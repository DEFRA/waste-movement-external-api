import { createServer } from '../server.js'
import { config } from '../config.js'

describe('deprecationHeader on the app server', () => {
  let server

  beforeAll(async () => {
    config.set('featureFlags.apiVersionsEnabled', 'beta-1,beta-2')
    server = await createServer()
  })

  afterAll(async () => {
    await server.stop()
    config.set('featureFlags.apiVersionsEnabled', '')
  })

  it('sets Deprecation on a beta-1 request rejected for having no token', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: '/beta-1/movements',
      payload: {}
    })

    expect(statusCode).toBe(401)
    expect(headers).toHaveProperty('deprecation', 'true')
  })

  it('does not set Deprecation on a beta-2 request', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: '/beta-2/movements',
      payload: {}
    })

    expect(statusCode).toBe(401)
    expect(headers).not.toHaveProperty('deprecation')
  })
})
