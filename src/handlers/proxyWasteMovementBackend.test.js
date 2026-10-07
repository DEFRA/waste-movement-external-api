import { jest } from '@jest/globals'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { httpClients } from '../common/helpers/http-client.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { config } from '../config.js'
import { createServer } from '../server.js'
import * as clientContext from '../common/helpers/client-context.js'
import { API_CODE_HEADER } from '../common/helpers/api-code.js'
import {
  CLIENT_NAME_HEADER,
  ORGANISATION_ID_HEADER,
  maskApiCode,
  proxyWasteMovementBackend
} from './proxyWasteMovementBackend.js'
import { badImplementation } from '@hapi/boom'

jest.mock('../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteOrganisation: {
      get: jest.fn()
    },
    wasteMovement: {
      post: jest.fn()
    }
  }
}))

jest.mock('../plugins/jwt-auth.js', () => ({
  jwtAuth: {
    plugin: {
      name: 'jwt-auth',
      register(server) {
        server.auth.scheme('jwt', () => ({
          authenticate(request, h) {
            return h.authenticated({
              credentials: { clientId: 'test-client-id' }
            })
          }
        }))
        server.auth.strategy('jwt', 'jwt')
        server.auth.default('jwt')
      }
    }
  }
}))

// Must stay the first describe in this file: jest.config.js sets
// resetModules, and createServer() lazily loads hapi internals, so building
// the server after any other test has run mixes two module registries.
//
// Beta requests end to end through the external API: the apiCode lookup in
// waste-organisation-backend decides which organisation (if any) is forwarded
// to the backend.
describe('proxyWasteMovementBackend through the server', () => {
  let server

  const apiCode = '25b14080-5e77-4f91-9957-2482a0cb8775'
  const organisationId = 'd829f66d-857f-401d-b5e9-5061b7dbb29d'

  beforeAll(async () => {
    config.set('featureFlags.apiVersionsEnabled', 'beta-1,beta-2')
    server = await createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: HTTP_STATUS.CREATED,
      payload: { data: { movementId: '26S8EYDJ' } }
    })
  })

  const betaRoutes = [
    ['/beta-1/movements', { apiCode }],
    ['/beta-1/movements/26S8EYDJ/collection', { apiCode }],
    ['/beta-1/deliveries', { apiCode, movementIds: ['26S8EYDJ'] }],
    ['/beta-1/deliveries/25KMT4Z9/receipt', { apiCode }],
    ['/beta-1/receipts', { apiCode, reason: 'No delivery' }],
    // beta-2 reads the x-api-code header but still falls back to
    // the body while clients move over
    [
      '/beta-2/movements',
      { apiCode, producer: { wasteSource: 'Household', councilMovement: true } }
    ]
  ]

  it.each(betaRoutes)(
    'POST %s forwards the organisation for a valid API code',
    async (url, payload) => {
      httpClients.wasteOrganisation.get.mockResolvedValue({
        payload: { defraCustomerOrganisationId: organisationId }
      })

      const { statusCode } = await server.inject({
        method: 'POST',
        url,
        payload
      })

      expect(statusCode).toEqual(HTTP_STATUS.CREATED)
      expect(httpClients.wasteOrganisation.get).toHaveBeenCalledWith(
        `/organisation/${apiCode}`
      )
      expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
        url,
        payload,
        { [ORGANISATION_ID_HEADER]: organisationId }
      )
    }
  )

  it('POST /beta-2/movements forwards the organisation for an API code in the x-api-code header', async () => {
    httpClients.wasteOrganisation.get.mockResolvedValue({
      payload: { defraCustomerOrganisationId: organisationId }
    })
    const payload = {
      producer: { wasteSource: 'Household', councilMovement: true }
    }

    const { statusCode } = await server.inject({
      method: 'POST',
      url: '/beta-2/movements',
      payload,
      headers: { [API_CODE_HEADER]: apiCode }
    })

    expect(statusCode).toEqual(HTTP_STATUS.CREATED)
    expect(httpClients.wasteOrganisation.get).toHaveBeenCalledWith(
      `/organisation/${apiCode}`
    )
    // The raw apiCode header is never forwarded, only the organisation
    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      '/beta-2/movements',
      payload,
      { [ORGANISATION_ID_HEADER]: organisationId }
    )
  })

  it('POST /beta-2/movements returns 401 without calling the backend when the x-api-code header is missing', async () => {
    const { statusCode, result } = await server.inject({
      method: 'POST',
      url: '/beta-2/movements',
      payload: { producer: { wasteSource: 'Household' } }
    })

    expect(statusCode).toEqual(HTTP_STATUS.UNAUTHORIZED)
    expect(result).toMatchObject({
      title: 'Unauthorized',
      detail: 'The x-api-code header is required'
    })
    expect(httpClients.wasteOrganisation.get).not.toHaveBeenCalled()
    expect(httpClients.wasteMovement.post).not.toHaveBeenCalled()
  })

  // waste-organisation-backend answers 404 for both unknown and disabled codes
  it.each(['an unknown', 'a disabled'])(
    'POST /beta-2/movements returns 401 without calling the backend for %s API code',
    async () => {
      httpClients.wasteOrganisation.get.mockResolvedValue({
        payload: { statusCode: HTTP_STATUS.NOT_FOUND }
      })

      const { statusCode, result } = await server.inject({
        method: 'POST',
        url: '/beta-2/movements',
        payload: { producer: { wasteSource: 'Household' } },
        headers: { [API_CODE_HEADER]: apiCode }
      })

      expect(statusCode).toEqual(HTTP_STATUS.UNAUTHORIZED)
      expect(result).toMatchObject({
        title: 'Unauthorized',
        detail: 'The x-api-code header does not contain a valid API code'
      })
      expect(httpClients.wasteMovement.post).not.toHaveBeenCalled()
    }
  )

  it('ignores the x-api-code header on beta-1 routes', async () => {
    await server.inject({
      method: 'POST',
      url: '/beta-1/movements',
      payload: {},
      headers: { [API_CODE_HEADER]: apiCode }
    })

    expect(httpClients.wasteOrganisation.get).not.toHaveBeenCalled()
    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      '/beta-1/movements',
      {},
      {}
    )
  })

  // waste-organisation-backend answers 404 for both unknown and disabled codes
  it.each(['unknown', 'disabled'])(
    'does not forward an organisation for a %s API code',
    async () => {
      httpClients.wasteOrganisation.get.mockResolvedValue({
        payload: { statusCode: HTTP_STATUS.NOT_FOUND }
      })

      await server.inject({
        method: 'POST',
        url: '/beta-1/movements',
        payload: { apiCode }
      })

      expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
        '/beta-1/movements',
        { apiCode },
        {}
      )
    }
  )

  it('does not forward an organisation header sent by the client', async () => {
    httpClients.wasteOrganisation.get.mockResolvedValue({
      payload: { statusCode: HTTP_STATUS.NOT_FOUND }
    })

    await server.inject({
      method: 'POST',
      url: '/beta-1/movements',
      payload: { apiCode },
      headers: { [ORGANISATION_ID_HEADER]: 'client-supplied-org-id' }
    })

    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      '/beta-1/movements',
      { apiCode },
      {}
    )
  })

  it.each(['/beta-1/movements', '/beta-2/movements'])(
    'POST %s returns 402 for an unpaid organisation without calling the backend',
    async (url) => {
      httpClients.wasteOrganisation.get.mockResolvedValue({
        payload: {
          statusCode: HTTP_STATUS.PAYMENT_REQUIRED,
          message: 'Payment is required'
        }
      })

      const { statusCode } = await server.inject({
        method: 'POST',
        url,
        payload: { apiCode }
      })

      expect(statusCode).toEqual(HTTP_STATUS.PAYMENT_REQUIRED)
      expect(httpClients.wasteMovement.post).not.toHaveBeenCalled()
    }
  )

  // Only a 404 means an unknown or disabled API code; any other failure is
  // ours, so it must not reach the backend and come back as an invalid code.
  it.each([
    ['a 401', { statusCode: HTTP_STATUS.UNAUTHORIZED }],
    ['a 500', { statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR }],
    ['a 503', { statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE }],
    ['a response without an organisation', {}]
  ])(
    'returns 502 without calling the backend when the lookup returns %s',
    async (_description, lookupPayload) => {
      httpClients.wasteOrganisation.get.mockResolvedValue({
        payload: lookupPayload
      })

      const { statusCode, result } = await server.inject({
        method: 'POST',
        url: '/beta-1/movements',
        payload: { apiCode }
      })

      expect(statusCode).toEqual(HTTP_STATUS.BAD_GATEWAY)
      expect(result).toMatchObject({
        title: 'Bad Gateway',
        detail: 'Unable to verify the API Code'
      })
      expect(httpClients.wasteMovement.post).not.toHaveBeenCalled()
    }
  )
})

