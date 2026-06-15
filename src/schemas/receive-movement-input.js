import { receiveMovementRequestSchema } from 'waste-movement-utils'

// Public input schema for the external API. Customers must supply `apiCode`;
// `submittingOrganisation` is an internal field resolved from `apiCode` before
// the request is forwarded to the backend, so it is not accepted as input.
export const receiveMovementInputSchema = receiveMovementRequestSchema
  .fork(['apiCode'], (schema) => schema.required())
  .fork(['submittingOrganisation'], (schema) => schema.forbidden())
