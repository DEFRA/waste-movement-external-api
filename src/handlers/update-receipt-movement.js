import Boom from '@hapi/boom'
import { httpClients } from '../common/helpers/http-client.js'
import { handleBackendResponse } from './handle-backend-response.js'
import { generateAllValidationWarnings } from 'waste-movement-utils'
import {
  metricsCounter,
  logReceiptMetrics,
  logWarningMetrics,
  logDeveloperMetrics
} from '../common/helpers/metrics.js'
import { METRIC_NAMES } from '../common/constants/metric-names.js'
import { isSuccessStatusCode } from '../common/helpers/utils.js'
import { addSubmittingOrganisationToRequest } from '../common/helpers/submitting-organisation.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

/**
 * Handler for updating a receipt movement
 * @param {Object} request - The Hapi request object
 * @param {Object} h - The Hapi response toolkit
 * @returns {Object} The response object
 */
export const handleUpdateReceiptMovement = async (request, h) => {
  try {
    const { wasteTrackingId } = request.params
    let requestData = { movement: request.payload }

    requestData = await addSubmittingOrganisationToRequest(requestData)

    const response = await httpClients.wasteMovement.put(
      `/movements/${wasteTrackingId}/receive`,
      requestData
    )

    // Generate validation warnings
    const warnings = generateAllValidationWarnings(
      requestData.movement,
      wasteTrackingId,
      logger
    )

    const responseData = {}

    // Only include validation object if there are warnings
    if (warnings.length > 0) {
      responseData.validation = {
        warnings
      }
    }

    const clientId = request.auth?.credentials?.clientId

    // Request passed validation (no validation errors) - log regardless of backend response
    const withoutErrorsDims = { endpointType: 'put' }
    if (clientId) {
      withoutErrorsDims.clientId = clientId
    }
    await metricsCounter(
      METRIC_NAMES.VALIDATION_REQUESTS_WITHOUT_ERRORS,
      1,
      withoutErrorsDims
    )

    // Only log metrics for successful responses
    if (isSuccessStatusCode(response.statusCode)) {
      await logReceiptMetrics('put', clientId)
      await logWarningMetrics(warnings, 'put', clientId)
      if (clientId) {
        await logDeveloperMetrics(clientId)
      }
    }

    return handleBackendResponse(response, h, () => responseData)
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw Boom.notFound('Movement not found')
    }
    throw Boom.internal(error.message)
  }
}
