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

  const validPayload = {
    receivingSiteId: 'site123',
    receiverReference: 'ref123',
    specialHandlingRequirements: 'Handle with care',
    wasteItems: {
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
    },
    receipt: {
      disposalOrRecoveryCodes: [
        {
          code: 'R1',
          weight: {
            metric: 'Tonnes',
            amount: 10,
            isEstimate: false
          }
        }
      ]
    }
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
      globalMovementId: mockWasteTrackingId
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

  it('should accept otherReferencesForMovement as an array of label-reference pairs', async () => {
    // Mock successful waste movement creation
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: 200
    })

    const payloadWithReferences = {
      ...validPayload,
      otherReferencesForMovement: [
        { label: 'PO Number', reference: 'PO-12345' },
        { label: 'Waste Ticket', reference: 'WT-67890' },
        { label: 'Haulier Note', reference: 'HN-11111' }
      ]
    }

    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: payloadWithReferences
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

    // Verify the payload with references was sent correctly
    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      `/movements/${mockWasteTrackingId}/receive`,
      {
        movement: payloadWithReferences
      }
    )
  })

  it('should accept empty otherReferencesForMovement array', async () => {
    // Mock successful waste movement creation
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: 200
    })

    const payloadWithEmptyReferences = {
      ...validPayload,
      otherReferencesForMovement: []
    }

    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: payloadWithEmptyReferences
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
      {
        movement: payloadWithEmptyReferences
      }
    )
  })

  it('should accept payload without otherReferencesForMovement field', async () => {
    // Mock successful waste movement creation
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: 200
    })

    // Payload without otherReferencesForMovement field
    const payloadWithoutReferences = { ...validPayload }

    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: payloadWithoutReferences
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
      {
        movement: payloadWithoutReferences
      }
    )
  })
})
