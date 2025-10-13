import { jest } from '@jest/globals'
import { httpClients } from '../common/helpers/http-client.js'
import { createReceiptMovement } from './create-receipt-movement.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'

// Mock the httpClients
jest.mock('../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteTracking: {
      get: jest.fn()
    },
    wasteMovement: {
      post: jest.fn()
    }
  }
}))

describe('Create Receipt Movement Route', () => {
  let mockWasteTrackingId

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Mock waste tracking ID
    mockWasteTrackingId = '2578ZCY8'
    httpClients.wasteTracking.get.mockResolvedValue({
      payload: {
        wasteTrackingId: mockWasteTrackingId
      }
    })
  })

  const validPayload = createMovementRequest()

  // Common validation warnings
  const disposalOrRecoveryCodesWarning = {
    errorType: 'NotProvided',
    key: 'wasteItems.0.disposalOrRecoveryCodes',
    message:
      'Disposal or Recovery codes are required for proper waste tracking and compliance'
  }

  it('should successfully create a waste movement', async () => {
    // Mock successful waste movement creation
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: 200
    })

    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: validPayload
    }
    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await createReceiptMovement.handler(request, h)

    expect(h.response).toHaveBeenCalledWith({
      statusCode: 200,
      globalMovementId: mockWasteTrackingId,
      validation: {
        warnings: [disposalOrRecoveryCodesWarning]
      }
    })

    // Verify waste tracking ID was requested
    expect(httpClients.wasteTracking.get).toHaveBeenCalledWith('/next')

    // Verify waste movement was created
    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      `/movements/${mockWasteTrackingId}/receive`,
      {
        movement: validPayload
      }
    )
  })

  it('should return 500 when waste movement creation fails', async () => {
    // Mock waste movement creation failure
    httpClients.wasteMovement.post.mockRejectedValue(new Error('API Error'))

    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: validPayload
    }
    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await createReceiptMovement.handler(request, h)

    expect(h.response).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Failed to create waste movement'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })

  it('should return 500 when waste tracking ID request fails', async () => {
    // Mock waste tracking ID request failure
    httpClients.wasteTracking.get.mockRejectedValue(new Error('API Error'))

    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: validPayload
    }
    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await createReceiptMovement.handler(request, h)

    expect(h.response).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Failed to create waste movement'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })
})
