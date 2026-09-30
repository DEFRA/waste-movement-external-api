import { Server } from '@hapi/hapi'
import {
  CLIENT_ID_HEADER,
  clientContext,
  getClientId,
  getClientName,
  withClientId
} from './client-context.js'
import hapiPino from 'hapi-pino'
import { loggerOptions } from './logging/logger-options.js'
import { httpClients } from './http-client.js'
import { config } from '../../config.js'

jest.mock('./http-client.js', () => ({
  httpClients: {
    softwareProviderDetails: {
      get: jest.fn()
    }
  }
}))

const originalGet = config.get.bind(config)
let clientNameCacheDuration = 1

jest.spyOn(config, 'get').mockImplementation((key) => {
  if (key === 'serviceName') {
    return 'test-service'
  }

  if (key === 'clientNameCacheDuration') {
    return clientNameCacheDuration
  }

  return originalGet(key)
})

describe('#withClientId', () => {
  test('leaves headers unchanged when no client id is set', () => {
    expect(withClientId(CLIENT_ID_HEADER, { existing: 'value' })).toEqual({
      existing: 'value'
    })
  })

  test('defaults to a new headers object when none is provided', () => {
    expect(withClientId(CLIENT_ID_HEADER)).toEqual({})
  })

  test('getClientId returns null outside of a request', () => {
    expect(getClientId()).toBeNull()
  })
})

describe('#clientContext plugin', () => {
  const clientId = 'test-client-id'
  let server

  beforeEach(async () => {
    server = new Server()
    await server.register({
      plugin: hapiPino,
      options: loggerOptions
    })

    // Minimal auth scheme that authenticates with a fixed client id, so the
    // onCredentials extension has credentials to store.
    server.auth.scheme('test-scheme', () => ({
      authenticate(request, h) {
        return h.authenticated({ credentials: { clientId } })
      }
    }))
    server.auth.strategy('test', 'test-scheme')

    await server.register(clientContext)
  })

  afterEach(async () => {
    await server.stop({ timeout: 0 })
  })

  test('exposes the caller client id to the request lifecycle', async () => {
    expect.assertions(3)

    server.route({
      method: 'GET',
      path: '/authed',
      options: { auth: 'test' },
      handler: (request, h) => {
        expect(getClientId()).toBe(clientId)
        return h.response(withClientId(CLIENT_ID_HEADER, {})).code(200)
      }
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/authed'
    })

    expect(statusCode).toBe(200)
    expect(result).toEqual({ [CLIENT_ID_HEADER]: clientId })
  })

  test('does not set a client id for unauthenticated routes', async () => {
    expect.assertions(2)

    server.route({
      method: 'GET',
      path: '/open',
      options: { auth: false },
      handler: (request, h) => {
        expect(getClientId()).toBeNull()
        return h.response('ok').code(200)
      }
    })

    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/open'
    })

    expect(statusCode).toBe(200)
  })
})

describe('#clientContext plugin onPostAuth', () => {
  let server
  let currentClientId

  beforeEach(async () => {
    jest.clearAllMocks()

    server = new Server()
    await server.register({
      plugin: hapiPino,
      options: loggerOptions
    })

    // Auth scheme that authenticates using whichever clientId the current
    // test has set, so each test can use its own unique id and avoid
    // colliding with the shared, module-level clientNameCache.
    server.auth.scheme('test-scheme', () => ({
      authenticate(request, h) {
        return h.authenticated({ credentials: { clientId: currentClientId } })
      }
    }))
    server.auth.strategy('test', 'test-scheme')

    await server.register(clientContext)

    server.route({
      method: 'GET',
      path: '/authed',
      options: { auth: 'test' },
      handler: (request, h) =>
        h.response({ clientName: getClientName() }).code(200)
    })
  })

  afterEach(async () => {
    await server.stop({ timeout: 0 })
  })

  test('fetches client details and stores the client name on success', async () => {
    currentClientId = 'client1'

    httpClients.softwareProviderDetails.get.mockResolvedValue({
      payload: { clientName: 'Acme Ltd' }
    })

    const { statusCode, result } = await server.inject({
      method: 'GET',
      url: '/authed'
    })

    expect(statusCode).toBe(200)
    expect(result).toEqual({ clientName: 'Acme Ltd' })
    expect(httpClients.softwareProviderDetails.get).toHaveBeenCalledWith(
      `/clients/test-service/${currentClientId}`
    )
  })

  test('serves the client name from cache on a subsequent request within the TTL', async () => {
    currentClientId = 'client-cache-hit'
    // large cache duration to ensure the cache is still valid for the second request
    clientNameCacheDuration = 1000

    httpClients.softwareProviderDetails.get.mockResolvedValue({
      payload: { clientName: 'Cached Co' }
    })

    const first = await server.inject({ method: 'GET', url: '/authed' })
    const second = await server.inject({ method: 'GET', url: '/authed' })

    expect(first.statusCode).toBe(200)
    expect(second.statusCode).toBe(200)
    expect(JSON.parse(second.payload)).toEqual({ clientName: 'Cached Co' })

    expect(httpClients.softwareProviderDetails.get).toHaveBeenCalledTimes(1)
  })

  test('refetches once the cached entry has expired', async () => {
    clientNameCacheDuration = 1

    currentClientId = 'client-cache-expiry'

    httpClients.softwareProviderDetails.get.mockResolvedValue({
      payload: { clientName: 'Expiring Co' }
    })

    await server.inject({ method: 'GET', url: '/authed' })

    // set cache timeout to 1ms then wait for 2ms to ensure the cache has expired before the next request
    await new Promise((resolve) => setTimeout(resolve, 2))

    await server.inject({ method: 'GET', url: '/authed' })

    expect(httpClients.softwareProviderDetails.get).toHaveBeenCalledTimes(2)
  })

  test('does not set a client name when the backend response has no clientName', async () => {
    currentClientId = 'client-no-name'
    clientNameCacheDuration = 100

    httpClients.softwareProviderDetails.get.mockResolvedValue({
      payload: {}
    })

    const { statusCode, result } = await server.inject({
      method: 'GET',
      url: '/authed'
    })

    expect(statusCode).toBe(200)
    expect(result).toEqual({ clientName: null })
  })

  test('does not block the request when the backend call throws', async () => {
    currentClientId = 'client-fetch-error'

    httpClients.softwareProviderDetails.get.mockRejectedValue(
      new Error('Client request error: getaddrinfo ENOTFOUND')
    )

    const { statusCode, result } = await server.inject({
      method: 'GET',
      url: '/authed'
    })

    expect(statusCode).toBe(200)
    expect(result).toEqual({ clientName: null })
  })

  test('does not attempt to fetch client details when there is no clientId', async () => {
    currentClientId = undefined

    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/authed'
    })

    expect(statusCode).toBe(200)
    expect(httpClients.softwareProviderDetails.get).not.toHaveBeenCalled()
  })
})
