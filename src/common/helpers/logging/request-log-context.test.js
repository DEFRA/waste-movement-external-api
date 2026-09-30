import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { httpClients } from '../http-client.js'
import { config } from '../../../config.js'
import { createServer } from '../../../server.js'
import { createMovementRequest } from '../../../test/utils/createMovementRequest.js'

// Every JSON line written by the request logger (hapi-pino) and by
// createLogger(), exactly as CDP would receive it.
const mockLogLines = []

// The production logger options in ECS format, writing to mockLogLines. A
// function declaration, so the hoisted jest.mock factories below can call it.
function mockCapturedLoggerOptions() {
  const { Writable } = jest.requireActual('stream')
  const { ecsFormat } = jest.requireActual('@elastic/ecs-pino-format')
  const { loggerOptions } = jest.requireActual('./logger-options.js')
  // Drop the pino-pretty transport used outside production, so the lines are
  // the same ECS JSON CDP gets. (Not object rest: Babel compiles it to a helper
  // the hoisted factories would run before.)
  const options = {
    ...loggerOptions,
    ...ecsFormat({ serviceName: 'test' }),
    enabled: true,
    level: 'info'
  }
  delete options.transport

  const stream = new Writable({
    write(chunk, _encoding, callback) {
      mockLogLines.push(chunk.toString())
      callback()
    }
  })

  return { options, stream }
}

jest.mock('./request-logger.js', () => {
  const { options, stream } = mockCapturedLoggerOptions()
  return {
    requestLogger: {
      plugin: jest.requireActual('hapi-pino'),
      options: { ...options, stream }
    }
  }
})

jest.mock('./logger.js', () => {
  const { pino } = jest.requireActual('pino')
  const { options, stream } = mockCapturedLoggerOptions()
  const logger = pino(options, stream)
  return { createLogger: () => logger }
})

jest.mock('../http-client.js', () => ({
  httpClients: {
    wasteOrganisation: { get: jest.fn() },
    wasteMovement: { post: jest.fn() },
    wasteTracking: { get: jest.fn() }
  }
}))

jest.mock('../../../plugins/jwt-auth.js', () => ({
  jwtAuth: {
    plugin: {
      name: 'jwt-auth',
      register(server) {
        server.auth.scheme('jwt', () => ({
          authenticate(request, h) {
            return h.authenticated({ credentials: { clientId: mockClientId } })
          }
        }))
        server.auth.strategy('jwt', 'jwt')
        server.auth.default('jwt')
      }
    }
  }
}))

const mockClientId = 'test-client-id'
const organisationId = 'd829f66d-857f-401d-b5e9-5061b7dbb29d'
const apiCode = '25b14080-5e77-4f91-9957-2482a0cb8775'

const requestCompletedLine = (method, path) => {
  const prefix = `[response] ${method} ${path} `
  const raw = mockLogLines.find((line) =>
    JSON.parse(line).message?.startsWith(prefix)
  )
  expect(raw).toBeDefined()
  return { raw, line: JSON.parse(raw) }
}

// JSON.parse keeps only the last duplicate key, so count them in the raw line
const keyCount = (raw, key) => raw.split(`"${key}":`).length - 1

