import { httpClients } from '../common/helpers/http-client.js'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'
import { handleBackendResponse } from './handle-backend-response.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { isSuccessStatusCode } from '../common/helpers/utils.js'
import { generateAllValidationWarnings } from '../common/helpers/validation-warnings/validation-warnings.js'

const logger = createLogger()

export const handleCreateReceiptMovement = async (request, h) => {
  let wasteTrackingId

  try {
    // const { clientId } = request.auth.credentials

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

    response = {
      ...response,
      statusCode: isSuccessStatusCode(response.statusCode)
        ? HTTP_STATUS.CREATED
        : response.statusCode
    }

    // Only include validation object if there are warnings
    if (warnings.length > 0) {
      responseData.validation = {
        warnings
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
