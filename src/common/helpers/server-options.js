import { config } from '../../config.js'
import { failAction } from './fail-action.js'

const getServerOptions = () => ({
  host: config.get('host'),
  port: config.get('port'),
  routes: {
    validate: {
      options: {
        abortEarly: false
      },
      failAction
    },
    security: {
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: false
      },
      xss: 'enabled',
      noSniff: true,
      xframe: true
    },
    cors: {
      origin: ['*'],
      additionalHeaders: [
        'accept',
        'authorization',
        'content-type',
        'x-requested-with',
        'x-api-key'
      ],
      additionalExposedHeaders: [
        'accept',
        'authorization',
        'content-type',
        'x-requested-with',
        'x-api-key'
      ],
      credentials: true
    }
  },
  router: {
    stripTrailingSlash: true
  }
})

export { getServerOptions }
