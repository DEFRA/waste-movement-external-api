import { httpClients } from '../common/helpers/http-client.js'

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
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to create waste movement'
      })
      .code(500)
  }
  return h.response({
    statusCode: 200,
    globalMovementId: wasteTrackingId
  })
}
