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
    message: 'Receipt movement updated successfully',
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
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully update a receipt movement', async () => {
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

  it('should handle not found error', async () => {
    const notFoundError = new Error('Not Found')
    notFoundError.name = 'NotFoundError'
    httpClients.wasteMovement.put.mockRejectedValueOnce(notFoundError)

    await expect(
      handleUpdateReceiptMovement(mockRequest, mockH)
    ).rejects.toThrow(Boom.notFound('Movement not found'))
  })
})
