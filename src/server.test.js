import { createServer } from './server.js'

describe('Server', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  describe('RFC 9457 error formatting', () => {
    it('formats errors on beta paths as problem details with the docs type base', async () => {
      const expectedTypeBase =
        'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/'
      const { statusCode, headers, payload } = await server.inject({
        method: 'GET',
        url: '/beta-2/does-not-exist'
      })

      expect(statusCode).toBe(404)
      expect(headers['content-type']).toEqual('application/problem+json')
      expect(JSON.parse(payload)).toMatchObject({
        type: `${expectedTypeBase}not-found`,
        title: 'Not Found',
        instance: '/beta-2/does-not-exist'
      })
    })

    it('does not format errors on non-beta paths', async () => {
      const { statusCode, headers } = await server.inject({
        method: 'GET',
        url: '/does-not-exist'
      })

      expect(statusCode).toBe(404)
      expect(headers['content-type']).not.toContain('application/problem+json')
    })
  })
})
