import { metricsCounter } from '../common/helpers/metrics.js'
import { normalizeArrayIndices } from '../common/helpers/utils.js'
import { isReceiptMovementEndpoint } from '../common/helpers/receipt-movement-endpoint.js'
import {
  HTTP_STATUS,
  METRIC_NAMES,
  validationErrorFormatter
} from '@defra/waste-movement-utils'

// Build dimensions object including clientId only when present.
const withClientId = (dims, clientId) =>
  clientId ? { ...dims, clientId } : dims

const formatPayloadParseError = (response) => ({
  validation: {
    errors: [
      {
        key: 'payload',
        errorType: 'InvalidFormat',
        message: response.output.payload.message
      }
    ]
  }
})

export const errorHandler = {
  plugin: {
    name: 'errorHandler',
    register: async (server) => {
      server.ext('onPreResponse', handleErrors)
    }
  }
}

export async function handleErrors(request, h) {
  const logger = request.logger
  const response = request.response

  if (response.isBoom) {
    logger.error({ err: response }, 'Request error')
  }

  // Check if it's a validation error (Boom error with status 400)
  if (
    response.isBoom &&
    response.output.statusCode === HTTP_STATUS.BAD_REQUEST
  ) {
    const customError = Array.isArray(response.details)
      ? validationErrorFormatter(response, logger)
      : formatPayloadParseError(response)

    // Log validation error metrics for receipt movement endpoints
    if (isReceiptMovementEndpoint(request)) {
      const endpointType = request.method.toLowerCase()
      const clientId = request.auth?.credentials?.clientId
      const baseDims = withClientId({ endpointType }, clientId)

      await metricsCounter(
        METRIC_NAMES.VALIDATION_ERRORS_COUNT,
        customError.validation.errors.length,
        baseDims
      )
      await metricsCounter(
        METRIC_NAMES.VALIDATION_REQUESTS_WITH_ERRORS,
        1,
        baseDims
      )
      logger.info(
        `${METRIC_NAMES.VALIDATION_REQUESTS_WITH_ERRORS} - ${endpointType}`
      )

      for (const error of customError.validation.errors) {
        const errorReason = normalizeArrayIndices(error.message)
        await metricsCounter(METRIC_NAMES.VALIDATION_ERROR_REASON, 1, {
          ...baseDims,
          errorReason
        })
        logger.info(`${METRIC_NAMES.VALIDATION_ERROR_REASON} - ${errorReason}`)
        await metricsCounter(METRIC_NAMES.VALIDATION_ERROR_CATEGORY, 1, {
          ...baseDims,
          errorCategory: error.errorType
        })
        logger.info(
          `${METRIC_NAMES.VALIDATION_ERROR_CATEGORY} - ${error.errorType}`
        )
      }

      await metricsCounter(METRIC_NAMES.ERRORS_BY_STATUS_CODE, 1, {
        ...baseDims,
        statusCode: '400'
      })
      logger.info(
        `${METRIC_NAMES.ERRORS_BY_STATUS_CODE} - ${HTTP_STATUS.BAD_REQUEST}`
      )
    }

    // Create the custom error response
    const errorResponse = h.response(customError).code(HTTP_STATUS.BAD_REQUEST)

    // Ensure headers are added to the custom error response
    if (response.output.headers) {
      Object.entries(response.output.headers).forEach(([key, value]) =>
        errorResponse.header(key, value)
      )
    }

    return errorResponse
  }

  // Log HTTP status code metrics for non-400 Boom errors on receipt movement endpoints
  if (
    response.isBoom &&
    response.output.statusCode !== HTTP_STATUS.BAD_REQUEST &&
    isReceiptMovementEndpoint(request)
  ) {
    const endpointType = request.method.toLowerCase()
    const statusCode = String(response.output.statusCode)
    const clientId = request.auth?.credentials?.clientId

    await metricsCounter(METRIC_NAMES.ERRORS_BY_STATUS_CODE, 1, {
      ...withClientId({ endpointType }, clientId),
      statusCode
    })
    logger.info(`${METRIC_NAMES.ERRORS_BY_STATUS_CODE} - ${statusCode}`)
  }

  // If not a validation error, continue with the default response
  return h.continue
}
