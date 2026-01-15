import { HTTP_STATUS } from '../constants/http-status-codes.js'
import { isSuccessStatusCode, normalizeArrayIndices } from './utils.js'

describe('Utils tests', () => {
  describe('isSuccessStatusCode', () => {
    it.each([
      HTTP_STATUS.ACCEPTED,
      HTTP_STATUS.CREATED,
      HTTP_STATUS.NO_CONTENT,
      HTTP_STATUS.OK
    ])('should return true for a success status code: "%s"', (statusCode) => {
      const result = isSuccessStatusCode(statusCode)

      expect(result).toEqual(true)
    })

    it('should return false for an error status code', () => {
      const result = isSuccessStatusCode(HTTP_STATUS.BAD_REQUEST)

      expect(result).toEqual(false)
    })
  })

  describe('normalizeArrayIndices', () => {
    it('should replace single array index with wildcard', () => {
      const result = normalizeArrayIndices('wasteItems[0].physicalForm')

      expect(result).toEqual('wasteItems[*].physicalForm')
    })

    it('should replace multiple array indices with wildcards', () => {
      const result = normalizeArrayIndices(
        'wasteItems[5].disposalOrRecoveryCodes[2].code'
      )

      expect(result).toEqual('wasteItems[*].disposalOrRecoveryCodes[*].code')
    })

    it('should handle double-digit indices', () => {
      const result = normalizeArrayIndices('items[12].value')

      expect(result).toEqual('items[*].value')
    })

    it('should return string unchanged if no array indices', () => {
      const result = normalizeArrayIndices('"apiCode" is required')

      expect(result).toEqual('"apiCode" is required')
    })
  })
})
