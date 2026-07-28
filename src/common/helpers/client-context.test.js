import { Server } from '@hapi/hapi'
import {
  clientContext,
  getClientId,
  withClientId,
  CLIENT_ID_HEADER
} from './client-context.js'

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
