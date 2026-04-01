import { httpClients } from './http-client.js'

/**
 * Looks up the Organisation Id from the Waste Organisation Backend for
 * the given API Code, adds submittingOrganisation inside the movement
 * object and strips apiCode before sending to the backend.
 *
 * @param {Object} requestData - The request data
 * @returns {Promise<Object>} The request data with submittingOrganisation in movement and apiCode removed
 */
export async function addSubmittingOrganisationToRequest(requestData) {
  const { apiCode, ...movementWithoutApiCode } = requestData.movement

  const submittingOrganisation = await httpClients.wasteOrganisation
    .get(`/organisation/${apiCode}`)
    .then(({ payload }) => payload)

  requestData.movement = {
    ...movementWithoutApiCode,
    submittingOrganisation: {
      defraCustomerOrganisationId:
        submittingOrganisation.defraCustomerOrganisationId
    }
  }

  return requestData
}
