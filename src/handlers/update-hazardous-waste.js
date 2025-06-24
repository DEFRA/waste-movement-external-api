import { HTTP_STATUS } from '../common/constants/http-status-codes.js'
import { httpClients } from '../common/helpers/http-client.js'
import Boom from '@hapi/boom'

export const handleUpdateHazardousWaste = async (request, h) => {
  try {
    const { wasteTrackingId } = request.params
    const payload = request.payload

    const response = await httpClients.wasteMovement.put(
      `/movements/${wasteTrackingId}/receive/hazardous`,
      { hazardousWaste: payload }
    )

    if (response.statusCode >= 400 && response.statusCode < 500) {
      return h
        .response({
          statusCode: response.statusCode,
          error: response.error,
          message: response.message
        })
        .code(response.statusCode)
    }

    return h
      .response({
        message: 'Hazardous waste details updated successfully'
      })
      .code(HTTP_STATUS.OK)
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw Boom.notFound('Movement not found')
    }
    throw Boom.badRequest(error.message)
  }
}
