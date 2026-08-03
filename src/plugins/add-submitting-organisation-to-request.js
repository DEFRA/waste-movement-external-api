import Boom from '@hapi/boom'
import { httpClients } from '../common/helpers/http-client.js'
import { HTTP_STATUS } from 'waste-movement-utils'

export const addSubmittingOrganisationToRequest = {
  plugin: {
    name: 'addSubmittingOrganisationToRequest',
    register: async (server) => {
      // Plugin needs to run between successful auth and validation
      server.ext('onPostAuth', async (request, h) => {
        const apiCode = request.payload?.apiCode

        let wasteOrganisationResponse

        /*
         * Set serviceChargeExpiryDate default value for the following scenarios:
         * - Missing API Code
         * - Waste Organisation Backend returns a 404 error
         * - Waste Organisation Backend returns a 402 error
         * - Waste Organisation Backend doesn't return disableAfter
         */
        request.serviceChargeExpiryDate = 'not available'

        // Don't need to handle a missing API Code as this is handled by the validation
        if (apiCode) {
          wasteOrganisationResponse = await httpClients.wasteOrganisation
            .get(`/organisation/${apiCode}`)
            .then(({ payload }) => payload)

          if (
            wasteOrganisationResponse.statusCode ===
            HTTP_STATUS.PAYMENT_REQUIRED
          ) {
            throw Boom.paymentRequired(wasteOrganisationResponse.message)
          }

          if (wasteOrganisationResponse?.defraCustomerOrganisationId) {
            request.submittingOrganisation = {
              defraCustomerOrganisationId:
                wasteOrganisationResponse.defraCustomerOrganisationId
            }
          }

          if (wasteOrganisationResponse?.metaData?.disableAfter) {
            request.serviceChargeExpiryDate =
              wasteOrganisationResponse.metaData.disableAfter
          }
        }

        return h.continue
      })
    }
  }
}
