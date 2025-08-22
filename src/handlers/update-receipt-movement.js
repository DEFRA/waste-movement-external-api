import Boom from '@hapi/boom'
import { httpClients } from '../common/helpers/http-client.js'
import { handleBackendResponse } from './handle-backend-response.js'
import { generateAllValidationWarnings } from '../common/helpers/validation-warnings.js'

/**
 * Handler for updating a receipt movement
 * @param {Object} request - The Hapi request object
 * @param {Object} h - The Hapi response toolkit
 * @returns {Object} The response object
 */
export const handleUpdateReceiptMovement = async (request, h) => {
  try {
    // const { clientId } = request.auth.credentials
    // console.debug('Client id:', clientId)
    console.debug('Auth Info:', request?.auth)
    console.debug('Auth Header:', request?.headers?.authorization)

    const { wasteTrackingId } = request.params
    const movement = request.payload

    const response = await httpClients.wasteMovement.put(
      `/movements/${wasteTrackingId}/receive`,
      {
        movement
      }
    )

    // Generate validation warnings
    const warnings = generateAllValidationWarnings(movement)

    const responseData = {
      message: 'Receipt movement updated successfully'
    }

    // Only include validation object if there are warnings
    if (warnings.length > 0) {
      responseData.validation = {
        warnings
      }
    }

    return handleBackendResponse(response, h, () => responseData)
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw Boom.notFound('Movement not found')
    }
    throw Boom.badRequest(error.message)
  }
}
