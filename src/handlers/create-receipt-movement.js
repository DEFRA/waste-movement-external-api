import { httpClients } from '../common/helpers/http-client.js'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'
import { handleBackendResponse } from './handle-backend-response.js'

export const handleCreateReceiptMovement = async (request, h) => {
  let wasteTrackingId
  try {
    wasteTrackingId = (await httpClients.wasteTracking.get('/next')).payload
      .wasteTrackingId
    console.log('Waste Tracking ID:', wasteTrackingId)
    const response = await httpClients.wasteMovement.post(
      `/movements/${wasteTrackingId}/receive`,
      request.payload
    )

    return handleBackendResponse(response, h, () => ({
      statusCode: HTTP_STATUS.OK,
      globalMovementId: wasteTrackingId
    }))
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
