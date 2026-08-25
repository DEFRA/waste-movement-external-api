import { ecsFormat } from '@elastic/ecs-pino-format'
import { config } from '../../../config.js'
import { getTraceId } from '@defra/hapi-tracing'
import { getOrganisationId } from '../../../plugins/request-custom-logger.js'
import { getClientId } from '../client-context.js'

const logConfig = config.get('log')
const serviceName = config.get('serviceName')
const serviceVersion = config.get('serviceVersion')

const formatters = {
  ecs: {
    ...ecsFormat({
      serviceVersion,
      serviceName
    })
  },
  'pino-pretty': { transport: { target: 'pino-pretty' } }
}

export const loggerOptions = {
  enabled: logConfig.isEnabled,
  ignorePaths: ['/health'],
  redact: {
    paths: logConfig.redact,
    remove: true
  },
  level: logConfig.level,
  ...formatters[logConfig.format],
  nesting: true,
  mixin() {
    const mixinValues = {}
    const traceId = getTraceId()
    const organisationId = getOrganisationId()
    const clientId = getClientId()
    if (traceId) {
      mixinValues.trace = { id: traceId }
    }
    if (organisationId) {
      mixinValues.event = { reference: organisationId }
    }
    if (clientId) {
      mixinValues.tenant = { id: clientId }
    }
    return mixinValues
  }
}
