import Boom from '@hapi/boom'
import { httpClients } from '../config.js'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'

/**
 * Handler for updating a receipt movement
 * @param {Object} request - The Hapi request object
 * @param {Object} h - The Hapi response toolkit
 * @returns {Object} The response object
 */
export const handleUpdateReceiptMovement = async (request, h) => {
  try {
    const { wasteTrackingId } = request.params
    const movement = request.payload

    await httpClients.wasteMovement.put(
      `/movements/${wasteTrackingId}/receive`,
      movement
    )

    return h
      .response({
        message: 'Receipt movement updated successfully'
      })
      .code(HTTP_STATUS.OK)
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw Boom.notFound('Movement not found')
    }
    throw Boom.badRequest(error.message)
  }
}
