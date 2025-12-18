import { httpClients } from '../common/helpers/http-client.js'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'
import { handleBackendResponse } from './handle-backend-response.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { isSuccessStatusCode } from '../common/helpers/utils.js'
import { generateAllValidationWarnings } from '../common/helpers/validation-warnings/validation-warnings.js'
import { metricsCounter, logReceiptMetrics } from '../common/helpers/metrics.js'

const logger = createLogger()

export const handleCreateReceiptMovement = async (request, h) => {
  let wasteTrackingId

  try {
    wasteTrackingId = (await httpClients.wasteTracking.get('/next')).payload
      .wasteTrackingId

    let response = await httpClients.wasteMovement.post(
      `/movements/${wasteTrackingId}/receive`,
      { movement: request.payload }
    )

    // Generate validation warnings
    const warnings = generateAllValidationWarnings(
      request.payload,
      wasteTrackingId
    )

    const responseData = {
      wasteTrackingId
    }

    const isSuccess = isSuccessStatusCode(response.statusCode)

    response = {
      ...response,
      statusCode: isSuccess ? HTTP_STATUS.CREATED : response.statusCode
    }

    // Only include validation object if there are warnings
    if (warnings.length > 0) {
      responseData.validation = {
        warnings
      }
    }

    // Request passed validation (no validation errors) - log regardless of backend response
    await metricsCounter('validation.requests.without_errors', 1, {
      endpointType: 'post'
    })
    await metricsCounter('validation.requests.without_errors', 1)

    // Only log warning metrics for successful responses
    if (isSuccess) {
      await logReceiptMetrics('post')

      if (warnings.length > 0) {
        await metricsCounter('validation.warnings.count', warnings.length, {
          endpointType: 'post'
        })
        await metricsCounter('validation.warnings.count', warnings.length)
        await metricsCounter('validation.requests.with_warnings', 1, {
          endpointType: 'post'
        })
        await metricsCounter('validation.requests.with_warnings', 1)
      } else {
        await metricsCounter('validation.requests.without_warnings', 1, {
          endpointType: 'post'
        })
        await metricsCounter('validation.requests.without_warnings', 1)
      }
    }

    return handleBackendResponse(response, h, () => responseData)
  } catch (error) {
    logger.error({ err: error }, 'Error creating waste movement')
    return h
      .response({
        error: 'Internal Server Error',
        message: 'Failed to create waste movement'
      })
      .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
