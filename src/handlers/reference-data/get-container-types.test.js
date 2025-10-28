import { describe, jest } from '@jest/globals'
import * as handler from '../handle-backend-response.js'
import {
  handleGetContainerTypes,
  mapGetContainerTypesResponse
} from './get-container-types.js'

describe('GET Container Types', () => {
  describe('Get Container Types Handler', () => {
    const validPayload = mapGetContainerTypesResponse()
    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: validPayload
    }

    it('should successfully get a list of container types', async () => {
      const h = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await handleGetContainerTypes(request, h)

      expect(h.response).toHaveBeenCalledWith(validPayload)
    })

    it('should return 500 when request to get container types fails', async () => {
      jest.spyOn(handler, 'handleBackendResponse').mockImplementation(() => {
        throw new Error('Internal Server Error')
      })

      const h = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await handleGetContainerTypes(request, h)

      expect(h.response).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Failed to get container types'
      })
      expect(h.code).toHaveBeenCalledWith(500)
    })
  })

  describe('mapGetContainerTypesResponse', () => {
    it('should map container types to the correct format', () => {
      const containerTypesResponse = mapGetContainerTypesResponse()

      expect(containerTypesResponse[0]).toStrictEqual({
        code: 'BAG'
      })
    })

    it('should return the correct number of container types in total', () => {
      const containerTypesResponse = mapGetContainerTypesResponse()

      expect(containerTypesResponse.length).toBe(16)
    })
  })
})
