import { httpClients } from '../common/helpers/http-client.js'
import { handleUpdateReceiptMovement } from '../handlers/update-receipt-movement.js'
import { updateReceiptMovement } from './update-receipt-movement.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import Boom from '@hapi/boom'

jest.mock('../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteMovement: {
      put: jest.fn()
    }
  }
}))

describe('updateReceiptMovement route', () => {
  it('should have correct route configuration', () => {
    expect(updateReceiptMovement.method).toBe('PUT')
    expect(updateReceiptMovement.path).toBe(
      '/movements/{wasteTrackingId}/receive'
    )
    expect(updateReceiptMovement.handler).toBe(handleUpdateReceiptMovement)
  })

  it('should have correct validation configuration', () => {
    const { validate } = updateReceiptMovement.options
    expect(validate.params).toBeDefined()
    expect(validate.payload).toBeDefined()
  })

  it('should have correct swagger documentation', () => {
    const { responses } = updateReceiptMovement.options.plugins['hapi-swagger']
    expect(responses['200']).toBeDefined()
    expect(responses['400']).toBeDefined()
    expect(responses['404']).toBeDefined()
  })
})

describe('handleUpdateReceiptMovement', () => {
  const mockRequest = {
    auth: {
      credentials: {
        clientId: 'test-client-id'
      }
    },
    params: {
      wasteTrackingId: '123e4567-e89b-12d3-a456-426614174000'
    },
    payload: createMovementRequest()
  }

  const mockH = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  }

  // Common expected response with validation warnings
  const expectedResponseWithWarnings = {
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
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully update a receipt movement with warnings', async () => {
    httpClients.wasteMovement.put.mockResolvedValueOnce({
      statusCode: 200
    })

    await handleUpdateReceiptMovement(mockRequest, mockH)

    expect(httpClients.wasteMovement.put).toHaveBeenCalledWith(
      `/movements/${mockRequest.params.wasteTrackingId}/receive`,
      { movement: mockRequest.payload }
    )
    expect(mockH.response).toHaveBeenCalledWith(expectedResponseWithWarnings)

    expect(mockH.code).toHaveBeenCalledWith(200)
  })

  it('should successfully update a receipt movement without warnings', async () => {
    // Create a complete payload with all required fields to avoid warnings
    const completePayload = {
      ...mockRequest.payload,
      wasteItems: mockRequest.payload.wasteItems.map((item) => ({
        ...item,
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
      }))
    }

    const completeRequest = {
      ...mockRequest,
      payload: completePayload
    }

    httpClients.wasteMovement.put.mockResolvedValueOnce({
      statusCode: 200
    })

    await handleUpdateReceiptMovement(completeRequest, mockH)

    expect(httpClients.wasteMovement.put).toHaveBeenCalledWith(
      `/movements/${mockRequest.params.wasteTrackingId}/receive`,
      { movement: completePayload }
    )
    expect(mockH.response).toHaveBeenCalledWith({})

    expect(mockH.code).toHaveBeenCalledWith(200)
  })

  it('should handle not found error', async () => {
    const notFoundError = new Error('Not Found')
    notFoundError.name = 'NotFoundError'
    httpClients.wasteMovement.put.mockRejectedValueOnce(notFoundError)

    await expect(
      handleUpdateReceiptMovement(mockRequest, mockH)
    ).rejects.toThrow(Boom.notFound('Movement not found'))
  })

  it('should handle bad request error', async () => {
    const badRequestError = new Error('Invalid input')
    httpClients.wasteMovement.put.mockRejectedValueOnce(badRequestError)

    await expect(
      handleUpdateReceiptMovement(mockRequest, mockH)
    ).rejects.toThrow(Boom.badRequest('Invalid input'))
  })
})
