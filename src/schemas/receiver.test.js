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
      organisationName: 'Test Receiver',
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

  it('accepts when a single authorisation number is provided', () => {
    const receiver = {
      organisationName: 'Test Receiver',
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

  it('accepts when multiple authorisation numbers are provided', () => {
    const receiver = {
      organisationName: 'Test Receiver',
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
      organisationName: 'Test Receiver'
    }

    const receipt = {
      address: {
        fullAddress: '1 Receiver St, Town',
        postcode: 'TE1 1ST'
      }
    }

    const { error } = validate(receiver, receipt)
    expect(error).toBeDefined()
    expect(error.message).toBe('Site authorisation number is required')
  })

  it('rejects when authorisation numbers is an empty array', () => {
    const receiver = {
      organisationName: 'Test Receiver',
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
      'At least one site authorisation number is required'
    )
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
      organisationName: 'Test Receiver',
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
      organisationName: 'Test Receiver',
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
      organisationName: 'Invalid Postcode Receiver',
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
    expect(error.message).toBe('Postcode must be in valid UK format')
  })

  it('rejects valid Ireland Eircode', () => {
    const receiver = {
      organisationName: 'Invalid Eircode Receiver',
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
    expect(error.message).toBe('Postcode must be in valid UK format')
  })

  it('rejects invalid receiver email address', () => {
    const receiver = {
      organisationName: 'Invalid Email Receiver',
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
      organisationName: TEST_DATA.RECEIVER.ORGANISATION_NAME,
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
      organisationName: TEST_DATA.RECEIVER.ORGANISATION_NAME,
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
      organisationName: 'Test Receiver',
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
      organisationName: 'Test Receiver',
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
      organisationName: 'Test Receiver',
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
    // Test valid formats from acceptance criteria
    it('accepts valid England format HP9999XX', () => {
      const receiver = {
        organisationName: 'Test Receiver',
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

    it('accepts lowercase hp9999xx format', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: [
          TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_LOWERCASE
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

    it('accepts EPR/XX1234XX/D6789 format', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: [
          TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_WITH_DEPLOYMENT
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

    it('accepts PPC/A/9999999 format', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: [
          TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_PPC_A
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

    it('accepts WPPC 99/99 format', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: [TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_WPPC]
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

    // Test invalid formats from acceptance criteria
    it('rejects EAWML-10001 format', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: [
          TEST_DATA.AUTHORISATION_NUMBERS.INVALID.EAWML_WITH_DASH
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
        'Site authorisation number must be in a valid UK format'
      )
    })

    it('rejects GMB383838X format', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: [
          TEST_DATA.AUTHORISATION_NUMBERS.INVALID.GMB_FORMAT
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
        'Site authorisation number must be in a valid UK format'
      )
    })

    it('rejects WEF1234567 format', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: [
          TEST_DATA.AUTHORISATION_NUMBERS.INVALID.WEF_FORMAT
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
        'Site authorisation number must be in a valid UK format'
      )
    })

    // Test additional valid formats from the annex
    it('accepts all England formats', () => {
      const englishFormats = [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_XX9999XX,
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_WITH_DEPLOYMENT,
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_EAWML,
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_WML
      ]

      englishFormats.forEach((format) => {
        const receiver = {
          organisationName: 'Test Receiver',
          authorisationNumbers: [format]
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
    })

    it('accepts all Scotland (SEPA) formats', () => {
      const scotlandFormats = [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_PPC_A,
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_WML_L,
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_SEPA,
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_EAS
      ]

      scotlandFormats.forEach((format) => {
        const receiver = {
          organisationName: 'Test Receiver',
          authorisationNumbers: [format]
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
    })

    it('accepts all Wales (NRW) formats', () => {
      const walesFormats = [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.WALES_XX9999XX,
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.WALES_EPR
      ]

      walesFormats.forEach((format) => {
        const receiver = {
          organisationName: 'Test Receiver',
          authorisationNumbers: [format]
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
    })

    it('accepts all Northern Ireland formats', () => {
      const niFormats = [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_P_FORMAT,
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_WPPC
      ]

      niFormats.forEach((format) => {
        const receiver = {
          organisationName: 'Test Receiver',
          authorisationNumbers: [format]
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
    })

    it('accepts mixed valid authorisation numbers from different nations', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: [
          TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_XX9999XX,
          TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_PPC_A,
          TEST_DATA.AUTHORISATION_NUMBERS.VALID.WALES_EPR,
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

    it('rejects when submission has no site authorisation number', () => {
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
      expect(error).toBeDefined()
      expect(error.message).toBe('Site authorisation number is required')
    })

    it('rejects when authorisation numbers array is empty', () => {
      const receiver = {
        organisationName: 'Test Receiver',
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
        'At least one site authorisation number is required'
      )
    })
  })
})
