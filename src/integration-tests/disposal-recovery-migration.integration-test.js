import { createServer } from '../server.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import { v4 as uuidv4 } from 'uuid'

describe('Disposal/Recovery Code Migration Integration Tests', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(async () => {
    server.stop()
  })

  describe('Schema validation for migration scenarios', () => {
    it('should reject payloads with disposal codes at root level (old structure)', async () => {
      const oldStructurePayload = createMovementRequest()

      // Add disposal codes at root level (old structure - should be rejected)
      oldStructurePayload.disposalOrRecoveryCodes = [
        {
          code: 'D01',
          weight: { metric: 'Kilograms', amount: 100, isEstimate: false }
        }
      ]

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload: oldStructurePayload,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.statusCode).toBe(400)
      expect(response.result.message).toContain('disposalOrRecoveryCodes')
    })

    it('should accept payloads with disposal codes nested under wasteItems (new structure)', async () => {
      const newStructurePayload = createMovementRequest()

      // Ensure disposal codes are nested under wasteItems (new structure)
      newStructurePayload.wasteItems[0].disposalOrRecoveryCodes = [
        {
          code: 'D01',
          weight: { metric: 'Kilograms', amount: 100, isEstimate: false }
        }
      ]

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload: newStructurePayload,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.statusCode).toBe(200)
      expect(response.result.globalMovementId).toBeDefined()
    })
  })

  describe('Validation warnings for migration scenarios', () => {
    it('should generate warnings when no disposal codes are provided (new validation logic)', async () => {
      const payloadWithoutDisposal = createMovementRequest()

      // Remove disposal codes to trigger validation warnings
      delete payloadWithoutDisposal.wasteItems[0].disposalOrRecoveryCodes

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload: payloadWithoutDisposal,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.statusCode).toBe(200)
      expect(response.result.validation.warnings).toHaveLength(1)
      expect(response.result.validation.warnings[0]).toEqual({
        key: 'receipt.wasteItems[0].disposalOrRecoveryCodes',
        errorType: 'NotProvided',
        message:
          'Disposal or Recovery codes are required for proper waste tracking and compliance'
      })
    })

    it('should generate warnings for incomplete weight information in nested structure', async () => {
      const payloadWithIncompleteWeight = createMovementRequest()

      // Add disposal code with incomplete weight
      payloadWithIncompleteWeight.wasteItems[0].disposalOrRecoveryCodes = [
        {
          code: 'D01',
          weight: { metric: 'Kilograms' } // Missing amount and isEstimate
        }
      ]

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload: payloadWithIncompleteWeight,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.statusCode).toBe(200)
      expect(response.result.validation.warnings).toContainEqual({
        key: 'receipt.wasteItems[0].disposalOrRecoveryCodes[0].weight.amount',
        errorType: 'NotProvided',
        message: 'Weight amount is required'
      })
      expect(response.result.validation.warnings).toContainEqual({
        key: 'receipt.wasteItems[0].disposalOrRecoveryCodes[0].weight.isEstimate',
        errorType: 'NotProvided',
        message: 'Weight estimate flag is required'
      })
    })

    it('should handle multiple waste items with different disposal code scenarios', async () => {
      const multiWasteItemPayload = createMovementRequest()

      // Add multiple waste items
      multiWasteItemPayload.wasteItems = [
        {
          ...multiWasteItemPayload.wasteItems[0],
          disposalOrRecoveryCodes: [
            {
              code: 'D01',
              weight: { metric: 'Kilograms', amount: 100, isEstimate: false }
            }
          ]
        },
        {
          ...multiWasteItemPayload.wasteItems[0],
          ewcCodes: ['200102']
          // No disposal codes - should generate warning
        }
      ]

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload: multiWasteItemPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.statusCode).toBe(200)
      expect(response.result.validation.warnings).toContainEqual({
        key: 'receipt.wasteItems[1].disposalOrRecoveryCodes',
        errorType: 'NotProvided',
        message:
          'Disposal or Recovery codes are required for proper waste tracking and compliance'
      })
    })
  })

  describe('End-to-end migration compatibility', () => {
    it('should successfully process complete movement with new nested structure', async () => {
      const completePayload = createMovementRequest({
        organisationApiId: uuidv4(),
        wasteItems: [
          {
            ewcCodes: ['200101'],
            wasteDescription: 'Paper and cardboard',
            physicalForm: 'Solid',
            numberOfContainers: 5,
            typeOfContainers: 'SKI',
            weight: { metric: 'Kilograms', amount: 500, isEstimate: false },
            pops: { containsPops: false },
            hazardous: { containsHazardous: false },
            disposalOrRecoveryCodes: [
              {
                code: 'R03',
                weight: { metric: 'Kilograms', amount: 300, isEstimate: false }
              },
              {
                code: 'R05',
                weight: { metric: 'Kilograms', amount: 200, isEstimate: false }
              }
            ]
          }
        ]
      })

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload: completePayload,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.statusCode).toBe(200)
      expect(response.result.globalMovementId).toBeDefined()
      expect(response.result.validation.warnings).toHaveLength(0)
    })
  })
})
