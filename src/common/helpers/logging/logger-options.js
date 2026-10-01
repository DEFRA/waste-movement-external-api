import { ecsFormat } from '@elastic/ecs-pino-format'
import { config } from '../../../config.js'
import { getTraceId } from '@defra/hapi-tracing'
import { getClientId, getClientName } from '../client-context.js'
import { getOrganisationId } from '../../../plugins/add-submitting-organisation-to-request.js'

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
    const traceId = getTraceId()
    const organisationId = getOrganisationId()
    const clientId = getClientId()
    const clientName = getClientName()

    return {
      ...(traceId && {
        trace: { id: traceId }
      }),
      ...(organisationId && {
        event: { reference: organisationId }
      }),
      ...((clientId || clientName) && {
        tenant: {
          ...(clientId && { id: clientId }),
          ...(clientName && { message: clientName })
        }
      })
    }
  }
}
