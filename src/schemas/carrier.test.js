import { receiveMovementRequestSchema } from './receipt.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import { MEANS_OF_TRANSPORT } from '../common/constants/means-of-transport.js'

describe('Carrier Registration Validation', () => {
  const basePayload = createMovementRequest()

  const validate = (carrier) =>
    receiveMovementRequestSchema.validate({ ...basePayload, carrier })

  describe('Scenario: Valid carrier registration number', () => {
    it('accepts submission with valid carrier registration number', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        organisationName: 'Test Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1]
      }

      const { error } = validate(carrier)
      expect(error).toBeUndefined()
    })

    it('accepts submission with valid carrier registration number and no reason', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        organisationName: 'Test Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1],
        reasonForNoRegistrationNumber: undefined
      }

      const { error } = validate(carrier)
      expect(error).toBeUndefined()
    })
  })

  describe('Scenario: Null/empty registration with reason', () => {
    it('accepts submission with null registration and valid reason', () => {
      const carrier = {
        registrationNumber: null,
        reasonForNoRegistrationNumber: 'Carrier registration not available',
        organisationName: 'Test Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1]
      }

      const { error } = validate(carrier)
      expect(error).toBeUndefined()
    })

    it('accepts submission with empty string registration and valid reason', () => {
      const carrier = {
        registrationNumber: '',
        reasonForNoRegistrationNumber: 'Documentation was not provided',
        organisationName: 'Test Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1]
      }

      const { error } = validate(carrier)
      expect(error).toBeUndefined()
    })

    it('accepts submission with whitespace-only registration and valid reason', () => {
      const carrier = {
        registrationNumber: '   ',
        reasonForNoRegistrationNumber: 'Carrier did not supply registration',
        organisationName: 'Test Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1]
      }

      const { error } = validate(carrier)
      expect(error).toBeUndefined()
    })
  })

  describe('Scenario: Invalid submissions', () => {
    it('rejects submission with null registration and null reason', () => {
      const carrier = {
        registrationNumber: null,
        reasonForNoRegistrationNumber: null,
        organisationName: 'Test Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1]
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'Either carrier registration number or reason for no registration number is required'
      )
    })

    it('rejects submission with null registration and empty reason', () => {
      const carrier = {
        registrationNumber: null,
        reasonForNoRegistrationNumber: '',
        organisationName: 'Test Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1]
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'Either carrier registration number or reason for no registration number is required'
      )
    })

    it('rejects submission with empty registration and empty reason', () => {
      const carrier = {
        registrationNumber: '',
        reasonForNoRegistrationNumber: '',
        organisationName: 'Test Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1]
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'Either carrier registration number or reason for no registration number is required'
      )
    })

    it('rejects submission with whitespace-only registration and whitespace-only reason', () => {
      const carrier = {
        registrationNumber: '   ',
        reasonForNoRegistrationNumber: '   ',
        organisationName: 'Test Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1]
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'Either carrier registration number or reason for no registration number is required'
      )
    })

    it('rejects submission without carrier registration number field', () => {
      const carrier = {
        organisationName: 'Test Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1]
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'Either carrier registration number or reason for no registration number is required'
      )
    })

    it('rejects submission with valid registration number and a reason', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        reasonForNoRegistrationNumber:
          'Should not have a reason with valid number',
        organisationName: 'Test Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1]
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'Reason for no registration number should only be provided when registration number is not provided'
      )
    })

    it('rejects submission without means of transport', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        organisationName: 'Test Carrier',
        meansOfTransport: undefined
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe('"carrier.meansOfTransport" is required')
    })
  })

  describe('Additional carrier info validation', () => {
    it('accepts complete carrier info with UK postcode, email and phone', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        organisationName: 'Test Carrier',
        address: { fullAddress: '123 Test St, Test City', postcode: 'TE1 1ST' },
        emailAddress: 'valid@example.com',
        phoneNumber: '01234567890',
        meansOfTransport: MEANS_OF_TRANSPORT[1]
      }

      const { error } = validate(carrier)
      expect(error).toBeUndefined()
    })

    it('rejects submission without carrier name', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        meansOfTransport: MEANS_OF_TRANSPORT[1]
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe('"carrier.organisationName" is required')
    })

    it('rejects address without postcode', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        organisationName: 'No Postcode Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1],
        address: { fullAddress: '123 Test St' } // Missing postcode
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe('"carrier.address.postcode" is required')
    })

    it('rejects invalid UK postcode', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        organisationName: 'Invalid Postcode Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1],
        address: { fullAddress: '123 Test St', postcode: 'INVALID' }
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'Postcode must be in valid UK or Ireland format'
      )
    })

    it('rejects invalid email format when provided', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        organisationName: 'Invalid Email Carrier',
        meansOfTransport: MEANS_OF_TRANSPORT[1],
        emailAddress: 'not-an-email'
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe('"carrier.emailAddress" must be a valid email')
    })
  })

  describe('Vehicle registration validation', () => {
    it('allows vehicle registration when Means of Transport is Road', () => {
      const carrier = {
        organisationName: 'Carrier Name',
        registrationNumber: 'CBDU123456',
        meansOfTransport: 'Road',
        vehicleRegistration: 'ABC 123'
      }

      const { error } = validate(carrier)
      expect(error).toBeUndefined()
    })

    it('requires a vehicle registration when Means of Transport is Road', () => {
      const carrier = {
        organisationName: 'Carrier Name',
        registrationNumber: 'CBDU123456',
        meansOfTransport: 'Road',
        vehicleRegistration: undefined
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'If carrier.meansOfTransport is "Road" then carrier.vehicleRegistration is required.'
      )
    })

    it.each(MEANS_OF_TRANSPORT.filter((x) => x !== 'Road'))(
      'allows no vehicle registration when Means of Transport is %s',
      (meansOfTransport) => {
        const carrier = {
          organisationName: 'Carrier Name',
          registrationNumber: 'CBDU123456',
          meansOfTransport,
          vehicleRegistration: undefined
        }

        const { error } = validate(carrier)
        expect(error).toBeUndefined()
      }
    )

    it.each(MEANS_OF_TRANSPORT.filter((x) => x !== 'Road'))(
      'rejects vehicle registration when Means of Transport is %s',
      (meansOfTransport) => {
        const carrier = {
          organisationName: 'Carrier Name',
          registrationNumber: 'CBDU123456',
          meansOfTransport,
          vehicleRegistration: 'ABC 123'
        }

        const { error } = validate(carrier)
        expect(error).toBeDefined()
        expect(error.message).toBe(
          'If carrier.meansOfTransport is not "Road" then carrier.vehicleRegistration is not applicable.'
        )
      }
    )
  })
})
