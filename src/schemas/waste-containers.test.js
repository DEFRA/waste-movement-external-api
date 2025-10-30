import { validContainerTypes } from '../common/constants/container-types.js'
import { mockProcessEnv } from '../test/helpers/mock-process-env.js'
import { receiveMovementRequestSchema } from './receipt.js'
import { createTestPayload } from './test-helpers/waste-test-helpers.js'

describe('Receipt Schema Validation - Containers', () => {
  mockProcessEnv()

  describe('Number of Containers Validation', () => {
    it('should require amount', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { numberOfContainers: undefined }
      })
      const result = receiveMovementRequestSchema.validate(payload)

      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"wasteItems[0].numberOfContainers" is required'
      )
    })

    it('should accept a positive integer', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { numberOfContainers: 1, containsPops: false }
      })
      const result = receiveMovementRequestSchema.validate(payload)

      expect(result.error).toBeUndefined()
    })

    it('should reject a decimal number', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { numberOfContainers: 1.5 }
      })
      const result = receiveMovementRequestSchema.validate(payload)

      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"wasteItems[0].numberOfContainers" must be an integer'
      )
    })

    it('should accept zero', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { numberOfContainers: 0, containsPops: false }
      })
      const result = receiveMovementRequestSchema.validate(payload)

      expect(result.error).toBeUndefined()
    })

    it('should reject a negative integer', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { numberOfContainers: -1 }
      })
      const result = receiveMovementRequestSchema.validate(payload)

      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"wasteItems[0].numberOfContainers" must be greater than or equal to 0'
      )
    })
  })
  describe('Container type validation', () => {
    it('should require container type', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { typeOfContainers: undefined }
      })
      const result = receiveMovementRequestSchema.validate(payload)

      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"wasteItems[0].typeOfContainers" is required'
      )
    })

    it.each(validContainerTypes)(
      'valid container types are accepted - %s',
      (containerType) => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            typeOfContainers: containerType,
            containsPops: false
          }
        })

        const result = receiveMovementRequestSchema.validate(payload)

        expect(result.error).toBeUndefined()
      }
    )

    it('should reject invalid container type', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { typeOfContainers: 'INV' }
      })
      const result = receiveMovementRequestSchema.validate(payload)

      expect(result.error).toBeDefined()
      expect(result.error.message).toContain(
        '"wasteItems[0].typeOfContainers" must be a valid container type'
      )
    })
  })
})
