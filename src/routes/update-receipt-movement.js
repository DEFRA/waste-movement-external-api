import { receiptMovementSchema } from '../schemas/receipt.js'
import { handleUpdateReceiptMovement } from '../handlers/update-receipt-movement.js'
import Joi from 'joi'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'

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
          [HTTP_STATUS.OK]: {
            description: 'The waste movement receipt has been processed',
            schema: Joi.object({
              message: Joi.string().description('Success message')
            })
          },
          [HTTP_STATUS.BAD_REQUEST]: {
            description: 'Bad Request',
            schema: Joi.object({
              statusCode: Joi.number().valid(HTTP_STATUS.BAD_REQUEST),
              error: Joi.string(),
              message: Joi.string()
            }).label('BadRequestResponse')
          },
          [HTTP_STATUS.NOT_FOUND]: {
            description: 'Movement not found',
            schema: Joi.object({
              statusCode: Joi.number().valid(HTTP_STATUS.NOT_FOUND),
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
