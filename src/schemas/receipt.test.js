import { receiveMovementRequestSchema } from './receipt.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'

describe('receiveMovementRequestSchema - otherReferencesForMovement validation', () => {
  const basePayload = createMovementRequest({
    dateTimeReceived: new Date().toISOString()
  })

  describe('valid payloads', () => {
    it('should accept valid array of label-reference pairs', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: [
          { label: 'PO Number', reference: 'PO-12345' },
          { label: 'Waste Ticket', reference: 'WT-67890' }
        ]
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeUndefined()
    })

    it('should accept empty array', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: []
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeUndefined()
    })

    it('should accept payload without otherReferencesForMovement', () => {
      const { error } = receiveMovementRequestSchema.validate(basePayload)
      expect(error).toBeUndefined()
    })

    it('should accept payload without special handling requirements', () => {
      const { error } = receiveMovementRequestSchema.validate(basePayload)
      expect(error).toBeUndefined()
    })

    it('should accept special handling requirements with 5000 characters', () => {
      const payload = {
        ...basePayload,
        specialHandlingRequirements: 'a'.repeat(5000)
      }

      const { error } = receiveMovementRequestSchema.validate(payload)

      expect(error).toBeUndefined()
    })
  })

  describe('invalid payloads', () => {
    it('should reject when organisation API ID is missing', () => {
      const payload = {
        ...basePayload,
        organisationApiId: undefined
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain('"organisationApiId" is required')
    })

    it('should reject when organisation API ID is not a guid', () => {
      const payload = {
        ...basePayload,
        organisationApiId: 'notaguid'
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"organisationApiId" must be a valid GUID'
      )
    })

    it('should reject when label is missing', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: [{ reference: 'PO-12345' }]
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"otherReferencesForMovement[0].label" is required'
      )
    })

    it('should reject when reference is missing', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: [{ label: 'PO Number' }]
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"otherReferencesForMovement[0].reference" is required'
      )
    })

    it('should reject when label is null', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: [{ label: null, reference: 'PO-12345' }]
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"otherReferencesForMovement[0].label" must be a string'
      )
    })

    it('should reject when reference is null', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: [{ label: 'PO Number', reference: null }]
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"otherReferencesForMovement[0].reference" must be a string'
      )
    })

    it('should reject when array contains non-object items', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: ['invalid string']
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"otherReferencesForMovement[0]" must be of type object'
      )
    })

    it('should reject when otherReferencesForMovement is not an array', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: 'not an array'
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"otherReferencesForMovement" must be an array'
      )
    })

    it('should reject empty string for label', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: [{ label: '', reference: 'PO-12345' }]
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"otherReferencesForMovement[0].label" is not allowed to be empty'
      )
    })

    it('should reject empty string for reference', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: [{ label: 'PO Number', reference: '' }]
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"otherReferencesForMovement[0].reference" is not allowed to be empty'
      )
    })

    it('should reject special handling requirements with more than 5000 characters', () => {
      const payload = {
        ...basePayload,
        specialHandlingRequirements: 'a'.repeat(5001)
      }

      const { error } = receiveMovementRequestSchema.validate(payload)

      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"specialHandlingRequirements" length must be less than or equal to 5000 characters long'
      )
    })

    it('should reject when receiver is missing', () => {
      const payload = {
        ...basePayload,
        receiver: undefined
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain('"receiver" is required')
    })

    it('should reject when receipt is missing', () => {
      const payload = {
        ...basePayload,
        receipt: undefined
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain('"receipt" is required')
    })
  })
})
