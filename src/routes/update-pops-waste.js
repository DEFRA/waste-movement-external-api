import { popsWasteSchema } from '../schemas/receipt.js'
import { handleUpdatePopsWaste } from '../handlers/update-pops-waste.js'
import Joi from 'joi'
import { commonSwaggerResponses } from '../schemas/common-schemas.js'

const updatePopsWaste = {
  method: 'PUT',
  path: '/movements/{wasteTrackingId}/pops',
  options: {
    tags: ['movements'],
    description:
      'Endpoint used to provide POPs waste details for a waste movement',
    validate: {
      params: Joi.object({
        wasteTrackingId: Joi.string()
          .uuid()
          .required()
          .description('The globally unique id of the movement.')
      }),
      payload: popsWasteSchema
    },
    plugins: {
      'hapi-swagger': {
        responses: commonSwaggerResponses
      }
    }
  },
  handler: handleUpdatePopsWaste
}

export { updatePopsWaste } 