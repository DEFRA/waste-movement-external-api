import { receiveMovementRequestSchema } from 'waste-movement-utils'

// Public input schema for the external API. Customers must supply `apiCode`;
// `submittingOrganisation` is an internal field resolved from `apiCode` before
// the request is forwarded to the backend, so it is not accepted as input.
//
// The shared schema applies `.xor('apiCode', 'submittingOrganisation')` because
// the backend accepts either during the apiCode -> submittingOrganisation
// transition. That object-level rule is redundant here (apiCode is required,
// submittingOrganisation is forbidden) and, under `abortEarly: false`, would
// surface a confusing "must contain at least one of [...]" error alongside
// "apiCode is required". Drop it while keeping every other rule (keys, the
// consignment custom validation, messages and label) intact.
const withoutOrgXor = receiveMovementRequestSchema.clone()
withoutOrgXor.$_terms.dependencies = withoutOrgXor.$_terms.dependencies.filter(
  (dependency) => dependency.rel !== 'xor'
)

export const receiveMovementInputSchema = withoutOrgXor
  .fork(['apiCode'], (schema) => schema.required())
  .fork(['submittingOrganisation'], (schema) => schema.forbidden())
