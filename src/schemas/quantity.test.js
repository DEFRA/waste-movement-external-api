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
      it('should reject isEstimate: 1 (number)', () => {
        const invalidPayload = {
          metric: 'Tonnes',
          amount: 10,
          isEstimate: 1
        }

        const { error } = quantitySchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].path).toEqual(['isEstimate'])
        expect(error.details[0].message).toContain(
          'must be either true or false'
        )
      })

      it('should reject isEstimate: 0 (number)', () => {
        const invalidPayload = {
          metric: 'Tonnes',
          amount: 10,
          isEstimate: 0
        }

        const { error } = quantitySchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].path).toEqual(['isEstimate'])
        expect(error.details[0].message).toContain(
          'must be either true or false'
        )
      })

      it('should reject isEstimate: "yes" (string)', () => {
        const invalidPayload = {
          metric: 'Tonnes',
          amount: 10,
          isEstimate: 'yes'
        }

        const { error } = quantitySchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].path).toEqual(['isEstimate'])
        expect(error.details[0].message).toContain(
          'must be either true or false'
        )
      })

      it('should reject isEstimate: "no" (string)', () => {
        const invalidPayload = {
          metric: 'Tonnes',
          amount: 10,
          isEstimate: 'no'
        }

        const { error } = quantitySchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].path).toEqual(['isEstimate'])
        expect(error.details[0].message).toContain(
          'must be either true or false'
        )
      })

      it('should reject isEstimate: null', () => {
        const invalidPayload = {
          metric: 'Tonnes',
          amount: 10,
          isEstimate: null
        }

        const { error } = quantitySchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].path).toEqual(['isEstimate'])
        expect(error.details[0].message).toContain(
          'must be either true or false'
        )
      })

      it('should reject isEstimate: undefined', () => {
        const invalidPayload = {
          metric: 'Tonnes',
          amount: 10
          // isEstimate is missing
        }

        const { error } = quantitySchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].path).toEqual(['isEstimate'])
        expect(error.details[0].message).toContain('is required')
      })

      it('should reject isEstimate: {} (object)', () => {
        const invalidPayload = {
          metric: 'Tonnes',
          amount: 10,
          isEstimate: {}
        }

        const { error } = quantitySchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].path).toEqual(['isEstimate'])
        expect(error.details[0].message).toContain(
          'must be either true or false'
        )
      })

      it('should reject isEstimate: [] (array)', () => {
        const invalidPayload = {
          metric: 'Tonnes',
          amount: 10,
          isEstimate: []
        }

        const { error } = quantitySchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].path).toEqual(['isEstimate'])
        expect(error.details[0].message).toContain(
          'must be either true or false'
        )
      })

      it('should reject isEstimate: "maybe" (string)', () => {
        const invalidPayload = {
          metric: 'Tonnes',
          amount: 10,
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
