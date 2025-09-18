import { validHazCodes } from '../common/constants/haz-codes.js'
import {
  sourceOfComponentsNotProvided,
  sourceOfComponentsProvided,
  validSourceOfComponents
} from '../common/constants/source-of-components.js'
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
            input: {
              containsHazardous: false,
              sourceOfComponents: sourceOfComponentsNotProvided.NOT_PROVIDED
            }
          },
          {
            description: 'hazardous with components array',
            input: {
              containsHazardous: true,
              sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
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
              sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
              hazCodes: ['HP_1', 'HP_2'],
              components: [{ name: 'Mercury', concentration: 30 }]
            }
          },
          {
            description:
              'when sourceOfComponents is NOT_PROVIDED then components can be undefined',
            input: {
              containsHazardous: true,
              sourceOfComponents: sourceOfComponentsNotProvided.NOT_PROVIDED,
              components: undefined
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

        it.each(Object.values(validSourceOfComponents))(
          'components can be an empty array when sourceOfComponents is %s',
          (componentSource) => {
            const result = validateHazardous({
              containsHazardous: true,
              sourceOfComponents: componentSource,
              components: []
            })
            expect(result.error).toBeUndefined()
          }
        )

        it.each(Object.values(sourceOfComponentsProvided))(
          'when sourceOfComponents is %s then components can be provided with name missing',
          (componentSource) => {
            const result = validateHazardous({
              containsHazardous: true,
              sourceOfComponents: componentSource,
              components: [{ name: undefined, concentration: 30 }]
            })
            expect(result.error).toBeUndefined()
          }
        )

        it.each(Object.values(sourceOfComponentsProvided))(
          'when sourceOfComponents is %s then components can be provided with concentration missing',
          (componentSource) => {
            const result = validateHazardous({
              containsHazardous: true,
              sourceOfComponents: componentSource,
              components: [{ name: 'Mercury', concentration: undefined }]
            })
            expect(result.error).toBeUndefined()
          }
        )

        it.each(Object.values(sourceOfComponentsProvided))(
          'when sourceOfComponents is %s then components can be provided with name and concentration missing',
          (componentSource) => {
            const result = validateHazardous({
              containsHazardous: true,
              sourceOfComponents: componentSource,
              components: [{ name: undefined, concentration: undefined }]
            })
            expect(result.error).toBeUndefined()
          }
        )
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
            description: 'invalid hazCodes types (string)',
            input: {
              containsHazardous: true,
              sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
              hazCodes: ['HP 1', 'HP2']
            },
            errorMessage: `"wasteItems[0].hazardous.hazCodes[0]" must be one of [${validHazCodes.join(', ')}]`
          },
          {
            description: 'invalid hazCodes types (undefined)',
            input: {
              containsHazardous: true,
              sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
              hazCodes: [undefined]
            },
            errorMessage: '"HazardCodes" must not be a sparse array item'
          },
          {
            description: 'invalid hazCodes types (null)',
            input: {
              containsHazardous: true,
              sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
              hazCodes: [null]
            },
            errorMessage: `"wasteItems[0].hazardous.hazCodes[0]" must be one of [${validHazCodes.join(', ')}]`
          },
          {
            description: 'invalid source of components (string)',
            input: { containsHazardous: true, sourceOfComponents: 'INVALID' },
            errorMessage: `"wasteItems[0].hazardous.sourceOfComponents" must be one of [${Object.values(validSourceOfComponents).join(', ')}]`
          },
          {
            description: 'invalid source of components (undefined)',
            input: { containsHazardous: true, sourceOfComponents: undefined },
            errorMessage:
              'Chemical or Biological component name and Source of Components must be specified when hazardous properties are present'
          },
          {
            description: 'invalid source of components (null)',
            input: { containsHazardous: true, sourceOfComponents: null },
            errorMessage: `"wasteItems[0].hazardous.sourceOfComponents" must be one of [${Object.values(validSourceOfComponents).join(', ')}]`
          },
          {
            description:
              'when source of components is NOT_PROVIDED then components cannot be provided',
            input: {
              containsHazardous: true,
              sourceOfComponents: sourceOfComponentsNotProvided.NOT_PROVIDED,
              components: [{ name: 'Mercury', concentration: 30 }]
            },
            errorMessage: `"wasteItems[0].hazardous.components" must either be an empty array or not provided if sourceOfComponents is ${sourceOfComponentsNotProvided.NOT_PROVIDED}`
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

      it.each(Object.values(sourceOfComponentsProvided))(
        'components cannot be undefined when sourceOfComponents is %s',
        (componentSource) => {
          const result = validateHazardous({
            containsHazardous: true,
            sourceOfComponents: componentSource,
            components: undefined
          })
          expect(result.error).toBeDefined()
          expect(result.error.message).toContain(
            `Components is required when Source of Components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`
          )
        }
      )

      it.each(Object.values(validSourceOfComponents))(
        'components cannot be null when sourceOfComponents is %s',
        (componentSource) => {
          const result = validateHazardous({
            containsHazardous: true,
            sourceOfComponents: componentSource,
            components: null
          })
          expect(result.error).toBeDefined()
          expect(result.error.message).toContain(
            '"wasteItems[0].hazardous.components" must be an array'
          )
        }
      )
    })

    // Test scenarios from user story
    describe('HP Code Validation Scenarios', () => {
      it('should accept valid HP codes with or without components', () => {
        // Single HP code with components
        const result1 = validateHazardous({
          containsHazardous: true,
          sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
          hazCodes: ['HP_15'],
          components: [{ name: 'Mercury', concentration: 10 }]
        })
        expect(result1.error).toBeUndefined()

        // Multiple HP codes without components
        const result2 = validateHazardous({
          containsHazardous: true,
          sourceOfComponents: sourceOfComponentsNotProvided.NOT_PROVIDED,
          hazCodes: ['HP_1', 'HP_3']
        })
        expect(result2.error).toBeUndefined()

        // Multiple HP codes with components
        const result3 = validateHazardous({
          containsHazardous: true,
          sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
          hazCodes: ['HP_5', 'HP_10', 'HP_12'],
          components: [{ name: 'Lead compounds', concentration: 15 }]
        })
        expect(result3.error).toBeUndefined()
      })

      it('should accept empty hazCodes array when containsHazardous is true with valid components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
          hazCodes: [],
          components: [{ name: 'Mercury', concentration: 'Not Supplied' }]
        })
        expect(result.error).toBeUndefined()
      })

      it('should accept hazardous indicator without components or hazCodes', () => {
        const result = validateHazardous({
          containsHazardous: true,
          sourceOfComponents: sourceOfComponentsNotProvided.NOT_PROVIDED
        })
        expect(result.error).toBeUndefined()
      })

      it.each(validHazCodes)(
        'should accept all valid HP codes with components',
        (hazCode) => {
          const result = validateHazardous({
            containsHazardous: true,
            sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
            hazCodes: [hazCode],
            components: [{ name: 'Mercury', concentration: 30 }]
          })
          expect(result.error).toBeUndefined()
        }
      )

      it('should accept duplicate HP codes and deduplicate them with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
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
          sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
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
          sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
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
          sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
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
          sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
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
    const validateHazardousWithComponents = (
      containsHazardous,
      components,
      sourceOfComponents = sourceOfComponentsProvided.CARRIER_PROVIDED
    ) => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          hazardous: {
            containsHazardous,
            sourceOfComponents,
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

      it('should reject numeric string concentration values', () => {
        const result = validateHazardousWithComponents(true, [
          {
            name: 'Mercury',
            concentration: '30'
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological concentration must be a valid number or "Not Supplied"'
        )
      })

      it('should accept component when concentration is provided and name is missing', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            hazardous: {
              containsHazardous: true,
              sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
              components: [
                {
                  name: undefined,
                  concentration: 30
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      it('should accept component when name is provided and concentration is missing', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            hazardous: {
              containsHazardous: true,
              sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
              components: [
                {
                  name: 'Mercury',
                  concentration: undefined
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      it('should accept component when name and concentration are missing', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            hazardous: {
              containsHazardous: true,
              sourceOfComponents: validSourceOfComponents.CARRIER_PROVIDED,
              components: [
                {
                  name: undefined,
                  concentration: undefined
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })
    })

    describe('When waste does not contain hazardous properties', () => {
      it('should accept submission without chemical/bio concentration', () => {
        const result = validateHazardousWithComponents(
          false,
          undefined,
          sourceOfComponentsNotProvided.NOT_PROVIDED
        )
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
    const validateComponentName = (
      containsHazardous,
      components,
      sourceOfComponents = sourceOfComponentsNotProvided.NOT_PROVIDED
    ) => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          hazardous: {
            containsHazardous,
            sourceOfComponents,
            ...(components && { components })
          }
        }
      })
      return receiveMovementRequestSchema.validate(payload)
    }

    it('should accept valid hazardous substance names when hazardous properties are present', () => {
      const result = validateComponentName(
        true,
        [
          {
            name: 'Mercury',
            concentration: 50
          }
        ],
        sourceOfComponentsProvided.CARRIER_PROVIDED
      )
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
      const result = validateComponentName(
        false,
        [
          {
            name: 'Mercury',
            concentration: 25
          }
        ],
        sourceOfComponentsProvided.CARRIER_PROVIDED
      )
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        'Chemical or Biological components cannot be provided when no hazardous properties are indicated'
      )
    })
  })
})
