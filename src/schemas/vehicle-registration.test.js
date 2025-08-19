import { receiveMovementRequestSchema } from './receipt.js'

describe('Vehicle Registration Validation', () => {
  const basePayload = {
    receivingSiteId: 'site123',
    carrier: {
      organisationName: 'Test Carrier',
      address: '123 Test Street'
    }
  }

  describe('Road Transport - Vehicle Registration Required', () => {
    describe('Valid Vehicle Registration for Road Transport', () => {
      const validVehicleRegistrations = [
        { registration: 'ABC123', description: 'format 1 (ABC123)' },
        {
          registration: 'ABC 123',
          description: 'format 1 with spaces (ABC 123)'
        },
        { registration: 'A123BCD', description: 'format 2 (A123BCD)' },
        {
          registration: 'A 123 BCD',
          description: 'format 2 with spaces (A 123 BCD)'
        },
        { registration: 'AB12CDE', description: 'format 3 (AB12CDE)' },
        {
          registration: 'AB 12 CDE',
          description: 'format 3 with spaces (AB 12 CDE)'
        },
        { registration: 'AB1CDE', description: 'single digit (AB1CDE)' },
        { registration: 'AB12CDE', description: 'double digit (AB12CDE)' },
        { registration: 'AB123CDE', description: 'triple digit (AB123CDE)' }
      ]

      test.each(validVehicleRegistrations)(
        'should accept valid UK vehicle registration $description for Road transport',
        ({ registration }) => {
          const payload = {
            ...basePayload,
            carrier: {
              ...basePayload.carrier,
              meansOfTransport: 'Road',
              vehicleRegistration: registration
            }
          }

          const { error } = receiveMovementRequestSchema.validate(payload)
          expect(error).toBeUndefined()
        }
      )
    })

    describe('Missing Vehicle Registration for Road Transport', () => {
      it('should reject when vehicle registration is missing for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road'
            // vehicleRegistration is missing
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeDefined()
        expect(error.details[0].message).toContain(
          'Vehicle registration is required when means of transport is Road'
        )
      })

      const invalidVehicleRegistrations = [
        {
          registration: '',
          description: 'empty string',
          expectedMessage:
            'Vehicle registration cannot be empty when means of transport is Road'
        },
        {
          registration: null,
          description: 'null value',
          expectedMessage: 'must be a string'
        },
        {
          registration: 'INVALID123',
          description: 'invalid format',
          expectedMessage: 'Vehicle registration must be in a valid UK format'
        },
        {
          registration: 'abc123',
          description: 'lowercase letters',
          expectedMessage: 'Vehicle registration must be in a valid UK format'
        },
        {
          registration: 'AB@12CD',
          description: 'special characters',
          expectedMessage: 'Vehicle registration must be in a valid UK format'
        },
        {
          registration: 'AB1',
          description: 'too short',
          expectedMessage: 'Vehicle registration must be in a valid UK format'
        },
        {
          registration: 'AB12345CDE',
          description: 'too long',
          expectedMessage: 'Vehicle registration must be in a valid UK format'
        }
      ]

      test.each(invalidVehicleRegistrations)(
        'should reject vehicle registration with $description for Road transport',
        ({ registration, expectedMessage }) => {
          const payload = {
            ...basePayload,
            carrier: {
              ...basePayload.carrier,
              meansOfTransport: 'Road',
              vehicleRegistration: registration
            }
          }

          const { error } = receiveMovementRequestSchema.validate(payload)
          expect(error).toBeDefined()
          expect(error.details[0].message).toContain(expectedMessage)
        }
      )
    })
  })

  describe('Non-Road Transport - Vehicle Registration Not Required', () => {
    const nonRoadTransportModes = [
      'Rail',
      'Air',
      'Sea',
      'Inland Waterway',
      'Piped'
    ]

    nonRoadTransportModes.forEach((transportMode) => {
      describe(`${transportMode} Transport`, () => {
        it(`should accept submission without vehicle registration for ${transportMode} transport`, () => {
          const payload = {
            ...basePayload,
            carrier: {
              ...basePayload.carrier,
              meansOfTransport: transportMode
              // vehicleRegistration is missing
            }
          }

          const { error } = receiveMovementRequestSchema.validate(payload)
          expect(error).toBeUndefined()
        })

        it(`should reject when vehicle registration is provided for ${transportMode} transport`, () => {
          const payload = {
            ...basePayload,
            carrier: {
              ...basePayload.carrier,
              meansOfTransport: transportMode,
              vehicleRegistration: 'AB12 CDE'
            }
          }

          const { error } = receiveMovementRequestSchema.validate(payload)
          expect(error).toBeDefined()
          expect(error.details[0].message).toContain(
            'Vehicle registration cannot be provided for non-Road transport'
          )
        })

        it(`should reject when vehicle registration is empty string for ${transportMode} transport`, () => {
          const payload = {
            ...basePayload,
            carrier: {
              ...basePayload.carrier,
              meansOfTransport: transportMode,
              vehicleRegistration: ''
            }
          }

          const { error } = receiveMovementRequestSchema.validate(payload)
          expect(error).toBeDefined()
          expect(error.details[0].message).toContain(
            'Vehicle registration cannot be provided for non-Road transport'
          )
        })
      })
    })
  })

  describe('Complete Movement Validation', () => {
    it('should accept complete movement with Road transport and vehicle registration', () => {
      const payload = {
        receivingSiteId: 'site123',
        yourUniqueReference: 'ref123',
        waste: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            form: 'Solid',
            quantity: {
              metric: 'Tonnes',
              amount: 10,
              isEstimate: false
            }
          }
        ],
        carrier: {
          organisationName: 'Test Carrier',
          address: '123 Test Street',
          meansOfTransport: 'Road',
          vehicleRegistration: 'AB12CDE'
        },
        acceptance: {
          acceptingAll: true
        }
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeUndefined()
    })

    it('should accept complete movement with Rail transport without vehicle registration', () => {
      const payload = {
        receivingSiteId: 'site123',
        yourUniqueReference: 'ref123',
        waste: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            form: 'Solid',
            quantity: {
              metric: 'Tonnes',
              amount: 10,
              isEstimate: false
            }
          }
        ],
        carrier: {
          organisationName: 'Test Carrier',
          address: '123 Test Street',
          meansOfTransport: 'Rail'
          // No vehicle registration
        },
        acceptance: {
          acceptingAll: true
        }
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeUndefined()
    })

    it('should reject complete movement with Road transport but missing vehicle registration', () => {
      const payload = {
        receivingSiteId: 'site123',
        yourUniqueReference: 'ref123',
        waste: [
          {
            ewcCodes: ['010101'],
            wasteDescription: 'Test waste',
            form: 'Solid',
            quantity: {
              metric: 'Tonnes',
              amount: 10,
              isEstimate: false
            }
          }
        ],
        carrier: {
          organisationName: 'Test Carrier',
          address: '123 Test Street',
          meansOfTransport: 'Road'
          // Missing vehicle registration
        },
        acceptance: {
          acceptingAll: true
        }
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.details[0].message).toContain(
        'Vehicle registration is required when means of transport is Road'
      )
    })
  })

  describe('Error Message Validation', () => {
    it('should provide clear error message for missing vehicle registration with Road transport', () => {
      const payload = {
        ...basePayload,
        carrier: {
          ...basePayload.carrier,
          meansOfTransport: 'Road'
          // vehicleRegistration is missing
        }
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        'Vehicle registration is required when means of transport is Road'
      )
    })

    it('should provide clear error message for providing vehicle registration with Rail transport', () => {
      const payload = {
        ...basePayload,
        carrier: {
          ...basePayload.carrier,
          meansOfTransport: 'Rail',
          vehicleRegistration: 'AB12CDE'
        }
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        'Vehicle registration cannot be provided for non-Road transport'
      )
    })

    it('should provide clear error message for invalid vehicle registration format', () => {
      const payload = {
        ...basePayload,
        carrier: {
          ...basePayload.carrier,
          meansOfTransport: 'Road',
          vehicleRegistration: 'INVALID123'
        }
      }

      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.details[0].message).toBe(
        'Vehicle registration must be in a valid UK format (e.g., ABC123, A123BCD, AB12CDE)'
      )
    })
  })
})
