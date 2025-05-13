import Boom from '@hapi/boom'
import { createMovement } from '../movement-create.js'
import {
  createMovementSchema,
  hazardousWasteSchema,
  popsSchema,
  movementIdSchema,
  carrierMovementSchema
} from '../schemas/movement.js'
import Joi from 'joi'

const movement = [
  {
    method: 'GET',
    path: '/movements',
    options: {
      tags: ['movements'],
      description: 'List all waste movements',
      notes: 'Retrieves a list of all waste movements',
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Successfully retrieved movements',
              schema: Joi.array()
                .items(
                  Joi.object({
                    _id: Joi.string()
                      .guid()
                      .description(
                        'Globally unique identifier of the movement'
                      ),
                    carrierMovementId: Joi.string().description(
                      'An identifier of the movement, unique for the carrier only'
                    ),
                    carrierId: Joi.string().description(
                      'Identifier of the carrier'
                    ),
                    hazardousWaste: Joi.object()
                      .optional()
                      .description('Hazardous waste details if applicable'),
                    pops: Joi.object()
                      .optional()
                      .description('POPs details if applicable'),
                    pepr: Joi.boolean()
                      .optional()
                      .description('pEPR flag if applicable')
                  })
                )
                .label('MovementListResponse')
            }
          }
        }
      }
    },
    handler: async (request, h) => {
      const movements = await request.db
        .collection('movements')
        .find()
        .toArray()
      return h.response(movements)
    }
  },
  {
    method: 'POST',
    path: '/movements',
    options: {
      tags: ['movements'],
      description: 'Create a new waste movement',
      notes:
        'Endpoint to be used when waste is received but the carrier has not already recorded the waste movement so has no id.',
      validate: {
        payload: createMovementSchema
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Successfully created movement',
              schema: Joi.object({
                globalMovementId: Joi.string()
                  .guid()
                  .description('Globally unique identifier of the movement'),
                carrierMovementId: Joi.string().description(
                  'An identifier of the movement, unique for the carrier only'
                )
              }).label('CreateMovementResponse')
            },
            400: {
              description: 'Bad Request',
              schema: Joi.object({
                statusCode: Joi.number().valid(400),
                error: Joi.string(),
                message: Joi.string()
              }).label('BadRequestResponse')
            }
          }
        }
      }
    },
    handler: async (request, h) => {
      const movement = await createMovement(request.db, request.payload)
      return h.response({
        globalMovementId: movement._id,
        carrierMovementId: movement.carrierMovementId
      })
    }
  },
  {
    method: 'POST',
    path: '/carriers/{carrierId}/movements/{carrierMovementId}/receive',
    options: {
      tags: ['movements'],
      description: 'Receive a waste movement with carrier ID',
      notes:
        'Endpoint to be used when waste is received and the carrier has a waste tracking id.',
      validate: {
        params: carrierMovementSchema,
        payload: createMovementSchema
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Successfully received movement',
              schema: Joi.object({
                globalMovementId: Joi.string()
                  .guid()
                  .description('Globally unique identifier of the movement')
              }).label('ReceiveMovementResponse')
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
              description: 'Not Found',
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
    handler: async (request, h) => {
      const movement = await createMovement(request.db, {
        ...request.payload,
        carrierId: request.params.carrierId,
        carrierMovementId: request.params.carrierMovementId
      })
      return h.response({
        globalMovementId: movement._id
      })
    }
  },
  {
    method: 'PATCH',
    path: '/movements/{movementId}',
    options: {
      tags: ['movements'],
      description: 'Update an existing waste movement',
      notes:
        'Endpoint to be used by the receiver to correct details of a movement which has already been created/received.',
      validate: {
        params: movementIdSchema,
        payload: createMovementSchema
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Successfully updated movement',
              schema: Joi.object({}).label('UpdateMovementResponse')
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
              description: 'Not Found',
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
    handler: async (request, h) => {
      const { movementId } = request.params
      const result = await request.db
        .collection('movements')
        .updateOne({ _id: movementId }, { $set: request.payload })

      if (result.matchedCount === 0) {
        return Boom.notFound('Movement not found')
      }

      return h.response().code(200)
    }
  },
  {
    method: 'PUT',
    path: '/movements/{movementId}/hazardous',
    options: {
      tags: ['movements'],
      description: 'Add hazardous waste details to a movement',
      notes:
        'Endpoint used to provide hazardous waste details for a waste movement',
      validate: {
        params: movementIdSchema,
        payload: hazardousWasteSchema
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Successfully added hazardous waste details',
              schema: Joi.object({}).label('HazardousWasteResponse')
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
              description: 'Not Found',
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
    handler: async (request, h) => {
      const { movementId } = request.params
      const result = await request.db
        .collection('movements')
        .updateOne(
          { _id: movementId },
          { $set: { hazardousWaste: request.payload } }
        )

      if (result.matchedCount === 0) {
        return Boom.notFound('Movement not found')
      }

      return h.response().code(200)
    }
  },
  {
    method: 'PUT',
    path: '/movements/{movementId}/pops',
    options: {
      tags: ['movements'],
      description: 'Add POPs details to a movement',
      notes: 'Endpoint used to provide pops details for a waste movement',
      validate: {
        params: movementIdSchema,
        payload: popsSchema
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Successfully added POPs details',
              schema: Joi.object({}).label('PopsResponse')
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
              description: 'Not Found',
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
    handler: async (request, h) => {
      const { movementId } = request.params
      const result = await request.db
        .collection('movements')
        .updateOne({ _id: movementId }, { $set: { pops: request.payload } })

      if (result.matchedCount === 0) {
        return Boom.notFound('Movement not found')
      }

      return h.response().code(200)
    }
  },
  {
    method: 'PUT',
    path: '/movements/{movementId}/pepr',
    options: {
      tags: ['movements'],
      description: 'Add pEPR details to a movement',
      notes: 'Endpoint used to provide additional details required for pEPR',
      validate: {
        params: movementIdSchema
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Successfully added pEPR details',
              schema: Joi.object({}).label('PeprResponse')
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
              description: 'Not Found',
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
    handler: async (request, h) => {
      const { movementId } = request.params
      const result = await request.db
        .collection('movements')
        .updateOne({ _id: movementId }, { $set: { pepr: true } })

      if (result.matchedCount === 0) {
        return Boom.notFound('Movement not found')
      }

      return h.response().code(200)
    }
  }
]

export { movement }
