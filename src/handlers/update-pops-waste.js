import { httpClients } from '../common/helpers/http-client.js'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'
import Boom from '@hapi/boom'

export const handleUpdatePopsWaste = async (request, h) => {
  try {
    const { wasteTrackingId } = request.params
    const popsData = request.payload

    await httpClients.wasteMovement.put(
      `/movements/${wasteTrackingId}/pops`,
      popsData
    )

    return h
      .response({
        message: 'POPs waste details updated successfully'
      })
      .code(HTTP_STATUS.OK)
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw Boom.notFound('Movement not found')
    }
    throw Boom.badRequest(error.message || 'Invalid input')
  }
} 