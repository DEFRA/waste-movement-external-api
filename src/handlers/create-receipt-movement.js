import { httpClients } from '../common/helpers/http-client.js'
import {
  HTTP_STATUS,
  METRIC_NAMES,
  generateAllValidationWarnings
} from '@defra/waste-movement-utils'
import { handleBackendResponse } from './handle-backend-response.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { isSuccessStatusCode } from '../common/helpers/utils.js'
import {
  logReceiptMetrics,
  logWarningMetrics,
  logDeveloperMetrics
} from '../common/helpers/metrics.js'
import { handleErrorResponse } from '../common/helpers/handle-error-response.js'

const logger = createLogger()

export const handleCreateReceiptMovement = async (request, h) => {
  try {
    const requestData = { movement: request.payload }
    const clientId = request.auth?.credentials?.clientId
    const wasteTrackingId = (await httpClients.wasteTracking.get('/next'))
      .payload.wasteTrackingId

    if (request.submittingOrganisation) {
      requestData.movement.submittingOrganisation =
        request.submittingOrganisation
      delete requestData.movement.apiCode
    }

    let response = await httpClients.wasteMovement.post(
      `/movements/${wasteTrackingId}/receive`,
      requestData
    )

    // Generate validation warnings
    const warnings = generateAllValidationWarnings(
      request.payload,
      wasteTrackingId,
      logger
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
    logger.info(`${METRIC_NAMES.VALIDATION_REQUESTS_WITHOUT_ERRORS} - post`)

    // Only log successful responses
    if (isSuccess) {
      logReceiptMetrics('post')
      logWarningMetrics(warnings)
      if (clientId) {
        logDeveloperMetrics()
      }
    }

    return handleBackendResponse(response, h, () => responseData)
  } catch (error) {
    logger.error({ error }, 'Error creating waste movement')
    return handleErrorResponse(error)
  }
}
