import { receiveMovementRequestSchema } from './receipt.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import { TEST_DATA } from './test-constants.js'

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
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'TE1 1ST'
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
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeUndefined()
  })

  it('accepts when a single authorisation number is provided', () => {
    const receiver = {
      organisationName: 'Test Receiver',
      authorisations: [
        {
          authorisationNumber: ['A1']
        }
      ]
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeUndefined()
  })

  it('accepts when multiple authorisation numbers are provided', () => {
    const receiver = {
      organisationName: 'Test Receiver',
      authorisations: [
        {
          authorisationNumber: ['A1', 'B2', 'C3']
        }
      ]
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeUndefined()
  })

  it('rejects when any receiver properties provided but organisationName missing', () => {
    const receiver = {
      address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('"receiver.organisationName" is required')
  })

  it('rejects incomplete receipt without address', () => {
    const receiver = {
      organisationName: 'Test Receiver',
      emailAddress: 'receiver@example.com',
      phoneNumber: '01234567890'
    }

    const receipt = {}

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('"receipt.address" is required')
  })

  it('rejects incomplete receiver address without postcode', () => {
    const receiver = {
      organisationName: 'Test Receiver'
    }

    const receipt = {
      address: { fullAddress: '1 Receiver St, Town' }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('"receipt.address.postcode" is required')
  })

  it('rejects incomplete receiver address without fullAddress', () => {
    const receiver = {
      organisationName: 'Test Receiver'
    }

    const receipt = {
      address: { postcode: 'TE1 1ST' }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('"receipt.address.fullAddress" is required')
  })

  it('rejects invalid UK postcode', () => {
    const receiver = {
      organisationName: 'Invalid Postcode Receiver'
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'INVALID'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('Postcode must be in valid UK format')
  })

  it('rejects valid Ireland Eircode', () => {
    const receiver = {
      organisationName: 'Invalid Eircode Receiver'
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Dublin',
        postcode: 'P85 YH98'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('Postcode must be in valid UK format')
  })

  it('rejects invalid receiver email address', () => {
    const receiver = {
      organisationName: 'Invalid Email Receiver',
      emailAddress: 'not-an-email'
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('"receiver.emailAddress" must be a valid email')
  })

  it('accepts receiver with authorisations containing valid RPS numbers', () => {
    const receiver = {
      organisationName: TEST_DATA.RECEIVER.ORGANISATION_NAME,
      authorisations: [
        {
          authorisationNumber: [TEST_DATA.AUTHORISATION.NUMBERS.COMPLEX],
          regulatoryPositionStatement: [123, 456]
        }
      ]
    }

    const receipt = {
      address: TEST_DATA.ADDRESS.RECEIVER
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeUndefined()
  })

  it('rejects receiver with invalid RPS number format', () => {
    const receiver = {
      organisationName: TEST_DATA.RECEIVER.ORGANISATION_NAME,
      authorisations: [
        {
          authorisationNumber: [TEST_DATA.AUTHORISATION.NUMBERS.COMPLEX],
          regulatoryPositionStatement: [TEST_DATA.RPS.INVALID.STRINGS[0]]
        }
      ]
    }

    const receipt = {
      address: TEST_DATA.ADDRESS.RECEIVER
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toContain('must be a number')
  })

  it('rejects when an authorisation number is not provided', () => {
    const receiver = {
      organisationName: 'Test Receiver',
      authorisations: [
        {
          authorisationNumber: []
        }
      ]
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"receiver.authorisations[0].authorisationNumber" must contain at least 1 items'
    )
  })

  it('rejects when an authorisation number property is not provided', () => {
    const receiver = {
      organisationName: 'Test Receiver',
      authorisations: [
        {
          authorisationNumber: undefined
        }
      ]
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"receiver.authorisations[0].authorisationNumber" is required'
    )
  })

  it('rejects when an authorisation number is provided with an invalid format', () => {
    const receiver = {
      organisationName: 'Test Receiver',
      authorisations: [
        {
          authorisationNumber: [1]
        }
      ]
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"receiver.authorisations[0].authorisationNumber[0]" must be a string'
    )
  })
})
