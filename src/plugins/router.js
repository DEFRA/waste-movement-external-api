import { health } from '../routes/health.js'
import { movement } from '../routes/movement.js'

const router = {
  plugin: {
    name: 'router',
    register: async (server, _options) => {
      // Register all routes
      const routes = [health, ...movement]

      // Register routes directly
      server.route(routes)
    }
  }
}

export { router }
