import { createWasteInput } from '../movement-create.js'
import { receiptMovementSchema } from '../schemas/receipt.js'
import { WasteInput } from '../domain/wasteInput.js'
import Joi from 'joi'

const movement = [
  {
    method: 'POST',
    path: '/movements/{wasteTrackingId}/receive',
    options: {
      tags: ['movements'],
      description: 'Create a new waste input with a receipt movement',
      validate: {
        payload: receiptMovementSchema
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Successfully created waste input'
            },
            400: {
              description: 'Bad Request',
              schema: Joi.object({
                statusCode: Joi.number().valid(400),
                error: Joi.string(),
                message: Joi.string()
              }).label('BadRequestResponse')
            }
          }
        }
      }
    },
    handler: async (request, h) => {
      const { wasteTrackingId } = request.params
      const wasteInput = new WasteInput()
      wasteInput.wasteTrackingId = wasteTrackingId
      wasteInput.receipt = request.payload
      await createWasteInput(request.db, wasteInput)
      return h.response()
    }
  }
]

export { movement }
