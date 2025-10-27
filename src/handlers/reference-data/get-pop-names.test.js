import { describe, jest } from '@jest/globals'
import * as handler from '../handle-backend-response.js'
import { handleGetPopNames, mapGetPopNamesResponse } from './get-pop-names.js'

describe('GET POP Names', () => {
  describe('Get POP Names Handler', () => {
    const validPayload = mapGetPopNamesResponse()
    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: validPayload
    }

    it('should successfully get a list of POP names', async () => {
      const h = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await handleGetPopNames(request, h)

      expect(h.response).toHaveBeenCalledWith(validPayload)
    })

    it('should return 500 when request to get POP names fails', async () => {
      jest.spyOn(handler, 'handleBackendResponse').mockImplementation(() => {
        throw new Error('Internal Server Error')
      })

      const h = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await handleGetPopNames(request, h)

      expect(h.response).toHaveBeenCalledWith({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to get POP names'
      })
      expect(h.code).toHaveBeenCalledWith(500)
    })
  })

  describe('mapGetPopNamesResponse', () => {
    it('should map POP names to the correct format', () => {
      const popNamesResponse = mapGetPopNamesResponse()

      expect(popNamesResponse[0]).toStrictEqual({
        code: 'END'
      })
    })

    it('should return the correct number of POP names in total', () => {
      const popNamesResponse = mapGetPopNamesResponse()

      expect(popNamesResponse.length).toBe(31)
    })
  })
})
