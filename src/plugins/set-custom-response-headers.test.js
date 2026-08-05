import { httpClients } from '../common/helpers/http-client.js'
import { createServer } from '../server.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'

jest.mock('../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteTracking: {
      get: jest.fn().mockResolvedValue({
        payload: {
          wasteTrackingId: '2578ZCY8'
        }
      })
    },
    wasteOrganisation: {
      get: jest.fn()
    },
    wasteMovement: {
      post: jest.fn().mockResolvedValue({
        statusCode: '200',
        payload: {}
      })
    }
  }
}))

jest.mock('./jwt-auth.js', () => ({
  jwtAuth: {
    plugin: {
      name: 'jwt-auth',
      register(server) {
        server.auth.scheme('jwt', () => ({
          authenticate(request, h) {
            return h.authenticated({ credentials: {} })
          }
        }))
        server.auth.strategy('jwt', 'jwt')
        server.auth.default('jwt')
      }
    }
  }
}))

describe('addSubmittingOrganisationToRequest', () => {
  let server

  const wasteOrgansiationBackendSuccessPayload = {
    defraCustomerOrganisationId: 'd829f66d-857f-401d-b5e9-5061b7dbb29d',
    metaData: {
      disableAfter: '2026-07-31T15:25:00.000Z'
    }
  }

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('should set service-charge-expiry-date response header when a Boom error is thrown', async () => {
    httpClients.wasteOrganisation.get.mockResolvedValue({
      payload: wasteOrgansiationBackendSuccessPayload
    })

    const { headers } = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: {
        ...createMovementRequest(),
        dateTimeReceived: undefined
      }
    })

    expect(headers).toHaveProperty(
      'service-charge-expiry-date',
      '2026-07-31T15:25:00.000Z'
    )
  })

  it('should set service-charge-expiry-date response header when a Boom error is not thrown', async () => {
    httpClients.wasteOrganisation.get.mockResolvedValue({
      payload: wasteOrgansiationBackendSuccessPayload
    })

    const { headers } = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: createMovementRequest()
    })

    expect(headers).toHaveProperty(
      'service-charge-expiry-date',
      '2026-07-31T15:25:00.000Z'
    )
  })

  it('should set default service-charge-expiry-date response header when serviceChargeExpiryDate is not available on the request', async () => {
    httpClients.wasteOrganisation.get.mockResolvedValue({
      payload: {}
    })

    const { headers } = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: createMovementRequest()
    })

    expect(headers).toHaveProperty(
      'service-charge-expiry-date',
      'not available'
    )
  })
})
