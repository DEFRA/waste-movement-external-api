import { jest } from '@jest/globals'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { httpClients } from '../common/helpers/http-client.js'
import { proxyWasteMovementBackend } from './proxyWasteMovementBackend.js'
import { badImplementation } from '@hapi/boom'

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
  const path = '/back/end/path'
  const goodRequest = {
    auth: {
      credentials: {
        clientId: 'test-client-id'
      }
    },
    payload,
    path,
    params: {}
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

    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(path, payload)
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

    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(path, payload)
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
})
