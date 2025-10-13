import { hasHazardousEwcCodes } from '../../schemas/hazardous-waste-consignment.js'
import { sourceOfComponentsProvided } from '../constants/source-of-components.js'

/**
 * Validation warning types as defined in the API specification
 */
export const VALIDATION_ERROR_TYPES = {
  NOT_PROVIDED: 'NotProvided',
  TBC: 'TBC'
}

/**
 * Validation warning keys
 */
export const VALIDATION_KEYS = {
  RECEIPT_DISPOSAL_RECOVERY_CODES: 'wasteItems.disposalOrRecoveryCodes',
  REASON_NO_CONSIGNMENT_CODE: 'receipt.reasonForNoConsignmentCode',
  HAZARDOUS_COMPONENTS: 'wasteItems.hazardous.components',
  POP_COMPONENTS: 'wasteItems.pops.components',
  POP_NAME: 'wasteItems.pops.components.name'
}

/**
 * Validation warning messages
 */
export const VALIDATION_MESSAGES = {
  DISPOSAL_RECOVERY_REQUIRED:
    'Disposal or Recovery codes are required for proper waste tracking and compliance'
}

export const hazardousComponentsWarningValidators = {
  key: 'wasteItems.hazardous.components',
  validators: [
    {
      field: null,
      validator: (wasteItem) =>
        validatePopOrHazardousComponents(
          wasteItem,
          'Hazardous',
          hasPopsOrHazardousComponents
        ),
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: `{{ #label }} are recommended when source of components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`
    },
    {
      field: 'concentration',
      validator: (wasteItem) =>
        validatePopOrHazardousComponents(
          wasteItem,
          'Hazardous',
          isPopOrHazardousConcentrationValid
        ),
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: `{{ #label }} is recommended when source of components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`
    }
  ]
}

export const popsComponentsWarningValidators = {
  key: 'wasteItems.pops.components',
  validators: [
    {
      field: null,
      validator: (wasteItem) =>
        validatePopOrHazardousComponents(
          wasteItem,
          'POPs',
          hasPopsOrHazardousComponents
        ),
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: `{{ #label }} are recommended when source of components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`
    },
    {
      field: 'concentration',
      validator: (wasteItem) =>
        validatePopOrHazardousComponents(
          wasteItem,
          'POPs',
          isPopOrHazardousConcentrationValid
        ),
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: `{{ #label }} is recommended when source of components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`
    }
  ]
}

export const disposalOrRecoveryCodesWarningValidators = {
  key: 'wasteItems.disposalOrRecoveryCodes',
  validators: [
    {
      field: 'code',
      validator: (wasteItem) => isDisposalOrRecoveryCodeMissing(wasteItem),
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message:
        '{{ #label }} is required for proper waste tracking and compliance'
    },
    {
      field: 'weight',
      validator: (wasteItem) => isDisposalOrRecoveryWeightMissing(wasteItem),
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: '{{ #label }} is required'
    },
    {
      field: 'weight.metric',
      validator: (wasteItem) =>
        isDisposalOrRecoveryWeightMetricMissing(wasteItem),
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: '{{ #label }} is required'
    },
    {
      field: 'weight.amount',
      validator: (wasteItem) =>
        isDisposalOrRecoveryWeightAmountMissing(wasteItem),
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: '{{ #label }} is required'
    },
    {
      field: 'weight.isEstimate',
      validator: (wasteItem) =>
        isDisposalOrRecoveryWeightIsEstimateMissing(wasteItem),
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: '{{ #label }} flag is required'
    }
  ]
}

export const hazardousConsignmentWarningValidators = {
  key: 'reasonForNoConsignmentCode',
  validators: [
    {
      field: null,
      validator: (payload) => isHazardousConsignmentCodeFieldsMissing(payload),
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: '{{ #label }} is required when hazardous EWC codes are present'
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
      let baseKeyJsonPath = warningValidators.key.replace(
        topLevelItem,
        `${topLevelItem}.${topLevelIndex}`
      )
      let baseKeyIndexed = warningValidators.key.replace(
        topLevelItem,
        `${topLevelItem}[${topLevelIndex}]`
      )

      if (invalidIndices && invalidIndices.length > 0) {
        fieldWarnings.push(
          ...invalidIndices.map((invalidIndex) => {
            baseKeyJsonPath = baseKeyJsonPath.replace(
              warningValidators.key.split('.').at(-1),
              `${warningValidators.key.split('.').at(-1)}.${invalidIndex}`
            )
            baseKeyIndexed = baseKeyIndexed.replace(
              warningValidators.key.split('.').at(-1),
              `${warningValidators.key.split('.').at(-1)}[${invalidIndex}]`
            )
            baseKeyJsonPath += field ? `.${field}` : ''
            baseKeyIndexed += field ? `.${field}` : ''
            return {
              key: baseKeyJsonPath,
              errorType,
              message: message.replace('{{ #label }}', baseKeyIndexed)
            }
          })
        )
      } else {
        fieldWarnings.push({
          key:
            topLevelItem === 'wasteItems'
              ? baseKeyJsonPath
              : `receipt.${topLevelItem}`,
          errorType,
          message: message.replace(
            '{{ #label }}',
            topLevelItem === 'wasteItems'
              ? baseKeyIndexed
              : `receipt.${topLevelItem}`
          )
        })
      }
    }
  }

  return fieldWarnings
}

