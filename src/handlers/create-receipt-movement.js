import { httpClients } from '../common/helpers/http-client.js'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'
import { handleBackendResponse } from './handle-backend-response.js'
import { generateAllValidationWarnings } from '../common/helpers/validation-warnings.js'

export const handleCreateReceiptMovement = async (request, h) => {
  let wasteTrackingId
  try {
    const { clientId } = request.auth.credentials
    console.debug('Client id:', clientId)

    wasteTrackingId = (await httpClients.wasteTracking.get('/next')).payload
      .wasteTrackingId
    console.log('Waste Tracking ID:', wasteTrackingId)
    const response = await httpClients.wasteMovement.post(
      `/movements/${wasteTrackingId}/receive`,
      { movement: request.payload }
    )

    // Generate validation warnings
    const warnings = generateAllValidationWarnings(request.payload)

    const responseData = {
      statusCode: HTTP_STATUS.OK,
      globalMovementId: wasteTrackingId
    }

    // Only include validation object if there are warnings
    if (warnings.length > 0) {
      responseData.validation = {
        warnings
      }
    }

    return handleBackendResponse(response, h, () => responseData)
  } catch (error) {
    console.error('Error creating waste movement:', error)
    return h
      .response({
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Failed to create waste movement'
      })
      .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
