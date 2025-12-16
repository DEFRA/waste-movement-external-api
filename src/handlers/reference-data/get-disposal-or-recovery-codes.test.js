import { describe, jest } from '@jest/globals'
import {
  handleGetDisposalOrRecoveryCodes,
  mapGetDisposalOrRecoveryCodesResponse
} from './get-disposal-or-recovery-codes.js'
import * as handler from '../handle-backend-response.js'

describe('GET Disposal or Recovery Codes', () => {
  describe('Get Disposal or Recovery Codes Handler', () => {
    const validPayload = mapGetDisposalOrRecoveryCodesResponse()
    const request = {
      auth: {
        credentials: {
          clientId: 'test-client-id'
        }
      },
      payload: validPayload
    }

    it('should successfully get a list of disposal or recovery codes', async () => {
      const h = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await handleGetDisposalOrRecoveryCodes(request, h)

      expect(h.response).toHaveBeenCalledWith(validPayload)
    })

    it('should return 500 when request to get disposal or recovery codes fails', async () => {
      jest.spyOn(handler, 'handleBackendResponse').mockImplementation(() => {
        throw new Error('Internal Server Error')
      })

      const h = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis()
      }

      await handleGetDisposalOrRecoveryCodes(request, h)

      expect(h.response).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Failed to get disposal or recovery codes'
      })
      expect(h.code).toHaveBeenCalledWith(500)
    })
  })

  describe('mapGetDisposalOrRecoveryCodesResponse', () => {
    it('should map disposal or recovery codes to the correct format', () => {
      const codesResponse = mapGetDisposalOrRecoveryCodesResponse()

      expect(codesResponse[0]).toStrictEqual({
        code: 'R1',
        isNotRecoveryToFinalProduct: true,
        description:
          'Use principally as a fuel or other means to generate energy'
      })
    })

    it('should return the correct number of codes in total', () => {
      const codesResponse = mapGetDisposalOrRecoveryCodesResponse()

      expect(codesResponse.length).toBe(28)
    })

    it('should include recovery codes', () => {
      const codesResponse = mapGetDisposalOrRecoveryCodesResponse()
      const recoveryCodes = codesResponse.filter(({ code }) =>
        code.startsWith('R')
      )

      expect(recoveryCodes.length).toBe(13)
    })

    it('should include disposal codes', () => {
      const codesResponse = mapGetDisposalOrRecoveryCodesResponse()
      const disposalCodes = codesResponse.filter(({ code }) =>
        code.startsWith('D')
      )

      expect(disposalCodes.length).toBe(15)
    })
  })
})
