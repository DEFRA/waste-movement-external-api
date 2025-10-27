import { receiveMovementRequestSchema } from '../schemas/receipt.js'
import { handleCreateReceiptMovement } from '../handlers/create-receipt-movement.js'
import Joi from 'joi'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'
import { badRequestResponseSchema } from '../schemas/bad-request-response-schema.js'

const createReceiptMovement = {
  method: 'POST',
  path: '/movements/receive',
  options: {
    tags: ['movements'],
    description:
      'Endpoint to be used when waste is received but the carrier has not already recorded the waste movement so has no id.',
    validate: {
      payload: receiveMovementRequestSchema
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.OK]: {
            description: 'The waste movement has been stored',
            schema: Joi.object({
              carrierMovementId: Joi.string().description(
                'An identifier of the movement, unique for the carrier only. This field will only be returned if the carrier is known to the service and should be provided to the carrier by the receiver.'
              ),
              wasteTrackingId: Joi.string()
                .uuid()
                .description(
                  'Globally unique identifier of the movement. This id should be stored and used for any subsequent updates of the movement.'
                )
            })
          },
          [HTTP_STATUS.BAD_REQUEST]: {
            description: 'Input was not in the correct format.',
            schema: badRequestResponseSchema
          }
        }
      }
    }
  },
  handler: handleCreateReceiptMovement
}

export { createReceiptMovement }
