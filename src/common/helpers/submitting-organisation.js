import { config } from '../../config.js'
import { httpClients } from './http-client.js'

/**
 * If IS_WASTE_ORGANISATION_BACKEND_AVAILABLE = true then gets the Organisation
 * Id from the Waste Organisation Backend for the given API Code and adds
 * submittingOrganisation inside the movement object, stripping apiCode.
 *
 * If IS_WASTE_ORGANISATION_BACKEND_AVAILABLE = false then the original
 * request data is returned unchanged (apiCode stays in the movement).
 *
 * @param {Object} requestData - The request data
 * @returns {Promise<Object>} The request data
 */
export async function addSubmittingOrganisationToRequest(requestData) {
  const isWasteOrganisationBackendAvailable = config.get(
    'isWasteOrganisationBackendAvailable'
  )

  if (isWasteOrganisationBackendAvailable) {
    const { apiCode, ...movementWithoutApiCode } = requestData.movement

    const submittingOrganisation = await httpClients.wasteOrganisation
      .get(`/organisation/${apiCode}`)
      .then(({ payload }) => payload)

    if (submittingOrganisation?.defraCustomerOrganisationId) {
      requestData.movement = {
        ...movementWithoutApiCode,
        submittingOrganisation: {
          defraCustomerOrganisationId:
            submittingOrganisation.defraCustomerOrganisationId
        }
      }
    }
  }

  return requestData
}
