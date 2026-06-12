import { createTestPayloadWith } from 'waste-movement-utils'
import { createMovementRequest } from '../../test/utils/createMovementRequest.js'

export const createTestPayload = (overrides) =>
  createTestPayloadWith(createMovementRequest, overrides)
