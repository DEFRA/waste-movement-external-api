import { jest } from '@jest/globals'
import { httpClients } from '../common/helpers/http-client.js'
import { handleCreateReceiptMovement } from './create-receipt-movement.js'
import { v4 as uuidv4 } from 'uuid'
import * as metrics from '../common/helpers/metrics.js'

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

// Mock metrics
jest.mock('../common/helpers/metrics.js', () => ({
  metricsCounter: jest.fn()
}))

describe('Create Receipt Movement Handler', () => {
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
    apiCode: uuidv4(),
    receiverReference: 'ref123',
    specialHandlingRequirements: 'Handle with care',
    wasteItems: [
      {
        ewcCodes: ['200101'],
        wasteDescription: 'Test waste',
        physicalForm: 'Solid',
        numberOfContainers: 1,
        typeOfContainers: 'SKI',
        weight: {
          metric: 'Tonnes',
          amount: 1.0,
          isEstimate: false
        },
        containsPops: false,
        containsHazardous: false,
        pops: {},
        hazardous: {},
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
    ],
    carrier: {
      name: 'Test Carrier',
      address: {
        street: '123 Test St',
        city: 'Test City',
        postcode: 'TE1 1ST'
      }
    }
  }

  const request = {
    auth: {
      credentials: {
        clientId: 'test-client-id'
      }
    },
    payload: validPayload
  }

  it('should successfully create a waste movement', async () => {
    // Mock successful waste movement creation
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: 200
    })

    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await handleCreateReceiptMovement(request, h)

    expect(h.response).toHaveBeenCalledWith({
      wasteTrackingId: mockWasteTrackingId
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

    // Verify metrics are logged on success (no warnings case)
    // Per-endpoint metrics with dimensions
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.warnings.count',
      0,
      { endpointType: 'post' }
    )
    // Total metrics without dimensions
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.warnings.count',
      0
    )
    // Requests without warnings
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.requests.without_warnings',
      1,
      { endpointType: 'post' }
    )
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.requests.without_warnings',
      1
    )
  })

  it('should successfully create a waste movement with warnings and log metrics', async () => {
    // Create a payload that will generate warnings (missing disposalOrRecoveryCodes)
    const payloadWithWarnings = {
      ...validPayload,
      wasteItems: validPayload.wasteItems.map((item) => {
        const { disposalOrRecoveryCodes, ...rest } = item
        return rest
      })
    }

    const requestWithWarnings = {
      ...request,
      payload: payloadWithWarnings
    }

    // Mock successful waste movement creation
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: 200
    })

    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await handleCreateReceiptMovement(requestWithWarnings, h)

    // Verify metrics are logged on success (with warnings case)
    // Per-endpoint metrics with dimensions
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.warnings.count',
      1,
      { endpointType: 'post' }
    )
    // Total metrics without dimensions
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.warnings.count',
      1
    )
    // Requests with warnings
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.requests.with_warnings',
      1,
      { endpointType: 'post' }
    )
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.requests.with_warnings',
      1
    )
  })

  it('should return 500 when waste movement creation fails', async () => {
    // Mock waste movement creation failure
    httpClients.wasteMovement.post.mockRejectedValue(new Error('API Error'))

    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await handleCreateReceiptMovement(request, h)

    expect(h.response).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Failed to create waste movement'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })

  it('should return 500 when waste tracking ID request fails', async () => {
    // Mock waste tracking ID request failure
    httpClients.wasteTracking.get.mockRejectedValue(new Error('API Error'))

    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await handleCreateReceiptMovement(request, h)

    expect(h.response).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Failed to create waste movement'
    })
    expect(h.code).toHaveBeenCalledWith(500)
  })

  it('should not log metrics when backend returns non-success status', async () => {
    // Mock backend returning error status code
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: 400,
      payload: { error: 'Bad Request' }
    })

    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await handleCreateReceiptMovement(request, h)

    expect(metrics.metricsCounter).not.toHaveBeenCalled()
    expect(h.code).toHaveBeenCalledWith(400)
  })
})
