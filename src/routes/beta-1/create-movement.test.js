import { jest } from '@jest/globals'
import { httpClients } from '../../common/helpers/http-client.js'
import { createMovement } from './create-movement.js'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { config } from '../../config.js'

jest.mock('../../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteMovement: {
      post: jest.fn()
    }
  }
}))

config.set('featureFlags.createMovement', true)

describe('Create Movement Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const apiCode = '25b14080-5e77-4f91-9957-2482a0cb8775'
  const goodPayload = { apiCode }
  const expectedPathVersion = 'beta-1'

  it('should successfully call the waste movement backend with a valid payload', async () => {
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: HTTP_STATUS.CREATED,
      body: { id: 'movementId' }
    })

    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: goodPayload
    }
    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await createMovement.handler(request, h)

    expect(h.response).toHaveBeenCalledWith({
      statusCode: 201,
      body: { movementId: 'movementId' }
    })

    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      `/${expectedPathVersion}/movements`,
      goodPayload
    )
  })

  it('should return 500 when waste movement creation fails', async () => {
    httpClients.wasteMovement.post.mockRejectedValue(new Error('API Error'))

    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: goodPayload
    }
    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await createMovement.handler(request, h)

    expect(h.response).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Failed to create waste movement'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})