describe('request log context', () => {
  let server

  beforeAll(async () => {
    config.set('featureFlags.apiVersionsEnabled', 'beta-1,beta-2')
    server = await createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockLogLines.length = 0
  })

  describe('beta routes', () => {
    it.each([
      ['beta-1', '/beta-1/movements', { apiCode }],
      [
        'beta-2',
        '/beta-2/movements',
        {
          apiCode,
          producer: { wasteSource: 'Household', councilMovement: true }
        }
      ]
    ])(
      'adds tenant.id and event.reference to "request completed" for a successful %s request',
      async (_version, url, payload) => {
        httpClients.wasteOrganisation.get.mockResolvedValue({
          payload: { defraCustomerOrganisationId: organisationId }
        })
        httpClients.wasteMovement.post.mockResolvedValue({
          statusCode: HTTP_STATUS.CREATED,
          payload: { data: { movementId: '26S8EYDJ' } }
        })

        const { statusCode } = await server.inject({
          method: 'POST',
          url,
          payload
        })

        expect(statusCode).toEqual(HTTP_STATUS.CREATED)
        const { raw, line } = requestCompletedLine('post', url)
        expect(line.tenant).toEqual({ id: mockClientId })
        expect(line.event).toEqual({ reference: organisationId })
        expect(keyCount(raw, 'tenant')).toEqual(1)
        expect(keyCount(raw, 'event')).toEqual(1)
      }
    )

    it('adds tenant.id and event.reference to "request completed" when the backend rejects the request with 400', async () => {
      httpClients.wasteOrganisation.get.mockResolvedValue({
        payload: { defraCustomerOrganisationId: organisationId }
      })
      httpClients.wasteMovement.post.mockResolvedValue({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        payload: { detail: '1 validation error occurred' }
      })

      const { statusCode } = await server.inject({
        method: 'POST',
        url: '/beta-1/movements',
        payload: { apiCode }
      })

      expect(statusCode).toEqual(HTTP_STATUS.BAD_REQUEST)
      const { raw, line } = requestCompletedLine('post', '/beta-1/movements')
      expect(line.tenant).toEqual({ id: mockClientId })
      expect(line.event).toEqual({ reference: organisationId })
      expect(keyCount(raw, 'tenant')).toEqual(1)
      expect(keyCount(raw, 'event')).toEqual(1)
    })

    it('adds tenant.id but no event.reference to "request completed" for an unknown or disabled API code', async () => {
      httpClients.wasteOrganisation.get.mockResolvedValue({
        payload: { statusCode: HTTP_STATUS.NOT_FOUND }
      })
      httpClients.wasteMovement.post.mockResolvedValue({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        payload: { detail: 'the API Code supplied is invalid' }
      })

      await server.inject({
        method: 'POST',
        url: '/beta-1/movements',
        payload: { apiCode }
      })

      const { raw, line } = requestCompletedLine('post', '/beta-1/movements')
      expect(line.tenant).toEqual({ id: mockClientId })
      expect(line).not.toHaveProperty('event')
      expect(keyCount(raw, 'tenant')).toEqual(1)
    })

    it('adds tenant.id but no event.reference to "request completed" for an unpaid organisation (402)', async () => {
      httpClients.wasteOrganisation.get.mockResolvedValue({
        payload: {
          statusCode: HTTP_STATUS.PAYMENT_REQUIRED,
          message: 'Payment is required'
        }
      })

      const { statusCode } = await server.inject({
        method: 'POST',
        url: '/beta-1/movements',
        payload: { apiCode }
      })

      expect(statusCode).toEqual(HTTP_STATUS.PAYMENT_REQUIRED)
      const { raw, line } = requestCompletedLine('post', '/beta-1/movements')
      expect(line.tenant).toEqual({ id: mockClientId })
      expect(line).not.toHaveProperty('event')
      expect(keyCount(raw, 'tenant')).toEqual(1)
    })

    it('writes tenant and event only once on every line of a beta request', async () => {
      httpClients.wasteOrganisation.get.mockResolvedValue({
        payload: { defraCustomerOrganisationId: organisationId }
      })
      httpClients.wasteMovement.post.mockResolvedValue({
        statusCode: HTTP_STATUS.CREATED,
        payload: {}
      })

      await server.inject({
        method: 'POST',
        url: '/beta-1/movements',
        payload: { apiCode }
      })

      // Includes the proxy's own line, which sets event explicitly on top of
      // the mixin
      expect(mockLogLines.map((raw) => JSON.parse(raw).message)).toEqual(
        expect.arrayContaining([
          'Beta request proxied',
          expect.stringMatching(/^\[response\] post \/beta-1\/movements 201/)
        ])
      )
      for (const raw of mockLogLines) {
        expect(keyCount(raw, 'tenant')).toBeLessThanOrEqual(1)
        expect(keyCount(raw, 'event')).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('receipt of waste routes (unchanged)', () => {
    it('leaves "request completed" without tenant.id or event.reference', async () => {
      httpClients.wasteOrganisation.get.mockResolvedValue({
        payload: { defraCustomerOrganisationId: organisationId }
      })
      httpClients.wasteTracking.get.mockResolvedValue({
        payload: { wasteTrackingId: '2578ZCY8' }
      })
      httpClients.wasteMovement.post.mockResolvedValue({
        statusCode: HTTP_STATUS.CREATED
      })

      await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload: createMovementRequest({ apiCode })
      })

      const { line } = requestCompletedLine('post', '/movements/receive')
      expect(line).not.toHaveProperty('tenant')
      expect(line).not.toHaveProperty('event')
    })
  })
})
