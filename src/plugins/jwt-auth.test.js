import { createLogger } from '../common/helpers/logging/logger.js'
import { validateJwt } from './jwt-auth.js'

describe('validateJwt', () => {
  const logger = createLogger()
  const clientId = 'test-client-id'
  const scope = ['waste-movement-external-api-resource-srv/access']

  const artifactsFor = (payload) => ({ decoded: { payload } })
  const validToken = artifactsFor({
    client_id: clientId,
    token_use: 'access',
    scope
  })

  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation(() => {})
    jest.spyOn(logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('accepts a valid access token and exposes its client id', async () => {
    const result = await validateJwt(validToken, {
      path: '/beta-1/movements'
    })

    expect(result).toEqual({
      isValid: true,
      credentials: { clientId, scope }
    })
  })

  it.each([
    ['without a client id', { token_use: 'access', scope }],
    ['that is not an access token', { client_id: clientId, scope }],
    [
      'without the required scope',
      { client_id: clientId, token_use: 'access', scope: [] }
    ]
  ])('rejects a token %s', async (_description, payload) => {
    const result = await validateJwt(artifactsFor(payload), {
      path: '/beta-1/movements'
    })

    expect(result).toEqual({ isValid: false })
  })

  describe('"JWT token client_id" log line', () => {
    it.each(['/beta-1/movements', '/beta-2/movements'])(
      'includes tenant.id on %s',
      async (path) => {
        await validateJwt(validToken, { path })

        expect(logger.info).toHaveBeenCalledWith(
          { tenant: { id: clientId } },
          `JWT token client_id: ${clientId}`
        )
      }
    )

    // Receipt of waste and other routes are unchanged
    it.each(['/movements/receive', '/movements/2578ZCY8/receive'])(
      'has no tenant on %s',
      async (path) => {
        await validateJwt(validToken, { path })

        expect(logger.info).toHaveBeenCalledWith(
          {},
          `JWT token client_id: ${clientId}`
        )
      }
    )
  })

  describe('rejection log lines', () => {
    const rejections = [
      [
        'JWT token is not an access token',
        { client_id: clientId, token_use: 'id', scope }
      ],
      [
        'JWT token missing required scope',
        { client_id: clientId, token_use: 'access', scope: [] }
      ]
    ]

    it.each(rejections)(
      'logs "%s" with tenant.id on beta routes',
      async (message, payload) => {
        await validateJwt(artifactsFor(payload), { path: '/beta-1/movements' })

        expect(logger.error).toHaveBeenCalledWith(
          { tenant: { id: clientId } },
          message
        )
      }
    )

    // Receipt of waste and other routes are unchanged
    it.each(rejections)(
      'logs "%s" without tenant on receipt of waste routes',
      async (message, payload) => {
        await validateJwt(artifactsFor(payload), { path: '/movements/receive' })

        expect(logger.error).toHaveBeenCalledWith({}, message)
      }
    )

    it('logs a missing client_id without tenant, as there is none', async () => {
      await validateJwt(artifactsFor({ token_use: 'access', scope }), {
        path: '/beta-1/movements'
      })

      expect(logger.error).toHaveBeenCalledWith('JWT token missing client_id')
    })
  })
})
