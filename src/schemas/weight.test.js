import { receiveMovementRequestSchema } from './receipt.js'
import {
  createTestPayload,
  TEST_CONSTANTS
} from './test-helpers/waste-test-helpers.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'

describe('Receipt Schema Validation - Weight', () => {
  describe('In waste item', () => {
    const validateWithWeightOverrides = (weightOverrides) => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          weight: {
            metric: TEST_CONSTANTS.DEFAULT_METRIC,
            amount: TEST_CONSTANTS.DEFAULT_AMOUNT,
            isEstimate: TEST_CONSTANTS.DEFAULT_IS_ESTIMATE,
            ...weightOverrides
          }
        }
      })
      return receiveMovementRequestSchema.validate(payload)
    }

    describe('Metric Validation', () => {
      it.each(['Grams', 'Kilograms', 'Tonnes'])(
        'should accept valid metric - %s',
        (metric) => {
          const result = validateWithWeightOverrides({ metric })

          expect(result.error).toBeUndefined()
        }
      )

      it('should reject invalid metric value', () => {
        const result = validateWithWeightOverrides({ metric: 'Pounds' })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          '"wasteItems[0].weight.metric" must be one of [Grams, Kilograms, Tonnes]'
        )
      })

      it('should require metric', () => {
        const result = validateWithWeightOverrides({ metric: undefined })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          '"wasteItems[0].weight.metric" is required'
        )
      })
    })

    describe('IsEstimate Validation', () => {
      it.each(['True', 'False', 'true', 'false', true, false])(
        'should accept valid isEstimate - %s',
        (isEstimate) => {
          const result = validateWithWeightOverrides({ isEstimate })

          expect(result.error).toBeUndefined()
        }
      )

      it('should require isEstimate', () => {
        const result = validateWithWeightOverrides({ isEstimate: undefined })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain('isEstimate is required')
      })
    })

    describe('Amount Validation', () => {
      it('should require amount', () => {
        const result = validateWithWeightOverrides({ amount: undefined })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          '"wasteItems[0].weight.amount" is required'
        )
      })

      it('should accept a positive integer', () => {
        const result = validateWithWeightOverrides({ amount: 1 })

        expect(result.error).toBeUndefined()
      })

      it('should reject zero', () => {
        const result = validateWithWeightOverrides({ amount: 0 })

        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          '"wasteItems[0].weight.amount" must be a positive number'
        )
      })

      it('should reject a negative integer', () => {
        const result = validateWithWeightOverrides({ amount: -1 })

        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          '"wasteItems[0].weight.amount" must be a positive number'
        )
      })

      it('should reject string values', () => {
        const result = validateWithWeightOverrides({ amount: '123' })

        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          '"wasteItems[0].weight.amount" must be a number'
        )
      })
    })
  })

  describe('In disposalOrRecoveryCode', () => {
    const validateWithReceiptWeightOverrides = (weightOverrides) => {
      const basePayload = createMovementRequest()
      const payload = {
        ...basePayload,
        wasteItems: [
          {
            ...basePayload.wasteItems[0],
            disposalOrRecoveryCodes: [
              {
                code: 'R1',
                weight: {
                  metric: 'Tonnes',
                  amount: 1,
                  isEstimate: false,
                  ...weightOverrides
                }
              }
            ]
          }
        ]
      }
      return receiveMovementRequestSchema.validate(payload)
    }

    it.each(['Grams', 'Kilograms', 'Tonnes'])(
      'should accept valid metric - %s',
      (metric) => {
        const result = validateWithReceiptWeightOverrides({ metric })
        expect(result.error).toBeUndefined()
      }
    )

    it('should reject invalid metric value', () => {
      const result = validateWithReceiptWeightOverrides({ metric: 'Pounds' })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"wasteItems[0].disposalOrRecoveryCodes[0].weight.metric" must be one of [Grams, Kilograms, Tonnes]'
      )
    })

    it('should require metric', () => {
      const result = validateWithReceiptWeightOverrides({ metric: undefined })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"wasteItems[0].disposalOrRecoveryCodes[0].weight.metric" is required'
      )
    })

    it('should require weight object in each disposalOrRecoveryCode', () => {
      const basePayload = createMovementRequest()
      const payload = {
        ...basePayload,
        wasteItems: [
          {
            ...basePayload.wasteItems[0],
            disposalOrRecoveryCodes: [
              {
                code: 'R1'
                // weight omitted
              }
            ]
          }
        ]
      }
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"wasteItems[0].disposalOrRecoveryCodes[0].weight" is required'
      )
    })
  })
})
