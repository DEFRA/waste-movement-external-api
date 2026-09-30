import { AsyncLocalStorage } from 'node:async_hooks'
import { httpClients } from './http-client.js'
import { config } from '../../config.js'

const asyncLocalStorage = new AsyncLocalStorage()

/**
 * Header used to forward the caller's OAuth client id to the backend service.
 */
export const CLIENT_ID_HEADER = 'x-dwt-client-id'

// Cache of clientId -> { clientName, fetchedAt } so we don't hit the
// backend on every single authenticated request.
const clientNameCache = new Map()

export const getClientId = () =>
  asyncLocalStorage.getStore()?.get('clientId') ?? null
export const getClientName = () =>
  asyncLocalStorage.getStore()?.get('clientName') ?? null

/**
 * Appends the client id to an existing set of headers.
 * @param { string } headerName name of header to put the client id in
 * @param { Object } headers object containing existing headers
 * @return { Object }
 */
export function withClientId(headerName, headers = {}) {
  const clientId = getClientId()
  if (clientId) {
    headers[headerName] = clientId
  }
  return headers
}

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

/**
 * Stores authenticated caller details in request-scoped storage for the
 * lifetime of the request.
 *
 * On request, a store is created and attached to the request. The store is
 * propagated through the Hapi lifecycle so client details can be accessed
 * from the request context and by outbound HTTP calls (see http-client.js).
 *
 * Once authentication has completed, the authenticated client id is stored
 * in the request context. The client id is then used to retrieve the
 * corresponding client details from the software provider details service.
 * Client names are cached for the configured duration to avoid making a
 * backend request for every request from the same client.
 *
 * Errors retrieving client details are logged but do not prevent the
 * request from continuing.
 *
 * The request-scoped context handling mirrors the trace-id handling in
 * @defra/hapi-tracing.
 */
export const clientContext = {
  plugin: {
    name: 'client-context',
    register(server) {
      server.ext('onRequest', (request, h) => {
        const store = new Map()
        request.app.clientDetailsStore = store
        wrapCycle(request, '_lifecycle', store)
        wrapCycle(request, '_postCycle', store)
        return h.continue
      })
      server.ext('onCredentials', (request, h) => {
        const store = request.app.clientDetailsStore
        const clientId = request.auth?.credentials?.clientId
        if (clientId) {
          store.set('clientId', clientId)
        } else {
          request.logger.warn(
            `No clientId found in request.auth.credentials for request ${request.path}`
          )
        }
        return h.continue
      })
      server.ext('onPostAuth', async (request, h) => {
        const serviceName = config.get('serviceName')
        const clientNameCacheDuration = config.get('clientNameCacheDuration')
        const store = request.app.clientDetailsStore
        const clientId = request.auth?.credentials?.clientId
        if (clientId) {
          try {
            // Serve from cache if we fetched this client's details recently
            const cached = clientNameCache.get(clientId)
            if (
              cached &&
              Date.now() - cached.fetchedAt < clientNameCacheDuration
            ) {
              store.set('clientName', cached.clientName)
            } else {
              const details = await httpClients.softwareProviderDetails
                .get(`/clients/${serviceName}/${clientId}`)
                .then(({ payload }) => payload)

              if (!details?.clientName) {
                request.logger.error(
                  `No clientName in response for clientId ${clientId}`
                )
              } else {
                store.set('clientName', details.clientName)

                // Populate the cache.
                clientNameCache.set(clientId, {
                  clientName: details.clientName,
                  fetchedAt: Date.now()
                })
              }
            }
          } catch (err) {
            // Log the error but don't throw, as we don't want to block the request if the backend is down or returns an error
            request.logger.error(
              `Error fetching client details for clientId ${clientId}: ${err.message}`
            )
          }
        }
        return h.continue
      })
    }
  }
}
