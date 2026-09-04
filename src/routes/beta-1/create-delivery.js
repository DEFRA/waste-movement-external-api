import Joi from 'joi'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { badRequestResponseSchema } from '../../schemas/bad-request-response-schema.js'
import { versionPath } from './common.js'
import { proxyWasteMovementBackend } from '../../handlers/proxyWasteMovementBackend.js'

const createDelivery = {
  method: 'POST',
  path: '/deliveries',
  options: {
    tags: ['deliveries'],
    description: 'Endpoint to be used to create a waste delivery',
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.CREATED]: {
            description: 'The waste delivery has been created',
            schema: Joi.object({
              deliveryId: Joi.string().description(
                'Globally unique identifier of the waste delivery. This id should be stored and used for any subsequent updates of the delivery.'
              )
            })
          },
          [HTTP_STATUS.BAD_REQUEST]: {
            description: 'Input was not in the correct format.',
            schema: badRequestResponseSchema
          },
          [HTTP_STATUS.FORBIDDEN]: {
            description: 'The client is not authorized to create deliveries.',
            schema: Joi.object({
              error: Joi.string(),
              message: Joi.string()
            })
          }
        }
      }
    }
  },
  handler: async (request, h) =>
    await proxyWasteMovementBackend(
      `/${versionPath}/deliveries`,
      request.payload,
      h
    )
}

export { createDelivery }
