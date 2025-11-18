import Jwt from '@hapi/jwt'
import { config } from '../config.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

const jwtAuth = {
  plugin: {
    name: 'jwt-auth',
    register: async (server) => {
      // Register the JWT plugin
      await server.register(Jwt)

      // Define the JWT authentication strategy
      server.auth.strategy('jwt', 'jwt', {
        keys: {
          uri: config.get('jwt.jwksUri'),
          algorithms: ['RS256']
        },
        verify: config.get('jwt.options.verify'),
        validate: async (artifacts, request, h) => {
          try {
            // Extract client_id from token payload
            const clientId = artifacts.decoded.payload.client_id

            if (!clientId) {
              logger.error('JWT token missing client_id')
              return { isValid: false }
            }

            const tokenUse = artifacts.decoded.payload.token_use
            if (tokenUse !== 'access') {
              logger.error('JWT token is not an access token')
              return { isValid: false }
            }

            const scope = artifacts.decoded.payload.scope || []
            if (
              !scope.includes('waste-movement-external-api-resource-srv/access')
            ) {
              logger.error('JWT token missing required scope')
              return { isValid: false }
            }

            // Make client_id available to handlers
            return {
              isValid: true,
              credentials: {
                clientId,
                scope: artifacts.decoded.payload.scope || []
              }
            }
          } catch (error) {
            logger.error({ err: error }, 'JWT validation error')
            return { isValid: false }
          }
        }
      })

      // Set JWT as the default authentication strategy
      server.auth.default('jwt')

      if (config.get('cdpEnvironment') !== 'prod') {
        // Add a route for testing JWT authentication
        server.route({
          method: 'GET',
          path: '/auth/test',
          options: {
            auth: 'jwt',
            handler: (request) => {
              return {
                authenticated: true,
                clientId: request.auth.credentials.clientId
              }
            }
          }
        })
      }

      logger.info('JWT authentication plugin registered')
    }
  }
}

export { jwtAuth }
