import Hapi from '@hapi/hapi'
import Boom from '@hapi/boom'
import { formatErrorToRFC9457Response } from '@defra/waste-movement-utils'
import { deprecationHeader } from './deprecation-header.js'
import { isBetaRoute } from '../common/helpers/beta-route.js'
import { apiVersions } from '../common/helpers/api-versions.js'

const ok = (_request, h) => h.response({ ok: true })
const fail = () => {
  throw Boom.badRequest('Invalid payload')
}

const beta1 = apiVersions.find(({ id }) => id === 'beta-1')

describe('deprecationHeader', () => {
  let server
  let beta1Deprecated

  beforeAll(async () => {
    beta1Deprecated = beta1.deprecated
    beta1.deprecated = true
    server = Hapi.server()
    server.ext('onRequest', (request, h) => {
      request.getTraceId = () => undefined
      request.logger = { error: jest.fn() }
      return h.continue
    })
    server.route([
      { method: 'GET', path: '/beta-1/ok', handler: ok },
      { method: 'GET', path: '/beta-1/fail', handler: fail },
      { method: 'GET', path: '/beta-2/ok', handler: ok },
      { method: 'GET', path: '/beta-10/ok', handler: ok },
      { method: 'GET', path: '/movements/ok', handler: ok }
    ])
    await server.register([
      deprecationHeader,
      {
        plugin: formatErrorToRFC9457Response,
        options: { shouldFormat: isBetaRoute }
      }
    ])
  })

  afterAll(async () => {
    await server.stop()
    beta1.deprecated = beta1Deprecated
  })

  it('sets Deprecation on a successful response from a deprecated version', async () => {
    const { statusCode, headers } = await server.inject('/beta-1/ok')

    expect(statusCode).toBe(200)
    expect(headers).toHaveProperty('deprecation', 'true')
  })

  it('keeps Deprecation on an error formatted as problem details', async () => {
    const { statusCode, headers } = await server.inject('/beta-1/fail')

    expect(statusCode).toBe(400)
    expect(headers['content-type']).toContain('application/problem+json')
    expect(headers).toHaveProperty('deprecation', 'true')
  })

  it('sets Deprecation when no route under a deprecated version matches', async () => {
    const { statusCode, headers } = await server.inject('/beta-1/unknown')

    expect(statusCode).toBe(404)
    expect(headers).toHaveProperty('deprecation', 'true')
  })

  it.each(['/beta-2/ok', '/beta-10/ok', '/movements/ok'])(
    'does not set Deprecation on %s',
    async (url) => {
      const { statusCode, headers } = await server.inject(url)

      expect(statusCode).toBe(200)
      expect(headers).not.toHaveProperty('deprecation')
    }
  )
})
