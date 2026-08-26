import { AsyncLocalStorage } from 'node:async_hooks'

const asyncLocalStorage = new AsyncLocalStorage()

/**
 * Header used to forward the caller's OAuth client id to the backend service.
 */
export const CLIENT_ID_HEADER = 'x-dwt-client-id'

// /**
//  * Returns the current request's OAuth client id, if set, else null.
//  * @return {string|null}
//  */
// export const getClientId = () => clientIdStorage.getStore() ?? null

export const getClientId = () =>
  asyncLocalStorage.getStore()?.get('clientId') ?? null

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
        request.app.clientIdStore = store
        wrapCycle(request, '_lifecycle', store)
        wrapCycle(request, '_postCycle', store)
        return h.continue
      })
      server.ext('onCredentials', (request, h) => {
        const store = request.app.clientIdStore
        const clientId = request.auth?.credentials?.clientId
        if (clientId) {
          store.set('clientId', clientId)
        }
        return h.continue
      })
    }
  }
}
