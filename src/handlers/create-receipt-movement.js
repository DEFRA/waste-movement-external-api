import { httpClients } from '../common/helpers/http-client.js'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'

export const handleCreateReceiptMovement = async (request, h) => {
  let wasteTrackingId
  try {
    wasteTrackingId = await httpClients.wasteTracking.get('/next')
    console.log('Waste Tracking ID:', wasteTrackingId)
    await httpClients.wasteMovement.post(
      `/movements/${wasteTrackingId}/receive`,
      request.payload
    )
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
  return h.response({
    statusCode: HTTP_STATUS.OK,
    globalMovementId: wasteTrackingId
  })
}
