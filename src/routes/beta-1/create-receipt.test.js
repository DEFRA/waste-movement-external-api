import { jest } from '@jest/globals'
import { httpClients } from '../../common/helpers/http-client.js'
import { createReceipt, createUndeliveredReceipt } from './create-receipt.js'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { versionPath } from './common.js'

jest.mock('../../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteMovement: {
      post: jest.fn()
    }
  }
}))

describe('Create Receipt with {deliveryId} Route', () => {
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
    payload: { apiCode },
    params: { deliveryId: 'deliveryId' }
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
      result: {},
      statusMessage: 'Successfully created a waste receipt'
    }

    httpClients.wasteMovement.post.mockResolvedValue(backendResponse)

    await createReceipt.handler(goodRequest, h)

    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      `/${expectedPathVersion}/deliveries/${goodRequest.params.deliveryId}/receipt`,
      goodRequest.payload
    )

    expect(h.response).toHaveBeenCalledWith(backendResponse.result)
    expect(h.code).toHaveBeenCalledWith(backendResponse.statusCode)
    expect(h.message).toHaveBeenCalledWith(backendResponse.statusMessage)
  })

  it('should return 500 when the backend errors', async () => {
    httpClients.wasteMovement.post.mockRejectedValue(new Error('API Error'))

    await createReceipt.handler(goodRequest, h)

    expect(h.response).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Waste Movement Backend Service Error'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})

describe('Create Undelivered Receipt Route', () => {
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
    payload: { apiCode, reasonForNoDeliveryId: 'It just appeared' }
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
      result: {},
      statusMessage: 'Successfully created a waste receipt'
    }

    httpClients.wasteMovement.post.mockResolvedValue(backendResponse)

    await createUndeliveredReceipt.handler(goodRequest, h)

    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      `/${expectedPathVersion}/receipts`,
      goodRequest.payload
    )

    expect(h.response).toHaveBeenCalledWith(backendResponse.result)
    expect(h.code).toHaveBeenCalledWith(backendResponse.statusCode)
    expect(h.message).toHaveBeenCalledWith(backendResponse.statusMessage)
  })

  it('should return 500 when the backend errors', async () => {
    httpClients.wasteMovement.post.mockRejectedValue(new Error('API Error'))

    await createUndeliveredReceipt.handler(goodRequest, h)

    expect(h.response).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Waste Movement Backend Service Error'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})
