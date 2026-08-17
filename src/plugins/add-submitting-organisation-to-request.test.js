import { HTTP_STATUS } from '@defra/waste-movement-utils'
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

  const submittingOrganisation = {
    defraCustomerOrganisationId: 'd829f66d-857f-401d-b5e9-5061b7dbb29d'
  }
  const serviceChargeExpiryDate = new Date().toISOString()

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('should set submittingOrganisation and serviceChargeExpiryDate on the request when the request is successful', async () => {
    httpClients.wasteOrganisation.get.mockResolvedValue({
      payload: {
        ...submittingOrganisation,
        metaData: {
          disableAfter: serviceChargeExpiryDate
        }
      }
    })

    const { request } = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: createMovementRequest()
    })

    expect(request).toHaveProperty(
      'submittingOrganisation',
      submittingOrganisation
    )
    expect(request).toHaveProperty(
      'serviceChargeExpiryDate',
      serviceChargeExpiryDate
    )
  })

  it('should set not set submittingOrganisation or serviceChargeExpiryDate on the request when API Code is missing', async () => {
    const { request } = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: {
        ...createMovementRequest(),
        apiCode: undefined
      }
    })

    expect(request).not.toHaveProperty('submittingOrganisation')
    expect(request).not.toHaveProperty('serviceChargeExpiryDate')
  })

  it('should set submittingOrganisation and serviceChargeExpiryDate on the request when request data validation fails', async () => {
    const { request } = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: {
        ...createMovementRequest(),
        dateTimeReceived: undefined
      }
    })

    expect(request).toHaveProperty(
      'submittingOrganisation',
      submittingOrganisation
    )
    expect(request).toHaveProperty(
      'serviceChargeExpiryDate',
      serviceChargeExpiryDate
    )
  })

  it('should not set submittingOrganisation or serviceChargeExpiryDate on the request when Waste Organisation Backend returns a 404 error', async () => {
    httpClients.wasteOrganisation.get.mockResolvedValue({
      payload: {
        statusCode: HTTP_STATUS.NOT_FOUND
      }
    })

    const { request } = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: createMovementRequest()
    })

    expect(request).not.toHaveProperty('submittingOrganisation')
    expect(request).not.toHaveProperty('serviceChargeExpiryDate')
  })

  it('should not set submittingOrganisation or serviceChargeExpiryDate on the request when Waste Organisation Backend returns a 402 error', async () => {
    httpClients.wasteOrganisation.get.mockResolvedValue({
      payload: {
        statusCode: HTTP_STATUS.PAYMENT_REQUIRED
      }
    })

    const { request } = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: createMovementRequest()
    })

    expect(request).not.toHaveProperty('submittingOrganisation')
    expect(request).not.toHaveProperty('serviceChargeExpiryDate')
  })

  it("should set submittingOrganisation but not serviceChargeExpiryDate on the request when Waste Organisation Backend doesn't return disableAfter", async () => {
    httpClients.wasteOrganisation.get.mockResolvedValue({
      payload: {
        ...submittingOrganisation,
        metaData: {
          disableAfter: undefined
        }
      }
    })

    const { request } = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: createMovementRequest()
    })

    expect(request).toHaveProperty('submittingOrganisation')
    expect(request).not.toHaveProperty('serviceChargeExpiryDate')
  })

  it('should return a POST 402 Payment Required error when Waste Organisation Backend returns a 402 response', async () => {
    httpClients.wasteOrganisation.get.mockResolvedValue({
      payload: {
        statusCode: HTTP_STATUS.PAYMENT_REQUIRED,
        message: 'Payment is required'
      }
    })

    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: createMovementRequest()
    })

    expect(statusCode).toEqual(HTTP_STATUS.PAYMENT_REQUIRED)
    expect(result).toEqual({
      error: 'Payment Required',
      message: 'Payment is required',
      statusCode: HTTP_STATUS.PAYMENT_REQUIRED
    })
  })

  it('should return a PUT 402 Payment Required error when Waste Organisation Backend returns a 402 response', async () => {
    httpClients.wasteOrganisation.get.mockResolvedValue({
      payload: {
        statusCode: HTTP_STATUS.PAYMENT_REQUIRED,
        message: 'Payment is required'
      }
    })

    const { result, statusCode } = await server.inject({
      method: 'PUT',
      url: '/movements/2578ZCY8/receive',
      payload: createMovementRequest()
    })

    expect(statusCode).toEqual(HTTP_STATUS.PAYMENT_REQUIRED)
    expect(result).toEqual({
      error: 'Payment Required',
      message: 'Payment is required',
      statusCode: HTTP_STATUS.PAYMENT_REQUIRED
    })
  })
})
