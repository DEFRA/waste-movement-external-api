import { health } from '../routes/health.js'
import { createReceiptMovement } from '../routes/create-receipt-movement.js'

const router = {
  plugin: {
    name: 'router',
    register: async (server, _options) => {
      // Register all routes
      const routes = [health, createReceiptMovement]

      // Register routes directly
      server.route(routes)
    }
  }
}

export { router }
