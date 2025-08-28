import { quantitySchema } from './quantity.js'

describe('Quantity Schema Validation - DWT-332', () => {
  describe('Valid quantity entry scenarios', () => {
    const validQuantityCases = [
      {
        name: 'positive integer',
        input: { metric: 'Tonnes', amount: 5, isEstimate: false },
        expectedAmount: 5
      },
      {
        name: 'positive decimal',
        input: { metric: 'Tonnes', amount: 5.5, isEstimate: false },
        expectedAmount: 5.5
      },
      {
        name: 'small positive decimal',
        input: { metric: 'Tonnes', amount: 0.1, isEstimate: false },
        expectedAmount: 0.1
      },
      {
        name: 'large positive decimal',
        input: { metric: 'Tonnes', amount: 999999.99, isEstimate: false },
        expectedAmount: 999999.99
      },
      {
        name: 'very small positive decimal',
        input: { metric: 'Tonnes', amount: 0.000001, isEstimate: false },
        expectedAmount: 0.000001
      },
      {
        name: 'very large positive number',
        input: { metric: 'Tonnes', amount: 999999999, isEstimate: false },
        expectedAmount: 999999999
      },
      {
        name: 'scientific notation',
        input: { metric: 'Tonnes', amount: 1e-6, isEstimate: false },
        expectedAmount: 1e-6
      }
    ]

    test.each(validQuantityCases)(
      'should accept $name',
      ({ input, expectedAmount }) => {
        const result = quantitySchema.validate(input)
        expect(result.error).toBeUndefined()
        expect(result.value.amount).toBe(expectedAmount)
      }
    )
  })

  describe('Invalid quantity entry scenarios', () => {
    const invalidQuantityCases = [
      {
        name: 'zero amount',
        input: { metric: 'Tonnes', amount: 0, isEstimate: false },
        expectedError: 'Quantity amount must be a positive decimal'
      },
      {
        name: 'negative amount',
        input: { metric: 'Tonnes', amount: -5, isEstimate: false },
        expectedError: 'Quantity amount must be a positive decimal'
      },
      {
        name: 'negative decimal',
        input: { metric: 'Tonnes', amount: -0.5, isEstimate: false },
        expectedError: 'Quantity amount must be a positive decimal'
      },
      {
        name: 'non-numeric string',
        input: { metric: 'Tonnes', amount: 'invalid', isEstimate: false },
        expectedError: 'Quantity amount must be a valid number'
      },
      {
        name: 'empty string',
        input: { metric: 'Tonnes', amount: '', isEstimate: false },
        expectedError: 'Quantity amount must be a valid number'
      },
      {
        name: 'null amount',
        input: { metric: 'Tonnes', amount: null, isEstimate: false },
        expectedError: 'Quantity amount must be a valid number'
      },
      {
        name: 'undefined amount',
        input: { metric: 'Tonnes', isEstimate: false },
        expectedError: 'Quantity amount is required'
      }
    ]

    test.each(invalidQuantityCases)(
      'should reject $name',
      ({ input, expectedError }) => {
        const result = quantitySchema.validate(input)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(expectedError)
      }
    )
  })

  describe('Leading zero handling scenarios', () => {
    const leadingZeroCases = [
      {
        name: 'leading zero in string',
        input: { metric: 'Tonnes', amount: '05.5', isEstimate: false },
        expectedAmount: 5.5
      },
      {
        name: 'multiple leading zeros',
        input: { metric: 'Tonnes', amount: '0005.5', isEstimate: false },
        expectedAmount: 5.5
      },
      {
        name: 'leading zero with integer',
        input: { metric: 'Tonnes', amount: '05', isEstimate: false },
        expectedAmount: 5
      },
      {
        name: 'leading zeros with decimal',
        input: { metric: 'Tonnes', amount: '000.5', isEstimate: false },
        expectedAmount: 0.5
      }
    ]

    test.each(leadingZeroCases)(
      'should handle $name and convert to proper decimal',
      ({ input, expectedAmount }) => {
        const result = quantitySchema.validate(input)
        expect(result.error).toBeUndefined()
        expect(result.value.amount).toBe(expectedAmount)
      }
    )
  })

  describe('Required fields validation', () => {
    const requiredFieldCases = [
      {
        name: 'missing metric field',
        input: { amount: 5, isEstimate: false },
        expectedError: 'metric'
      },
      {
        name: 'missing isEstimate field',
        input: { metric: 'Tonnes', amount: 5 },
        expectedError: 'isEstimate'
      },
      {
        name: 'invalid metric value',
        input: { metric: 'InvalidMetric', amount: 5, isEstimate: false },
        expectedError: 'metric'
      }
    ]

    test.each(requiredFieldCases)(
      'should require $name',
      ({ input, expectedError }) => {
        const result = quantitySchema.validate(input)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(expectedError)
      }
    )
  })

  describe('Integration with waste schema', () => {
    const integrationCases = [
      {
        name: 'valid quantity in waste item',
        input: {
          ewcCodes: ['010101'],
          wasteDescription: 'Test waste',
          physicalForm: 'Solid',
          quantity: {
            metric: 'Tonnes',
            amount: 5.5,
            isEstimate: false
          }
        },
        shouldPass: true,
        expectedAmount: 5.5
      },
      {
        name: 'invalid quantity in waste item',
        input: {
          ewcCodes: ['010101'],
          wasteDescription: 'Test waste',
          physicalForm: 'Solid',
          quantity: {
            metric: 'Tonnes',
            amount: -5,
            isEstimate: false
          }
        },
        shouldPass: false,
        expectedError: 'Quantity amount must be a positive decimal'
      }
    ]

    test.each(integrationCases)(
      'should $name',
      async ({ input, shouldPass, expectedAmount, expectedError }) => {
        const { wasteItemsSchema } = await import('./waste.js')
        const result = wasteItemsSchema.validate(input)

        if (shouldPass) {
          expect(result.error).toBeUndefined()
          expect(result.value.quantity.amount).toBe(expectedAmount)
        } else {
          expect(result.error).toBeDefined()
          expect(result.error.message).toContain(expectedError)
        }
      }
    )
  })

  describe('Edge cases and boundary testing', () => {
    const edgeCases = [
      {
        name: 'minimum positive value',
        input: {
          metric: 'Tonnes',
          amount: Number.MIN_VALUE,
          isEstimate: false
        },
        shouldPass: true
      },
      {
        name: 'maximum safe integer',
        input: {
          metric: 'Tonnes',
          amount: Number.MAX_SAFE_INTEGER,
          isEstimate: false
        },
        shouldPass: true
      },
      {
        name: 'infinity',
        input: { metric: 'Tonnes', amount: Infinity, isEstimate: false },
        shouldPass: false,
        expectedError: 'cannot be infinity'
      },
      {
        name: 'negative infinity',
        input: { metric: 'Tonnes', amount: -Infinity, isEstimate: false },
        shouldPass: false,
        expectedError: 'cannot be infinity'
      },
      {
        name: 'NaN',
        input: { metric: 'Tonnes', amount: NaN, isEstimate: false },
        shouldPass: false,
        expectedError: 'Quantity amount must be a valid number'
      }
    ]

    test.each(edgeCases)(
      'should handle $name',
      ({ input, shouldPass, expectedError }) => {
        const result = quantitySchema.validate(input)

        if (shouldPass) {
          expect(result.error).toBeUndefined()
        } else {
          expect(result.error).toBeDefined()
          expect(result.error.message).toContain(expectedError)
        }
      }
    )
  })
})
