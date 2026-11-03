import { createServer } from '../server.js'
import { config } from '../config.js'
import { apiVersions } from '../common/helpers/api-versions.js'

const beta1 = apiVersions.find(({ id }) => id === 'beta-1')

describe('deprecationHeader on the app server', () => {
  let server
  let beta1Deprecated

  beforeAll(async () => {
    beta1Deprecated = beta1.deprecated
    beta1.deprecated = true
    config.set('featureFlags.apiVersionsEnabled', 'beta-1,beta-2')
    server = await createServer()
  })

  afterAll(async () => {
    await server.stop()
    config.set('featureFlags.apiVersionsEnabled', '')
    beta1.deprecated = beta1Deprecated
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
