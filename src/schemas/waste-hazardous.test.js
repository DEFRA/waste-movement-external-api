import { receiveMovementRequestSchema } from './receipt.js'
import { createTestPayload } from './test-helpers/waste-test-helpers.js'

describe('Receipt Schema Validation - Hazardous', () => {
  describe('Hazardous Waste Validation', () => {
    // Helper function to validate a payload with hazardous waste data
    const validateHazardous = (hazardous) => {
      const payload = createTestPayload({
        wasteItemOverrides: { hazardous }
      })
      return receiveMovementRequestSchema.validate(payload)
    }

    describe('Hazardous validation scenarios', () => {
      describe('Valid hazardous scenarios', () => {
        const validTestCases = [
          {
            description: 'valid hazardous indicator (false)',
            input: { containsHazardous: false }
          },
          {
            description: 'hazardous with components array',
            input: {
              containsHazardous: true,
              components: [
                { name: 'Mercury', concentration: 30 },
                { name: 'Lead', concentration: 15 }
              ]
            }
          },
          {
            description: 'hazardous with both hazCodes and components',
            input: {
              containsHazardous: true,
              hazCodes: [1, 2],
              components: [{ name: 'Mercury', concentration: 30 }]
            }
          },
          {
            description: 'missing hazardous section',
            input: undefined
          }
        ]

        it.each(validTestCases)('should accept $description', ({ input }) => {
          const result = validateHazardous(input)
          expect(result.error).toBeUndefined()
        })
      })

      describe('Invalid hazardous scenarios', () => {
        const invalidTestCases = [
          {
            description: 'hazardous indicator (true) without components',
            input: { containsHazardous: true },
            errorMessage:
              'Chemical or Biological component name must be specified when hazardous properties are present'
          },
          {
            description: 'hazardous with only hazCodes array (no components)',
            input: { containsHazardous: true, hazCodes: [1, 2, 3] },
            errorMessage:
              'Chemical or Biological component name must be specified when hazardous properties are present'
          },
          {
            description:
              'missing containsHazardous field when hazardous object exists',
            input: { hazCodes: [1, 2, 3] },
            errorMessage:
              'Hazardous waste is any waste that is potentially harmful to human health or the environment.'
          },
          {
            description: 'invalid hazCodes types',
            input: { containsHazardous: true, hazCodes: ['not', 'numbers'] },
            errorMessage: 'must be a number'
          }
        ]

        it.each(invalidTestCases)(
          'should reject $description',
          ({ input, errorMessage }) => {
            const result = validateHazardous(input)
            expect(result.error).toBeDefined()
            expect(result.error.message).toContain(errorMessage)
          }
        )
      })
    })

    // Test scenarios from user story
    describe('HP Code Validation Scenarios', () => {
      it('should reject valid single HP code (1) without components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1]
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological component name must be specified when hazardous properties are present'
        )
      })

      it('should accept valid single HP code (15) with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [15],
          components: [{ name: 'Mercury', concentration: 10 }]
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept multiple valid HP codes (1, 3) with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1, 3],
          components: [{ name: 'Arsenic compounds', concentration: 20 }]
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept multiple valid HP codes (5, 10, 12) with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [5, 10, 12],
          components: [{ name: 'Lead compounds', concentration: 15 }]
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept empty hazCodes array when containsHazardous is true with valid components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [],
          components: [{ name: 'Mercury', concentration: 'Not Supplied' }]
        })
        expect(result.error).toBeUndefined()
      })

      it('should reject missing hazCodes field without components', () => {
        const result = validateHazardous({
          containsHazardous: true
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological component name must be specified when hazardous properties are present'
        )
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

      it('should accept all valid HP codes (1-15) with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
          components: [
            { name: 'Mixed hazardous compounds', concentration: 100 }
          ]
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept duplicate HP codes and deduplicate them with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1, 1, 1],
          components: [{ name: 'Cyanides', concentration: 5 }]
        })
        expect(result.error).toBeUndefined()
        expect(result.value.wasteItems[0].hazardous.hazCodes).toEqual([1])
      })

      it('should deduplicate HP codes with different values with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1, 5, 1, 10],
          components: [{ name: 'Chromium VI compounds', concentration: 8 }]
        })
        expect(result.error).toBeUndefined()
        expect(result.value.wasteItems[0].hazardous.hazCodes).toEqual([
          1, 5, 10
        ])
      })

      it('should deduplicate HP codes even with valid range with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [15, 3, 15],
          components: [{ name: 'Cadmium compounds', concentration: 12 }]
        })
        expect(result.error).toBeUndefined()
        expect(result.value.wasteItems[0].hazardous.hazCodes).toEqual([15, 3])
      })

      it('should deduplicate complex HP codes array with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [1, 1, 4, 1, 2, 3, 3, 3, 2, 4],
          components: [
            { name: 'PCBs (Polychlorinated biphenyls)', concentration: 50 }
          ]
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

  describe('Chemical/Biological Concentration Validation', () => {
    // Helper function to validate a payload with hazardous waste and components
    const validateHazardousWithComponents = (containsHazardous, components) => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          hazardous: {
            containsHazardous,
            ...(components && { components })
          }
        }
      })
      return receiveMovementRequestSchema.validate(payload)
    }

    describe('When waste contains hazardous properties', () => {
      it('should accept valid numerical concentration values', () => {
        const testCases = [
          { concentration: 12.5, description: 'decimal value' },
          { concentration: 500, description: 'whole number' },
          { concentration: 0, description: 'zero value' }
        ]

        testCases.forEach(({ concentration }) => {
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
          'Chemical or Biological components cannot be provided when no hazardous properties are indicated'
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
          'Chemical or Biological components cannot be provided when no hazardous properties are indicated'
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
          'Chemical or Biological components cannot be provided when no hazardous properties are indicated'
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

  describe('Chemical or Biological Component Name Validation', () => {
    // Helper function to validate hazardous waste with component names
    const validateComponentName = (containsHazardous, components) => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          hazardous: {
            containsHazardous,
            ...(components && { components })
          }
        }
      })
      return receiveMovementRequestSchema.validate(payload)
    }

    it('should accept valid hazardous substance names when hazardous properties are present', () => {
      const result = validateComponentName(true, [
        {
          name: 'Mercury',
          concentration: 50
        }
      ])
      expect(result.error).toBeUndefined()
    })

    it('should REJECT null as component name when hazardous properties are present', () => {
      const result = validateComponentName(true, [
        {
          name: null,
          concentration: 30
        }
      ])
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        'Chemical or Biological Component name must be an actual component name, not null'
      )
    })

    it('should require components when hazardous properties are present', () => {
      const result = validateComponentName(true)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        'Chemical or Biological component name must be specified when hazardous properties are present'
      )
    })

    it('should accept submission without components when no hazardous properties', () => {
      const result = validateComponentName(false)
      expect(result.error).toBeUndefined()
    })

    it('should reject components when no hazardous properties are indicated', () => {
      const result = validateComponentName(false, [
        {
          name: 'Mercury',
          concentration: 25
        }
      ])
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        'Chemical or Biological components cannot be provided when no hazardous properties are indicated'
      )
    })
  })
})
