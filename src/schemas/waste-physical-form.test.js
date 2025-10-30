import { apiCodes } from '../test/data/api-codes.js'
import { mockProcessEnv } from '../test/helpers/mock-process-env.js'
import { receiveMovementRequestSchema } from './receipt.js'
import {
  createTestPayload,
  TEST_CONSTANTS
} from './test-helpers/waste-test-helpers.js'

describe('Receipt Schema Validation - Physical Form', () => {
  mockProcessEnv()

  describe('Physical Form Validation', () => {
    it('should accept valid physical form', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { physicalForm: 'Solid', containsPops: false }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid physical form', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { physicalForm: 'Invalid' }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"wasteItems[0].physicalForm" must be one of [Gas, Liquid, Solid, Powder, Sludge, Mixed]'
      )
    })

    it('should reject empty physical form', () => {
      // Need to build manually as physicalForm is required in defaults
      const payload = {
        apiCode: apiCodes[0],
        dateTimeReceived: '2021-01-01T00:00:00.000Z',
        wasteItems: [
          {
            ewcCodes: [TEST_CONSTANTS.VALID_EWC_CODE],
            wasteDescription: TEST_CONSTANTS.DEFAULT_WASTE_DESCRIPTION,
            // physicalForm missing,
            weight: {
              metric: TEST_CONSTANTS.DEFAULT_METRIC,
              amount: TEST_CONSTANTS.DEFAULT_AMOUNT,
              isEstimate: TEST_CONSTANTS.DEFAULT_IS_ESTIMATE
            }
          }
        ]
      }
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"wasteItems[0].physicalForm" is required'
      )
    })
  })
})
