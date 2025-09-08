import { receiveMovementRequestSchema } from './receipt.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'

describe('Receiver Validation', () => {
  const basePayload = createMovementRequest()

  const validate = (receiver, receipt) =>
    receiveMovementRequestSchema.validate({ ...basePayload, receiver, receipt })

  it('accepts complete receiver info with UK postcode, email and phone', () => {
    const receiver = {
      organisationName: 'Test Receiver',
      emailAddress: 'receiver@example.com',
      phoneNumber: '01234567890'
    }

    const receipt = {
      receiptAddress: {
        fullAddress: '1 Receiver St, Town',
        postCode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeUndefined()
  })

  it('accepts when no receiver tel/email are provided', () => {
    const receiver = {
      organisationName: 'Test Receiver'
    }

    const receipt = {
      receiptAddress: {
        fullAddress: '1 Receiver St, Town',
        postCode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeUndefined()
  })

  it('rejects when any receiver properties provided but organisationName missing', () => {
    const receiver = {
      address: { fullAddress: '1 Receiver St, Town', postCode: 'TE1 1ST' }
    }

    const receipt = {
      receiptAddress: {
        fullAddress: '1 Receiver St, Town',
        postCode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('"receiver.organisationName" is required')
  })

  it('rejects incomplete receipt without receiptAddress', () => {
    const receiver = {
      organisationName: 'Test Receiver',
      emailAddress: 'receiver@example.com',
      phoneNumber: '01234567890'
    }

    const receipt = {}

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('"receipt.receiptAddress" is required')
  })

  it('rejects incomplete receiver address without postcode', () => {
    const receiver = {
      organisationName: 'Test Receiver'
    }

    const receipt = {
      receiptAddress: { fullAddress: '1 Receiver St, Town' }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('"receipt.receiptAddress.postCode" is required')
  })

  it('rejects incomplete receiver address without fullAddress', () => {
    const receiver = {
      organisationName: 'Test Receiver'
    }

    const receipt = {
      receiptAddress: { postCode: 'TE1 1ST' }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"receipt.receiptAddress.fullAddress" is required'
    )
  })

  it('rejects invalid UK postcode', () => {
    const receiver = {
      organisationName: 'Invalid Postcode Receiver'
    }

    const receipt = {
      receiptAddress: {
        fullAddress: '1 Receiver St, Town',
        postCode: 'INVALID'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('Post Code must be in valid UK format')
  })

  it('rejects valid Ireland Eircode', () => {
    const receiver = {
      organisationName: 'Invalid Eircode Receiver'
    }

    const receipt = {
      receiptAddress: {
        fullAddress: '1 Receiver St, Dublin',
        postCode: 'P85 YH98'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('Post Code must be in valid UK format')
  })

  it('rejects invalid receiver email address', () => {
    const receiver = {
      organisationName: 'Invalid Email Receiver',
      emailAddress: 'not-an-email'
    }

    const receipt = {
      receiptAddress: {
        fullAddress: '1 Receiver St, Town',
        postCode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('"receiver.emailAddress" must be a valid email')
  })
})
