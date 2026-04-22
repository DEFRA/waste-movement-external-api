import { jest } from '@jest/globals'
import { httpClients } from '../common/helpers/http-client.js'
import { config } from '../config.js'
import { createReceiptMovement } from './create-receipt-movement.js'
import { v4 as uuidv4 } from 'uuid'
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

describe('Create Receipt Movement - Means of Transport Handler', () => {
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

  // Test helpers
  const createTestRequest = (payload) => ({
    auth: { credentials: { clientId: 'test-client-id' } },
    payload
  })

  const createMockResponse = () => ({
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  })

  const expectSuccessfulResponse = (h) => {
    expect(h.response).toHaveBeenCalledWith({
      wasteTrackingId: mockWasteTrackingId,
      validation: {
        warnings: [
          {
            errorType: 'NotProvided',
            key: 'wasteItems.0.disposalOrRecoveryCodes',
            message:
              'wasteItems[0].disposalOrRecoveryCodes is required for proper waste tracking and compliance'
          }
        ]
      }
    })
  }

  describe('Handler Tests for Means of Transport', () => {
    describe('Successful submissions with valid means of transport', () => {
      it('should successfully create movement with Road transport', async () => {
        config.set('isWasteOrganisationBackendAvailable', true)

        const payload = {
          apiCode: uuidv4(),
          carrier: {
            organisationName: 'Test Carrier',
            meansOfTransport: 'Road'
          }
        }

        httpClients.wasteMovement.post.mockResolvedValue({
          statusCode: HTTP_STATUS.CREATED
        })

        const request = createTestRequest(payload)
        const h = createMockResponse()

        await createReceiptMovement.handler(request, h)

        expectSuccessfulResponse(h)

        const { apiCode, ...payloadWithoutApiCode } = payload
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

      it('should successfully create movement with Rail transport', async () => {
        const validPayload = {
          apiCode: uuidv4(),
          carrier: {
            organisationName: 'Test Carrier',
            meansOfTransport: 'Rail'
          }
        }

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
          wasteTrackingId: mockWasteTrackingId,
          validation: {
            warnings: [
              {
                errorType: 'NotProvided',
                key: 'wasteItems.0.disposalOrRecoveryCodes',
                message:
                  'wasteItems[0].disposalOrRecoveryCodes is required for proper waste tracking and compliance'
              }
            ]
          }
        })
      })

      it('should successfully create movement with Sea transport', async () => {
        const validPayload = {
          apiCode: uuidv4(),
          carrier: {
            organisationName: 'Test Carrier',
            meansOfTransport: 'Sea'
          }
        }

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
          wasteTrackingId: mockWasteTrackingId,
          validation: {
            warnings: [
              {
                errorType: 'NotProvided',
                key: 'wasteItems.0.disposalOrRecoveryCodes',
                message:
                  'wasteItems[0].disposalOrRecoveryCodes is required for proper waste tracking and compliance'
              }
            ]
          }
        })
      })
    })

    describe('Handler error handling', () => {
      it('should handle backend errors', async () => {
        const validPayload = {
          apiCode: uuidv4(),
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
          error: 'Internal Server Error',
          message: 'Failed to create waste movement'
        })
      })
    })
  })
})
