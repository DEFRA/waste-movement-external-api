import Boom from '@hapi/boom'
import { httpClients } from '../common/helpers/http-client.js'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { AsyncLocalStorage } from 'node:async_hooks'
import { isBetaRoute } from '../common/helpers/beta-route.js'
import {
  API_CODE_INVALID_MESSAGE,
  API_CODE_MISSING_MESSAGE,
  getApiCode,
  usesApiCodeHeader
} from '../common/helpers/api-code.js'

const asyncLocalStorage = new AsyncLocalStorage()

export const getOrganisationId = () =>
  asyncLocalStorage.getStore()?.get('organisationId')

export const getOrganisationName = () =>
  asyncLocalStorage.getStore()?.get('organisationName')

/**
 * Wrap the request cycle in an asyncLocalStorage run call. This allows the passed store to be available during the
 * request lifecycle
 * @param { Request } request
 * @param { '_lifecycle'|'_postCycle'|'_finalize' } cycle
 * @param { Map<string, string> } store
 */
function wrapCycle(request, cycle, store) {
  const requestCycle = request[cycle].bind(request)
  request[cycle] = () => asyncLocalStorage.run(store, requestCycle)
}

/**
 * Builds the submitting organisation recorded against the movement. The name
 * and isLocalAuthority flag are omitted until the waste organisation response
 * carries them, so movements created in the meantime keep the id on its own.
 * @param { { defraCustomerOrganisationId: string, name?: string, isLocalAuthority?: boolean } } wasteOrganisation
 */
function buildSubmittingOrganisation({
  defraCustomerOrganisationId,
  name,
  isLocalAuthority
}) {
  return {
    defraCustomerOrganisationId,
    ...(name ? { defraCustomerOrganisationName: name } : {}),
    ...(typeof isLocalAuthority === 'boolean'
      ? { defraCustomerOrganisationIsLocalAuthority: isLocalAuthority }
      : {})
  }
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
        // hapi-pino writes "request completed" from the response event, which
        // hapi emits in _finalize() after _postCycle, so beta routes also wrap
        // it to get event.reference on that line. Other routes keep their log
        // lines.
        if (isBetaRoute(request)) {
          wrapCycle(request, '_finalize', store)
        }
        return h.continue
      })

      // Plugin needs to run between successful auth and validation
      server.ext('onPostAuth', async (request, h) => {
        const store = request.app.organisationIdStore

        const apiCode = getApiCode(request)

        // Where the apiCode is a header credential, a missing one is an
        // authentication failure. Elsewhere it's a body field, so a missing
        // one is left to the backend's validation.
        if (!apiCode && usesApiCodeHeader(request)) {
          throw Boom.unauthorized(API_CODE_MISSING_MESSAGE)
        }

        let wasteOrganisationResponse

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

          // waste-organisation-backend answers 404 for both unknown and
          // disabled codes, so the response doesn't reveal which codes exist.
          if (
            usesApiCodeHeader(request) &&
            wasteOrganisationResponse?.statusCode === HTTP_STATUS.NOT_FOUND
          ) {
            throw Boom.unauthorized(API_CODE_INVALID_MESSAGE)
          }

          if (wasteOrganisationResponse?.defraCustomerOrganisationId) {
            request.submittingOrganisation = buildSubmittingOrganisation(
              wasteOrganisationResponse
            )
            store.set(
              'organisationId',
              wasteOrganisationResponse.defraCustomerOrganisationId
            )
            if (wasteOrganisationResponse.name) {
              store.set('organisationName', wasteOrganisationResponse.name)
            }
          } else if (
            // Beta routes rely only on this lookup for the organisation. RoW
            // routes still fall back to ORG_API_CODES in the backend, so they
            // keep the old behaviour.
            isBetaRoute(request) &&
            wasteOrganisationResponse?.statusCode !== HTTP_STATUS.NOT_FOUND
          ) {
            // Only a 404 means the API code is unknown or disabled. Anything
            // else (401, 5xx, a 200 without an organisation) is a failure on
            // our side, so fail fast rather than let the backend reject the
            // request as an invalid API code.
            const lookupStatus = wasteOrganisationResponse?.statusCode
            // CDP only indexes allowlisted ECS fields, and only as nested
            // objects.
            request.logger.error(
              {
                event: {
                  action: 'organisation-lookup-failed',
                  reason: lookupStatus
                    ? `waste-organisation-backend returned ${lookupStatus}`
                    : 'waste-organisation-backend returned no organisation'
                },
                url: { path: request.path }
              },
              'Organisation lookup failed'
            )

            throw Boom.badGateway('Unable to verify the API Code')
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
