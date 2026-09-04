import Joi from 'joi'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { badRequestResponseSchema } from '../../schemas/bad-request-response-schema.js'
import { versionPath } from './common.js'
import { proxyWasteMovementBackend } from '../../handlers/proxyWasteMovementBackend.js'

const createMovement = {
  method: 'POST',
  path: '/movements',
  options: {
    tags: ['movements'],
    description: 'Endpoint to be used to create a waste collection',
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.CREATED]: {
            description: 'The waste movement has been created',
            schema: Joi.object({
              movementId: Joi.string().description(
                'Globally unique identifier of the movement. This id should be stored and used for any subsequent updates of the movement.'
              )
            })
          },
          [HTTP_STATUS.BAD_REQUEST]: {
            description: 'Input was not in the correct format.',
            schema: badRequestResponseSchema
          },
          [HTTP_STATUS.FORBIDDEN]: {
            description: 'The client is not authorized to create movements.',
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
      `/${versionPath}/movements`,
      request.payload,
      h
    )
}

export { createMovement }
