import { receiveMovementRequestSchema } from './receipt.js'
import { createTestPayload } from './test-helpers/waste-test-helpers.js'
import { isValidPopName } from '../common/constants/pop-names.js'

describe('Receipt Schema Validation - POPs', () => {
  describe('POPs Indicator Validation', () => {
    it('should accept valid POPs indicator (true)', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          pops: { containsPops: true, sourceOfComponents: 'NOT_PROVIDED' }
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
  })

  describe('POP Name Validation', () => {
    // Representative sample of POP names for testing
    const samplePopNames = [
      '', // Empty string case
      'Endosulfan', // Regular POP name
      'PFOS', // Acronym case
      'Tetra-, penta-, hexa-, hepta- and deca- bromodiphenyl ether' // Complex name
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
        expect(result.error).toBeUndefined()
      })

      it('should accept POP component without concentration', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'CARRIER_PROVIDED',
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

      it('should accept POP component without name', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: [
                {
                  concentration: 100
                }
              ]
            }
          }
        })
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

      it('should require POP components when source is CARRIER_PROVIDED', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'CARRIER_PROVIDED'
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain(
          'At least one POP component must be provided when a source is specified'
        )
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
    })

    describe('When waste does not contain POPs', () => {
      it('should accept when no POP name is specified', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: false
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      const nonEmptySampleNames = samplePopNames.filter((name) => name !== '')

      it.each(nonEmptySampleNames)(
        'should reject non-empty POP name "%s" when containsPops is false',
        (popName) => {
          const payload = createTestPayload({
            wasteItemOverrides: {
              pops: {
                containsPops: false,
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
          expect(result.error).toBeDefined()
          expect(result.error.message).toContain(
            'A POP name cannot be provided when POPs are not present'
          )
        }
      )

      it('should accept empty POP name when containsPops is false', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: false,
              components: [
                {
                  name: '',
                  concentration: 0
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
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

      it.each(invalidInputs)(
        'should return false for %s (%s)',
        (input, description) => {
          expect(isValidPopName(input)).toBe(false)
        }
      )
    })
  })
})
