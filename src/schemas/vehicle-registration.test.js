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
      it('should accept valid UK vehicle registration format 1 (ABC123) for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'ABC123'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeUndefined()
      })

      it('should accept valid UK vehicle registration format 1 with spaces (ABC 123) for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'ABC 123'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeUndefined()
      })

      it('should accept valid UK vehicle registration format 2 (A123BCD) for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'A123BCD'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeUndefined()
      })

      it('should accept valid UK vehicle registration format 2 with spaces (A 123 BCD) for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'A 123 BCD'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeUndefined()
      })

      it('should accept valid UK vehicle registration format 3 (AB12CDE) for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'AB12CDE'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeUndefined()
      })

      it('should accept valid UK vehicle registration format 3 with spaces (AB 12 CDE) for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'AB 12 CDE'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeUndefined()
      })

      it('should accept valid UK vehicle registration with single digit (AB1CDE) for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'AB1CDE'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeUndefined()
      })

      it('should accept valid UK vehicle registration with double digit (AB12CDE) for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'AB12CDE'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeUndefined()
      })

      it('should accept valid UK vehicle registration with triple digit (AB123CDE) for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'AB123CDE'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeUndefined()
      })
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

      it('should reject when vehicle registration is empty string for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: ''
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeDefined()
        expect(error.details[0].message).toContain(
          'Vehicle registration cannot be empty when means of transport is Road'
        )
      })

      it('should reject when vehicle registration is null for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: null
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeDefined()
        expect(error.details[0].message).toContain('must be a string')
      })

      it('should reject invalid vehicle registration format for Road transport', () => {
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
        expect(error.details[0].message).toContain(
          'Vehicle registration must be in a valid UK format'
        )
      })

      it('should reject vehicle registration with lowercase letters for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'abc123'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeDefined()
        expect(error.details[0].message).toContain(
          'Vehicle registration must be in a valid UK format'
        )
      })

      it('should reject vehicle registration with special characters for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'AB@12CD'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeDefined()
        expect(error.details[0].message).toContain(
          'Vehicle registration must be in a valid UK format'
        )
      })

      it('should reject vehicle registration that is too short for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'AB1'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeDefined()
        expect(error.details[0].message).toContain(
          'Vehicle registration must be in a valid UK format'
        )
      })

      it('should reject vehicle registration that is too long for Road transport', () => {
        const payload = {
          ...basePayload,
          carrier: {
            ...basePayload.carrier,
            meansOfTransport: 'Road',
            vehicleRegistration: 'AB12345CDE'
          }
        }

        const { error } = receiveMovementRequestSchema.validate(payload)
        expect(error).toBeDefined()
        expect(error.details[0].message).toContain(
          'Vehicle registration must be in a valid UK format'
        )
      })
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
