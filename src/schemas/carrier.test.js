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
        organisationName: 'Test Carrier'
      }

      const { error } = validate(carrier)
      expect(error).toBeUndefined()
    })

    it('accepts submission with valid carrier registration number and no reason', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        organisationName: 'Test Carrier',
        reasonForNoRegistrationNumber: undefined
      }

      const { error } = validate(carrier)
      expect(error).toBeUndefined()
    })
  })

  describe('Scenario: N/A with reason', () => {
    it('accepts submission with N/A and valid reason', () => {
      const carrier = {
        registrationNumber: 'N/A',
        reasonForNoRegistrationNumber: 'Carrier did not provide documentation',
        organisationName: 'Test Carrier'
      }

      const { error } = validate(carrier)
      expect(error).toBeUndefined()
    })

    it('accepts submission with n/a (lowercase) and valid reason', () => {
      const carrier = {
        registrationNumber: 'n/a',
        reasonForNoRegistrationNumber: 'Documentation was not available',
        organisationName: 'Test Carrier'
      }

      const { error } = validate(carrier)
      expect(error).toBeUndefined()
    })
  })

  describe('Scenario: Invalid submissions', () => {
    it('rejects submission without carrier registration number', () => {
      const carrier = {
        organisationName: 'Test Carrier'
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe('Carrier registration number is required')
    })

    it('rejects submission with blank carrier registration number and blank reason', () => {
      const carrier = {
        registrationNumber: '',
        reasonForNoRegistrationNumber: '',
        organisationName: 'Test Carrier'
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe('Carrier registration number is required')
    })

    it('rejects submission with N/A but no reason', () => {
      const carrier = {
        registrationNumber: 'N/A',
        organisationName: 'Test Carrier'
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'When carrier registration number is "N/A", a reason must be provided'
      )
    })

    it('rejects submission with N/A and blank reason', () => {
      const carrier = {
        registrationNumber: 'N/A',
        reasonForNoRegistrationNumber: '   ',
        organisationName: 'Test Carrier'
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'When carrier registration number is "N/A", a reason must be provided'
      )
    })

    it('rejects submission with valid registration number and a reason', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        reasonForNoRegistrationNumber:
          'Should not have a reason with valid number',
        organisationName: 'Test Carrier'
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'Reason for no registration number should only be provided when registration number is "N/A"'
      )
    })
  })

  describe('Additional carrier info validation', () => {
    it('accepts complete carrier info with UK postcode, email and phone', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        organisationName: 'Test Carrier',
        address: { fullAddress: '123 Test St, Test City', postcode: 'TE1 1ST' },
        emailAddress: 'valid@example.com',
        phoneNumber: '01234567890'
      }

      const { error } = validate(carrier)
      expect(error).toBeUndefined()
    })

    it('rejects submission without carrier name', () => {
      const carrier = {
        registrationNumber: 'CBDU123456'
      }

      const { error } = validate(carrier)
      expect(error).toBeDefined()
      expect(error.message).toBe('"carrier.organisationName" is required')
    })

    it('rejects address without postcode', () => {
      const carrier = {
        registrationNumber: 'CBDU123456',
        organisationName: 'No Postcode Carrier',
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
        console.log(error)
        expect(error.message).toBe(
          'If carrier.meansOfTransport is not "Road" then carrier.vehicleRegistration is not applicable.'
        )
      }
    )
  })
})
