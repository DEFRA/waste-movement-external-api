import { describe, jest } from '@jest/globals'
import * as handler from '../handle-backend-response.js'
import {
  handleGetHazardousPropertyCodes,
  mapGetHazardousPropertyCodesResponse
} from './get-hazardous-property-codes.js'

describe('GET Hazardous Property Codes', () => {
  describe('Get Hazardous Property Codes Handler', () => {
    const validPayload = mapGetHazardousPropertyCodesResponse()
    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: validPayload
    }

    it('should successfully get a list of hazardous property codes', async () => {
      const h = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await handleGetHazardousPropertyCodes(request, h)

      expect(h.response).toHaveBeenCalledWith(validPayload)
    })

    it('should return 500 when request to get hazardous property codes fails', async () => {
      jest.spyOn(handler, 'handleBackendResponse').mockImplementation(() => {
        throw new Error('Internal Server Error')
      })

      const h = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await handleGetHazardousPropertyCodes(request, h)

      expect(h.response).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Failed to get hazardous property codes'
      })
      expect(h.code).toHaveBeenCalledWith(500)
    })
  })

  describe('mapGetHazardousPropertyCodesResponse', () => {
    it('should map hazardous property codes to the correct format', () => {
      const hazPropertyCodesResponse = mapGetHazardousPropertyCodesResponse()

      expect(hazPropertyCodesResponse[0]).toStrictEqual({
        code: 'HP_1'
      })
    })

    it('should return the correct number of codes', () => {
      const hazPropertyCodesResponse = mapGetHazardousPropertyCodesResponse()

      expect(hazPropertyCodesResponse.length).toBe(16)
    })
  })
})
