import { health } from '../routes/health.js'
import { createReceiptMovement } from '../routes/create-receipt-movement.js'
import { updateReceiptMovement } from '../routes/update-receipt-movement.js'
import { updateHazardousWaste } from '../routes/update-hazardous-waste.js'

const router = {
  plugin: {
    name: 'router',
    register: async (server, _options) => {
      // Register all routes
      const routes = [
        health,
        createReceiptMovement,
        updateReceiptMovement,
        updateHazardousWaste
      ]

      // Register routes directly
      server.route(routes)
    }
  }
}

export { router }
