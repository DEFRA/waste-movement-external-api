import Boom from '@hapi/boom'
import { httpClients } from '../common/helpers/http-client.js'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { AsyncLocalStorage } from 'node:async_hooks'

const asyncLocalStorage = new AsyncLocalStorage()

/**
 * Return's the request's organisation id, if set else null.
 * @return {string|null}
 */
export const getOrganisationId = () =>
  asyncLocalStorage.getStore()?.get('organisationId')

/**
 * Wrap the request lifecycle in an asyncLocalStorage run call. This allows the
 * passed store to be available during the request lifecycle.
 * @param { Request } request
 * @param { Map<string, string> } store
 */
function wrapLifecycle(request, store) {
  const requestLifecycle = request._lifecycle.bind(request)
  request._lifecycle = () => asyncLocalStorage.run(store, requestLifecycle)
}

export const addSubmittingOrganisationToRequest = {
  plugin: {
    name: 'addSubmittingOrganisationToRequest',
    register: async (server) => {
      // Plugin needs to run between successful auth and validation
      server.ext('onPostAuth', async (request, h) => {
        const apiCode = request.payload?.apiCode
        const store = new Map()

        let wasteOrganisationResponse

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

            store.set(
              'organisationId',
              wasteOrganisationResponse.defraCustomerOrganisationId
            )
            wrapLifecycle(request, store)
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
