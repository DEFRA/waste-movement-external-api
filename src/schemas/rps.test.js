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
        organisationName: TEST_DATA.RECEIVER.ORGANISATION_NAME,
        authorisationNumbers: TEST_DATA.AUTHORISATION_NUMBERS.SIMPLE,
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
        organisationName: TEST_DATA.RECEIVER.ORGANISATION_NAME,
        authorisationNumbers: TEST_DATA.AUTHORISATION_NUMBERS.SIMPLE,
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
        organisationName: 'Test Receiver',
        authorisationNumbers: ['EPR123']
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeUndefined()
    })

    it('rejects when both authorisations and RPS are empty', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: [],
        regulatoryPositionStatements: []
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toBe(
        '"receiver.authorisationNumbers" must contain at least 1 items'
      )
    })

    it('rejects when neither authorisations nor RPS are provided', () => {
      const receiver = {
        organisationName: 'Test Receiver'
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toBe('"receiver.authorisationNumbers" is required')
    })
  })

  describe('Providing an RPS Number in an Invalid Format', () => {
    it('rejects string value "123RPS"', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: ['EPR123'],
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
        organisationName: 'Test Receiver',
        authorisationNumbers: ['EPR123'],
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
        organisationName: 'Test Receiver',
        authorisationNumbers: ['EPR123'],
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
        organisationName: 'Test Receiver',
        authorisationNumbers: ['EPR123'],
        regulatoryPositionStatements: [-123]
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toContain('must be greater than 0')
    })

    it('rejects zero', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: ['EPR123'],
        regulatoryPositionStatements: [0]
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toContain('must be greater than 0')
    })

    it('rejects decimal numbers', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: ['EPR123'],
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

  describe('RPS can be provided independently of authorisation numbers', () => {
    it('rejects RPS without any authorisation numbers', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        regulatoryPositionStatements: [123, 456]
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toBe('"receiver.authorisationNumbers" is required')
    })

    it('accepts authorisation numbers without RPS', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: ['EPR123', 'EPR456']
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeUndefined()
    })

    it('accepts both authorisation numbers and RPS together', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisationNumbers: ['EPR123', 'EPR456'],
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
