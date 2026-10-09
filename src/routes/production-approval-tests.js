import {
  HTTP_STATUS,
  productionApprovalTestsSchema
} from '@defra/waste-movement-utils'
import { handleProductionApprovalTests } from '../handlers/production-approval-tests.js'
import Joi from 'joi'
import { badRequestResponseSchema } from '../schemas/bad-request-response-schema.js'
import { productionApprovalTestScenarioIds } from '@defra/waste-movement-utils/src/constants/production-approval-tests.js'

const productionApprovalTests = {
  method: 'POST',
  path: '/production-approval-tests',
  options: {
    tags: ['production-approval-tests'],
    description:
      'Endpoint to be used to run the Production Approval Tests for one or more Waste Tracking Ids.',
    notes:
      'Accepts an array of scenario/wasteTrackingId pairs. Each scenarioId must be unique in the request. Returns a submissionId and per-scenario results.',
    validate: {
      payload: productionApprovalTestsSchema
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.OK]: {
            description: 'The production approval tests have been run',
            schema: Joi.object({
              submissionId: Joi.string()
                .description('Identifier of the submission')
                .example('6a75b4bbe8624f6a79240d78'),
              results: Joi.array()
                .items(
                  Joi.object({
                    scenarioId: Joi.string()
                      .valid(...productionApprovalTestScenarioIds)
                      .description(
                        'The production approval test scenario identifier'
                      ),
                    wasteTrackingId: Joi.string()
                      .description(
                        'The waste tracking ID evaluated for the scenario'
                      )
                      .example('26BHUT6U'),
                    status: Joi.string()
                      .valid('Pass', 'Fail')
                      .description('The outcome of the scenario evaluation')
                      .example('Fail'),
                    message: Joi.string()
                      .allow('')
                      .description(
                        'Empty when the scenario passes; otherwise describes why it failed or errored'
                      )
                      .example(
                        'Expected more than 1 waste item for R02, found 1'
                      )
                  })
                )
                .description(
                  'One result per scenario, for each Waste Tracking Id'
                )
            })
          },
          [HTTP_STATUS.BAD_REQUEST]: {
            description:
              'Request payload was invalid, or one or more waste tracking IDs were missing or not valid for the client.',
            schema: badRequestResponseSchema
          },
          [HTTP_STATUS.UNAUTHORIZED]: {
            schema: Joi.object({
              message: Joi.string()
            }),
            description: 'Authentication is required or the token is invalid'
          }
        }
      }
    }
  },
  handler: handleProductionApprovalTests
}

export { productionApprovalTests }
