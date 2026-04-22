import { receiveMovementRequestSchema } from './receipt.js'
import { MEANS_OF_TRANSPORT } from '../common/constants/means-of-transport.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'

describe('Create Receipt Movement - Means of Transport Validation', () => {
  describe('Schema Validation Tests', () => {
    describe('Valid Means of Transport', () => {
      MEANS_OF_TRANSPORT.forEach((meansOfTransport) => {
        it(`should accept valid means of transport: ${meansOfTransport}`, () => {
          const validPayload = createMovementRequest({
            carrier: {
              registrationNumber: 'CBDU123456',
              organisationName: 'Test Carrier',
              meansOfTransport,
              vehicleRegistration:
                meansOfTransport !== 'Road' ? undefined : 'ABC123'
            }
          })

          const { error } = receiveMovementRequestSchema.validate(validPayload)
          expect(error).toBeUndefined()
        })
      })
    })

    describe('Invalid Means of Transport', () => {
      const invalidMeansOfTransport = [
        'Bike',
        'Walking',
        'Teleport',
        'Invalid',
        '123'
      ]

      invalidMeansOfTransport.forEach((meansOfTransport) => {
        it(`should reject invalid means of transport: ${meansOfTransport}`, () => {
          const invalidPayload = {
            ...createMovementRequest({
              dateTimeReceived: new Date().toISOString()
            }),
            carrier: {
              registrationNumber: 'CBDU123456',
              organisationName: 'Test Carrier',
              meansOfTransport
            }
          }

          const { error } =
            receiveMovementRequestSchema.validate(invalidPayload)
          expect(error).toBeDefined()
          expect(error.details[0].message).toContain('must be one of')
        })
      })

      it('should reject submission without means of transport', () => {
        const invalidPayload = {
          ...createMovementRequest(),
          carrier: {
            registrationNumber: 'CBDU123456',
            organisationName: 'Test Carrier',
            meansOfTransport: undefined
          }
        }

        const { error } = receiveMovementRequestSchema.validate(invalidPayload)
        expect(error).toBeDefined()
        expect(error.details[0].message).toBe(
          '"carrier.meansOfTransport" is required'
        )
      })
    })
  })
})
