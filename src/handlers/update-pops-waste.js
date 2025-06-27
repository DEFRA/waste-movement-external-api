import { httpClients } from '../common/helpers/http-client.js'
import Boom from '@hapi/boom'
import { handleBackendResponse } from './handle-backend-response.js'

export const handleUpdatePopsWaste = async (request, h) => {
  try {
    const { wasteTrackingId } = request.params
    const popsData = request.payload

    const response = await httpClients.wasteMovement.put(
      `/movements/${wasteTrackingId}/pops`,
      popsData
    )

    return handleBackendResponse(response, h, () => ({
      message: 'POPs waste details updated successfully'
    }))
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw Boom.notFound('Movement not found')
    }
    throw Boom.badRequest(error.message || 'Invalid input')
  }
}
