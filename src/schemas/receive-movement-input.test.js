import { describe, it, expect } from '@jest/globals'
import {
  receiveMovementInputSchema,
  isApiCodeOrgXor
} from './receive-movement-input.js'
import { createTestPayload } from './test-helpers/waste-test-helpers.js'

describe('receiveMovementInputSchema', () => {
  it('should accept a valid payload with an apiCode', () => {
    const { error } = receiveMovementInputSchema.validate(createTestPayload())

    expect(error).toBeUndefined()
  })

  it('should require apiCode without surfacing the shared xor rule', () => {
    const { apiCode, ...payloadWithoutApiCode } = createTestPayload()

    const { error } = receiveMovementInputSchema.validate(
      payloadWithoutApiCode,
      { abortEarly: false }
    )

    expect(error).toBeDefined()
    expect(error.details).toEqual([
      expect.objectContaining({ path: ['apiCode'], type: 'any.required' })
    ])
  })

  it('should still apply the shared consignment custom validation', () => {
    const payload = createTestPayload({
      wasteItemOverrides: { ewcCodes: ['180103'], containsHazardous: true }
    })
    delete payload.hazardousWasteConsignmentCode
    delete payload.reasonForNoConsignmentCode

    const { error } = receiveMovementInputSchema.validate(payload, {
      abortEarly: false
    })

    expect(error).toBeDefined()
    expect(error.details).toContainEqual(
      expect.objectContaining({ type: 'BusinessRuleViolation.reasonRequired' })
    )
  })

  describe('isApiCodeOrgXor', () => {
    const xor = (...keys) => ({
      rel: 'xor',
      peers: keys.map((key) => ({ key }))
    })

    it('should match only the apiCode/submittingOrganisation xor', () => {
      expect(isApiCodeOrgXor(xor('apiCode', 'submittingOrganisation'))).toBe(
        true
      )
    })

    it('should leave other dependency rules untouched', () => {
      expect(isApiCodeOrgXor(xor('a', 'b'))).toBe(false)
      expect(isApiCodeOrgXor({ rel: 'and', peers: [] })).toBe(false)
      expect(
        isApiCodeOrgXor(xor('apiCode', 'submittingOrganisation', 'a'))
      ).toBe(false)
    })
  })

  it('should forbid submittingOrganisation as input', () => {
    const payload = createTestPayload({
      submittingOrganisation: {
        defraCustomerOrganisationId: 'org-123'
      }
    })

    const { error } = receiveMovementInputSchema.validate(payload)

    expect(error).toBeDefined()
    expect(error.details[0]).toMatchObject({
      path: ['submittingOrganisation'],
      type: 'any.unknown'
    })
  })
})
