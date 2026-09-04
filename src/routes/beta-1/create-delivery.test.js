import { jest } from '@jest/globals'
import { httpClients } from '../../common/helpers/http-client.js'
import { createDelivery } from './create-delivery.js'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { versionPath } from './common.js'

jest.mock('../../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteMovement: {
      post: jest.fn()
    }
  }
}))

describe('Create Delivery Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const apiCode = '25b14080-5e77-4f91-9957-2482a0cb8775'
  const movementIds = ['25HRA0B2', '25HRA0B3']
  const goodRequest = {
    auth: {
      credentials: {
        clientId: 'test-client-id'
      }
    },
    payload: { apiCode, movementIds }
  }
  const expectedPathVersion = versionPath
  const h = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis(),
    message: jest.fn().mockReturnThis()
  }

  it('should correctly proxy the backend', async () => {
    const backendResponse = {
      statusCode: HTTP_STATUS.CREATED,
      result: { deliveryId: 'deliveryId' },
      statusMessage: 'Successfully created a waste movement'
    }

    httpClients.wasteMovement.post.mockResolvedValue(backendResponse)

    await createDelivery.handler(goodRequest, h)

    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      `/${expectedPathVersion}/deliveries`,
      goodRequest.payload
    )

    expect(h.response).toHaveBeenCalledWith(backendResponse.result)
    expect(h.code).toHaveBeenCalledWith(backendResponse.statusCode)
    expect(h.message).toHaveBeenCalledWith(backendResponse.statusMessage)
  })

  it('should return 500 when backend errors', async () => {
    httpClients.wasteMovement.post.mockRejectedValue(new Error('API Error'))

    await createDelivery.handler(goodRequest, h)

    expect(h.response).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Waste Movement Backend Service Error'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})
