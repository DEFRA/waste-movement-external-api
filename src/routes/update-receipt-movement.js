import { receiptMovementSchema } from '../schemas/receipt.js'
import { handleUpdateReceiptMovement } from '../handlers/update-receipt-movement.js'
import Joi from 'joi'

const updateReceiptMovement = {
  method: 'PUT',
  path: '/movements/{wasteTrackingId}/receive',
  options: {
    tags: ['movements'],
    description:
      'Endpoint to be used when waste is received and the carrier has a waste tracking id.',
    validate: {
      params: Joi.object({
        wasteTrackingId: Joi.string()
          .uuid()
          .required()
          .description('The globally unique id of the movement.')
      }),
      payload: receiptMovementSchema
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          200: {
            description: 'The waste movement receipt has been processed',
            schema: Joi.object({
              message: Joi.string().description('Success message')
            })
          },
          400: {
            description: 'Bad Request',
            schema: Joi.object({
              statusCode: Joi.number().valid(400),
              error: Joi.string(),
              message: Joi.string()
            }).label('BadRequestResponse')
          },
          404: {
            description: 'Movement not found',
            schema: Joi.object({
              statusCode: Joi.number().valid(404),
              error: Joi.string(),
              message: Joi.string()
            }).label('NotFoundResponse')
          }
        }
      }
    }
  },
  handler: handleUpdateReceiptMovement
}

export { updateReceiptMovement }
