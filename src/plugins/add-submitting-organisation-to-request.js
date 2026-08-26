import Boom from '@hapi/boom'
import { httpClients } from '../common/helpers/http-client.js'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { AsyncLocalStorage } from 'node:async_hooks'

const asyncLocalStorage = new AsyncLocalStorage()

export const getOrganisationId = () =>
  asyncLocalStorage.getStore()?.get('organisationId')

/**
 * Wrap the request cycle in an asyncLocalStorage run call. This allows the passed store to be available during the
 * request lifecycle
 * @param { Request } request
 * @param { '_lifecycle'|'_postCycle' } cycle
 * @param { Map<string, string> } store
 */
function wrapCycle(request, cycle, store) {
  const requestCycle = request[cycle].bind(request)
  request[cycle] = () => asyncLocalStorage.run(store, requestCycle)
}

export const addSubmittingOrganisationToRequest = {
  plugin: {
    name: 'addSubmittingOrganisationToRequest',
    register: async (server) => {
      server.ext('onRequest', (request, h) => {
        const store = new Map()
        request.app.organisationIdStore = store
        wrapCycle(request, '_lifecycle', store)
        wrapCycle(request, '_postCycle', store)
        return h.continue
      })

      // Plugin needs to run between successful auth and validation
      server.ext('onPostAuth', async (request, h) => {
        const store = request.app.organisationIdStore

        const apiCode = request.payload?.apiCode

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
            store.set(
              'organisationId',
              wasteOrganisationResponse.defraCustomerOrganisationId
            )

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
