import { receiveMovementRequestSchema } from './receipt.js'

describe('Receipt Schema Validation', () => {
  describe('EWC Code Validation', () => {
    // Helper function to validate a payload with a specific EWC code
    const validateEwcCode = (ewcCodeArray) => {
      const payload = {
        receivingSiteId: 'site123',
        waste: [
          {
            ewcCodes: ewcCodeArray,
            wasteDescription: 'Test waste',
            form: 'Solid',
            quantity: {
              metric: 'Tonnes',
              amount: 1,
              isEstimate: false
            }
          }
        ]
      }

      return receiveMovementRequestSchema.validate(payload)
    }

    it('should accept valid EWC codes without spaces', () => {
      // Test with valid EWC codes without spaces
      const result1 = validateEwcCode(['010101'])
      const result2 = validateEwcCode(['020101'])
      const result3 = validateEwcCode(['150101'])

      expect(result1.error).toBeUndefined()
      expect(result2.error).toBeUndefined()
      expect(result3.error).toBeUndefined()
    })

    it('should reject EWC codes with spaces', () => {
      // Test with valid EWC codes with spaces
      const result1 = validateEwcCode(['01 01 01'])

      expect(result1.error).toBeDefined()
      expect(result1.error.message).toContain(
        '"waste[0].ewcCodes[0]" must be a valid 6-digit numeric code'
      )
    })

    it('should reject EWC codes with invalid format', () => {
      // Test with codes that don't match the 6-digit format
      const result1 = validateEwcCode(['1234'])
      const result2 = validateEwcCode(['12345'])
      const result3 = validateEwcCode(['1234567'])
      const result4 = validateEwcCode(['ABCDEF'])

      expect(result1.error).toBeDefined()
      expect(result1.error.message).toContain(
        'must be a valid 6-digit numeric code'
      )

      expect(result2.error).toBeDefined()
      expect(result2.error.message).toContain(
        'must be a valid 6-digit numeric code'
      )

      expect(result3.error).toBeDefined()
      expect(result3.error.message).toContain(
        'must be a valid 6-digit numeric code'
      )

      expect(result4.error).toBeDefined()
      expect(result4.error.message).toContain(
        'must be a valid 6-digit numeric code'
      )
    })

    it('should reject EWC codes not in the official list', () => {
      // Test with codes that match the format but aren't in the list
      const result1 = validateEwcCode(['999999'])

      expect(result1.error).toBeDefined()
      expect(result1.error.message).toContain(
        'must be a valid EWC code from the official list'
      )
    })

    it('should reject EWC codes array with more than 5 items', () => {
      const result = validateEwcCode([
        '999999',
        '999999',
        '999999',
        '999999',
        '999999',
        '999999'
      ])

      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"waste[0].ewcCodes[0]" must be a valid EWC code from the official list'
      )
    })

    it('should require the EWC code field', () => {
      // Test with missing EWC code
      const payload = {
        receivingSiteId: 'site123',
        waste: [
          {
            wasteDescription: 'Test waste',
            form: 'Solid',
            quantity: {
              metric: 'Tonnes',
              amount: 1,
              isEstimate: false
            }
          }
        ]
      }

      const result = receiveMovementRequestSchema.validate(payload)

      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('"waste[0].ewcCodes" is required')
    })
  })
})
