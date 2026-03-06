import { config } from '../../config.js'
import { httpClients } from './http-client.js'
import { createLogger } from './logging/logger.js'

const logger = createLogger()

/**
 * If IS_WASTE_ORGANISATION_BACKEND_AVAILABLE = true then gets the Organisation
 * Id from the Waste Organisation Backend for the given API Code
 *
 * If the Organisation Id is returned then it is added to the request as
 * submittingOrganisation
 *
 * If the Organisation Id doesn't exist then submittingOrganisation is not
 * added to the request
 *
 * If IS_WASTE_ORGANISATION_BACKEND_AVAILABLE = false then the Waste Organisation
 * Backend service is not called and the original request data is returned
 *
 * @param {Object} requestData - The request data
 * @returns {Promise<Object>} The request data
 */
export async function addSubmittingOrganisationToRequest(requestData) {
  const isWasteOrganisationBackendAvailable = config.get(
    'isWasteOrganisationBackendAvailable'
  )

  if (isWasteOrganisationBackendAvailable) {
    const submittingOrganisation = await httpClients.wasteOrganisation
      .get(`/organisation/${requestData.movement.apiCode}`)
      .then(({ payload }) => payload)

    if (submittingOrganisation?.defraCustomerOrganisationId) {
      requestData.submittingOrganisation = submittingOrganisation
    }
  } else {
    logger.info(
      'Unable to get submittingOrganisation as IS_WASTE_ORGANISATION_BACKEND_AVAILABLE env var = false'
    )
  }

  return requestData
}
