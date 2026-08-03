export const setCustomResponseHeaders = {
  plugin: {
    name: 'setCustomResponseHeaders',
    register: async (server) => {
      // Plugin needs to run before response is returned
      server.ext('onPreResponse', async (request, h) => {
        const response = request.response
        const headersToSet = {
          'service-charge-expiry-date': request.serviceChargeExpiryDate
        }

        if (response.isBoom) {
          Object.entries(headersToSet).forEach(
            ([name, value]) => (response.output.headers[name] = value)
          )
        } else {
          Object.entries(headersToSet).forEach(([name, value]) =>
            response.header(name, value)
          )
        }

        return h.continue
      })
    }
  }
}
