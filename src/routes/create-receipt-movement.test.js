import { jest } from '@jest/globals'
import { httpClients } from '../common/helpers/http-client.js'
import { createReceiptMovement } from './create-receipt-movement.js'

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

describe('Movement Route', () => {
  let mockWasteTrackingId

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Mock waste tracking ID
    mockWasteTrackingId = '123e4567-e89b-12d3-a456-426614174000'
    httpClients.wasteTracking.get.mockResolvedValue(mockWasteTrackingId)
  })

  describe('POST /movements/receive', () => {
    const validPayload = {
      movement: {
        receivingSiteId: 'site123',
        receiverReference: 'ref123',
        specialHandlingRequirements: 'Handle with care',
        waste: {
          wasteCode: '123456',
          description: 'Test waste'
        },
        carrier: {
          name: 'Test Carrier',
          address: {
            street: '123 Test St',
            city: 'Test City',
            postcode: 'TE1 1ST'
          }
        }
      }
    }

    it('should successfully create a waste movement', async () => {
      // Mock successful waste movement creation
      httpClients.wasteMovement.post.mockResolvedValue({})

      const request = {
        payload: validPayload
      }
      const h = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await createReceiptMovement.handler(request, h)

      expect(h.response).toHaveBeenCalledWith({
        statusCode: 200,
        globalMovementId: mockWasteTrackingId
      })

      // Verify waste tracking ID was requested
      expect(httpClients.wasteTracking.get).toHaveBeenCalledWith('/next')

      // Verify waste movement was created
      expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
        `/movements/${mockWasteTrackingId}/receive`,
        {
          movement: validPayload.movement
        }
      )
    })

    it('should return 500 when waste movement creation fails', async () => {
      // Mock waste movement creation failure
      httpClients.wasteMovement.post.mockRejectedValue(new Error('API Error'))

      const request = {
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
})
