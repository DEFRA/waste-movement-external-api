import { receiveMovementRequestSchema } from './receipt.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import { TEST_DATA } from './test-constants.js'

describe('Regulatory Position Statement (RPS) Validation', () => {
  const basePayload = createMovementRequest()

  const validate = (receiver, receipt) =>
    receiveMovementRequestSchema.validate({ ...basePayload, receiver, receipt })

  describe('Successfully Providing a Valid RPS Number', () => {
    it('accepts single positive integer', () => {
      const receiver = {
        siteName: TEST_DATA.RECEIVER.SITE_NAME,
        authorisationNumber: TEST_DATA.AUTHORISATION_NUMBERS.SIMPLE,
        regulatoryPositionStatements: TEST_DATA.RPS.VALID.SINGLE
      }

      const receipt = {
        address: TEST_DATA.ADDRESS.RECEIVER
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeUndefined()
    })
  })

  describe('Successfully Providing Multiple Valid RPS Numbers', () => {
    it('accepts multiple positive integers', () => {
      const receiver = {
        siteName: TEST_DATA.RECEIVER.SITE_NAME,
        authorisationNumber: TEST_DATA.AUTHORISATION_NUMBERS.SIMPLE,
        regulatoryPositionStatements: TEST_DATA.RPS.VALID.MULTIPLE
      }

      const receipt = {
        address: TEST_DATA.ADDRESS.RECEIVER
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeUndefined()
    })
  })

  describe('Omitting the RPS Number', () => {
    it('accepts when RPS is not provided', () => {
      const receiver = {
        siteName: 'Test Receiver',
        authorisationNumber:
          TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_XX9999XX
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeUndefined()
    })

    it('rejects when both authorisation number and RPS are empty', () => {
      const receiver = {
        siteName: 'Test Receiver',
        authorisationNumber: '',
        regulatoryPositionStatements: []
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        '"receiver.authorisationNumber" is not allowed to be empty'
      )
    })

    it('rejects when both authorisation number and RPS are null', () => {
      const receiver = {
        siteName: 'Test Receiver',
        authorisationNumber: null,
        regulatoryPositionStatements: null
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        '"receiver.authorisationNumber" must be a string'
      )
    })

    it('rejects when neither authorisation number nor RPS are provided', () => {
      const receiver = {
        siteName: 'Test Receiver'
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toBe('"receiver.authorisationNumber" is required')
    })
  })

  describe('Providing an RPS Number in an Invalid Format', () => {
    it('rejects string value "123RPS"', () => {
      const receiver = {
        siteName: 'Test Receiver',
        authorisationNumber:
          TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_PPC_A,
        regulatoryPositionStatements: ['123RPS']
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toContain('must be a number')
    })

    it('rejects string value "RPS-123"', () => {
      const receiver = {
        siteName: 'Test Receiver',
        authorisationNumber: TEST_DATA.AUTHORISATION_NUMBERS.VALID.WALES_EPR,
        regulatoryPositionStatements: ['RPS-123']
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toContain('must be a number')
    })

    it('rejects string value "RPS12A3"', () => {
      const receiver = {
        siteName: 'Test Receiver',
        authorisationNumber: TEST_DATA.AUTHORISATION_NUMBERS.VALID.NI_WPPC,
        regulatoryPositionStatements: ['RPS12A3']
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toContain('must be a number')
    })

    it('rejects negative numbers', () => {
      const receiver = {
        siteName: 'Test Receiver',
        authorisationNumber:
          TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_EAWML,
        regulatoryPositionStatements: [-123]
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toContain('must be a positive number')
    })

    it('rejects zero', () => {
      const receiver = {
        siteName: 'Test Receiver',
        authorisationNumber: TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_WML,
        regulatoryPositionStatements: [0]
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toContain('must be a positive number')
    })

    it('rejects decimal numbers', () => {
      const receiver = {
        siteName: 'Test Receiver',
        authorisationNumber:
          TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_WML_L,
        regulatoryPositionStatements: [12.5]
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toContain('must be an integer')
    })
  })

  describe('RPS can be provided independently of authorisation number', () => {
    it('rejects RPS without any authorisation number', () => {
      const receiver = {
        siteName: 'Test Receiver',
        regulatoryPositionStatements: [123, 456]
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toBe('"receiver.authorisationNumber" is required')
    })

    it('accepts authorisation number without RPS', () => {
      const receiver = {
        siteName: 'Test Receiver',
        authorisationNumber:
          TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_XX9999XX
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeUndefined()
    })

    it('accepts both authorisation number and RPS together', () => {
      const receiver = {
        siteName: 'Test Receiver',
        authorisationNumber:
          TEST_DATA.AUTHORISATION_NUMBERS.VALID.SCOTLAND_SEPA,
        regulatoryPositionStatements: [100, 200, 300]
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeUndefined()
    })
  })
})
