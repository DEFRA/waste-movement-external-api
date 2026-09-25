import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'

import { config } from './config.js'
import { router } from './plugins/router.js'
import { requestLogger } from './common/helpers/logging/request-logger.js'
import { secureContext } from './common/helpers/secure-context/index.js'
import { pulse } from './common/helpers/pulse.js'
import { requestTracing } from './common/helpers/request-tracing.js'
import { setupProxy } from './common/helpers/proxy/setup-proxy.js'
import { getServerOptions } from './common/helpers/server-options.js'
import { swagger } from './plugins/swagger.js'
import { errorHandler } from './plugins/error-handler.js'
import { jwtAuth } from './plugins/jwt-auth.js'
import { requestMetrics } from './plugins/request-metrics.js'
import { clientContext } from './common/helpers/client-context.js'
import { addSubmittingOrganisationToRequest } from './plugins/add-submitting-organisation-to-request.js'
import { setCustomResponseHeaders } from './plugins/set-custom-response-headers.js'
import { formatErrorToRFC9457Response } from '@defra/waste-movement-utils'

async function createServer() {
  setupProxy()
  const server = Hapi.server(getServerOptions())

  // Register Vision and Inert first as they are required by Swagger
  await server.register([
    {
      plugin: Inert
    },
    {
      plugin: Vision
    }
  ])

  // Register Swagger before routes
  await server.register(swagger)

  // Register JWT authentication before routes. It is always registered so the
  // client id can be extracted from the JWT and forwarded to the backend,
  // regardless of the environment the app runs in (see DWTA-337).
  await server.register(jwtAuth)

  // Register routes
  await server.register(router)

  // Register remaining plugins
  await server.register([
    requestLogger,
    requestTracing,
    secureContext,
    pulse,
    setCustomResponseHeaders,
    addSubmittingOrganisationToRequest,
    {
      plugin: formatErrorToRFC9457Response,
      options: {
        shouldFormat: (request) => request.path.startsWith('/beta-'),
        typeBase: config.get('problemDetails.typeBase')
      }
    },
    errorHandler,
    requestMetrics,
    clientContext
  ])

  return server
}

export { createServer }
