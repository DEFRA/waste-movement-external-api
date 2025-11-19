import { receiveMovementRequestSchema } from './receipt.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import { TEST_DATA } from './test-constants.js'

describe('Receiver Validation', () => {
  const basePayload = createMovementRequest()

  const validate = (receiver, receipt) =>
    receiveMovementRequestSchema.validate({ ...basePayload, receiver, receipt })

  const createStandardReceipt = () => ({
    address: {
      fullAddress: '1 Receiver St, Town',
      postcode: 'TE1 1ST'
    }
  })

  it('accepts complete receiver info with UK postcode, email and phone', () => {
    const receiver = {
      siteName: 'Test Receiver',
      emailAddress: 'receiver@example.com',
      phoneNumber: '01234567890',
      authorisationNumbers: [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_XX9999XX
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

  it('accepts when no receiver tel/email are provided', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumbers: [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.WALES_XX9999XX
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
      siteName: 'Test Receiver',
      authorisationNumbers: [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_XX9999XX,
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_PPC_A,
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_WPPC
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

  it('rejects when no authorisation numbers are provided', () => {
    const receiver = {
      siteName: 'Test Receiver'
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('"receiver.authorisationNumbers" is required')
  })

  it('rejects when authorisation numbers is an empty array', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumbers: []
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
      '"receiver.authorisationNumbers" must contain at least 1 items'
    )
  })

  it('rejects when any receiver properties provided but siteName missing', () => {
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
    expect(error.message).toBe('"receiver.siteName" is required')
  })

  it('rejects incomplete receipt without address', () => {
    const receiver = {
      siteName: 'Test Receiver',
      emailAddress: 'receiver@example.com',
      phoneNumber: '01234567890',
      authorisationNumbers: [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_PPC_A
      ]
    }

    const receipt = {}

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('"receipt.address" is required')
  })

  it('rejects incomplete receiver address without postcode', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumbers: [TEST_DATA.AUTHORISATION_NUMBERS.VALID.WALES_EPR]
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
      siteName: 'Test Receiver',
      authorisationNumbers: [TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_WPPC]
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
      siteName: 'Invalid Postcode Receiver',
      authorisationNumbers: [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_EAWML
      ]
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'INVALID'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"receipt.address.postcode" must be in valid UK format'
    )
  })

  it('rejects valid Ireland Eircode', () => {
    const receiver = {
      siteName: 'Invalid Eircode Receiver',
      authorisationNumbers: [TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_WML]
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Dublin',
        postcode: 'P85 YH98'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"receipt.address.postcode" must be in valid UK format'
    )
  })

  it('rejects invalid receiver email address', () => {
    const receiver = {
      siteName: 'Invalid Email Receiver',
      emailAddress: 'not-an-email',
      authorisationNumbers: [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_WML_L
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
    expect(error.message).toBe('"receiver.emailAddress" must be a valid email')
  })

  it('accepts receiver with authorisation numbers and valid RPS numbers', () => {
    const receiver = {
      siteName: TEST_DATA.RECEIVER.SITE_NAME,
      authorisationNumbers: TEST_DATA.AUTHORISATION_NUMBERS.COMPLEX,
      regulatoryPositionStatements: [123, 456]
    }

    const receipt = {
      address: TEST_DATA.ADDRESS.RECEIVER
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeUndefined()
  })

  it('rejects receiver with invalid RPS number format', () => {
    const receiver = {
      siteName: TEST_DATA.RECEIVER.SITE_NAME,
      authorisationNumbers: TEST_DATA.AUTHORISATION_NUMBERS.COMPLEX,
      regulatoryPositionStatements: [TEST_DATA.RPS.INVALID.STRINGS[0]]
    }

    const receipt = {
      address: TEST_DATA.ADDRESS.RECEIVER
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toContain('must be a number')
  })

  it('rejects when an authorisation number is provided with an invalid format', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumbers: [1]
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
      '"receiver.authorisationNumbers[0]" must be a string'
    )
  })

  it('accepts receiver with only regulatory position statements', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumbers: [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_SEPA
      ],
      regulatoryPositionStatements: [123, 456, 789]
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

  it('accepts receiver with only authorisation numbers', () => {
    const receiver = {
      siteName: 'Test Receiver',
      authorisationNumbers: [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_XX9999XX,
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.WALES_EPR
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

  // Tests for DWT-578: Site Authorization Number Validation
  describe('Site Authorization Number Validation (DWT-578)', () => {
    // Test invalid formats from acceptance criteria
    describe.each([
      ['EAWML-10001', TEST_DATA.AUTHORISATION_NUMBERS.INVALID.EAWML_WITH_DASH],
      ['GMB383838X', TEST_DATA.AUTHORISATION_NUMBERS.INVALID.GMB_FORMAT],
      ['WEF1234567', TEST_DATA.AUTHORISATION_NUMBERS.INVALID.WEF_FORMAT]
    ])('rejects %s format', (formatExample, testDataValue) => {
      test(`invalidates ${formatExample}`, () => {
        const receiver = {
          siteName: 'Test Receiver',
          authorisationNumbers: [testDataValue]
        }

        const { error } = validate(receiver, createStandardReceipt())
        expect(error).toBeDefined()
        expect(error.message).toBe(
          '"receiver.authorisationNumbers[0]" must be in a valid UK format'
        )
      })
    })

    // Test all valid formats comprehensively (England, Scotland, Wales, Northern Ireland)
    test.each([
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_XX9999XX,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_LOWERCASE,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_WITH_DEPLOYMENT,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_EAWML,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_WML,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_PPC_A,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_WML_L,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_SEPA,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_EAS,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.WALES_XX9999XX,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.WALES_EPR,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_P_FORMAT,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_WPPC,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_P_WITH_VERSION,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_WPPC_WITH_VERSION,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_COMBINED,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_COMBINED_NO_SUFFIX,
      TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_COMBINED_PAC
    ])('accepts valid format: %s', (format) => {
      const receiver = {
        siteName: 'Test Receiver',
        authorisationNumbers: [format]
      }

      const { error } = validate(receiver, createStandardReceipt())
      expect(error).toBeUndefined()
    })

    // Test NI standalone formats are rejected (must be combined with WML reference)
    describe.each([
      ['WML 07/61', TEST_DATA.AUTHORISATION_NUMBERS.INVALID.NI_WML_ALONE],
      [
        'WML 19/36/T',
        TEST_DATA.AUTHORISATION_NUMBERS.INVALID.NI_WML_TRANSFER_ALONE
      ],
      ['LN/13/02', TEST_DATA.AUTHORISATION_NUMBERS.INVALID.NI_LN_ALONE],
      [
        'LN/13/02/M/V2',
        TEST_DATA.AUTHORISATION_NUMBERS.INVALID.NI_LN_WITH_SUFFIXES_ALONE
      ],
      ['PAC/2014/WCL001', TEST_DATA.AUTHORISATION_NUMBERS.INVALID.NI_PAC_ALONE]
    ])('rejects NI standalone format: %s', (formatExample, testDataValue) => {
      test(`invalidates ${formatExample}`, () => {
        const receiver = {
          siteName: 'Test Receiver',
          authorisationNumbers: [testDataValue]
        }

        const { error } = validate(receiver, createStandardReceipt())
        expect(error).toBeDefined()
        expect(error.message).toBe(
          '"receiver.authorisationNumbers[0]" must be in a valid UK format'
        )
      })
    })
  })
})
