import { jest } from '@jest/globals'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { httpClients } from '../common/helpers/http-client.js'
import { proxyWasteMovementBackend } from './proxyWasteMovementBackend.js'

jest.mock('../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteMovement: {
      post: jest.fn()
    }
  }
}))

describe('proxyWasteMovementBackend', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const payload = { apiCode: 'apiCode' }
  const backendPath = '/back/end/path'
  const h = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis(),
    message: jest.fn().mockReturnThis()
  }

  it('should successfully call the waste movement backend with a valid payload', async () => {
    const backendResponse = {
      statusCode: HTTP_STATUS.CREATED,
      result: { movementId: 'movementId' },
      statusMessage: 'Successful'
    }

    httpClients.wasteMovement.post.mockResolvedValue(backendResponse)

    await proxyWasteMovementBackend(backendPath, payload, h)

    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      backendPath,
      payload
    )
    expect(h.response).toHaveBeenCalledWith(backendResponse.result)
    expect(h.code).toHaveBeenCalledWith(backendResponse.statusCode)
    expect(h.message).toHaveBeenCalledWith(backendResponse.statusMessage)
  })

  it('should return 500 when waste collection creation fails', async () => {
    httpClients.wasteMovement.post.mockRejectedValue(new Error('API Error'))

    await proxyWasteMovementBackend(backendPath, payload, h)

    expect(h.response).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Waste Movement Backend Service Error'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})
