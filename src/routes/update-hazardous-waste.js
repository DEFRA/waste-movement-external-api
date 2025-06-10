import { hazardousWasteSchema } from '../schemas/receipt.js'
import { handleUpdateHazardousWaste } from '../handlers/update-hazardous-waste.js'
import Joi from 'joi'

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
          200: {
            description: 'OK',
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
  handler: handleUpdateHazardousWaste
}

export { updateHazardousWaste }
