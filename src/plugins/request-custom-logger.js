import { AsyncLocalStorage } from 'node:async_hooks'

const asyncLocalStorage = new AsyncLocalStorage()

/**
 * Return's the request's organisation id, if set else null.
 * @return {string|null}
 */
const getOrganisationId = () =>
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

/**
 * @satisfies {Plugin}
 */
const requestCustomLogger = {
  plugin: {
    name: 'request-custom-logger',
    version: '0.1.0',
    once: true,
    register(server, options) {
      server.ext('onPostAuth', (request, h) => {
        const store = new Map()

        const organisationId =
          request.payload?.movement?.submittingOrganisation
            ?.defraCustomerOrganisationId
        const clientId = request.auth?.credentials?.clientId

        if (clientId) {
          store.set('clientId', clientId)
        }

        if (organisationId) {
          store.set('organisationId', organisationId)
        }
        wrapLifecycle(request, store)
        return h.continue
      })
    }
  }
}

export { requestCustomLogger, getOrganisationId }
