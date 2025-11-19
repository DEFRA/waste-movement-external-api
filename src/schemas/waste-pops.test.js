import { receiveMovementRequestSchema } from './receipt.js'
import { createTestPayload } from './test-helpers/waste-test-helpers.js'
import { isValidPopCode, validPopNames } from '../common/constants/pop-names.js'
import { popsAndHazardousComponentsErrorTests } from '../test/common/pop-and-hazardous-components/pops-and-hazardous-components-error-tests.js'

describe('Receipt Schema Validation - POPs', () => {
  describe('POPs Indicator Validation', () => {
    it('should accept valid POPs indicator (true)', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          containsPops: true,
          pops: {
            sourceOfComponents: 'PROVIDED_WITH_WASTE',
            components: [
              {
                code: 'ALD',
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
        wasteItemOverrides: { containsPops: false }
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
        wasteItemOverrides: { containsPops: undefined, pops: {} } // Empty pops object without containsPops
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        '"wasteItems[0].containsPops" is required'
      )
    })
  })

  popsAndHazardousComponentsErrorTests('POPs')

  it('should reject POP code with an invalid value', () => {
    const payload = createTestPayload({
      wasteItemOverrides: {
        containsPops: true,
        pops: {
          sourceOfComponents: 'PROVIDED_WITH_WASTE',
          components: [
            {
              code: 'ABC',
              concentration: 100
            }
          ]
        }
      }
    })
    const result = receiveMovementRequestSchema.validate(payload)
    expect(result.error).toBeDefined()
    expect(result.error.message).toBe(
      `"wasteItems[0].pops.components[0].code" contains an invalid POP code`
    )
  })

  it.each(validPopNames.map((pop) => pop.code))(
    'should accept valid POP code: "%s"',
    (popCode) => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          containsPops: true,
          pops: {
            sourceOfComponents: 'PROVIDED_WITH_WASTE',
            components: [
              {
                code: popCode,
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

  describe('isValidPopCode function unit tests', () => {
    describe('returns true for valid POP codes', () => {
      it.each(validPopNames.map((pop) => pop.code))(
        'should return true for: "%s"',
        (popCode) => {
          expect(isValidPopCode(popCode)).toBe(true)
        }
      )
    })

    describe('returns false for invalid inputs', () => {
      const invalidInputs = [
        [null, 'null'],
        [undefined, 'undefined'],
        ['ABC', 'invalid code'],
        ['WXYZ', 'invalid code'],
        ['PQRSTUVW', 'invalid code'],
        [123, 'number'],
        [true, 'boolean'],
        [{}, 'object'],
        [[], 'array'],
        ['end', 'wrong case']
      ]

      it.each(invalidInputs)('should return false for %s (%s)', (input) => {
        expect(isValidPopCode(input)).toBe(false)
      })
    })
  })
})
