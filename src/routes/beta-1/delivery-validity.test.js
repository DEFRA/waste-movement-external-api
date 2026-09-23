import { jest } from '@jest/globals'
import { httpClients } from '../../common/helpers/http-client.js'
import { deliveryValidity } from './delivery-validity.js'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { versionPath } from './common.js'
import { badImplementation } from '@hapi/boom'

jest.mock('../../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteMovement: {
      get: jest.fn()
    }
  }
}))

describe('Delivery Validity Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const deliveryId = '25KMT4Z9'
  const goodRequest = {
    auth: {
      credentials: {
        clientId: 'test-client-id'
      }
    },
    path: `/${versionPath}/deliveries/${deliveryId}/validity`,
    method: 'get',
    headers: {},
    params: { deliveryId }
  }
  const h = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis(),
    message: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis()
  }

  it('should correctly proxy a GET to the backend', async () => {
    const backendResponse = {
      statusCode: HTTP_STATUS.OK,
      payload: { known: true, state: 'reserved', acceptable: true }
    }

    httpClients.wasteMovement.get.mockResolvedValue(backendResponse)

    await deliveryValidity.handler(goodRequest, h)

    expect(httpClients.wasteMovement.get).toHaveBeenCalledWith(
      goodRequest.path,
      {}
    )

    expect(h.response).toHaveBeenCalledWith(backendResponse.payload)
    expect(h.code).toHaveBeenCalledWith(backendResponse.statusCode)
  })

  it('should return 500 when backend errors', async () => {
    httpClients.wasteMovement.get.mockRejectedValue(new Error('API Error'))

    const returned = await deliveryValidity.handler(goodRequest, h)

    expect(returned).toEqual(badImplementation('API Error'))
  })
})
