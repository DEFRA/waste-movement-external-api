import { httpClients } from '../config.js'
import Boom from '@hapi/boom'

export const handleUpdateHazardousWaste = async (request, h) => {
  try {
    const { wasteTrackingId } = request.params
    const payload = request.payload

    await httpClients.wasteMovement.put(
      `/movements/${wasteTrackingId}/hazardous`,
      payload
    )

    return h
      .response({
        message: 'Hazardous waste details updated successfully'
      })
      .code(200)
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw Boom.notFound('Movement not found')
    }
    throw Boom.badRequest(error.message)
  }
}
