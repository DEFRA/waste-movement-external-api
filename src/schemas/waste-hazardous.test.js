import { validHazCodes } from '../common/constants/haz-codes.js'
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
              hazCodes: ['HP_1', 'HP_2'],
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
            description:
              'missing containsHazardous field when hazardous object exists',
            input: { hazCodes: ['HP_1', 'HP_2', 'HP_3'] },
            errorMessage:
              'Hazardous waste is any waste that is potentially harmful to human health or the environment.'
          },
          {
            description: 'invalid concentration string that is not allowed',
            input: {
              containsHazardous: true,
              components: [{ name: 'Mercury', concentration: 'invalid' }]
            },
            errorMessage:
              'Chemical or Biological concentration must be a valid number or "Not Supplied"'
          },
          {
            description: 'invalid concentration type (object)',
            input: {
              containsHazardous: true,
              components: [{ name: 'Mercury', concentration: {} }]
            },
            errorMessage:
              'Chemical or Biological concentration must be a valid number or "Not Supplied"'
          },
          {
            description: 'invalid hazCodes types (string)',
            input: { containsHazardous: true, hazCodes: ['HP 1', 'HP2'] },
            errorMessage: `"wasteItems[0].hazardous.hazCodes[0]" must be one of [${validHazCodes.join(', ')}]`
          },
          {
            description: 'invalid hazCodes types (undefined)',
            input: { containsHazardous: true, hazCodes: [undefined] },
            errorMessage: '"HazardCodes" must not be a sparse array item'
          },
          {
            description: 'invalid hazCodes types (null)',
            input: { containsHazardous: true, hazCodes: [null] },
            errorMessage: `"wasteItems[0].hazardous.hazCodes[0]" must be one of [${validHazCodes.join(', ')}]`
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
      it('should accept valid HP codes with or without components', () => {
        // Single HP code with components
        const result1 = validateHazardous({
          containsHazardous: true,
          hazCodes: ['HP_15'],
          components: [{ name: 'Mercury', concentration: 10 }]
        })
        expect(result1.error).toBeUndefined()

        // Multiple HP codes without components
        const result2 = validateHazardous({
          containsHazardous: true,
          hazCodes: ['HP_1', 'HP_3']
        })
        expect(result2.error).toBeUndefined()

        // Multiple HP codes with components
        const result3 = validateHazardous({
          containsHazardous: true,
          hazCodes: ['HP_5', 'HP_10', 'HP_12'],
          components: [{ name: 'Lead compounds', concentration: 15 }]
        })
        expect(result3.error).toBeUndefined()
      })

      it('should accept empty hazCodes array when containsHazardous is true with valid components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [],
          components: [{ name: 'Mercury', concentration: 'Not Supplied' }]
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept hazardous indicator without components or hazCodes', () => {
        const result = validateHazardous({
          containsHazardous: true
        })
        expect(result.error).toBeUndefined()
      })

      it.each(validHazCodes)(
        'should accept all valid HP codes with components',
        (hazCode) => {
          const result = validateHazardous({
            containsHazardous: true,
            hazCodes: [hazCode],
            components: [{ name: 'Mercury', concentration: 30 }]
          })
          expect(result.error).toBeUndefined()
        }
      )

      it('should accept duplicate HP codes and deduplicate them with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: ['HP_1', 'HP_1', 'HP_2', 'HP_2'],
          components: [{ name: 'Mercury', concentration: 30 }]
        })
        expect(result.error).toBeUndefined()
        // Get the validated hazardous object
        const validatedHazardous = result.value.wasteItems[0].hazardous
        expect(validatedHazardous.hazCodes).toEqual(['HP_1', 'HP_2'])
      })

      it('should deduplicate HP codes with different values with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: ['HP_3', 'HP_5', 'HP_3', 'HP_7', 'HP_5'],
          components: [{ name: 'Lead compounds', concentration: 20 }]
        })
        expect(result.error).toBeUndefined()
        const validatedHazardous = result.value.wasteItems[0].hazardous
        expect(validatedHazardous.hazCodes).toEqual(['HP_3', 'HP_5', 'HP_7'])
      })

      it('should deduplicate HP codes even with valid range with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: ['HP_15', 'HP_15', 'HP_1', 'HP_1'],
          components: [{ name: 'Arsenic compounds', concentration: 25 }]
        })
        expect(result.error).toBeUndefined()
        const validatedHazardous = result.value.wasteItems[0].hazardous
        expect(validatedHazardous.hazCodes).toEqual(['HP_15', 'HP_1'])
      })

      it('should deduplicate complex HP codes array with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [
            'HP_1',
            'HP_2',
            'HP_3',
            'HP_1',
            'HP_2',
            'HP_3',
            'HP_4',
            'HP_5',
            'HP_4'
          ],
          components: [{ name: 'Mercury', concentration: 15 }]
        })
        expect(result.error).toBeUndefined()
        const validatedHazardous = result.value.wasteItems[0].hazardous
        expect(validatedHazardous.hazCodes).toEqual([
          'HP_1',
          'HP_2',
          'HP_3',
          'HP_4',
          'HP_5'
        ])
      })

      it('should reject mix of valid and invalid HP codes', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: ['HP_1', 'HP_2', 'HP_16']
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toBe(
          `"wasteItems[0].hazardous.hazCodes[2]" must be one of [${validHazCodes.join(', ')}]`
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
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Mercury',
            concentration: 30
          }
        ])
        expect(result.error).toBeUndefined()
      })

      it('should accept "Not Supplied" as concentration value', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Mercury',
            concentration: 'Not Supplied'
          }
        ])
        expect(result.error).toBeUndefined()
      })

      it('should accept blank concentration value with warning', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Mercury',
            concentration: ''
          }
        ])
        expect(result.error).toBeUndefined()
      })

      it('should reject negative concentration values', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Mercury',
            concentration: -10
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
        const payload = createTestPayload({
          wasteItemOverrides: {
            hazardous: {
              containsHazardous: true,
              components: [
                {
                  concentration: 30
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological Component name is required'
        )
      })

      it('should require concentration when component name is provided', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            hazardous: {
              containsHazardous: true,
              components: [
                {
                  name: 'Mercury'
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
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
            concentration: 30
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
            name: 'Mercury',
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
            name: 'Mercury',
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
            concentration: 30
          },
          {
            name: 'Lead',
            concentration: 'Not Supplied'
          },
          {
            name: 'Cadmium',
            concentration: 15
          }
        ])
        expect(result.error).toBeUndefined()
      })

      it('should reject when any component has invalid concentration', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Mercury',
            concentration: 30
          },
          {
            name: 'Lead',
            concentration: 'Invalid Value'
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological concentration must be a valid number or "Not Supplied"'
        )
      })

      it('should reject when any component has negative concentration', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Mercury',
            concentration: 30
          },
          {
            name: 'Lead',
            concentration: -5
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

    it('should accept submission without components regardless of hazardous properties', () => {
      // Test with hazardous=true
      const resultHazardous = validateComponentName(true)
      expect(resultHazardous.error).toBeUndefined()

      // Test with hazardous=false
      const resultNonHazardous = validateComponentName(false)
      expect(resultNonHazardous.error).toBeUndefined()
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
