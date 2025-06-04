import { receiptMovementSchema } from '../schemas/receipt.js'
import { handleCreateReceiptMovement } from '../handlers/create-receipt-movement.js'
import Joi from 'joi'

const createReceiptMovement = {
  method: 'POST',
  path: '/movements/receive',
  options: {
    tags: ['movements'],
    description:
      'Endpoint to be used when waste is received but the carrier has not already recorded the waste movement so has no id.',
    validate: {
      payload: receiptMovementSchema
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          200: {
            description: 'The waste movement has been stored',
            schema: Joi.object({
              carrierMovementId: Joi.string().description(
                'An identifier of the movement, unique for the carrier only. This field will only be returned if the carrier is known to the service and should be provided to the carrier by the receiver.'
              ),
              globalMovementId: Joi.string()
                .uuid()
                .description(
                  'Globally unique identifier of the movement. This id should be stored and used for any subsequent updates of the movement.'
                )
            })
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
  handler: handleCreateReceiptMovement
}

export { createReceiptMovement }
