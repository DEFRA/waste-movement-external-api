import { AsyncLocalStorage } from 'node:async_hooks'
import { httpClients } from './http-client.js'
import { config } from '../../config.js'

const asyncLocalStorage = new AsyncLocalStorage()

/**
 * Header used to forward the caller's OAuth client id to the backend service.
 */
export const CLIENT_ID_HEADER = 'x-dwt-client-id'
const { serviceName, clientNameCacheDuration } = config.getProperties()

// Cache of clientId -> { clientName, fetchedAt } so we don't hit the
// backend on every single authenticated request.
const clientNameCache = new Map()
const CACHE_TTL_MS = clientNameCacheDuration

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
 * Stores the authenticated caller's client id in async local storage for the
 * lifetime of the request, so outbound calls to the backend can forward it as a
 * header automatically (see http-client.js). Mirrors the trace-id handling in
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
        const store = request.app.clientDetailsStore
        const clientId = request.auth?.credentials?.clientId
        if (clientId) {
          try {
            // Serve from cache if we fetched this client's details recently
            const cached = clientNameCache.get(clientId)
            if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
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
