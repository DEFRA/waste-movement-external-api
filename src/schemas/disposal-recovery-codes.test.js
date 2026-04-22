import { receiveMovementRequestSchema } from './receipt.js'
import { DISPOSAL_OR_RECOVERY_CODES } from '../common/constants/treatment-codes.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'

describe('Create Receipt Movement - Disposal/Recovery Code Validation', () => {
  function createPayload(disposalOrRecoveryCodes) {
    const baseRequest = createMovementRequest()

    // If disposalOrRecoveryCodes provided, add them to the first wasteItem
    if (disposalOrRecoveryCodes) {
      return {
        ...baseRequest,
        wasteItems: [
          {
            ...baseRequest.wasteItems[0],
            disposalOrRecoveryCodes:
              disposalOrRecoveryCodes.disposalOrRecoveryCodes
          }
        ]
      }
    }

    return baseRequest
  }

  describe('Schema Validation Tests', () => {
    describe('Valid Disposal/Recovery Codes', () => {
      DISPOSAL_OR_RECOVERY_CODES.forEach((code) => {
        it(`should accept valid code: ${code}`, () => {
          const validPayload = createPayload({
            disposalOrRecoveryCodes: [
              {
                code,
                weight: {
                  metric: 'Tonnes',
                  amount: 0.1,
                  isEstimate: false
                }
              }
            ]
          })

          const { error } = receiveMovementRequestSchema.validate(validPayload)
          expect(error).toBeUndefined()
        })
      })

      it('should accept multiple valid codes', () => {
        const validPayload = createPayload({
          disposalOrRecoveryCodes: [
            {
              code: 'R1',
              weight: {
                metric: 'Tonnes',
                amount: 0.1,
                isEstimate: false
              }
            },
            {
              code: 'D10',
              weight: {
                metric: 'Tonnes',
                amount: 0.0505,
                isEstimate: false
              }
            },
            {
              code: 'R3',
              weight: {
                metric: 'Tonnes',
                amount: 0.02,
                isEstimate: false
              }
            }
          ]
        })

        const { error } = receiveMovementRequestSchema.validate(validPayload)
        expect(error).toBeUndefined()
      })
    })

    describe('Invalid Disposal/Recovery Codes', () => {
      const invalidCodes = ['X99', 'R99', 'D99', 'ABC', '123', 'R0', 'D0']

      invalidCodes.forEach((code) => {
        it(`should reject invalid code: ${code}`, () => {
          const invalidPayload = createPayload({
            disposalOrRecoveryCodes: [
              {
                code,
                weight: {
                  metric: 'Tonnes',
                  amount: 0.1,
                  isEstimate: false
                }
              }
            ]
          })

          const { error } =
            receiveMovementRequestSchema.validate(invalidPayload)
          expect(error).toBeDefined()
          expect(error.details[0].message).toContain('must be one of')
        })
      })
    })

    describe('Missing Quantity', () => {
      it('should reject code without quantity', () => {
        const invalidPayload = createPayload({
          disposalOrRecoveryCodes: [
            {
              code: 'R1'
              // No quantity specified
            }
          ]
        })

        const { error } = receiveMovementRequestSchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].message).toContain(
          '"wasteItems[0].disposalOrRecoveryCodes[0].weight" is required'
        )
      })
    })

    describe('Incomplete Quantity', () => {
      it('should reject quantity without required fields', () => {
        const invalidPayload = createPayload({
          disposalOrRecoveryCodes: [
            {
              code: 'R1',
              weight: {
                metric: 'Tonnes'
                // Missing amount and isEstimate
              }
            }
          ]
        })

        const { error } = receiveMovementRequestSchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details.length).toBeGreaterThan(0)
      })
    })

    describe('Optional Disposal/Recovery Codes', () => {
      it('should accept submission without disposal/recovery codes', () => {
        const validPayload = createPayload({
          // No disposalOrRecoveryCodes specified
        })

        const { error } = receiveMovementRequestSchema.validate(validPayload)
        expect(error).toBeUndefined()
      })
    })
  })
})
