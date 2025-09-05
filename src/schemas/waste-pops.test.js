import { receiveMovementRequestSchema } from './receipt.js'
import { createTestPayload } from './test-helpers/waste-test-helpers.js'
import { isValidPopName } from '../common/constants/pop-names.js'

describe('Receipt Schema Validation - POPs', () => {
  describe('POPs Indicator Validation', () => {
    it('should accept valid POPs indicator (true)', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { pops: { containsPops: true } }
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

      it('should accept POPs without components when containsPops is true', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      })

      it('should require concentration when POP component is provided', () => {
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
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain('POP concentration is required')
      })

      it('should require name when POP component is provided', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              components: [
                {
                  concentration: 100
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain('POP name is required')
      })

      it('should reject null POP name when containsPops is true', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
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

      it('should reject undefined POP name when containsPops is true', () => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              components: [
                {
                  name: undefined,
                  concentration: 100
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toContain('POP name is required')
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
