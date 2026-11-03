import { getApiVersionForPath } from '../common/helpers/api-versions.js'

export const DEPRECATION_HEADER = 'Deprecation'

/**
 * Sets `Deprecation: true` on every response from a deprecated API version,
 * including errors, so integrators can detect the deprecation in-band
 * (digital-waste-tracking-api-docs docs/api/versioning.md).
 */
export const deprecationHeader = {
  plugin: {
    name: 'deprecationHeader',
    register: async (server) => {
      server.ext('onPreResponse', async (request, h) => {
        if (!getApiVersionForPath(request.path)?.deprecated) {
          return h.continue
        }

        const response = request.response

        if (response.isBoom) {
          response.output.headers[DEPRECATION_HEADER] = 'true'
        } else {
          response.header(DEPRECATION_HEADER, 'true')
        }

        return h.continue
      })
    }
  }
}
