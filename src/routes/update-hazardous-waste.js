import { hazardousWasteSchema } from '../schemas/receipt.js'
import { handleUpdateHazardousWaste } from '../handlers/update-hazardous-waste.js'
import Joi from 'joi'
import { commonSwaggerResponses } from '../schemas/common-schemas.js'

const updateHazardousWaste = {
  method: 'PUT',
  path: '/movements/{wasteTrackingId}/receive/hazardous',
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
        responses: commonSwaggerResponses
      }
    }
  },
  handler: handleUpdateHazardousWaste
}

export { updateHazardousWaste }
