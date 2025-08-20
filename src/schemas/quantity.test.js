import { quantitySchema } from './quantity.js'

describe('Quantity Schema Validation', () => {
  describe('isEstimate Field Validation', () => {
    describe('Valid isEstimate Values', () => {
      it('should accept isEstimate: true', () => {
        const validPayload = {
          metric: 'Tonnes',
          amount: 10,
          isEstimate: true
        }

        const { error } = quantitySchema.validate(validPayload)
        expect(error).toBeUndefined()
      })

      it('should accept isEstimate: false', () => {
        const validPayload = {
          metric: 'Tonnes',
          amount: 10,
          isEstimate: false
        }

        const { error } = quantitySchema.validate(validPayload)
        expect(error).toBeUndefined()
      })

      // Joi automatically converts string "true"/"false" to boolean, so these are actually valid
      it('should accept isEstimate: "true" (string) - Joi auto-converts', () => {
        const validPayload = {
          metric: 'Tonnes',
          amount: 10,
          isEstimate: 'true'
        }

        const { error } = quantitySchema.validate(validPayload)
        expect(error).toBeUndefined()
      })

      it('should accept isEstimate: "false" (string) - Joi auto-converts', () => {
        const validPayload = {
          metric: 'Tonnes',
          amount: 10,
          isEstimate: 'false'
        }

        const { error } = quantitySchema.validate(validPayload)
        expect(error).toBeUndefined()
      })
    })

    describe('Invalid isEstimate Values', () => {
      const cases = [
        {
          name: 'should reject isEstimate: 1 (number)',
          isEstimate: 1,
          expectedMessage: 'must be either true or false'
        },
        {
          name: 'should reject isEstimate: 0 (number)',
          isEstimate: 0,
          expectedMessage: 'must be either true or false'
        },
        {
          name: 'should reject isEstimate: "yes" (string)',
          isEstimate: 'yes',
          expectedMessage: 'must be either true or false'
        },
        {
          name: 'should reject isEstimate: "no" (string)',
          isEstimate: 'no',
          expectedMessage: 'must be either true or false'
        },
        {
          name: 'should reject isEstimate: null',
          isEstimate: null,
          expectedMessage: 'must be either true or false'
        },
        {
          name: 'should reject isEstimate: undefined',
          isEstimate: undefined,
          expectedMessage: 'is required'
        },
        {
          name: 'should reject isEstimate: {} (object)',
          isEstimate: {},
          expectedMessage: 'must be either true or false'
        },
        {
          name: 'should reject isEstimate: [] (array)',
          isEstimate: [],
          expectedMessage: 'must be either true or false'
        },
        {
          name: 'should reject isEstimate: "maybe" (string)',
          isEstimate: 'maybe',
          expectedMessage: 'must be either true or false'
        }
      ]

      test.each(cases)('$name', ({ isEstimate, expectedMessage }) => {
        const payload = {
          metric: 'Tonnes',
          amount: 10,
          ...(isEstimate !== undefined && { isEstimate })
        }

        const { error } = quantitySchema.validate(payload)
        expect(error).toBeDefined()
        expect(error.details[0].path).toEqual(['isEstimate'])
        expect(error.details[0].message).toContain(expectedMessage)
      })
    })

    describe('Complete Quantity Schema Validation', () => {
      it('should accept complete valid quantity with isEstimate: true', () => {
        const validPayload = {
          metric: 'Tonnes',
          amount: 5.5,
          isEstimate: true
        }

        const { error } = quantitySchema.validate(validPayload)
        expect(error).toBeUndefined()
      })

      it('should accept complete valid quantity with isEstimate: false', () => {
        const validPayload = {
          metric: 'Tonnes',
          amount: 5.5,
          isEstimate: false
        }

        const { error } = quantitySchema.validate(validPayload)
        expect(error).toBeUndefined()
      })

      it('should reject when isEstimate is the only invalid field', () => {
        const invalidPayload = {
          metric: 'Tonnes',
          amount: 5.5,
          isEstimate: 'maybe'
        }

        const { error } = quantitySchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].path).toEqual(['isEstimate'])
        expect(error.details[0].message).toContain(
          'must be either true or false'
        )
      })
    })
  })
})
