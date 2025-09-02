import { receiveMovementRequestSchema } from './receipt.js'

describe('receiveMovementRequestSchema - otherReferencesForMovement validation', () => {
  const basePayload = {
    receivingSiteId: 'site123',
    dateTimeReceived: new Date().toISOString()
  }

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
  })

  describe('invalid payloads', () => {
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

    it('should reject label exceeding 100 characters', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: [
          { label: 'a'.repeat(101), reference: 'PO-12345' }
        ]
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"otherReferencesForMovement[0].label" length must be less than or equal to 100 characters long'
      )
    })

    it('should reject reference exceeding 255 characters', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: [
          { label: 'PO Number', reference: 'a'.repeat(256) }
        ]
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"otherReferencesForMovement[0].reference" length must be less than or equal to 255 characters long'
      )
    })

    it('should reject array with more than 20 items', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: Array(21).fill({
          label: 'Test',
          reference: 'REF-001'
        })
      }
      const { error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeDefined()
      expect(error.message).toContain(
        '"otherReferencesForMovement" must contain less than or equal to 20 items'
      )
    })

    it('should trim whitespace from label and reference', () => {
      const payload = {
        ...basePayload,
        otherReferencesForMovement: [
          { label: '  PO Number  ', reference: '  PO-12345  ' }
        ]
      }
      const { value, error } = receiveMovementRequestSchema.validate(payload)
      expect(error).toBeUndefined()
      expect(value.otherReferencesForMovement[0].label).toBe('PO Number')
      expect(value.otherReferencesForMovement[0].reference).toBe('PO-12345')
    })
  })
})
