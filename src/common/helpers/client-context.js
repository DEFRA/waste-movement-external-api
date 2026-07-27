import { AsyncLocalStorage } from 'node:async_hooks'

const clientIdStorage = new AsyncLocalStorage()

/**
 * Header used to forward the caller's OAuth client id to the backend service.
 */
export const CLIENT_ID_HEADER = 'x-dwt-client-id'

/**
 * Returns the current request's OAuth client id, if set, else null.
 * @return {string|null}
 */
export const getClientId = () => clientIdStorage.getStore() ?? null

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
 * Stores the authenticated caller's client id in async local storage for the
 * lifetime of the request, so outbound calls to the backend can forward it as a
 * header automatically (see http-client.js). Mirrors the trace-id handling in
 * @defra/hapi-tracing.
 */
export const clientContext = {
  plugin: {
    name: 'client-context',
    register(server) {
      server.ext('onCredentials', (request, h) => {
        clientIdStorage.enterWith(request.auth?.credentials?.clientId)
        return h.continue
      })
    }
  }
}
