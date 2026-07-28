import { HTTP_STATUS } from 'waste-movement-utils'
import { httpClients } from './http-client.js'
import { PaymentRequiredError } from './errors/payment-required-error.js'

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

  const wasteOrganisationResponse = await httpClients.wasteOrganisation
    .get(`/organisation/${apiCode}`)
    .then(({ payload }) => payload)

  if (wasteOrganisationResponse.statusCode === HTTP_STATUS.PAYMENT_REQUIRED) {
    throw new PaymentRequiredError(wasteOrganisationResponse.message)
  }

  if (wasteOrganisationResponse?.defraCustomerOrganisationId) {
    requestData.movement = {
      ...movementWithoutApiCode,
      submittingOrganisation: {
        defraCustomerOrganisationId:
          wasteOrganisationResponse.defraCustomerOrganisationId
      }
    }
  }

  return requestData
}
