import { jest } from '@jest/globals'
import { httpClients } from '../common/helpers/http-client.js'
import { createReceiptMovement } from './create-receipt-movement.js'
import { receiveMovementRequestSchema } from '../schemas/receipt.js'
import { DISPOSAL_OR_RECOVERY_CODES } from '../common/constants/treatment-codes.js'
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

describe('Create Receipt Movement - Disposal/Recovery Code Validation', () => {
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

  function createPayload(disposalOrRecoveryCodes) {
    const baseRequest = createMovementRequest()

    // If disposalOrRecoveryCodes provided, add them to the first wasteItem
    if (disposalOrRecoveryCodes) {
      return {
        ...baseRequest,
        wasteItems: [
          {
            ...baseRequest.wasteItems[0],
            disposalOrRecoveryCodes:
              disposalOrRecoveryCodes.disposalOrRecoveryCodes
          }
        ]
      }
    }

    return baseRequest
  }

  describe('Schema Validation Tests', () => {
    describe('Valid Disposal/Recovery Codes', () => {
      DISPOSAL_OR_RECOVERY_CODES.forEach((code) => {
        it(`should accept valid code: ${code}`, () => {
          const validPayload = createPayload({
            disposalOrRecoveryCodes: [
              {
                code,
                weight: {
                  metric: 'Tonnes',
                  amount: 1,
                  isEstimate: false
                }
              }
            ]
          })

          const { error } = receiveMovementRequestSchema.validate(validPayload)
          expect(error).toBeUndefined()
        })
      })

      it('should accept multiple valid codes', () => {
        const validPayload = createPayload({
          disposalOrRecoveryCodes: [
            {
              code: 'R1',
              weight: {
                metric: 'Tonnes',
                amount: 1,
                isEstimate: false
              }
            },
            {
              code: 'D10',
              weight: {
                metric: 'Tonnes',
                amount: 2,
                isEstimate: false
              }
            },
            {
              code: 'R3',
              weight: {
                metric: 'Tonnes',
                amount: 3,
                isEstimate: false
              }
            }
          ]
        })

        const { error } = receiveMovementRequestSchema.validate(validPayload)
        expect(error).toBeUndefined()
      })
    })

    describe('Invalid Disposal/Recovery Codes', () => {
      const invalidCodes = ['X99', 'R99', 'D99', 'ABC', '123', 'R0', 'D0']

      invalidCodes.forEach((code) => {
        it(`should reject invalid code: ${code}`, () => {
          const invalidPayload = createPayload({
            disposalOrRecoveryCodes: [
              {
                code,
                weight: {
                  metric: 'Tonnes',
                  amount: 1,
                  isEstimate: false
                }
              }
            ]
          })

          const { error } =
            receiveMovementRequestSchema.validate(invalidPayload)
          expect(error).toBeDefined()
          expect(error.details[0].message).toContain('must be one of')
        })
      })
    })

    describe('Missing Quantity', () => {
      it('should reject code without quantity', () => {
        const invalidPayload = createPayload({
          disposalOrRecoveryCodes: [
            {
              code: 'R1'
              // No quantity specified
            }
          ]
        })

        const { error } = receiveMovementRequestSchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].message).toContain(
          '"wasteItems[0].disposalOrRecoveryCodes[0].weight" is required'
        )
      })
    })

    describe('Incomplete Quantity', () => {
      it('should reject quantity without required fields', () => {
        const invalidPayload = createPayload({
          disposalOrRecoveryCodes: [
            {
              code: 'R1',
              weight: {
                metric: 'Tonnes'
                // Missing amount and isEstimate
              }
            }
          ]
        })

        const { error } = receiveMovementRequestSchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details.length).toBeGreaterThan(0)
      })
    })

    describe('Optional Disposal/Recovery Codes', () => {
      it('should accept submission without disposal/recovery codes', () => {
        const validPayload = createPayload({
          // No disposalOrRecoveryCodes specified
        })

        const { error } = receiveMovementRequestSchema.validate(validPayload)
        expect(error).toBeUndefined()
      })
    })
  })

  describe('Handler Tests for Disposal/Recovery Codes', () => {
    describe('Successful submissions with valid codes', () => {
      it('should successfully create movement with R1 code', async () => {
        const validPayload = createPayload({
          disposalOrRecoveryCodes: [
            {
              code: 'R1',
              weight: {
                metric: 'Tonnes',
                amount: 1,
                isEstimate: false
              }
            }
          ]
        })

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
          globalMovementId: mockWasteTrackingId
        })

        expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
          `/movements/${mockWasteTrackingId}/receive`,
          { movement: validPayload }
        )
      })

      it('should successfully create movement with multiple codes', async () => {
        const validPayload = createPayload({
          disposalOrRecoveryCodes: [
            {
              code: 'R3',
              weight: {
                metric: 'Tonnes',
                amount: 2,
                isEstimate: false
              }
            },
            {
              code: 'D5',
              weight: {
                metric: 'Tonnes',
                amount: 3,
                isEstimate: false
              }
            }
          ]
        })

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
          globalMovementId: mockWasteTrackingId
        })
      })
    })

    describe('Handler error handling', () => {
      it('should handle backend errors', async () => {
        const validPayload = createPayload({
          disposalOrRecoveryCodes: [
            {
              code: 'R1',
              weight: {
                metric: 'Tonnes',
                amount: 1,
                isEstimate: false
              }
            }
          ]
        })

        httpClients.wasteMovement.post.mockRejectedValue(
          new Error('Backend Error')
        )

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
      })
    })
  })
})
