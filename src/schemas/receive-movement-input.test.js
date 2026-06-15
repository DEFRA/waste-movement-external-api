import { describe, it, expect } from '@jest/globals'
import { receiveMovementInputSchema } from './receive-movement-input.js'
import { createTestPayload } from './test-helpers/waste-test-helpers.js'

describe('receiveMovementInputSchema', () => {
  it('should accept a valid payload with an apiCode', () => {
    const { error } = receiveMovementInputSchema.validate(createTestPayload())

    expect(error).toBeUndefined()
  })

  it('should require apiCode', () => {
    const { apiCode, ...payloadWithoutApiCode } = createTestPayload()

    const { error } = receiveMovementInputSchema.validate(payloadWithoutApiCode)

    expect(error).toBeDefined()
    expect(error.details[0]).toMatchObject({
      path: ['apiCode'],
      type: 'any.required'
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
