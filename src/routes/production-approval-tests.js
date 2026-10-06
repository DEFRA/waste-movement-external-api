import {
  HTTP_STATUS,
  productionApprovalTestsSchema
} from '@defra/waste-movement-utils'
import { handleProductionApprovalTests } from '../handlers/production-approval-tests.js'
import Joi from 'joi'
import { badRequestResponseSchema } from '../schemas/bad-request-response-schema.js'

const productionApprovalTests = {
  method: 'POST',
  path: '/production-approval-tests',
  options: {
    tags: ['production-approval-tests'],
    description:
      'Endpoint to be used to run the Production Approval Tests for one or more Waste Tracking Ids.',
    validate: {
      payload: productionApprovalTestsSchema
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.CREATED]: {
            description: 'The waste movement has been stored',
            schema: Joi.object({
              productionApprovalTestsSchema: Joi.string().description(
                'The Production Approval Tests have been run successfully for the provided Waste Tracking Ids.'
              )
            })
          },
          [HTTP_STATUS.OK]: {
            description: 'The waste movement has been stored',
            schema: Joi.object({
              productionApprovalTestsSchema: Joi.string().description(
                'The Production Approval Tests have been run successfully for the provided Waste Tracking Ids.'
              )
            })
          },
          [HTTP_STATUS.BAD_REQUEST]: {
            description: 'Input was not in the correct format.',
            schema: badRequestResponseSchema
          }
        }
      }
    }
  },
  handler: handleProductionApprovalTests
}

export { productionApprovalTests }
