import { createTestPayloadWith } from 'waste-movement-utils'
import { createMovementRequest } from '../../test/utils/createMovementRequest.js'

export { TEST_CONSTANTS } from 'waste-movement-utils'

export const createTestPayload = (overrides) =>
  createTestPayloadWith(createMovementRequest, overrides)
