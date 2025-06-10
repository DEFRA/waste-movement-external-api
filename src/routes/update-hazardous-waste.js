import { hazardousWasteSchema } from '../schemas/receipt.js'
import { handleUpdateHazardousWaste } from '../handlers/update-hazardous-waste.js'
import Joi from 'joi'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'

const updateHazardousWaste = {
  method: 'PUT',
  path: '/movements/{wasteTrackingId}/hazardous',
  options: {
    tags: ['movements'],
    description:
      'Endpoint used to provide hazardous waste details for a waste movement',
    validate: {
      params: Joi.object({
        wasteTrackingId: Joi.string()
          .uuid()
          .required()
          .description('The globally unique id of the movement.')
      }),
      payload: hazardousWasteSchema
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.OK]: {
            description: 'OK',
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
  handler: handleUpdateHazardousWaste
}

export { updateHazardousWaste }