/**
 * Determines if Disposal or Recovery weight is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
const isDisposalOrRecoveryWeightMissing = (wasteItem) => {
  if (!wasteItem) {
    return { isValid: true }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: true }
  }

  let invalidIndices = []

  invalidIndices = disposalOrRecoveryCodes?.reduce((indices, item, index) => {
    if (!item?.weight) {
      indices.push(index)
    }
    return indices
  }, [])

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Disposal or Recovery weight is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
const isDisposalOrRecoveryWeightMetricMissing = (wasteItem) => {
  if (!wasteItem) {
    return { isValid: true }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: true }
  }

  let invalidIndices = []

  invalidIndices = disposalOrRecoveryCodes?.reduce((indices, item, index) => {
    if (item?.weight && !item.weight.metric) {
      indices.push(index)
    }
    return indices
  }, [])

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Disposal or Recovery weight amount is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
const isDisposalOrRecoveryWeightAmountMissing = (wasteItem) => {
  if (!wasteItem) {
    return { isValid: true }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: true }
  }

  let invalidIndices = []

  invalidIndices = disposalOrRecoveryCodes?.reduce((indices, item, index) => {
    if (item?.weight && !item.weight.amount) {
      indices.push(index)
    }
    return indices
  }, [])

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Disposal or Recovery weight isEstimate flag is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
const isDisposalOrRecoveryWeightIsEstimateMissing = (wasteItem) => {
  if (!wasteItem) {
    return { isValid: true }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: true }
  }

  let invalidIndices = []

  invalidIndices = disposalOrRecoveryCodes?.reduce((indices, item, index) => {
    if (item?.weight && ![true, false].includes(item.weight.isEstimate)) {
      indices.push(index)
    }
    return indices
  }, [])

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Disposal or Recovery code is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
const isDisposalOrRecoveryCodeMissing = (wasteItem) => {
  if (!wasteItem) {
    return { isValid: false }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: false }
  }

  let invalidIndices = []

  invalidIndices = disposalOrRecoveryCodes?.reduce((indices, item, index) => {
    if (!item.code) {
      indices.push(index)
    }
    return indices
  }, [])

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Hazardous consignment code is missing
 * @param {Object} payload - The request payload
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
const isHazardousConsignmentCodeFieldsMissing = (payload) => {
  if (!Array.isArray(payload?.wasteItems)) {
    return { isValid: true }
  }

  if (!hasHazardousEwcCodes(payload)) {
    return { isValid: true }
  }

  const code = payload.hazardousWasteConsignmentCode
  const reason = payload.reasonForNoConsignmentCode

  // If consignment code is blank, reason must be provided
  if (!code && !reason) {
    return { isValid: false }
  }

  return { isValid: true }
}

/**
 * Determines if POPs/Hazardous components is an empty array
 * @param {Object} components - The POPs/Hazardous components
 * @returns {Boolean} True if POPs/Hazardous components array is empty, otherwise false
 */
function isPopOrHazardousComponentsEmpty(components) {
  return (
    (Array.isArray(components) && components.length === 0) ||
    !Array.isArray(components)
  )
}

/**
 * Determines if POPs/Hazardous components is an empty array
 * @param {Object} wasteItem - The waste item
 * @param {String} popsOrHazardous - One of: POPs, Hazardous
 * @param {Function} validate - The validation function
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function validatePopOrHazardousComponents(
  wasteItem,
  popsOrHazardous,
  validate
) {
  if (!wasteItem) {
    return { isValid: true }
  }

  if (!['POPs', 'Hazardous'].includes(popsOrHazardous)) {
    throw new Error('Expecting popsOrHazardous to be one of: POPs, Hazardous')
  }

  const popsOrHazardousObjectProperty = String(popsOrHazardous).toLowerCase()
  const containsPopsOrHazardousField = `contains${String(popsOrHazardous).charAt(0).toUpperCase()}${String(popsOrHazardous).toLowerCase().slice(1)}`

  if (!wasteItem[popsOrHazardousObjectProperty]) {
    return { isValid: true }
  }

  const { sourceOfComponents, components } =
    wasteItem[popsOrHazardousObjectProperty]

  if (
    wasteItem[popsOrHazardousObjectProperty][containsPopsOrHazardousField] ===
      false ||
    sourceOfComponents === 'NOT_PROVIDED'
  ) {
    return { isValid: true }
  }

  return validate(components)
}

/**
 * Determines if POPs/Hazardous components is an empty array
 * @param {Object} components - The POPs/Hazardous components
 * @returns {Object} { isValid: Boolean }
 */
function hasPopsOrHazardousComponents(components) {
  return { isValid: Array.isArray(components) && components.length > 0 }
}

/**
 * Determines if any of the POPs/Hazardous components has a missing concentration value
 * @param {Object} components - The POPs/Hazardous components
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isPopOrHazardousConcentrationValid(components) {
  let invalidIndices = []

  if (!isPopOrHazardousComponentsEmpty(components)) {
    invalidIndices = components.reduce((indices, item, index) => {
      if (item.concentration === undefined || item.concentration === null) {
        indices.push(index)
      }
      return indices
    }, [])
  }

  return { isValid: invalidIndices.length === 0, invalidIndices }
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

  // Add hazardous consignment related warnings
  const consignmentWarnings = processValidationWarnings(
    payload,
    hazardousConsignmentWarningValidators
  )
  warnings.push(...consignmentWarnings)

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

  return warnings
}
