import { validHazCodes } from '../common/constants/haz-codes.js'
import {
  sourceOfComponentsNotProvided,
  validSourceOfComponents
} from '../common/constants/source-of-components.js'
import { popsAndHazardousComponentsErrorTests } from '../test/common/pop-and-hazardous-components/pops-and-hazardous-components-error-tests.js'
import { receiveMovementRequestSchema } from './receipt.js'
import { createTestPayload } from './test-helpers/waste-test-helpers.js'

describe('Receipt Schema Validation - Hazardous', () => {
  describe('Hazardous Waste Validation', () => {
    // Helper function to validate a payload with hazardous waste data
    const validateHazardous = (wasteItemOverrides) => {
      const payload = createTestPayload({ wasteItemOverrides })
      return receiveMovementRequestSchema.validate(payload)
    }

    // Test scenarios from user story
    describe('HP Code Validation Scenarios', () => {
      it('should accept valid HP codes with or without components', () => {
        // Single HP code with components
        const result1 = validateHazardous({
          containsHazardous: true,
          hazardous: {
            sourceOfComponents: validSourceOfComponents.PROVIDED_WITH_WASTE,
            hazCodes: ['HP_15'],
            components: [{ name: 'Mercury', concentration: 10 }]
          }
        })
        expect(result1.error).toBeUndefined()

        // Multiple HP codes without components
        const result2 = validateHazardous({
          containsHazardous: true,
          hazardous: {
            sourceOfComponents: sourceOfComponentsNotProvided.NOT_PROVIDED,
            hazCodes: ['HP_1', 'HP_3']
          }
        })
        expect(result2.error).toBeUndefined()

        // Multiple HP codes with components
        const result3 = validateHazardous({
          containsHazardous: true,
          hazardous: {
            sourceOfComponents: validSourceOfComponents.PROVIDED_WITH_WASTE,
            hazCodes: ['HP_5', 'HP_10', 'HP_12'],
            components: [{ name: 'Lead compounds', concentration: 15 }]
          }
        })
        expect(result3.error).toBeUndefined()
      })

      it('should reject empty hazCodes array when containsHazardous is true', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazardous: {
            sourceOfComponents: validSourceOfComponents.PROVIDED_WITH_WASTE,
            hazCodes: [],
            components: [{ name: 'Mercury', concentration: 15 }]
          }
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          '"wasteItems[0].hazardous.hazCodes" is required when containsHazardous is true'
        )
      })

      it('should reject when containsHazardous is true and hazCodes not provided', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazardous: {
            sourceOfComponents: sourceOfComponentsNotProvided.NOT_PROVIDED
          }
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          '"wasteItems[0].hazardous.hazCodes" is required when containsHazardous is true'
        )
      })

      it('should accept when containsHazardous is false and no hazCodes provided', () => {
        const result = validateHazardous({
          containsHazardous: false
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept when containsHazardous is false and hazCodes provided', () => {
        const result = validateHazardous({
          containsHazardous: false,
          hazardous: {
            hazCodes: ['HP_1', 'HP_3']
          }
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept when containsHazardous is false and empty hazCodes array provided', () => {
        const result = validateHazardous({
          containsHazardous: false,
          hazardous: {
            hazCodes: []
          }
        })
        expect(result.error).toBeUndefined()
      })

      it.each(validHazCodes)(
        'should accept all valid HP codes with components',
        (hazCode) => {
          const result = validateHazardous({
            containsHazardous: true,
            hazardous: {
              sourceOfComponents: validSourceOfComponents.PROVIDED_WITH_WASTE,
              hazCodes: [hazCode],
              components: [{ name: 'Mercury', concentration: 30 }]
            }
          })
          expect(result.error).toBeUndefined()
        }
      )

      it('should accept duplicate HP codes and deduplicate them with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazardous: {
            sourceOfComponents: validSourceOfComponents.PROVIDED_WITH_WASTE,
            hazCodes: ['HP_1', 'HP_1', 'HP_2', 'HP_2'],
            components: [{ name: 'Mercury', concentration: 30 }]
          }
        })
        expect(result.error).toBeUndefined()
        // Get the validated hazardous object
        const validatedHazardous = result.value.wasteItems[0].hazardous
        expect(validatedHazardous.hazCodes).toEqual(['HP_1', 'HP_2'])
      })

      it('should deduplicate HP codes with different values with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazardous: {
            sourceOfComponents: validSourceOfComponents.PROVIDED_WITH_WASTE,
            hazCodes: ['HP_3', 'HP_5', 'HP_3', 'HP_7', 'HP_5'],
            components: [{ name: 'Lead compounds', concentration: 20 }]
          }
        })
        expect(result.error).toBeUndefined()
        const validatedHazardous = result.value.wasteItems[0].hazardous
        expect(validatedHazardous.hazCodes).toEqual(['HP_3', 'HP_5', 'HP_7'])
      })

      it('should deduplicate HP codes even with valid range with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazardous: {
            sourceOfComponents: validSourceOfComponents.PROVIDED_WITH_WASTE,
            hazCodes: ['HP_15', 'HP_15', 'HP_1', 'HP_1'],
            components: [{ name: 'Arsenic compounds', concentration: 25 }]
          }
        })
        expect(result.error).toBeUndefined()
        const validatedHazardous = result.value.wasteItems[0].hazardous
        expect(validatedHazardous.hazCodes).toEqual(['HP_15', 'HP_1'])
      })

      it('should deduplicate complex HP codes array with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazardous: {
            sourceOfComponents: validSourceOfComponents.PROVIDED_WITH_WASTE,
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
          }
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
          hazardous: {
            sourceOfComponents: validSourceOfComponents.PROVIDED_WITH_WASTE,
            hazCodes: ['HP_1', 'HP_2', 'HP_16']
          }
        })
        expect(result.error).toBeDefined()
        expect(result.error.message).toBe(
          `"wasteItems[0].hazardous.hazCodes[2]" must be one of [${validHazCodes.join(', ')}]`
        )
      })
    })

    const invalidTestCases = [
      {
        description: 'invalid hazCodes types (string)',
        input: {
          containsHazardous: true,
          hazardous: {
            sourceOfComponents: validSourceOfComponents.PROVIDED_WITH_WASTE,
            hazCodes: ['HP 1', 'HP2']
          }
        },
        errorMessage: `"wasteItems[0].hazardous.hazCodes[0]" must be one of [${validHazCodes.join(', ')}]`
      },
      {
        description: 'invalid hazCodes types (undefined)',
        input: {
          containsHazardous: true,
          hazardous: {
            sourceOfComponents: validSourceOfComponents.PROVIDED_WITH_WASTE,
            hazCodes: [undefined]
          }
        },
        errorMessage:
          '"wasteItems[0].hazardous.hazCodes[0]" must not be a sparse array item'
      },
      {
        description: 'invalid hazCodes types (null)',
        input: {
          containsHazardous: true,
          hazardous: {
            sourceOfComponents: validSourceOfComponents.PROVIDED_WITH_WASTE,
            hazCodes: [null]
          }
        },
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

popsAndHazardousComponentsErrorTests('Hazardous', {
  hazCodes: [validHazCodes[0]]
})
