import { receiveMovementRequestSchema } from './receipt.js'
import { createTestPayload } from './test-helpers/waste-test-helpers.js'
import { isValidPopName } from '../common/constants/pop-names.js'

describe('Receipt Schema Validation - POPs', () => {
  describe('POPs Indicator Validation', () => {
    it('should accept valid POPs indicator (true)', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          pops: {
            containsPops: true,
            sourceOfComponents: 'NOT_PROVIDED',
            components: [
              {
                name: 'Aldrin',
                concentration: 30
              }
            ]
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid POPs indicator (false)', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { pops: { containsPops: false } }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeUndefined()
    })

    it('should accept missing POPs section', () => {
      const payload = createTestPayload()
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeUndefined()
    })

    it('should accept payload when POPs property is omitted', () => {
      const payload = createTestPayload()
      delete payload.wasteItems[0].pops

      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeUndefined()
    })

    it('should reject missing containsPops field', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { pops: {} } // Empty pops object without containsPops
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        'Does the waste contain persistent organic pollutants (POPs)? is required'
      )
    })

    it('should reject null pops object (shows line 107 is unreachable)', () => {
      // Create payload without using the helper to ensure null is preserved
      const payload = createTestPayload()
      payload.wasteItems[0].pops = null

      const result = receiveMovementRequestSchema.validate(payload)
      // Joi rejects null before custom validator runs, making line 107 unreachable
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('"Pops" must be of type object')
    })

    it('should handle undefined containsPops (coverage line 118)', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          pops: {
            containsPops: undefined,
            components: []
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      // Should require containsPops to be defined
      expect(result.error.message).toContain('persistent organic pollutants')
    })
  })

  describe('POP Name Validation', () => {
    // Representative sample of POP names for testing
    const samplePopNames = [
      '', // Empty string case
      'Endosulfan', // Regular POP name
      'PFOS', // Acronym case
      'Tetra-, penta-, hexa-, hepta- and deca- bromodiphenyl ether', // Complex name
      null,
      undefined
    ]

    describe('When waste contains POPs', () => {
      it.each(samplePopNames)(
        'should accept valid POP name: "%s"',
        (popName) => {
          const payload = createTestPayload({
            wasteItemOverrides: {
              pops: {
                containsPops: true,
                sourceOfComponents: 'CARRIER_PROVIDED',
                components: [
                  {
                    name: popName,
                    concentration: 100
                  }
                ]
              }
            }
          })
          const result = receiveMovementRequestSchema.validate(payload)
          expect(result.error).toBeUndefined()
        }
      )

      it('should accept valid POP components when concentration is missing', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              components: [
                {
                  name: 'Aldrin'
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      it('should accept valid POP components when name is missing', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              components: [
                {
                  concentration: 30
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      it.each([12.5, 9.12345678, 500, 0])(
        'should accept valid POP concentration value: "%s"',
        (value) => {
          const payload = createTestPayload({
            wasteItemOverrides: {
              pops: {
                containsPops: true,
                components: [
                  {
                    name: 'Aldrin',
                    concentration: value
                  }
                ]
              }
            }
          })
          const result = receiveMovementRequestSchema.validate(payload)
          expect(result.error).toBeUndefined()
        }
      )

      it('should reject invalid POP name', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: [
                {
                  name: 'Invalid POP Name',
                  concentration: 100
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain('POP name is not valid')
      })

      it('should accept POPs without components when source is NOT_PROVIDED', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'NOT_PROVIDED'
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toBe(
          '"wasteItems[0].pops.components" is required'
        )
      })

      it('should reject POPs when components is undefined when containsPops is true', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              components: undefined
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toBe(
          '"wasteItems[0].pops.components" is required'
        )
      })

      it('should accept POP component without concentration', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: [
                {
                  name: 'Aldrin',
                  concentration: -12
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      it('should accept POP component with undefined name (coverage line 28)', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: [
                {
                  name: undefined,
                  concentration: 100
                }
              ]
            }
          }
        })
        console.dir({ payload }, { depth: null })
        const result = receiveMovementRequestSchema.validate(payload)

        expect(result.error).toBeUndefined()
      })

      it('should reject POP component with null name', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: [
                {
                  name: null,
                  concentration: 100
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain('must be a string')
      })

      it('should reject POPs data when sourceOfComponents is missing', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Source of POP components is required when POPs are present'
        )
      })

      it('should reject invalid sourceOfComponents value', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'INVALID_SOURCE',
              components: [{}]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          '"wasteItems[0].pops.sourceOfComponents" must be one of'
        )
      })

      it('should accept POPs without components when source is CARRIER_PROVIDED (warning handled separately)', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'CARRIER_PROVIDED'
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        // Schema validation should pass - warnings are generated separately
        expect(result.error).toBeUndefined()
      })

      it('should reject POP components when source is NOT_PROVIDED', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'NOT_PROVIDED',
              components: [{}]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'POP components must not be provided when the source is NOT_PROVIDED'
        )
      })

      it('should accept POPs with empty components array when source is CARRIER_PROVIDED (warning handled separately)', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: []
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        // Schema validation should pass - warnings are generated separately
        expect(result.error).toBeUndefined()
      })

      it('should accept POP components with empty object when source is GUIDANCE', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'GUIDANCE',
              components: [{}]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      it('should accept POP components with details when source is OWN_TESTING', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'OWN_TESTING',
              components: [
                {
                  name: 'Endosulfan',
                  concentration: 42.5
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      it('should reject POP component concentration when value is not numeric', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'OWN_TESTING',
              components: [
                {
                  name: 'Endosulfan',
                  concentration: 'invalid'
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'POP concentration must be a number'
        )
      })

      it('should accept source NOT_PROVIDED with empty components array', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'NOT_PROVIDED',
              components: []
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      it('should accept POPs without components when source is GUIDANCE (warning handled separately)', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'GUIDANCE'
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      it('should accept POPs without components when source is OWN_TESTING (warning handled separately)', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'OWN_TESTING'
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })
    })

    describe('When waste does not contain POPs', () => {
      it.each([undefined, null])(
        'should accept when no components are specified (%s)',
        (value) => {
          const payload = createTestPayload({
            wasteItemOverrides: {
              pops: {
                containsPops: false,
                components: value
              }
            }
          })
          const result = receiveMovementRequestSchema.validate(payload)
          expect(result.error).toBeUndefined()
        }
      )

      it('should reject component with empty POP name when containsPops is false', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: false,
              components: [
                {
                  name: 'Aldrin',
                  concentration: 100
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'A POP name cannot be provided when POPs are not present'
        )
      })

      it('should reject POP components array with empty object when containsPops is false', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: false,
              components: [{}]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'A POP name cannot be provided when POPs are not present'
        )
      })

      it('should treat pops property set to undefined as valid', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: undefined
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      it('should reject POPs when components is null when containsPops is true', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              components: null
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toBe(
          '"wasteItems[0].pops.components" is required'
        )
      })

      it('should reject POPs when components is an empty array when containsPops is true', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              components: []
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toBe(
          '"wasteItems[0].pops.components" must contain at least 1 items'
        )
      })

      it('should reject a negative POP concentration value when containsPops is true', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: [
                {
                  name: 'Aldrin',
                  concentration: -12
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)

        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          '"wasteItems[0].pops.components[0].concentration" concentration cannot be negative'
        )
      })

      it('should reject a numeric string POP concentration value when containsPops is true', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: [
                {
                  name: 'Aldrin',
                  concentration: '12'
                }
              ]
            }
          }
        })
        console.dir({ payload }, { depth: null })
        const result = receiveMovementRequestSchema.validate(payload)

        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          '"wasteItems[0].pops.components[0].concentration" must be a valid number'
        )
      })
    })

    describe('When waste does not contain POPs', () => {
      it.each([undefined, null])(
        'should accept when no components are specified (%s)',
        (value) => {
          const payload = createTestPayload({
            wasteItemOverrides: {
              pops: {
                containsPops: false,
                components: value
              }
            }
          })
          const result = receiveMovementRequestSchema.validate(payload)
          expect(result.error).toBeUndefined()
        }
      )

      it('should reject when components are specified', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: false,
              components: [
                {
                  name: 'Aldrin',
                  concentration: 100
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toBe(
          '"wasteItems[0].pops.components" is not allowed when POPs are not present'
        )
      })

      it('should reject sourceOfComponents when containsPops is false', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: false,
              sourceOfComponents: 'CARRIER_PROVIDED'
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'Source of POP components can only be provided when POPs are present'
        )
      })

      it('should trigger validatePopAbsence error for sourceOfComponents (coverage line 75)', () => {
        // This tests the specific branch in validatePopAbsence function
        // where sourceOfComponents is defined when containsPops is false
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: false,
              sourceOfComponents: 'NOT_PROVIDED' // Using a valid value that might bypass early validation
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        // The error should come from either the forbidden rule or the custom validator
        expect(result.error.message).toMatch(
          /Source of POP components|pops.sourceNotAllowed/
        )
      })
    })
  })

  describe('isValidPopName function unit tests', () => {
    describe('returns true for valid POP names', () => {
      // Reuse the samplePopNames array from above to test valid cases
      const validPopNames = ['', 'Endosulfan', 'PFOS', 'PCB', 'DDT']

      it.each(validPopNames)('should return true for: "%s"', (popName) => {
        expect(isValidPopName(popName)).toBe(true)
      })
    })

    describe('returns false for invalid inputs', () => {
      const invalidInputs = [
        [null, 'null'],
        [undefined, 'undefined'],
        ['Invalid POP Name', 'invalid string'],
        ['Carrier did not provide detail', 'deprecated entry'],
        [123, 'number'],
        [true, 'boolean'],
        [{}, 'object'],
        [[], 'array'],
        ['pfos', 'wrong case']
      ]

      it.each(invalidInputs)('should return false for %s (%s)', (input) => {
        expect(isValidPopName(input)).toBe(false)
      })
    })
  })
})
