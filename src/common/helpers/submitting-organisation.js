import { httpClients } from './http-client.js'

/**
 * Gets the Defra Customer Organisation Id from the Waste Organisation Backend based
 * on the API Code in the request.
 *
 * If an id is returned then a submittingOrganisation object is added to the request.
 *
 * If an id is not returned then the original request is returned.
 *
 * @param {Object} requestData - The request data
 * @returns {Promise<Object>} The request data
 */
export async function addSubmittingOrganisationToRequest(requestData) {
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

  return requestData
}
