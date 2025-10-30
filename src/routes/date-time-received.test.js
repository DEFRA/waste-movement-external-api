import { receiveMovementRequestSchema } from '../schemas/receipt.js'
import { apiCodes } from '../test/data/api-codes.js'
import { mockProcessEnv } from '../test/helpers/mock-process-env.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'

describe('Create Receipt Movement - Date and Time Received Validation', () => {
  mockProcessEnv()

  describe('Schema Validation Tests for dateTimeReceived', () => {
    it('should accept a valid ISO date-time for dateTimeReceived', () => {
      const payload = {
        ...createMovementRequest(),
        dateTimeReceived: '2025-08-29T15:24:00Z'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeUndefined()
    })

    it('should reject an invalid date-time for dateTimeReceived', () => {
      const payload = {
        ...createMovementRequest(),
        // Invalid ISO date-time
        dateTimeReceived: 'not-a-date'
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      // Joi message for iso constraint typically contains 'must be in iso format'
      expect(error.details[0].message.toLowerCase()).toBe(
        '"datetimereceived" must be in iso 8601 date format'
      )
    })

    it('should reject when receipt is provided without dateTimeReceived', () => {
      const payload = {
        apiCode: apiCodes[0]
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe('"dateTimeReceived" is required')
    })
  })
})
