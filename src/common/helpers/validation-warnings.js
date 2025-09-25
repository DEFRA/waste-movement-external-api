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

/**
 * Helper function to check if disposal/recovery codes exist for a waste item
 * @param {Object} wasteItem - The waste item to check
 * @returns {boolean} Whether the waste item has valid disposal/recovery codes
 */
const hasValidDisposalRecoveryCodes = (wasteItem) => {
  return (
    wasteItem.disposalOrRecoveryCodes &&
    Array.isArray(wasteItem.disposalOrRecoveryCodes) &&
    wasteItem.disposalOrRecoveryCodes.length > 0
  )
}

/**
 * Validate weight fields for a disposal/recovery code entry
 * @param {Object} codeEntry - The disposal/recovery code entry
 * @param {string} codeKeyBase - The base key path for warnings
 * @returns {Array} Array of validation warnings for weight fields
 */
const validateWeightFields = (codeEntry, codeKeyBase) => {
  const warnings = []

  if (!codeEntry.weight) {
    warnings.push({
      key: `${codeKeyBase}.weight`,
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: `Weight is required for Disposal/Recovery code: ${codeEntry.code || 'UNKNOWN'}`
    })
    return warnings
  }

  // Check individual weight fields
  if (!codeEntry.weight.metric) {
    warnings.push({
      key: `${codeKeyBase}.weight.metric`,
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: 'Weight metric is required'
    })
  }

  if (
    codeEntry.weight.amount === undefined ||
    codeEntry.weight.amount === null
  ) {
    warnings.push({
      key: `${codeKeyBase}.weight.amount`,
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: 'Weight amount is required'
    })
  }

  if (
    codeEntry.weight.isEstimate === undefined ||
    codeEntry.weight.isEstimate === null
  ) {
    warnings.push({
      key: `${codeKeyBase}.weight.isEstimate`,
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: 'Weight estimate flag is required'
    })
  }

  return warnings
}

/**
 * Generate validation warnings for disposal/recovery codes
 * @param {Object} payload - The request payload
 * @returns {Array} Array of validation warnings
 */
export const generateDisposalRecoveryWarnings = (payload) => {
  const warnings = []

  // Check if wasteItems exist
  if (!payload.wasteItems || !Array.isArray(payload.wasteItems)) {
    warnings.push({
      key: 'wasteItems[0].disposalOrRecoveryCodes',
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: VALIDATION_MESSAGES.DISPOSAL_RECOVERY_REQUIRED
    })
    return warnings
  }

  // Check if any waste item has disposal/recovery codes
  let hasAnyDisposalOrRecoveryCodes = false

  payload.wasteItems.forEach((wasteItem, wasteItemIndex) => {
    // Check if this waste item has valid disposal/recovery codes
    if (!hasValidDisposalRecoveryCodes(wasteItem)) {
      const message = !wasteItem.disposalOrRecoveryCodes
        ? VALIDATION_MESSAGES.DISPOSAL_RECOVERY_REQUIRED
        : 'At least one Disposal or Recovery code must be specified with associated weight'

      warnings.push({
        key: `wasteItems[${wasteItemIndex}].disposalOrRecoveryCodes`,
        errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
        message
      })
      return
    }

    hasAnyDisposalOrRecoveryCodes = true

    // Check each disposal/recovery code entry for this waste item
    // Note: Missing codes and quantities are handled by schema validation (rejection)
    // This warning logic only handles cases where the request passes schema validation
    // but still has business rule violations that should generate warnings
    wasteItem.disposalOrRecoveryCodes.forEach((codeEntry, codeIndex) => {
      const codeKeyBase = `wasteItems[${wasteItemIndex}].disposalOrRecoveryCodes[${codeIndex}]`

      // Check if code is missing (this should be caught by schema validation)
      if (!codeEntry.code) {
        warnings.push({
          key: `${codeKeyBase}.code`,
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Disposal or Recovery code is required for each entry'
        })
      }

      // Validate weight fields
      warnings.push(...validateWeightFields(codeEntry, codeKeyBase))
    })
  })

  // If no waste items have disposal/recovery codes at all, add a general warning
  if (!hasAnyDisposalOrRecoveryCodes && warnings.length === 0) {
    warnings.push({
      key: VALIDATION_KEYS.RECEIPT_DISPOSAL_RECOVERY_CODES,
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message: VALIDATION_MESSAGES.DISPOSAL_RECOVERY_REQUIRED
    })
  }

  return warnings
}

/**
 * Generate warnings for hazardous consignment code conditions.
 * If any EWC code is hazardous and hazardousWasteConsignmentCode is blank,
 * then reasonForNoConsignmentCode must be provided; otherwise add a warning.
 * @param {Object} payload
 * @returns {Array}
 */
