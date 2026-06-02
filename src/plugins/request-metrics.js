import { logAttemptedDeveloperMetrics } from '../common/helpers/metrics.js'
import { isReceiptMovementEndpoint } from '../common/helpers/receipt-movement-endpoint.js'

export const requestMetrics = {
  plugin: {
    name: 'requestMetrics',
    register: async (server) => {
      // Emit developers.attempted once per authenticated receipt-movement
      // request, regardless of validation outcome or backend response.
      // This is the canonical source for the "Active Client IDs" panel —
      // developers.active only fires on success and undercounts vendors
      // stuck in onboarding.
      server.ext('onPostAuth', async (request, h) => {
        if (!isReceiptMovementEndpoint(request)) {
          return h.continue
        }
        const clientId = request.auth?.credentials?.clientId
        if (clientId) {
          await logAttemptedDeveloperMetrics(clientId)
        }
        return h.continue
      })
    }
  }
}
