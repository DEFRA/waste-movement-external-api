import { receiveMovementRequestSchema } from './receipt.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'

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
            physicalForm: 'Solid',
            pops: containsPops !== undefined ? { containsPops } : undefined,
            weight: {
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
            physicalForm: 'Solid',
            pops: {}, // Empty pops object without containsPops
            weight: {
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
            physicalForm: 'Solid',
            hazardous,
            weight: {
              metric: 'Tonnes',
              amount: 1,
              isEstimate: false
            }
          }
        ]
      }

      return receiveMovementRequestSchema.validate(payload)
    }

    describe('Hazardous validation scenarios', () => {
      const testCases = [
        {
          description:
            'should reject valid hazardous indicator (true) without components',
          input: { containsHazardous: true },
          expectError: true,
          errorMessage:
            'Chemical or Biological component name must be specified when hazardous properties are present'
        },
        {
          description: 'should accept valid hazardous indicator (false)',
          input: { containsHazardous: false },
          expectError: false
        },
        {
          description:
            'should reject hazardous with only hazCodes array (no components)',
          input: { containsHazardous: true, hazCodes: [1, 2, 3] },
          expectError: true,
          errorMessage:
            'Chemical or Biological component name must be specified when hazardous properties are present'
        },
        {
          description: 'should accept hazardous with components array',
          input: {
            containsHazardous: true,
            components: [
              { name: 'Mercury', concentration: 30 },
              { name: 'Lead', concentration: 15 }
            ]
          },
          expectError: false
        },
        {
          description:
            'should accept hazardous with both hazCodes and components',
          input: {
            containsHazardous: true,
            hazCodes: [1, 2],
            components: [{ name: 'Mercury', concentration: 30 }]
          },
          expectError: false
        },
        {
          description: 'should accept missing hazardous section',
          input: undefined,
          expectError: false
        },
        {
          description:
            'should reject missing containsHazardous field when hazardous object exists',
          input: { hazCodes: [1, 2, 3] },
          expectError: true,
          errorMessage:
            'Hazardous waste is any waste that is potentially harmful to human health or the environment.'
        },
        {
          description: 'should reject invalid hazCodes types',
          input: { containsHazardous: true, hazCodes: ['not', 'numbers'] },
          expectError: true,
          errorMessage: 'must be a number'
        }
      ]

      it.each(testCases)(
        '$description',
        ({ input, expectError, errorMessage }) => {
          const result = validateHazardous(input)

          if (expectError) {
            expect(result.error).toBeDefined()
            expect(result.error.message).toContain(errorMessage)
          } else {
            expect(result.error).toBeUndefined()
          }
        }
      )
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

      it('should accept empty hazCodes array when containsHazardous is true with components', () => {
        const result = validateHazardous({
          containsHazardous: true,
          hazCodes: [],
          components: [{ name: 'Not Supplied', concentration: 'Not Supplied' }]
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

  describe('EWC Code Validation', () => {
    // Helper function to validate a payload with a specific EWC code
    const validateEwcCode = (ewcCodeArray) => {
      const payload = {
        receivingSiteId: 'site123',
        wasteItems: [
          {
            ewcCodes: ewcCodeArray,
            wasteDescription: 'Test waste',
            physicalForm: 'Solid',
            pops: {
              containsPops: false
            },
            weight: {
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
            physicalForm: 'Solid',
            weight: {
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
        wasteItems: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            physicalForm: 'Solid',
            hazardous: {
              containsHazardous,
              ...(components && { components })
            },
            weight: {
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

  describe('Physical Form Validation', () => {
    it('should accept valid physical form', () => {
      const payload = createMovementRequest({
        wasteItems: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            physicalForm: 'Solid',
            weight: {
              metric: 'Tonnes',
              amount: 1,
              isEstimate: false
            }
          }
        ]
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid physical form', () => {
      const payload = createMovementRequest({
        wasteItems: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            physicalForm: 'Invalid',
            weight: {
              metric: 'Tonnes',
              amount: 1,
              isEstimate: false
            }
          }
        ]
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"wasteItems[0].physicalForm" must be one of [Gas, Liquid, Solid, Powder, Sludge, Mixed]'
      )
    })

    it('should reject empty physical form', () => {
      const payload = createMovementRequest({
        wasteItems: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            // physicalForm missing,
            weight: {
              metric: 'Tonnes',
              amount: 1,
              isEstimate: false
            }
          }
        ]
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"wasteItems[0].physicalForm" is required'
      )
    })
  })

  describe('Chemical or Biological Component Name Validation', () => {
    // Helper function to validate hazardous waste with component names
    const validateComponentName = (containsHazardous, components) => {
      const payload = {
        receivingSiteId: 'site123',
        wasteItems: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            physicalForm: 'Solid',
            hazardous: {
              containsHazardous,
              ...(components && { components })
            },
            weight: {
              metric: 'Tonnes',
              amount: 1,
              isEstimate: false
            }
          }
        ]
      }

      return receiveMovementRequestSchema.validate(payload)
    }

    describe('Scenario: Successfully Specifying a Chemical or Biological Component Name', () => {
      it('should accept valid hazardous substance names when hazardous properties are present', () => {
        const hazardousSubstances = [
          'Arsenic compounds',
          'Cyanides',
          'Mercury',
          'Lead compounds',
          'Chromium VI compounds',
          'Cadmium compounds',
          'PCBs (Polychlorinated biphenyls)',
          'Asbestos'
        ]

        hazardousSubstances.forEach((substance) => {
          const result = validateComponentName(true, [
            {
              name: substance,
              concentration: 50
            }
          ])
          expect(result.error).toBeUndefined()
        })
      })

      it('should accept "Not Supplied" as component name when hazardous properties are present', () => {
        const result = validateComponentName(true, [
          {
            name: 'Not Supplied',
            concentration: 30
          }
        ])
        expect(result.error).toBeUndefined()
      })

      it('should REQUIRE components when hazardous properties are present - reject empty array', () => {
        const result = validateComponentName(true, [])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological component name must be specified when hazardous properties are present'
        )
      })

      it('should REQUIRE components when hazardous properties are present - reject missing field', () => {
        const result = validateComponentName(true)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological component name must be specified when hazardous properties are present'
        )
      })

      it('should accept multiple component names when hazardous properties are present', () => {
        const result = validateComponentName(true, [
          {
            name: 'Arsenic compounds',
            concentration: 25
          },
          {
            name: 'Not Supplied',
            concentration: 'Not Supplied'
          },
          {
            name: 'Mercury',
            concentration: 10
          }
        ])
        expect(result.error).toBeUndefined()
      })
    })

    describe('Scenario: Chemical or Biological Component Name Not Required When No Hazardous Properties', () => {
      it('should accept submission without component name when no hazardous properties', () => {
        const result = validateComponentName(false)
        expect(result.error).toBeUndefined()
      })

      it('should accept submission with empty components array when no hazardous properties', () => {
        const result = validateComponentName(false, [])
        expect(result.error).toBeUndefined()
      })
    })

    describe('Scenario: Providing Chemical or Biological Component Name When Not Required', () => {
      it('should reject when any component name is provided and no hazardous properties', () => {
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

      it('should reject when "Not Supplied" is provided as component name and no hazardous properties', () => {
        const result = validateComponentName(false, [
          {
            name: 'Not Supplied',
            concentration: 'Not Supplied'
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological components cannot be provided when no hazardous properties are indicated'
        )
      })

      it('should reject multiple component names when no hazardous properties', () => {
        const result = validateComponentName(false, [
          {
            name: 'Arsenic compounds',
            concentration: 10
          },
          {
            name: 'Mercury',
            concentration: 20
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological components cannot be provided when no hazardous properties are indicated'
        )
      })

      it('should reject any arbitrary text as component name when no hazardous properties', () => {
        const result = validateComponentName(false, [
          {
            name: 'Random text',
            concentration: 100
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological components cannot be provided when no hazardous properties are indicated'
        )
      })
    })

    describe('Edge cases and validation rules', () => {
      it('should require component name when concentration is provided', () => {
        const result = validateComponentName(true, [
          {
            concentration: 50
            // name is missing
          }
        ])
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Chemical or Biological Component name is required'
        )
      })

      it('should require concentration when component name is provided', () => {
        const result = validateComponentName(true, [
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

      it('should accept component with both name and concentration as "Not Supplied"', () => {
        const result = validateComponentName(true, [
          {
            name: 'Not Supplied',
            concentration: 'Not Supplied'
          }
        ])
        expect(result.error).toBeUndefined()
      })

      it('should handle mixed valid and "Not Supplied" component names', () => {
        const result = validateComponentName(true, [
          {
            name: 'Arsenic compounds',
            concentration: 15
          },
          {
            name: 'Not Supplied',
            concentration: 'Not Supplied'
          },
          {
            name: 'Cyanides',
            concentration: 25
          }
        ])
        expect(result.error).toBeUndefined()
      })
    })

    describe('Required Components When Hazardous Properties Present', () => {
      it('should require at least one component when containsHazardous is true', () => {
        const payload = {
          receivingSiteId: 'site123',
          wasteItems: [
            {
              ewcCodes: ['010101'],
              wasteDescription: 'Hazardous waste',
              physicalForm: 'Solid',
              hazardous: {
                containsHazardous: true
                // No components provided - should be invalid
              },
              weight: {
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
          'Chemical or Biological component name must be specified when hazardous properties are present'
        )
      })

      it('should require components even when hazCodes are provided', () => {
        const payload = {
          receivingSiteId: 'site123',
          wasteItems: [
            {
              ewcCodes: ['010101'],
              wasteDescription: 'Hazardous waste',
              physicalForm: 'Solid',
              hazardous: {
                containsHazardous: true,
                hazCodes: [1, 2, 3]
                // No components provided - should still be invalid
              },
              weight: {
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
          'Chemical or Biological component name must be specified when hazardous properties are present'
        )
      })

      it('should accept when both hazCodes and components are provided', () => {
        const payload = {
          receivingSiteId: 'site123',
          wasteItems: [
            {
              ewcCodes: ['010101'],
              wasteDescription: 'Hazardous waste',
              physicalForm: 'Solid',
              hazardous: {
                containsHazardous: true,
                hazCodes: [1, 2],
                components: [
                  {
                    name: 'Mercury',
                    concentration: 25
                  }
                ]
              },
              weight: {
                metric: 'Tonnes',
                amount: 1,
                isEstimate: false
              }
            }
          ]
        }

        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      it('should accept minimal valid component (Not Supplied values)', () => {
        const payload = {
          receivingSiteId: 'site123',
          wasteItems: [
            {
              ewcCodes: ['010101'],
              wasteDescription: 'Hazardous waste',
              physicalForm: 'Solid',
              hazardous: {
                containsHazardous: true,
                components: [
                  {
                    name: 'Not Supplied',
                    concentration: 'Not Supplied'
                  }
                ]
              },
              weight: {
                metric: 'Tonnes',
                amount: 1,
                isEstimate: false
              }
            }
          ]
        }

        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })
    })
  })
})
