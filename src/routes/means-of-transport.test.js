import { jest } from '@jest/globals'
import { httpClients } from '../common/helpers/http-client.js'
import { createReceiptMovement } from './create-receipt-movement.js'
import { receiveMovementRequestSchema } from '../schemas/receipt.js'
import { MEANS_OF_TRANSPORT } from '../common/constants/means-of-transport.js'
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

describe('Create Receipt Movement - Means of Transport Validation', () => {
  let mockWasteTrackingId

  beforeEach(() => {
    jest.clearAllMocks()
    mockWasteTrackingId = '2578ZCY8'
    httpClients.wasteTracking.get.mockResolvedValue({
      payload: {
        wasteTrackingId: mockWasteTrackingId
      }
    })
  })

  describe('Schema Validation Tests', () => {
    describe('Valid Means of Transport', () => {
      MEANS_OF_TRANSPORT.forEach((meansOfTransport) => {
        it(`should accept valid means of transport: ${meansOfTransport}`, () => {
          const validPayload = createMovementRequest({
            carrier: {
              registrationNumber: 'CBDU123456',
              organisationName: 'Test Carrier',
              meansOfTransport,
              vehicleRegistration:
                meansOfTransport !== 'Road' ? undefined : 'ABC123'
            }
          })

          const { error } = receiveMovementRequestSchema.validate(validPayload)
          expect(error).toBeUndefined()
        })
      })
    })

    describe('Invalid Means of Transport', () => {
      const invalidMeansOfTransport = [
        'Bike',
        'Walking',
        'Teleport',
        'Invalid',
        '123'
      ]

      invalidMeansOfTransport.forEach((meansOfTransport) => {
        it(`should reject invalid means of transport: ${meansOfTransport}`, () => {
          const invalidPayload = {
            receivingSiteId: 'site123',
            dateTimeReceived: '2024-01-15T14:30:00Z',
            carrier: {
              registrationNumber: 'CBDU123456',
              organisationName: 'Test Carrier',
              meansOfTransport
            }
          }

          const { error } =
            receiveMovementRequestSchema.validate(invalidPayload)
          expect(error).toBeDefined()
          expect(error.details[0].message).toContain('must be one of')
        })
      })

      it('should reject submission without means of transport', () => {
        const invalidPayload = {
          ...createMovementRequest(),
          carrier: {
            registrationNumber: 'CBDU123456',
            organisationName: 'Test Carrier',
            meansOfTransport: undefined
          }
        }

        const { error } = receiveMovementRequestSchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].message).toBe(
          '"carrier.meansOfTransport" is required'
        )
      })
    })
  })

  describe('Handler Tests for Means of Transport', () => {
    describe('Successful submissions with valid means of transport', () => {
      it('should successfully create movement with Road transport', async () => {
        const validPayload = {
          receivingSiteId: 'site123',
          carrier: {
            organisationName: 'Test Carrier',
            meansOfTransport: 'Road'
          }
        }

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
            warnings: [
              {
                errorType: 'NotProvided',
                key: 'receipt.disposalOrRecoveryCodes',
                message:
                  'Disposal or Recovery codes are required for proper waste tracking and compliance'
              }
            ]
          }
        })

        expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
          `/movements/${mockWasteTrackingId}/receive`,
          { movement: validPayload }
        )
      })

      it('should successfully create movement with Rail transport', async () => {
        const validPayload = {
          receivingSiteId: 'site123',
          carrier: {
            organisationName: 'Test Carrier',
            meansOfTransport: 'Rail'
          }
        }

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
            warnings: [
              {
                errorType: 'NotProvided',
                key: 'receipt.disposalOrRecoveryCodes',
                message:
                  'Disposal or Recovery codes are required for proper waste tracking and compliance'
              }
            ]
          }
        })
      })

      it('should successfully create movement with Sea transport', async () => {
        const validPayload = {
          receivingSiteId: 'site123',
          carrier: {
            organisationName: 'Test Carrier',
            meansOfTransport: 'Sea'
          }
        }

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
            warnings: [
              {
                errorType: 'NotProvided',
                key: 'receipt.disposalOrRecoveryCodes',
                message:
                  'Disposal or Recovery codes are required for proper waste tracking and compliance'
              }
            ]
          }
        })
      })
    })

    describe('Handler error handling', () => {
      it('should handle backend errors', async () => {
        const validPayload = {
          receivingSiteId: 'site123',
          carrier: {
            organisationName: 'Test Carrier',
            meansOfTransport: 'Road'
          }
        }

        httpClients.wasteMovement.post.mockRejectedValue(
          new Error('Backend Error')
        )

        const request = { payload: validPayload }
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
      })
    })
  })
})
