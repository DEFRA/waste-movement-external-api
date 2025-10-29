import { HTTP_STATUS } from '../constants/http-status-codes.js'
import { isSuccessStatusCode } from './utils.js'

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
})
