import { receiveMovementRequestSchema } from './receipt.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import { MEANS_OF_TRANSPORT } from '../common/constants/means-of-transport.js'
import {
  invalidCarrierRegistrationNumbers,
  validCarrierRegistrationNumbers,
  validNiCarrierRegistrationNumbers
} from '../test/data/carrier-registration-numbers.js'

describe('Carrier Registration Validation', () => {
  const basePayload = createMovementRequest()

  const validate = (carrier) =>
    receiveMovementRequestSchema.validate({ ...basePayload, carrier })

  describe('Scenario: Valid carrier registration number', () => {
    it.each(validCarrierRegistrationNumbers)(
      'accepts submission with valid carrier registration number: "%s"',
      (value) => {
        const carrier = {
          registrationNumber: value,
          organisationName: 'Test Carrier',
          meansOfTransport: MEANS_OF_TRANSPORT[1]
        }

        const { error } = validate(carrier)
        expect(error).toBeUndefined()
      }
    )

    it.each(validCarrierRegistrationNumbers.map((v) => v.toLowerCase()))(
      'accepts submission with lowercase carrier registration number: "%s"',
      (value) => {
        const carrier = {
          registrationNumber: value,
          organisationName: 'Test Carrier',
          meansOfTransport: MEANS_OF_TRANSPORT[1]
        }

        const { error } = validate(carrier)
        expect(error).toBeUndefined()
      }
    )

    it.each(
      validNiCarrierRegistrationNumbers.map((v) => v.replaceAll(' ', ''))
    )(
      'accepts submission with NI carrier registration number without spaces: "%s"',
      (value) => {
        const carrier = {
          registrationNumber: value,
          organisationName: 'Test Carrier',
          meansOfTransport: MEANS_OF_TRANSPORT[1]
        }

        const { error } = validate(carrier)
        expect(error).toBeUndefined()
      }
    )
  })

  describe('Scenario: Invalid submissions', () => {
    it.each([null, undefined])(
      'rejects submission with a missing carrier registration number: "%s"',
      (value) => {
        const carrier = {
          registrationNumber: value,
          organisationName: 'Test Carrier',
          meansOfTransport: MEANS_OF_TRANSPORT[1]
        }

        const { error } = validate(carrier)
        expect(error).toBeDefined()
        expect(error.message).toBe('"carrier.registrationNumber" is required')
      }
    )

    it.each(invalidCarrierRegistrationNumbers)(
      'rejects submission with an invalid carrier registration number: "%s"',
      (value) => {
        const carrier = {
          registrationNumber: value,
          organisationName: 'Test Carrier',
          meansOfTransport: MEANS_OF_TRANSPORT[1]
        }

        const { error } = validate(carrier)
        expect(error).toBeDefined()
        expect(error.message).toBe(
          '"carrier.registrationNumber" must be in a valid England, SEPA, NRW or NI format'
        )
      }
    )

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
