import { jest } from '@jest/globals'
import { httpClients } from '../../common/helpers/http-client.js'
import { reserveDelivery } from './reserve-delivery.js'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { versionPath } from './common.js'
import { badImplementation } from '@hapi/boom'

jest.mock('../../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteMovement: {
      post: jest.fn()
    }
  }
}))

describe('Reserve Delivery Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const apiCode = '25b14080-5e77-4f91-9957-2482a0cb8775'
  const goodRequest = {
    auth: {
      credentials: {
        clientId: 'test-client-id'
      }
    },
    path: `/${versionPath}/deliveries/reserve`,
    payload: { apiCode, count: 25 },
    method: 'post',
    headers: { 'idempotency-key': 'batch-1' }
  }
  const h = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis(),
    message: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis()
  }

  it('should correctly proxy the backend, forwarding the Idempotency-Key header', async () => {
    const backendResponse = {
      statusCode: HTTP_STATUS.CREATED,
      payload: { reservations: [], outstanding: 25, cap: 50 }
    }

    httpClients.wasteMovement.post.mockResolvedValue(backendResponse)

    await reserveDelivery.handler(goodRequest, h)

    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      goodRequest.path,
      goodRequest.payload,
      { 'idempotency-key': 'batch-1' }
    )

    expect(h.response).toHaveBeenCalledWith(backendResponse.payload)
    expect(h.code).toHaveBeenCalledWith(backendResponse.statusCode)
  })

  it('should return 500 when backend errors', async () => {
    httpClients.wasteMovement.post.mockRejectedValue(new Error('API Error'))

    const returned = await reserveDelivery.handler(goodRequest, h)

    expect(returned).toEqual(badImplementation('API Error'))
  })
})
