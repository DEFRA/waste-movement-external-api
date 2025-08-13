import { quantitySchema } from './waste.js'

describe('Quantity Schema Validation', () => {
  describe('isEstimate Field Validation', () => {
    it('should accept isEstimate as true', () => {
      const validPayload = {
        metric: 'Tonnes',
        amount: 10.5,
        isEstimate: true
      }

      const result = quantitySchema.validate(validPayload)
      expect(result.error).toBeUndefined()
    })

    it('should accept isEstimate as false', () => {
      const validPayload = {
        metric: 'Tonnes',
        amount: 10.5,
        isEstimate: false
      }

      const result = quantitySchema.validate(validPayload)
      expect(result.error).toBeUndefined()
    })

    it('should reject isEstimate when it is a string', () => {
      const invalidPayload = {
        metric: 'Tonnes',
        amount: 10.5,
        isEstimate: 'true'
      }

      const result = quantitySchema.validate(invalidPayload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('"isEstimate" must be a boolean')
    })

    it('should reject isEstimate when it is a number', () => {
      const invalidPayload = {
        metric: 'Tonnes',
        amount: 10.5,
        isEstimate: 1
      }

      const result = quantitySchema.validate(invalidPayload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('"isEstimate" must be a boolean')
    })

    it('should reject isEstimate when it is missing', () => {
      const invalidPayload = {
        metric: 'Tonnes',
        amount: 10.5
      }

      const result = quantitySchema.validate(invalidPayload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('"isEstimate" is required')
    })
  })

  describe('Complete Quantity Validation', () => {
    it('should accept valid quantity with all required fields', () => {
      const validPayload = {
        metric: 'Tonnes',
        amount: 10.5,
        isEstimate: false
      }

      const result = quantitySchema.validate(validPayload)
      expect(result.error).toBeUndefined()
    })

    it('should reject when metric is missing', () => {
      const invalidPayload = {
        amount: 10.5,
        isEstimate: false
      }

      const result = quantitySchema.validate(invalidPayload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('"metric" is required')
    })

    it('should reject when amount is missing', () => {
      const invalidPayload = {
        metric: 'Tonnes',
        isEstimate: false
      }

      const result = quantitySchema.validate(invalidPayload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('"amount" is required')
    })
  })
})
