import { describe, jest } from '@jest/globals'
import { handleGetEwcCodes, mapGetEwcCodesResponse } from './get-ewc-codes.js'
import * as handler from '../handle-backend-response.js'

describe('GET EWC Codes', () => {
  describe('Get EWC Codes Handler', () => {
    const validPayload = mapGetEwcCodesResponse()
    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: validPayload
    }

    it('should successfully get a list of EWC codes', async () => {
      const h = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await handleGetEwcCodes(request, h)

      expect(h.response).toHaveBeenCalledWith(validPayload)
    })

    it('should return 500 when request to get EWC codes fails', async () => {
      jest.spyOn(handler, 'handleBackendResponse').mockImplementation(() => {
        throw new Error('Internal Server Error')
      })

      const h = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await handleGetEwcCodes(request, h)

      expect(h.response).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Failed to get EWC codes'
      })
      expect(h.code).toHaveBeenCalledWith(500)
    })
  })

  // Sanity tests so we don't need to test the entire list of codes
  describe('mapGetEwcCodesResponse', () => {
    it('should map EWC codes to the correct format', () => {
      const ewcCodesResponse = mapGetEwcCodesResponse()

      expect(ewcCodesResponse[0]).toStrictEqual({
        code: '010101',
        isHazardous: false
      })
    })

    it('should return the correct number of codes in total', () => {
      const ewcCodesResponse = mapGetEwcCodesResponse()

      expect(ewcCodesResponse.length).toBe(840)
    })

    it('should return the correct number of hazardous codes', () => {
      const ewcCodesResponse = mapGetEwcCodesResponse()
      const hazardousEwcCodes = ewcCodesResponse.filter(
        ({ isHazardous }) => isHazardous
      )

      expect(hazardousEwcCodes.length).toBe(407)
    })

    it('should return the correct number of non-hazardous codes', () => {
      const ewcCodesResponse = mapGetEwcCodesResponse()
      const nonHazardousEwcCodes = ewcCodesResponse.filter(
        ({ isHazardous }) => !isHazardous
      )

      expect(nonHazardousEwcCodes.length).toBe(433)
    })
  })
})
