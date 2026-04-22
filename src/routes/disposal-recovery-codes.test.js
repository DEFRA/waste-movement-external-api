import { jest } from '@jest/globals'
import { httpClients } from '../common/helpers/http-client.js'
import { config } from '../config.js'
import { createReceiptMovement } from './create-receipt-movement.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'

// Mock the httpClients
jest.mock('../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteTracking: {
      get: jest.fn()
    },
    wasteMovement: {
      post: jest.fn()
    },
    wasteOrganisation: {
      get: jest.fn().mockResolvedValue({
        payload: {
          defraCustomerOrganisationId: 'd829f66d-857f-401d-b5e9-5061b7dbb29d'
        }
      })
    }
  }
}))

describe('Create Receipt Movement - Disposal/Recovery Code Handler', () => {
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

  describe('Handler Tests for Disposal/Recovery Codes', () => {
    describe('Successful submissions with valid codes', () => {
      it('should successfully create movement with R1 code', async () => {
        config.set('isWasteOrganisationBackendAvailable', true)

        const validPayload = createPayload({
          disposalOrRecoveryCodes: [
            {
              code: 'R1',
              weight: {
                metric: 'Tonnes',
                amount: 0.1,
                isEstimate: false
              }
            }
          ]
        })

        httpClients.wasteMovement.post.mockResolvedValue({
          statusCode: HTTP_STATUS.CREATED
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
          wasteTrackingId: mockWasteTrackingId
        })

        const { apiCode, ...payloadWithoutApiCode } = validPayload
        expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
          `/movements/${mockWasteTrackingId}/receive`,
          {
            movement: {
              ...payloadWithoutApiCode,
              submittingOrganisation: {
                defraCustomerOrganisationId:
                  'd829f66d-857f-401d-b5e9-5061b7dbb29d'
              }
            }
          }
        )
      })

      it('should successfully create movement with multiple codes', async () => {
        const validPayload = createPayload({
          disposalOrRecoveryCodes: [
            {
              code: 'R3',
              weight: {
                metric: 'Tonnes',
                amount: 0.02,
                isEstimate: false
              }
            },
            {
              code: 'D5',
              weight: {
                metric: 'Tonnes',
                amount: 0.03,
                isEstimate: false
              }
            }
          ]
        })

        httpClients.wasteMovement.post.mockResolvedValue({
          statusCode: HTTP_STATUS.CREATED
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
          wasteTrackingId: mockWasteTrackingId
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
                amount: 0.1,
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
          error: 'Internal Server Error',
          message: 'Failed to create waste movement'
        })
      })
    })
  })
})
