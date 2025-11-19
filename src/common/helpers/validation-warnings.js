import { REASONS_FOR_NO_REGISTRATION_NUMBER } from '../constants/reasons-for-no-registration-number.js'
import {
  CARRIER_WARNINGS,
  RECEIPT_WARNINGS,
  VALIDATION_WARNING_TYPES,
  WASTE_WARNINGS
} from '../constants/validation-warning-messages.js'
import {
  hazardousComponentsWarningValidators,
  popsComponentsWarningValidators
} from './validation-warnings/validators/hazardous-and-pops-components.js'

export const disposalOrRecoveryCodesWarningValidators = {
  key: 'wasteItems.disposalOrRecoveryCodes',
  validators: [
    {
      field: 'code',
      validator: isDisposalOrRecoveryCodeMissing,
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: WASTE_WARNINGS.DISPOSAL_OR_RECOVERY_CODE_REQUIRED
    },
    {
      field: 'weight',
      validator: isDisposalOrRecoveryWeightMissing,
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: RECEIPT_WARNINGS.IS_REQUIRED
    },
    {
      field: 'weight.metric',
      validator: isDisposalOrRecoveryWeightMetricMissing,
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: RECEIPT_WARNINGS.IS_REQUIRED
    },
    {
      field: 'weight.amount',
      validator: isDisposalOrRecoveryWeightAmountMissing,
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: RECEIPT_WARNINGS.IS_REQUIRED
    },
    {
      field: 'weight.isEstimate',
      validator: isDisposalOrRecoveryWeightIsEstimateMissing,
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: WASTE_WARNINGS.DISPOSAL_OR_RECOVERY_CODE_WEIGHT_IS_REQURIED
    }
  ]
}

export const reasonForNoRegistrationNumberWarningValidators = {
  key: 'carrier.reasonForNoRegistrationNumber',
  validators: [
    {
      field: null,
      validator: isReasonForNoRegistrationNumberValid,
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: CARRIER_WARNINGS.REASON_FOR_NO_REGISTRATION_NUMBER_INVALID
    }
  ]
}
/**
 * Process validation warnings
 * @param {Object} payload - The request payload
 * @param {Object} warningValidators - The validators to use
 * @returns {Array} Array of warning messages
 */
export function processValidationWarnings(payload, warningValidators) {
  const validationWarnings = []

  if (!payload) {
    return validationWarnings
  }

  const topLevelItem = warningValidators.key.split('.')[0]

  if (Array.isArray(payload[topLevelItem])) {
    for (const [topLevelIndex, field] of payload[topLevelItem].entries()) {
      validationWarnings.push(
        ...validateField(field, warningValidators, topLevelIndex, topLevelItem)
      )
    }
  } else {
    validationWarnings.push(
      ...validateField(payload, warningValidators, 0, topLevelItem)
    )
  }

  return validationWarnings
}

/**
 * Validates a field
 * @param {Object} currentField - The field to validate
 * @param {Object} warningValidators - The validators to use
 * @param {Number} topLevelIndex - The index of the top level item
 * @param {String} topLevelItem - The top level item
 * @returns {Array} Array of warning messages
 */
function validateField(
  currentField,
  warningValidators,
  topLevelIndex,
  topLevelItem
) {
  const fieldWarnings = []

  for (const {
    field,
    validator,
    errorType,
    message
  } of warningValidators.validators) {
    const { isValid, invalidIndices } = validator(currentField)

    if (isValid === false) {
      const baseKeyJsonPath = replaceJsonPathIndex(
        warningValidators.key,
        topLevelItem,
        topLevelIndex
      )
      const baseKeyIndexed = replaceIndexedPathIndex(
        warningValidators.key,
        topLevelItem,
        topLevelIndex
      )

      if (invalidIndices && invalidIndices.length > 0) {
        fieldWarnings.push(
          ...formatIndexedKeyWarning(
            warningValidators.key,
            field,
            invalidIndices,
            baseKeyJsonPath,
            baseKeyIndexed,
            errorType,
            message
          )
        )
      } else {
        fieldWarnings.push({
          key: baseKeyJsonPath,
          errorType,
          message: message.replace('{{ #label }}', baseKeyIndexed)
        })
      }
    }
  }

  return fieldWarnings
}

/**
 * Formats the warning messages for indexed fields
 * @param {String} key - The validation key
 * @param {String} field - The key of the field being validated
 * @param {Array} invalidIndices - The indices of fields failing validation
 * @param {String} baseKeyJsonPath - The validation key in JSON path format
 * @param {String} baseKeyIndexed - The validation key in indexed format
 * @param {String} errorType - The error type
 * @param {String} message - The validation message
 * @returns {Array} Array of warning messages
 */