export const generateHazardousConsignmentWarnings = (payload) => {
  const warnings = []

  if (!Array.isArray(payload?.wasteItems)) {
    return warnings
  }

  if (!hasHazardousEwcCodes(payload)) {
    return warnings
  }

  const code = payload.hazardousWasteConsignmentCode
  const reason = payload.reasonForNoConsignmentCode

  // If consignment code is blank, reason must be provided
  if (!code && !reason) {
    warnings.push({
      key: VALIDATION_KEYS.REASON_NO_CONSIGNMENT_CODE,
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message:
        'Reason for no Consignment Note Code is required when hazardous EWC codes are present'
    })
  }

  return warnings
}

/**
 * Generate warnings for POPs/Hazardous components
 *
 * item   contains<Haz/Pops>	sourceOfComponents	                    components			                          expected outcome
 * 16     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   []                                        WARNING
 * 18     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   [{ name: 'Aldrin' }]                      WARNING
 *
 * @param {Object} payload - The request payload
 * @returns {Array} Array of validation warnings for POPs
 */
export const generatePopAndHazardousComponentWarnings = (
  payload,
  popsOrHazardous
) => {
  if (!['POPs', 'Hazardous'].includes(popsOrHazardous)) {
    throw new Error('Expecting popsOrHazardous to be one of: POPs, Hazardous')
  }

  const warnings = []
  const popsOrHazardousObjectProperty = String(popsOrHazardous).toLowerCase()
  const containsPopsOrHazardousField = `contains${String(popsOrHazardous).charAt(0).toUpperCase()}${String(popsOrHazardous).toLowerCase().slice(1)}`

  if (!Array.isArray(payload?.wasteItems)) {
    return warnings
  }

  payload.wasteItems.forEach((wasteItem, index) => {
    if (
      !wasteItem[popsOrHazardousObjectProperty]?.[containsPopsOrHazardousField]
    ) {
      return
    }

    const sourceOfComponents =
      wasteItem[popsOrHazardousObjectProperty].sourceOfComponents
    const components = wasteItem[popsOrHazardousObjectProperty].components

    if (sourceOfComponents === 'NOT_PROVIDED') {
      return
    }

    // Check if source is one of the values that expects components
    if (isPopOrHazardousComponentsEmpty(components)) {
      warnings.push({
        key: `wasteItems[${index}].${popsOrHazardousObjectProperty}.components`,
        errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
        message: `${popsOrHazardous} components are recommended when source of components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`
      })
    }

    if (isPopOrHazardousConcentrationMissing(components)) {
      warnings.push({
        key: `wasteItems[${index}].${popsOrHazardousObjectProperty}.components`,
        errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
        message: `${popsOrHazardous} concentration is recommended when source of components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`
      })
    }
  })

  return warnings
}

/**
 * Determines if POPs/Hazardous components is an empty array
 * @param {Object} components - The POPs/Hazardous components
 * @returns {Boolean} True if POPs/Hazardous components array is empty, otherwisse false
 */
function isPopOrHazardousComponentsEmpty(components) {
  console.log({ components, isArray: Array.isArray(components) })
  return (
    (Array.isArray(components) && components.length === 0) ||
    !Array.isArray(components)
  )
}

/**
 * Determines if any of the POPs/Hazardous components has a missing concentration value
 * @param {Object} components - The POPs/Hazardous components
 * @returns {Boolean} True if any of the POPs/Hazardous components has a missing concentration value, otherwise false
 */
function isPopOrHazardousConcentrationMissing(components) {
  return (
    !isPopOrHazardousComponentsEmpty(components) &&
    components.some(
      (component) =>
        component.concentration === undefined ||
        component.concentration === null
    )
  )
}

/**
 * Generate all validation warnings for a movement request
 * @param {Object} payload - The request payload
 * @returns {Array} Array of all validation warnings
 */
export const generateAllValidationWarnings = (payload) => {
  const warnings = []

  // Add disposal/recovery code warnings
  const disposalRecoveryWarnings = generateDisposalRecoveryWarnings(payload)
  warnings.push(...disposalRecoveryWarnings)

  // Add hazardous consignment related warnings
  const consignmentWarnings = generateHazardousConsignmentWarnings(payload)
  warnings.push(...consignmentWarnings)

  // Add POPs components warnings
  const popsWarnings = generatePopAndHazardousComponentWarnings(payload, 'POPs')
  warnings.push(...popsWarnings)

  // Add Hazardous components warnings
  const hazardousWarnings = generatePopAndHazardousComponentWarnings(
    payload,
    'Hazardous'
  )
  warnings.push(...hazardousWarnings)

  return warnings
}
