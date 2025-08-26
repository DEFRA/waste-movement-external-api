import { receiveMovementRequestSchema } from './receipt.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'

describe('Carrier Validation', () => {
  const basePayload = createMovementRequest()

  const validate = (carrier) =>
    receiveMovementRequestSchema.validate({ ...basePayload, carrier })

  it('accepts complete carrier info with UK postcode, email and phone', () => {
    const carrier = {
      organisationName: 'Test Carrier',
      address: { fullAddress: '123 Test St, Test City', postCode: 'TE1 1ST' },
      emailAddress: 'valid@example.com',
      phoneNumber: '01234567890'
    }

    const { error } = validate(carrier)
    expect(error).toBeUndefined()
  })

  it('accepts only required carrier info (organisationName)', () => {
    const carrier = { organisationName: 'Only Name Carrier' }
    const { error } = validate(carrier)
    expect(error).toBeUndefined()
  })

  it('rejects submission without a carrier name', () => {
    const carrier = {}
    const { error } = validate(carrier)
    expect(error).toBeDefined()
    expect(error.message).toBe('"carrier.organisationName" is required')
  })

  it('rejects address without postcode', () => {
    const carrier = {
      organisationName: 'No Postcode Carrier',
      address: { fullAddress: '123 Test St' } // Missing postCode
    }

    const { error } = validate(carrier)
    expect(error).toBeDefined()
    expect(error.message).toBe('"carrier.address.postCode" is required')
  })

  it('rejects invalid UK postcode', () => {
    const carrier = {
      organisationName: 'Invalid Postcode Carrier',
      address: { fullAddress: '123 Test St', postCode: 'INVALID' }
    }

    const { error } = validate(carrier)
    expect(error).toBeDefined()
    expect(error.message).toBe('Post Code must be in valid UK format')
  })

  it('rejects invalid email format when provided', () => {
    const carrier = {
      organisationName: 'Invalid Email Carrier',
      emailAddress: 'not-an-email'
    }

    const { error } = validate(carrier)
    expect(error).toBeDefined()
    expect(error.message).toBe('"carrier.emailAddress" must be a valid email')
  })
})
