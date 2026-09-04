import Joi from 'joi'
import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { badRequestResponseSchema } from '../../schemas/bad-request-response-schema.js'
import { versionPath } from './common.js'
import { proxyWasteMovementBackend } from '../../handlers/proxyWasteMovementBackend.js'

const createReceipt = {
  method: 'POST',
  path: '/deliveries/{deliveryId}/receipt',
  options: {
    tags: ['deliveries'],
    description: 'Endpoint to be used to create a waste receipt event',
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.CREATED]: {
            description: 'The waste receipt has been created'
          },
          [HTTP_STATUS.BAD_REQUEST]: {
            description: 'Input was not in the correct format.',
            schema: badRequestResponseSchema
          },
          [HTTP_STATUS.FORBIDDEN]: {
            description:
              'The client is not authorized to create waste receipts.',
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
      `/${versionPath}/deliveries/${request.params.deliveryId}/receipt`,
      request.payload,
      h
    )
}

const createUndeliveredReceipt = {
  method: 'POST',
  path: '/receipts',
  options: {
    tags: ['deliveries'],
    description:
      'Endpoint to be used to create a waste receipt event with no deliveryId',
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.CREATED]: {
            description: 'The waste receipt has been created'
          },
          [HTTP_STATUS.BAD_REQUEST]: {
            description: 'Input was not in the correct format.',
            schema: badRequestResponseSchema
          },
          [HTTP_STATUS.FORBIDDEN]: {
            description:
              'The client is not authorized to create waste receipts.',
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
      `/${versionPath}/receipts`,
      request.payload,
      h
    )
}

export { createReceipt, createUndeliveredReceipt }
