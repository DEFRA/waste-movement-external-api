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
      'Carrier did not provide detail', // Special case
      '', // Empty string case
      'Endosulfan', // Regular POP name
      'PFOS', // Acronym case
      'Tetra-, penta-, hexa-, hepta- and deca- bromodiphenyl ether', // Complex name
      null
    ]

    describe('When waste contains POPs', () => {
      it.each(samplePopNames)(
        'should accept valid POP name: "%s"',
        (popName) => {
          const payload = createTestPayload({
            wasteItemOverrides: {
              pops: {
                containsPops: true,
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

      it('should reject invalid POP name', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
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
    })
  })

  describe('isValidPopName function unit tests', () => {
    describe('returns true for valid POP names', () => {
      // Reuse the samplePopNames array from above to test valid cases
      const validPopNames = [
        'Carrier did not provide detail',
        '',
        'Endosulfan',
        'PFOS',
        'PCB',
        'DDT'
      ]

      it.each(validPopNames)('should return true for: "%s"', (popName) => {
        expect(isValidPopName(popName)).toBe(true)
      })
    })

    describe('returns false for invalid inputs', () => {
      const invalidInputs = [
        [null, 'null'],
        [undefined, 'undefined'],
        ['Invalid POP Name', 'invalid string'],
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
