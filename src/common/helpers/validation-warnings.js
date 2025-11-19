import { REASONS_FOR_NO_REGISTRATION_NUMBER } from '../constants/reasons-for-no-registration-number.js'
import {
  CARRIER_WARNINGS,
  VALIDATION_WARNING_TYPES
} from '../constants/validation-warning-messages.js'
import { disposalOrRecoveryCodesWarningValidators } from './validation-warnings/validators/disposal-or-recovery-codes.js'
import {
  hazardousComponentsWarningValidators,
  popsComponentsWarningValidators
} from './validation-warnings/validators/hazardous-and-pops-components.js'

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