const formatIndexedKeyWarning = (
  key,
  field,
  invalidIndices,
  baseKeyJsonPath,
  baseKeyIndexed,
  errorType,
  message
) => {
  const keyLastItem = String(key).split('.').at(-1)
  const keyFieldItem = field ? `.${field}` : ''

  return invalidIndices.map((invalidIndex) => {
    baseKeyJsonPath = replaceJsonPathIndex(
      baseKeyJsonPath,
      keyLastItem,
      invalidIndex
    )
    baseKeyIndexed = replaceIndexedPathIndex(
      baseKeyIndexed,
      keyLastItem,
      invalidIndex
    )
    return {
      key: baseKeyJsonPath + keyFieldItem,
      errorType,
      message: message.replace('{{ #label }}', baseKeyIndexed + keyFieldItem)
    }
  })
}

/**
 * Replaces a key item with a JSON path index item
 * @param {string} key - The key with item to be replaced
 * @param {string} item - The item to replace
 * @param {string} index - The index to use in the replacement
 * @returns {string} The key with the replaced item
 */
const replaceJsonPathIndex = (key, item, index) =>
  key.replace(item, key.includes('wasteItems') ? `${item}.${index}` : item)

/**
 * Replaces a key item with an indexed path index item
 * @param {string} key - The key with item to be replaced
 * @param {string} item - The item to replace
 * @param {string} index - The index to use in the replacement
 * @returns {string} The key with the replaced item
 */
const replaceIndexedPathIndex = (key, item, index) =>
  key.replace(item, key.includes('wasteItems') ? `${item}[${index}]` : item)

/**
 * Determines if Disposal or Recovery weight is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isDisposalOrRecoveryWeightMissing(wasteItem) {
  if (!wasteItem) {
    return { isValid: true }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: true }
  }

  const invalidIndices = disposalOrRecoveryCodes?.reduce(
    (indices, item, index) => {
      if (!item?.weight) {
        indices.push(index)
      }
      return indices
    },
    []
  )

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Disposal or Recovery weight is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isDisposalOrRecoveryWeightMetricMissing(wasteItem) {
  if (!wasteItem) {
    return { isValid: true }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: true }
  }

  const invalidIndices = disposalOrRecoveryCodes?.reduce(
    (indices, item, index) => {
      if (item?.weight && !item.weight.metric) {
        indices.push(index)
      }
      return indices
    },
    []
  )

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Disposal or Recovery weight amount is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isDisposalOrRecoveryWeightAmountMissing(wasteItem) {
  if (!wasteItem) {
    return { isValid: true }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: true }
  }

  const invalidIndices = disposalOrRecoveryCodes?.reduce(
    (indices, item, index) => {
      if (item?.weight && !item.weight.amount) {
        indices.push(index)
      }
      return indices
    },
    []
  )

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Disposal or Recovery weight isEstimate flag is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isDisposalOrRecoveryWeightIsEstimateMissing(wasteItem) {
  if (!wasteItem) {
    return { isValid: true }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: true }
  }

  const invalidIndices = disposalOrRecoveryCodes?.reduce(
    (indices, item, index) => {
      if (item?.weight && ![true, false].includes(item.weight.isEstimate)) {
        indices.push(index)
      }
      return indices
    },
    []
  )

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Disposal or Recovery code is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isDisposalOrRecoveryCodeMissing(wasteItem) {
  if (!wasteItem) {
    return { isValid: false }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: false }
  }

  const invalidIndices = disposalOrRecoveryCodes?.reduce(
    (indices, item, index) => {
      if (!item.code) {
        indices.push(index)
      }
      return indices
    },
    []
  )

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if the reason for no registration number field is valid
 * @param {Object} payload - The request payload
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isReasonForNoRegistrationNumberValid(payload) {
  const { registrationNumber, reasonForNoRegistrationNumber } = payload.carrier

  if (
    [null, ''].includes(registrationNumber) &&
    [null, ''].includes(reasonForNoRegistrationNumber)
  ) {
    return { isValid: false }
  }

  return { isValid: true }
}

/**
 * Generate all validation warnings for a movement request
 * @param {Object} payload - The request payload
 * @returns {Array} Array of all validation warnings
 */
export const generateAllValidationWarnings = (payload) => {
  const warnings = []

  // Add disposal/recovery code warnings
  const disposalRecoveryWarnings = processValidationWarnings(
    payload,
    disposalOrRecoveryCodesWarningValidators
  )
  warnings.push(...disposalRecoveryWarnings)

  // Add POPs components warnings
  const popsWarnings = processValidationWarnings(
    payload,
    popsComponentsWarningValidators
  )
  warnings.push(...popsWarnings)

  // Add Hazardous components warnings
  const hazardousWarnings = processValidationWarnings(
    payload,
    hazardousComponentsWarningValidators
  )
  warnings.push(...hazardousWarnings)

  // Add reason for no registration number warnings
  const reasonForNoRegistrationNumberWarnings = processValidationWarnings(
    payload,
    reasonForNoRegistrationNumberWarningValidators
  )
  warnings.push(...reasonForNoRegistrationNumberWarnings)

  return warnings
}
