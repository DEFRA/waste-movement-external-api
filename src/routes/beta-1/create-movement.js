import Joi from 'joi'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { isSuccessStatusCode } from '../../common/helpers/utils.js'
import { badRequestResponseSchema } from '../../schemas/bad-request-response-schema.js'
import { httpClients } from '../../common/helpers/http-client.js'
import { handleBackendResponse } from '../../handlers/handle-backend-response.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()

const createMovementSchema = Joi.object({
  apiCode: Joi.string()
    .uuid()
    .description('Unique identifier of the submitting organisation.')
    .example('25b14080-5e77-4f91-9957-2482a0cb8775')
    .required()
})

const versionPath = 'beta-1'

const createMovement = {
  method: 'POST',
  path: '/movements',
  options: {
    tags: ['movements'],
    description: 'Endpoint to be used to create a waste collection',
    validate: {
      payload: createMovementSchema
    },
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
  handler: async (request, h) => {
    try {
      const requestData = request.payload
      const backendResponse = await httpClients.wasteMovement.post(
        `/${versionPath}/movements`,
        requestData
      )
      const isSuccess = isSuccessStatusCode(backendResponse.statusCode)

      const response = {
        body: { movementId: backendResponse?.body?.id },
        statusCode: isSuccess ? HTTP_STATUS.CREATED : backendResponse.statusCode
      }

      logger.info(
        `Successfully created waste movement with id ${response.body.movementId}`,
        response
      )

      return handleBackendResponse(response, h, () => response)
    } catch (error) {
      logger.error({ err: error }, 'Error creating waste movement')
      return h
        .response({
          error: 'Internal Server Error',
          message: 'Failed to create waste movement'
        })
        .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }
}

export { createMovement }
