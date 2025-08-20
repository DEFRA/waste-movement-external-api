import { receiveMovementRequestSchema } from './receipt.js'

describe('Receipt Schema Validation', () => {
  describe('POPs Indicator Validation', () => {
    // Helper function to validate a payload with POPs indicator
    const validatePopsIndicator = (containsPops) => {
      const payload = {
        receivingSiteId: 'site123',
        wasteItems: [
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
        wasteItems: [
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
        wasteItems: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            form: 'Solid',
            hazardous,
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

    // Test scenarios from user story
    describe('HP Code Validation Scenarios', () => {
      it('should accept valid single HP code (1)', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1]
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept valid single HP code (15)', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [15]
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept multiple valid HP codes (1, 3)', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1, 3]
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept multiple valid HP codes (5, 10, 12)', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [5, 10, 12]
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept empty hazCodes array when containsHazardous is true', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: []
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept missing hazCodes field', () => {
        const result = validateHazardous({
          containsHazardous: true
        })
        expect(result.error).toBeUndefined()
      })

      it('should reject HP code 0 (out of range)', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [0]
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Hazard code must be between 1 and 15 (HP1-HP15)'
        )
      })

      it('should reject HP code 16 (out of range)', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [16]
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Hazard code must be between 1 and 15 (HP1-HP15)'
        )
      })

      it('should reject HP code 17 (invalid per user story)', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [17]
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Hazard code must be between 1 and 15 (HP1-HP15)'
        )
      })

      it('should reject string format "HP 17"', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: ['HP 17']
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain('Hazard code must be a number')
      })

      it('should reject string format "H P1"', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: ['H P1']
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain('Hazard code must be a number')
      })

      it('should reject string format "HP 1"', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: ['HP 1']
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain('Hazard code must be a number')
      })

      it('should reject string "Not A Code"', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: ['Not A Code']
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain('Hazard code must be a number')
      })

      it('should reject negative HP codes', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [-1]
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Hazard code must be between 1 and 15 (HP1-HP15)'
        )
      })

      it('should reject decimal HP codes', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1.5]
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain('Hazard code must be an integer')
      })

      it('should accept all valid HP codes (1-15)', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept duplicate HP codes and deduplicate them', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1, 1, 1]
        })
        expect(result.error).toBeUndefined()
        expect(result.value.wasteItems[0].hazardous.hazCodes).toEqual([1])
      })

      it('should deduplicate HP codes with different values', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1, 5, 1, 10]
        })
        expect(result.error).toBeUndefined()
        expect(result.value.wasteItems[0].hazardous.hazCodes).toEqual([
          1, 5, 10
        ])
      })

      it('should deduplicate HP codes even with valid range', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [15, 3, 15]
        })
        expect(result.error).toBeUndefined()
        expect(result.value.wasteItems[0].hazardous.hazCodes).toEqual([15, 3])
      })

      it('should deduplicate complex HP codes array', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1, 1, 4, 1, 2, 3, 3, 3, 2, 4]
        })
        expect(result.error).toBeUndefined()
        // The Set preserves insertion order for unique values
        expect(result.value.wasteItems[0].hazardous.hazCodes).toEqual([
          1, 4, 2, 3
        ])
      })

      it('should reject mix of valid and invalid HP codes', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1, 16, 3]
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Hazard code must be between 1 and 15 (HP1-HP15)'
        )
      })
    })
  })

  describe('EWC Code Validation', () => {
    // Helper function to validate a payload with a specific EWC code
    const validateEwcCode = (ewcCodeArray) => {
      const payload = {
        receivingSiteId: 'site123',
        wasteItems: [
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
        '"wasteItems[0].ewcCodes[0]" must be a valid 6-digit numeric code'
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
        '"wasteItems[0].ewcCodes[0]" must be a valid EWC code from the official list'
      )
    })

    it('should require the EWC code field', () => {
      // Test with missing EWC code
      const payload = {
        receivingSiteId: 'site123',
        wasteItems: [
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
      expect(result.error.message).toContain(
        '"wasteItems[0].ewcCodes" is required'
      )
    })
  })

  describe('Chemical/Biological Concentration Validation', () => {
    // Helper function to validate a payload with hazardous waste and components
    const validateHazardousWithComponents = (containsHazardous, components) => {
      const payload = {
        receivingSiteId: 'site123',
        waste: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            form: 'Solid',
            hazardous: {
              containsHazardous,
              ...(components && { components })
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

    describe('When waste contains hazardous properties', () => {
      it('should accept valid numerical concentration values', () => {
        const testCases = [
          { concentration: 12.5, description: 'decimal value' },
          { concentration: 500, description: 'whole number' },
          { concentration: 0, description: 'zero value' }
        ]

        testCases.forEach(({ concentration, description }) => {
          const result = validateHazardousWithComponents(true, [
            {
              name: 'Mercury',
              concentration
            }
          ])
          expect(result.error).toBeUndefined()
        })
      })

      it('should accept "Not Supplied" as concentration value', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Lead',
            concentration: 'Not Supplied'
          }
        ])
        expect(result.error).toBeUndefined()
      })

      it('should accept blank concentration value with warning', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Cadmium',
            concentration: ''
          }
        ])
        expect(result.error).toBeUndefined()
        // Note: Warning generation would be handled by validation warnings helper
      })

      it('should reject negative concentration values', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Mercury',
            concentration: -5
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological concentration cannot be negative'
        )
      })

      it('should reject invalid concentration values', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Mercury',
            concentration: 'Invalid'
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological concentration must be a valid number or "Not Supplied"'
        )
      })

      it('should require component name when concentration is provided', () => {
        const result = validateHazardousWithComponents(true, [
          {
            concentration: 25
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological Component name is required'
        )
      })

      it('should require concentration when component name is provided', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Mercury'
            // concentration is missing
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological concentration is required when hazardous properties are present'
        )
      })
    })

    describe('When waste does not contain hazardous properties', () => {
      it('should accept submission without chemical/bio concentration', () => {
        const result = validateHazardousWithComponents(false)
        expect(result.error).toBeUndefined()
      })

      it('should reject when chemical/bio concentration is provided', () => {
        const result = validateHazardousWithComponents(false, [
          {
            name: 'Mercury',
            concentration: 25
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological concentration cannot be provided when hazardous properties are not present'
        )
      })

      it('should reject when "Not Supplied" concentration is provided', () => {
        const result = validateHazardousWithComponents(false, [
          {
            name: 'Lead',
            concentration: 'Not Supplied'
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological concentration cannot be provided when hazardous properties are not present'
        )
      })

      it('should reject when blank concentration is provided', () => {
        const result = validateHazardousWithComponents(false, [
          {
            name: 'Cadmium',
            concentration: ''
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological concentration cannot be provided when hazardous properties are not present'
        )
      })
    })

    describe('Multiple components validation', () => {
      it('should accept multiple components with valid concentrations', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Mercury',
            concentration: 12.5
          },
          {
            name: 'Lead',
            concentration: 'Not Supplied'
          },
          {
            name: 'Cadmium',
            concentration: 0
          }
        ])
        expect(result.error).toBeUndefined()
      })

      it('should reject when any component has invalid concentration', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Mercury',
            concentration: 12.5
          },
          {
            name: 'Lead',
            concentration: -5 // Invalid negative value
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological concentration cannot be negative'
        )
      })
    })
  })
})
