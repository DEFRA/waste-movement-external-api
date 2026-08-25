import { jest } from '@jest/globals'
import { httpClients } from '../common/helpers/http-client.js'
import { handleCreateReceiptMovement } from './create-receipt-movement.js'
import { v4 as uuidv4 } from 'uuid'
import * as metrics from '../common/helpers/metrics.js'
import Boom from '@hapi/boom'
import * as logger from '../common/helpers/logging/logger.js'
import { METRIC_NAMES } from '@defra/waste-movement-utils'

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
  logReceiptMetrics: jest.fn(),
  logWarningMetrics: jest.fn(),
  logDeveloperMetrics: jest.fn()
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

  const submittingOrganisation = {
    defraCustomerOrganisationId: 'd829f66d-857f-401d-b5e9-5061b7dbb29d'
  }

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
    payload: validPayload,
    submittingOrganisation
  }

  it('should successfully create a waste movement with submittingOrganisation', async () => {
    // Mock successful waste movement creation
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: 200
    })

    const infoLoggerSpy = jest.spyOn(logger.createLogger(), 'info')

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

    // Verify waste movement was created with submittingOrganisation inside
    // movement and apiCode stripped. clientId is forwarded as the
    // x-dwt-client-id header (see client-context.js), not in the payload.
    const { apiCode, ...payloadWithoutApiCode } = validPayload
    expect(httpClients.wasteMovement.post).toHaveBeenCalledWith(
      `/movements/${mockWasteTrackingId}/receive`,
      {
        movement: {
          ...payloadWithoutApiCode,
          submittingOrganisation
        }
      }
    )

    // Receipt received metrics
    expect(metrics.logReceiptMetrics).toHaveBeenCalledWith('post')
    expect(metrics.logWarningMetrics).toHaveBeenCalledWith([])
    // Developer activity metrics
    expect(metrics.logDeveloperMetrics).toHaveBeenCalled()

    expect(infoLoggerSpy).toHaveBeenCalledWith(
      `${METRIC_NAMES.VALIDATION_REQUESTS_WITHOUT_ERRORS} - post`
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

    const infoLoggerSpy = jest.spyOn(logger.createLogger(), 'info')

    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await handleCreateReceiptMovement(requestWithWarnings, h)

    // Receipt received metrics
    expect(metrics.logReceiptMetrics).toHaveBeenCalledWith('post')
    expect(metrics.logWarningMetrics).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          errorType: 'NotProvided',
          key: 'wasteItems.0.disposalOrRecoveryCodes'
        })
      ])
    )
    // Developer activity metrics
    expect(metrics.logDeveloperMetrics).toHaveBeenCalled()

    expect(infoLoggerSpy).toHaveBeenCalledWith(
      `${METRIC_NAMES.VALIDATION_REQUESTS_WITHOUT_ERRORS} - post`
    )
  })

  it('should throw a 500 error when waste movement creation fails', async () => {
    // Mock waste movement creation failure
    httpClients.wasteMovement.post.mockRejectedValue(new Error('API Error'))

    const infoLoggerSpy = jest.spyOn(logger.createLogger(), 'info')

    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await expect(() => handleCreateReceiptMovement(request, h)).rejects.toThrow(
      Boom.internal('API Error')
    )

    expect(infoLoggerSpy).not.toHaveBeenCalled()
  })

  it('should throw a 500 error when waste tracking ID request fails', async () => {
    // Mock waste tracking ID request failure
    httpClients.wasteTracking.get.mockRejectedValue(new Error('API Error'))

    const infoLoggerSpy = jest.spyOn(logger.createLogger(), 'info')

    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await expect(() => handleCreateReceiptMovement(request, h)).rejects.toThrow(
      Boom.internal('API Error')
    )

    expect(infoLoggerSpy).not.toHaveBeenCalled()
  })

  it('should not log developer metrics when clientId is not provided', async () => {
    // Mock successful waste movement creation
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: 200
    })

    const requestWithoutAuth = {
      payload: validPayload
    }

    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await handleCreateReceiptMovement(requestWithoutAuth, h)

    // Receipt and warning logs should still be written
    expect(metrics.logReceiptMetrics).toHaveBeenCalledWith('post')
    expect(metrics.logWarningMetrics).toHaveBeenCalled()
    // Developer activity should NOT be logged when clientId is missing
    expect(metrics.logDeveloperMetrics).not.toHaveBeenCalled()
  })

  it('should log without_errors but not warning or receipt metrics when backend returns non-success status', async () => {
    // Mock backend returning error status code
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: 400,
      payload: { error: 'Bad Request' }
    })

    const infoLoggerSpy = jest.spyOn(logger.createLogger(), 'info')

    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await handleCreateReceiptMovement(request, h)

    // Receipt, warning, and developer activity should NOT be logged
    expect(metrics.logReceiptMetrics).not.toHaveBeenCalled()
    expect(metrics.logWarningMetrics).not.toHaveBeenCalled()
    expect(metrics.logDeveloperMetrics).not.toHaveBeenCalled()
    expect(h.code).toHaveBeenCalledWith(400)

    expect(infoLoggerSpy).toHaveBeenCalledWith(
      `${METRIC_NAMES.VALIDATION_REQUESTS_WITHOUT_ERRORS} - post`
    )
  })
})
