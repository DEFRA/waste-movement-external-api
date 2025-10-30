import { receiveMovementRequestSchema } from '../schemas/receipt.js'
import { handleUpdateReceiptMovement } from '../handlers/update-receipt-movement.js'
import Joi from 'joi'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'
import { badRequestResponseSchema } from '../schemas/bad-request-response-schema.js'

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
          .required()
          .description('The globally unique id of the movement.')
      }),
      payload: receiveMovementRequestSchema
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.OK]: {
            description: 'The waste movement receipt has been processed',
            schema: Joi.object({
              validation: Joi.object({
                warnings: Joi.array()
                  .items(
                    Joi.object({
                      key: Joi.string().description(
                        'The field path that triggered the warning'
                      ),
                      errorType: Joi.string().description(
                        'The type of validation warning'
                      ),
                      message: Joi.string().description('The warning message')
                    })
                  )
                  .description('Array of validation warnings')
              })
                .optional()
                .description('Validation warnings if any')
            })
              .allow({})
              .description('Empty object or object with validation warnings')
          },
          [HTTP_STATUS.BAD_REQUEST]: {
            description: 'Input was not in the correct format.',
            schema: badRequestResponseSchema
          },
          [HTTP_STATUS.NOT_FOUND]: {
            description: 'Movement not found',
            schema: Joi.object({
              statusCode: Joi.number().valid(HTTP_STATUS.NOT_FOUND),
              error: Joi.string(),
              message: Joi.string()
            })
          }
        }
      }
    }
  },
  handler: handleUpdateReceiptMovement
}

export { updateReceiptMovement }
