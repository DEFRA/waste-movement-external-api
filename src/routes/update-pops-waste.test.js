import { jest } from '@jest/globals'
import { httpClients } from '../common/helpers/http-client.js'
import { updatePopsWaste } from './update-pops-waste.js'
import Boom from '@hapi/boom'

// Mock the httpClients
jest.mock('../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteMovement: {
      put: jest.fn()
    }
  }
}))

describe('updatePopsWaste route', () => {
  it('should have correct route configuration', () => {
    expect(updatePopsWaste.method).toBe('PUT')
    expect(updatePopsWaste.path).toBe('/movements/{wasteTrackingId}/pops')
  })

  it('should have correct validation configuration', () => {
    const { validate } = updatePopsWaste.options
    expect(validate.params).toBeDefined()
    expect(validate.payload).toBeDefined()
  })

  it('should have correct swagger documentation', () => {
    const { responses } = updatePopsWaste.options.plugins['hapi-swagger']
    expect(responses['200']).toBeDefined()
    expect(responses['400']).toBeDefined()
    expect(responses['404']).toBeDefined()
  })
})

describe('handleUpdatePopsWaste', () => {
  const mockRequest = {
    params: {
      wasteTrackingId: '123e4567-e89b-12d3-a456-426614174000'
    },
    payload: {
      isPopsWaste: true,
      components: [
        {
          component: 'Test Component',
          concentration: 0.5,
          popsCode: 'P001'
        }
      ]
    }
  }

  const mockH = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully update POPs waste details', async () => {
    httpClients.wasteMovement.put.mockResolvedValueOnce({})

    await updatePopsWaste.handler(mockRequest, mockH)

    expect(httpClients.wasteMovement.put).toHaveBeenCalledWith(
      `/movements/${mockRequest.params.wasteTrackingId}/pops`,
      mockRequest.payload
    )
    expect(mockH.response).toHaveBeenCalledWith({
      message: 'POPs waste details updated successfully'
    })
    expect(mockH.code).toHaveBeenCalledWith(200)
  })

  it('should handle not found error', async () => {
    const notFoundError = new Error('Not Found')
    notFoundError.name = 'NotFoundError'
    httpClients.wasteMovement.put.mockRejectedValueOnce(notFoundError)

    await expect(updatePopsWaste.handler(mockRequest, mockH)).rejects.toThrow(
      Boom.notFound('Movement not found')
    )
  })

  it('should handle bad request error', async () => {
    const badRequestError = new Error('Invalid input')
    httpClients.wasteMovement.put.mockRejectedValueOnce(badRequestError)

    await expect(updatePopsWaste.handler(mockRequest, mockH)).rejects.toThrow(
      Boom.badRequest('Invalid input')
    )
  })
})
