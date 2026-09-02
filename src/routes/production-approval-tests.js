import { productionApprovalTestsSchema } from '@defra/waste-movement-utils'
import { handleProductionApprovalTests } from '../handlers/production-approval-tests.js'

const productionApprovalTests = {
  method: 'POST',
  path: '/production-approval-tests',
  options: {
    tags: ['production-approval-tests'],
    description:
      'Endpoint to be used to run the Production Approval Tests for one or more Waste Tracking Ids.',
    validate: {
      payload: productionApprovalTestsSchema
    }
  },
  handler: handleProductionApprovalTests
}

export { productionApprovalTests }
