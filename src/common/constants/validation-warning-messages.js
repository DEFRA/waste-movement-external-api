import { REASONS_FOR_NO_REGISTRATION_NUMBER } from './reasons-for-no-registration-number.js'
import { sourceOfComponentsProvided } from './source-of-components.js'

export const RECEIPT_WARNINGS = {
  IS_REQUIRED: '{{ #label }} is required'
}

export const POPS_OR_HAZARDOUS_WARNINGS = {
  COMPONENTS_RECOMMENDED: `{{ #label }} are recommended when source of components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`,
  CONCENTRATION_RECOMMENDED: `{{ #label }} is recommended when source of components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`
}

export const WASTE_WARNINGS = {
  DISPOSAL_OR_RECOVERY_CODE_REQUIRED:
    '{{ #label }} is required for proper waste tracking and compliance',
  DISPOSAL_OR_RECOVERY_CODE_WEIGHT_IS_REQUIRED: '{{ #label }} flag is required'
}

export const CARRIER_WARNINGS = {
  REASON_FOR_NO_REGISTRATION_NUMBER_INVALID: `{{ #label }} must be one of: ${REASONS_FOR_NO_REGISTRATION_NUMBER.join(', ')}`
}

export const VALIDATION_WARNING_TYPES = {
  NOT_PROVIDED: 'NotProvided',
  TBC: 'TBC'
}