describe('proxyWasteMovementBackend', () => {
  const logger = createLogger()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(logger, 'info').mockImplementation(() => {})
    jest.spyOn(logger, 'warn').mockImplementation(() => {})
    jest.spyOn(logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const apiCode = '25b14080-5e77-4f91-9957-2482a0cb8775'
  const organisationId = 'd829f66d-857f-401d-b5e9-5061b7dbb29d'
  const payload = { apiCode }
  const path = '/back/end/path'
  const goodRequest = {
    auth: {
      credentials: {
        clientId: 'test-client-id'
      }
    },
    method: 'post',
    payload,
    path,
    params: {}
  }
  const requestWithOrganisation = {
    ...goodRequest,
    submittingOrganisation: { defraCustomerOrganisationId: organisationId }
  }
  const h = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis(),
    message: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis()
  }

  it('should successfully call the waste movement backend with a valid payload', async () => {
    const backendResponse = {
      statusCode: HTTP_STATUS.CREATED,
      payload: { movementId: 'movementId' },
      statusMessage: 'Successful'
    }

    httpClients.wasteMovement.post.mockResolvedValue(backendResponse)

    await proxyWasteMovementBackend(goodRequest, h)

    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      path,
      payload,
      {}
    )
    expect(h.response).toHaveBeenCalledWith(backendResponse.payload)
    expect(h.code).toHaveBeenCalledWith(backendResponse.statusCode)
  })

  it('should successfully manage headers to proxy', async () => {
    const backendResponse = {
      statusCode: HTTP_STATUS.CREATED,
      payload: { movementId: 'movementId' },
      statusMessage: 'Successful',
      headers: {
        'Content-Type': 'application/problem+json',
        'x-request-id': '12345678',
        'back-end-header': 'xxx'
      }
    }

    httpClients.wasteMovement.post.mockResolvedValue(backendResponse)

    await proxyWasteMovementBackend(goodRequest, h)

    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      path,
      payload,
      {}
    )
    expect(h.response).toHaveBeenCalledWith(backendResponse.payload)
    expect(h.code).toHaveBeenCalledWith(backendResponse.statusCode)
    expect(h.header).toHaveBeenCalledWith(
      'Content-Type',
      'application/problem+json'
    )
    expect(h.header).toHaveBeenCalledWith('x-request-id', '12345678')
    expect(h.header).not.toHaveBeenCalledWith(
      'back-end-header',
      expect.anything()
    )
  })

  it('should return 500 when waste collection creation fails', async () => {
    httpClients.wasteMovement.post.mockRejectedValue(new Error('API Error'))

    const returned = await proxyWasteMovementBackend(goodRequest, h)

    expect(returned).toEqual(badImplementation('API Error'))
  })

  describe('organisation forwarding', () => {
    beforeEach(() => {
      httpClients.wasteMovement.post.mockResolvedValue({
        statusCode: HTTP_STATUS.CREATED,
        payload: {}
      })
    })

    it('forwards the organisation resolved by waste-organisation-backend in a header', async () => {
      await proxyWasteMovementBackend(requestWithOrganisation, h)

      expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
        path,
        payload,
        { [ORGANISATION_ID_HEADER]: organisationId }
      )
    })

    it('forwards the client name, URI-encoded, when it is known', async () => {
      jest.spyOn(clientContext, 'getClientName').mockReturnValue('Débora & Co')

      await proxyWasteMovementBackend(requestWithOrganisation, h)

      expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
        path,
        payload,
        {
          [ORGANISATION_ID_HEADER]: organisationId,
          [CLIENT_NAME_HEADER]: 'D%C3%A9bora%20%26%20Co'
        }
      )
    })

    it('forwards the client name even when no organisation was resolved', async () => {
      jest.spyOn(clientContext, 'getClientName').mockReturnValue('Acme Ltd')

      await proxyWasteMovementBackend(goodRequest, h)

      expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
        path,
        payload,
        { [CLIENT_NAME_HEADER]: 'Acme%20Ltd' }
      )
    })

    it('does not forward an organisation header when none was resolved', async () => {
      await proxyWasteMovementBackend(goodRequest, h)

      expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
        path,
        payload,
        {}
      )
    })

    it('ignores an organisation header sent by the client', async () => {
      await proxyWasteMovementBackend(
        {
          ...requestWithOrganisation,
          headers: { [ORGANISATION_ID_HEADER]: 'client-supplied-org-id' }
        },
        h
      )

      expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
        path,
        payload,
        { [ORGANISATION_ID_HEADER]: organisationId }
      )
    })

    it('ignores a client-supplied header when no organisation was resolved', async () => {
      await proxyWasteMovementBackend(
        {
          ...goodRequest,
          headers: { [ORGANISATION_ID_HEADER]: 'client-supplied-org-id' }
        },
        h
      )

      expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
        path,
        payload,
        {}
      )
    })
  })

  describe('logging', () => {
    it('logs one info line with the organisation when the lookup succeeded', async () => {
      httpClients.wasteMovement.post.mockResolvedValue({
        statusCode: HTTP_STATUS.CREATED,
        payload: {}
      })

      await proxyWasteMovementBackend(requestWithOrganisation, h)

      expect(logger.info).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledWith(
        {
          event: { action: 'beta-request-proxied', reference: organisationId },
          url: { path },
          http: {
            request: { method: 'POST' },
            response: { status_code: HTTP_STATUS.CREATED }
          }
        },
        'Beta request proxied'
      )
      expect(logger.warn).not.toHaveBeenCalled()
    })

    it('logs one warn line with a masked API code when the lookup returned 404', async () => {
      httpClients.wasteMovement.post.mockResolvedValue({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        payload: {}
      })

      await proxyWasteMovementBackend(goodRequest, h)

      expect(logger.info).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledTimes(1)
      expect(logger.warn).toHaveBeenCalledWith(
        {
          event: {
            action: 'beta-request-proxied',
            reason: 'No organisation resolved for API code ****8775'
          },
          url: { path },
          http: {
            request: { method: 'POST' },
            response: { status_code: HTTP_STATUS.BAD_REQUEST }
          }
        },
        'Beta request proxied'
      )
      expect(JSON.stringify(logger.warn.mock.calls)).not.toContain(apiCode)
    })

    it('masks an API code sent in the x-api-code header on beta-2', async () => {
      httpClients.wasteMovement.post.mockResolvedValue({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        payload: {}
      })

      await proxyWasteMovementBackend(
        {
          ...goodRequest,
          path: '/beta-2/movements',
          payload: {},
          headers: { [API_CODE_HEADER]: apiCode }
        },
        h
      )

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          event: {
            action: 'beta-request-proxied',
            reason: 'No organisation resolved for API code ****8775'
          }
        }),
        'Beta request proxied'
      )
      expect(JSON.stringify(logger.warn.mock.calls)).not.toContain(apiCode)
    })

    it('logs one line with the error status when the backend call fails', async () => {
      httpClients.wasteMovement.post.mockRejectedValue(new Error('API Error'))

      await proxyWasteMovementBackend(requestWithOrganisation, h)

      expect(logger.info).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          http: {
            request: { method: 'POST' },
            response: { status_code: HTTP_STATUS.INTERNAL_SERVER_ERROR }
          }
        }),
        'Beta request proxied'
      )
      expect(JSON.stringify(logger.error.mock.calls)).not.toContain(apiCode)
    })
  })
})

describe('maskApiCode', () => {
  it('keeps only the last 4 characters', () => {
    expect(maskApiCode('25b14080-5e77-4f91-9957-2482a0cb8775')).toBe('****8775')
  })

  it.each([undefined, null, '', 'abcd', 1234])('fully masks %p', (apiCode) => {
    expect(maskApiCode(apiCode)).toBe('****')
  })
})
