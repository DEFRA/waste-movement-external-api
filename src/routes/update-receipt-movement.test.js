import { httpClients } from '../common/helpers/http-client.js'
import { handleUpdateReceiptMovement } from '../handlers/update-receipt-movement.js'
import { updateReceiptMovement } from './update-receipt-movement.js'
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
    payload: {
      receivingSiteId: '123e4567-e89b-12d3-a456-426614174001',
      wasteItems: [
        {
          ewcCodes: ['01 01 01'],
          description: 'Test waste',
          physicalForm: 'Solid',
          containers: 'Bulk',
          weight: {
            metric: 'Tonnes',
            amount: 1,
            isEstimate: false
          }
        }
      ],
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
  }

  const mockH = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
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
    expect(mockH.response).toHaveBeenCalledWith({
      message: 'Receipt movement updated successfully'
    })
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

  it('should accept otherReferencesForMovement as an array of label-reference pairs', async () => {
    httpClients.wasteMovement.put.mockResolvedValueOnce({
      statusCode: 200
    })

    const requestWithReferences = {
      ...mockRequest,
      payload: {
        ...mockRequest.payload,
        otherReferencesForMovement: [
          { label: 'PO Number', reference: 'PO-12345' },
          { label: 'Waste Ticket', reference: 'WT-67890' },
          { label: 'Haulier Note', reference: 'HN-11111' }
        ]
      }
    }

    await handleUpdateReceiptMovement(requestWithReferences, mockH)

    expect(httpClients.wasteMovement.put).toHaveBeenCalledWith(
      `/movements/${mockRequest.params.wasteTrackingId}/receive`,
      { movement: requestWithReferences.payload }
    )
    expect(mockH.response).toHaveBeenCalledWith({
      message: 'Receipt movement updated successfully'
    })
    expect(mockH.code).toHaveBeenCalledWith(200)
  })

  it('should accept empty otherReferencesForMovement array', async () => {
    httpClients.wasteMovement.put.mockResolvedValueOnce({
      statusCode: 200
    })

    const requestWithEmptyReferences = {
      ...mockRequest,
      payload: {
        ...mockRequest.payload,
        otherReferencesForMovement: []
      }
    }

    await handleUpdateReceiptMovement(requestWithEmptyReferences, mockH)

    expect(httpClients.wasteMovement.put).toHaveBeenCalledWith(
      `/movements/${mockRequest.params.wasteTrackingId}/receive`,
      { movement: requestWithEmptyReferences.payload }
    )
    expect(mockH.response).toHaveBeenCalledWith({
      message: 'Receipt movement updated successfully'
    })
    expect(mockH.code).toHaveBeenCalledWith(200)
  })

  it('should accept payload without otherReferencesForMovement field', async () => {
    httpClients.wasteMovement.put.mockResolvedValueOnce({
      statusCode: 200
    })

    const requestWithoutReferences = {
      ...mockRequest,
      payload: mockRequest.payload // Already doesn't have otherReferencesForMovement
    }

    await handleUpdateReceiptMovement(requestWithoutReferences, mockH)

    expect(httpClients.wasteMovement.put).toHaveBeenCalledWith(
      `/movements/${mockRequest.params.wasteTrackingId}/receive`,
      { movement: requestWithoutReferences.payload }
    )
    expect(mockH.response).toHaveBeenCalledWith({
      message: 'Receipt movement updated successfully'
    })
    expect(mockH.code).toHaveBeenCalledWith(200)
  })
})
