import convict from 'convict'
import convictFormatWithValidator from 'convict-format-with-validator'

import { convictValidateMongoUri } from './common/helpers/convict/validate-mongo-uri.js'

convict.addFormat(convictValidateMongoUri)
convict.addFormats(convictFormatWithValidator)

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

const config = convict({
  serviceVersion: {
    doc: 'The service version, this variable is injected into your docker container in CDP environments',
    format: String,
    nullable: true,
    default: null,
    env: 'SERVICE_VERSION'
  },
  jwt: {
    jwksUri: {
      doc: 'The URI of the JWKS endpoint',
      format: String,
      default: `https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_yxW9beJCW/.well-known/jwks.json`,
      env: 'JWT_JWKS_URI'
    },
    cognitoUserPoolId: {
      doc: 'The Cognito User Pool ID',
      format: String,
      default: 'eu-west-2_yxW9beJCW', // dev cognito user pool
      env: 'JWT_COGNITO_USER_POOL_ID'
    },
    options: {
      doc: 'JWT validation options',
      format: Object,
      default: {
        verify: {
          aud: false,
          iss: false,
          sub: false,
          maxAgeSec: 14400 // 4 hours
        },
        validate: {
          isValid: true,
          credentials: true
        }
      }
    }
  },
  host: {
    doc: 'The IP address to bind',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'HOST'
  },
  port: {
    doc: 'The port to bind',
    format: 'port',
    default: 3001,
    env: 'PORT'
  },
  serviceName: {
    doc: 'Api Service Name',
    format: String,
    default: 'waste-movement-backend'
  },
  cdpEnvironment: {
    doc: 'The CDP environment the app is running in. With the addition of "local" for local development',
    format: [
      'local',
      'infra-dev',
      'management',
      'dev',
      'test',
      'perf-test',
      'ext-test',
      'prod'
    ],
    default: 'local',
    env: 'ENVIRONMENT'
  },
  log: {
    isEnabled: {
      doc: 'Is logging enabled',
      format: Boolean,
      default: !isTest,
      env: 'LOG_ENABLED'
    },
    level: {
      doc: 'Logging level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
      env: 'LOG_LEVEL'
    },
    format: {
      doc: 'Format to output logs in',
      format: ['ecs', 'pino-pretty'],
      default: isProduction ? 'ecs' : 'pino-pretty',
      env: 'LOG_FORMAT'
    },
    redact: {
      doc: 'Log paths to redact',
      format: Array,
      default: isProduction
        ? ['req.headers.authorization', 'req.headers.cookie', 'res.headers']
        : ['req', 'res', 'responseTime']
    }
  },
  mongo: {
    uri: {
      doc: 'URI for mongodb',
      format: String,
      default: 'mongodb://127.0.0.1:27017',
      env: 'MONGO_URI'
    },
    databaseName: {
      doc: 'Database name for mongodb',
      format: String,
      default: 'waste-movement-external-api',
      env: 'MONGO_DATABASE'
    }
  },
  httpProxy: {
    doc: 'HTTP Proxy URL',
    format: String,
    nullable: true,
    default: null,
    env: 'HTTP_PROXY'
  },
  isSecureContextEnabled: {
    doc: 'Enable Secure Context',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_SECURE_CONTEXT'
  },
  isMetricsEnabled: {
    doc: 'Enable metrics reporting',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_METRICS'
  },
  tracing: {
    header: {
      doc: 'CDP tracing header name',
      format: String,
      default: 'x-cdp-request-id',
      env: 'TRACING_HEADER'
    }
  },
  services: {
    wasteTracking: {
      doc: 'Waste Tracking Service URL',
      format: String,
      default: 'https://waste-tracking-id-backend.dev.cdp-int.defra.cloud',
      env: 'WASTE_TRACKING_SERVICE_URL'
    },
    wasteMovement: {
      doc: 'Waste Movement Service URL',
      format: String,
      default: 'https://waste-movement-backend.dev.cdp-int.defra.cloud',
      env: 'WASTE_MOVEMENT_SERVICE_URL'
    }
  }
})

const overrideConfig = {
  services: {
    // wasteTracking: `https://waste-tracking-id-backend.${config.get('cdpEnvironment')}.cdp-int.defra.cloud`,
    // wasteMovement: `https://waste-movement-backend.${config.get('cdpEnvironment')}.cdp-int.defra.cloud`
    wasteTracking: `http://waste-tracking-id-backend:3001`,
    wasteMovement: `http://waste-movement-backend:3001`
  },
  jwt: {
    jwksUri: `https://cognito-idp.eu-west-2.amazonaws.com/${config.get('jwt.cognitoUserPoolId')}/.well-known/jwks.json`,
    options: {
      verify: {
        aud: false,
        iss: [
          `https://cognito-idp.eu-west-2.amazonaws.com/${config.get('jwt.cognitoUserPoolId')}`
        ],
        sub: false,
        maxAgeSec: 14400 // 4 hours
      },
      validate: {
        isValid: true,
        credentials: true
      }
    }
  }
}

config.load(overrideConfig)

config.validate({ allowed: 'strict' })

export { config }
