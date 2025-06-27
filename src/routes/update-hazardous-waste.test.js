import { httpClients } from '../common/helpers/http-client.js'
import { handleUpdateHazardousWaste } from '../handlers/update-hazardous-waste.js'
import { updateHazardousWaste } from './update-hazardous-waste.js'
import Boom from '@hapi/boom'

jest.mock('../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteMovement: {
      put: jest.fn()
    }
  }
}))

describe('updateHazardousWaste route', () => {
  it('should have correct route configuration', () => {
    expect(updateHazardousWaste.method).toBe('PUT')
    expect(updateHazardousWaste.path).toBe(
      '/movements/{wasteTrackingId}/receive/hazardous'
    )
    expect(updateHazardousWaste.handler).toBe(handleUpdateHazardousWaste)
  })

  it('should have correct validation configuration', () => {
    const { validate } = updateHazardousWaste.options
    expect(validate.params).toBeDefined()
    expect(validate.payload).toBeDefined()
  })

  it('should have correct swagger documentation', () => {
    const { responses } = updateHazardousWaste.options.plugins['hapi-swagger']
    expect(responses['200']).toBeDefined()
    expect(responses['400']).toBeDefined()
    expect(responses['404']).toBeDefined()
  })
})

describe('handleUpdateHazardousWaste', () => {
  const mockRequest = {
    params: {
      wasteTrackingId: '123e4567-e89b-12d3-a456-426614174000'
    },
    payload: {
      isHazerdousWaste: true,
      components: [
        {
          component: 'Test Component',
          concentration: 0.5,
          hazCode: 'H200'
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

  it('should successfully update hazardous waste details', async () => {
    httpClients.wasteMovement.put.mockResolvedValueOnce({
      statusCode: 200
    })

    await handleUpdateHazardousWaste(mockRequest, mockH)

    expect(httpClients.wasteMovement.put).toHaveBeenCalledWith(
      `/movements/${mockRequest.params.wasteTrackingId}/receive/hazardous`,
      { hazardousWaste: mockRequest.payload }
    )
    expect(mockH.response).toHaveBeenCalledWith({
      message: 'Hazardous waste details updated successfully'
    })
    expect(mockH.code).toHaveBeenCalledWith(200)
  })

  it('should handle not found error', async () => {
    const notFoundError = new Error('Not Found')
    notFoundError.name = 'NotFoundError'
    httpClients.wasteMovement.put.mockRejectedValueOnce(notFoundError)

    await expect(
      handleUpdateHazardousWaste(mockRequest, mockH)
    ).rejects.toThrow(Boom.notFound('Movement not found'))
  })

  it('should handle bad request error', async () => {
    const badRequestError = new Error('Invalid input')
    httpClients.wasteMovement.put.mockRejectedValueOnce(badRequestError)

    await expect(
      handleUpdateHazardousWaste(mockRequest, mockH)
    ).rejects.toThrow(Boom.badRequest('Invalid input'))
  })
})
