import Boom from '@hapi/boom'
import { httpClients } from '../common/helpers/http-client.js'
import { handleBackendResponse } from './handle-backend-response.js'
import { generateAllValidationWarnings } from '../common/helpers/validation-warnings/validation-warnings.js'
import { metricsCounter } from '../common/helpers/metrics.js'
import { isSuccessStatusCode } from '../common/helpers/utils.js'

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

    const response = await httpClients.wasteMovement.put(
      `/movements/${wasteTrackingId}/receive`,
      {
        movement
      }
    )

    // Generate validation warnings
    const warnings = generateAllValidationWarnings(movement, wasteTrackingId)

    const responseData = {}

    // Only include validation object if there are warnings
    if (warnings.length > 0) {
      responseData.validation = {
        warnings
      }
    }

    // Only log metrics for successful responses
    if (isSuccessStatusCode(response.statusCode)) {
      // Per-endpoint metrics with dimensions
      await metricsCounter('validation.warnings.count', warnings.length, {
        endpointType: 'put'
      })
      // Total metrics without dimensions
      await metricsCounter('validation.warnings.count', warnings.length)

      if (warnings.length > 0) {
        await metricsCounter('validation.requests.with_warnings', 1, {
          endpointType: 'put'
        })
        await metricsCounter('validation.requests.with_warnings', 1)
      } else {
        await metricsCounter('validation.requests.without_warnings', 1, {
          endpointType: 'put'
        })
        await metricsCounter('validation.requests.without_warnings', 1)
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
