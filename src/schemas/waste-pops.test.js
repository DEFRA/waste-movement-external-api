import { receiveMovementRequestSchema } from './receipt.js'
import { createTestPayload } from './test-helpers/waste-test-helpers.js'
import { isValidPopName, validPopNames } from '../common/constants/pop-names.js'
import { popsAndHazardousComponentsErrorTests } from '../test/common/pop-and-hazardous-components/pops-and-hazardous-components-error-tests.js'

describe('Receipt Schema Validation - POPs', () => {
  describe('POPs Indicator Validation', () => {
    it('should accept valid POPs indicator (true)', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          pops: {
            containsPops: true,
            sourceOfComponents: 'CARRIER_PROVIDED',
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
      expect(result.error.message).toBe(
        '"wasteItems[0].pops.containsPops" is required'
      )
    })
  })

  popsAndHazardousComponentsErrorTests('POPs')

  it('should reject POP name with an invalid value', () => {
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
    expect(result.error.message).toBe(
      `"wasteItems[0].pops.components[0].name" contains an invalid value`
    )
  })

  it.each(validPopNames)('should accept valid POP name: "%s"', (popName) => {
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
  })

  describe('isValidPopName function unit tests', () => {
    describe('returns true for valid POP names', () => {
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
