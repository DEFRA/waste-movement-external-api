import { receiveMovementRequestSchema } from './receipt.js'

describe('Receipt Schema Validation', () => {
  describe('POPs Indicator Validation', () => {
    // Helper function to validate a payload with POPs indicator
    const validatePopsIndicator = (containsPops) => {
      const payload = {
        receivingSiteId: 'site123',
        waste: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            form: 'Solid',
            pops: containsPops !== undefined ? { containsPops } : undefined,
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

    it('should accept valid POPs indicator (true)', () => {
      const result = validatePopsIndicator(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid POPs indicator (false)', () => {
      const result = validatePopsIndicator(false)
      expect(result.error).toBeUndefined()
    })

    it('should accept missing POPs section', () => {
      const result = validatePopsIndicator(undefined)
      expect(result.error).toBeUndefined()
    })

    it('should reject missing containsPops field', () => {
      // Create a payload with pops object but missing containsPops
      const payload = {
        receivingSiteId: 'site123',
        waste: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            form: 'Solid',
            pops: {}, // Empty pops object without containsPops
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
      expect(result.error.message).toContain(
        'Does the waste contain persistent organic pollutants (POPs)? is required'
      )
    })
  })

  describe('Hazardous Waste Validation', () => {
    // Helper function to validate a payload with hazardous waste data
    const validateHazardous = (hazardous) => {
      const payload = {
        receivingSiteId: 'site123',
        waste: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            form: 'Solid',
            hazardous: hazardous,
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

    it('should accept valid hazardous indicator (true)', () => {
      const result = validateHazardous({
        containsHazardous: true
      })
      expect(result.error).toBeUndefined()
    })

    it('should accept valid hazardous indicator (false)', () => {
      const result = validateHazardous({
        containsHazardous: false
      })
      expect(result.error).toBeUndefined()
    })

    it('should accept hazardous with hazCodes array', () => {
      const result = validateHazardous({
        containsHazardous: true,
        hazCodes: [1, 2, 3]
      })
      expect(result.error).toBeUndefined()
    })

    it('should accept hazardous with components array', () => {
      const result = validateHazardous({
        containsHazardous: true,
        components: [
          {
            name: 'Mercury',
            concentration: 30
          },
          {
            name: 'Lead',
            concentration: 15
          }
        ]
      })
      expect(result.error).toBeUndefined()
    })

    it('should accept hazardous with both hazCodes and components', () => {
      const result = validateHazardous({
        containsHazardous: true,
        hazCodes: [1, 2],
        components: [
          {
            name: 'Mercury',
            concentration: 30
          }
        ]
      })
      expect(result.error).toBeUndefined()
    })

    it('should accept missing hazardous section', () => {
      const result = validateHazardous(undefined)
      expect(result.error).toBeUndefined()
    })

    it('should reject missing containsHazardous field when hazardous object exists', () => {
      const result = validateHazardous({
        hazCodes: [1, 2, 3]
      })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        'Hazardous waste is any waste that is potentially harmful to human health or the environment.'
      )
    })

    it('should reject invalid hazCodes types', () => {
      const result = validateHazardous({
        containsHazardous: true,
        hazCodes: ['not', 'numbers']
      })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('must be a number')
    })
  })

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
            pops: {
              containsPops: false
            },
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
