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
        authorisations: [
          {
            authorisationNumber: [TEST_DATA.AUTHORISATION.NUMBERS.SIMPLE],
            regulatoryPositionStatement: TEST_DATA.RPS.VALID.SINGLE
          }
        ]
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
        authorisations: [
          {
            authorisationNumber: [TEST_DATA.AUTHORISATION.NUMBERS.SIMPLE],
            regulatoryPositionStatement: TEST_DATA.RPS.VALID.MULTIPLE
          }
        ]
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
        authorisations: [
          {
            authorisationNumber: ['EPR123']
          }
        ]
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeUndefined()
    })

    it('accepts when authorisations is empty', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisations: []
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeUndefined()
    })

    it('accepts when authorisations is not provided', () => {
      const receiver = {
        organisationName: 'Test Receiver'
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeUndefined()
    })
  })

  describe('Providing an RPS Number in an Invalid Format', () => {
    it('rejects string value "123RPS"', () => {
      const receiver = {
        organisationName: 'Test Receiver',
        authorisations: [
          {
            authorisationNumber: ['EPR123'],
            regulatoryPositionStatement: ['123RPS']
          }
        ]
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
        authorisations: [
          {
            authorisationNumber: ['EPR123'],
            regulatoryPositionStatement: ['RPS-123']
          }
        ]
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
        authorisations: [
          {
            authorisationNumber: ['EPR123'],
            regulatoryPositionStatement: ['RPS12A3']
          }
        ]
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
        authorisations: [
          {
            authorisationNumber: ['EPR123'],
            regulatoryPositionStatement: [-123]
          }
        ]
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
        organisationName: 'Test Receiver',
        authorisations: [
          {
            authorisationNumber: ['EPR123'],
            regulatoryPositionStatement: [0]
          }
        ]
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
        organisationName: 'Test Receiver',
        authorisations: [
          {
            authorisationNumber: ['EPR123'],
            regulatoryPositionStatement: [12.5]
          }
        ]
      }

      const receipt = {
        address: { fullAddress: '1 Receiver St, Town', postcode: 'TE1 1ST' }
      }

      const { error } = validate(receiver, receipt)
      expect(error).toBeDefined()
      expect(error.message).toContain('must be an integer')
    })
  })
})
