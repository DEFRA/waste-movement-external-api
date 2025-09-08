import { hasHazardousEwcCodes } from '../../schemas/hazardous-waste-consignment.js'

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
  RECEIPT_DISPOSAL_RECOVERY_CODES: 'receipt.disposalOrRecoveryCodes',
  REASON_NO_CONSIGNMENT_CODE: 'receipt.reasonForNoConsignmentCode'
}

/**
 * Generate validation warnings for disposal/recovery codes
 * @param {Object} payload - The request payload
 * @returns {Array} Array of validation warnings
 */
export const generateDisposalRecoveryWarnings = (payload) => {
  const warnings = []

  // Check if disposalOrRecoveryCodes array exists
  if (!payload.disposalOrRecoveryCodes) {
    warnings.push({
      key: VALIDATION_KEYS.RECEIPT_DISPOSAL_RECOVERY_CODES,
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message:
        'Disposal or Recovery codes are required for proper waste tracking and compliance'
    })
    return warnings
  }

  // Check if disposalOrRecoveryCodes array is empty
  if (payload.disposalOrRecoveryCodes.length === 0) {
    warnings.push({
      key: VALIDATION_KEYS.RECEIPT_DISPOSAL_RECOVERY_CODES,
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message:
        'At least one Disposal or Recovery code must be specified with associated weight'
    })
    return warnings
  }

  // Check each disposal/recovery code entry
  // Note: Missing codes and quantities are handled by schema validation (rejection)
  // This warning logic only handles cases where the request passes schema validation
  // but still has business rule violations that should generate warnings
  payload.disposalOrRecoveryCodes.forEach((codeEntry, index) => {
    // Check if code is missing (this should be caught by schema validation)
    if (!codeEntry.code) {
      warnings.push({
        key: `${VALIDATION_KEYS.RECEIPT_DISPOSAL_RECOVERY_CODES}[${index}].code`,
        errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
        message: 'Disposal or Recovery code is required for each entry'
      })
    }

    // Check if weight is missing (this should be caught by schema validation)
    if (!codeEntry.weight) {
      warnings.push({
        key: `${VALIDATION_KEYS.RECEIPT_DISPOSAL_RECOVERY_CODES}[${index}].weight`,
        errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
        message: `Weight is required for Disposal/Recovery code: ${codeEntry.code || 'UNKNOWN'}`
      })
    } else {
      // Check if weight has required fields (these should be caught by schema validation)
      if (!codeEntry.weight.metric) {
        warnings.push({
          key: `${VALIDATION_KEYS.RECEIPT_DISPOSAL_RECOVERY_CODES}[${index}].weight.metric`,
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight metric is required'
        })
      }

      if (
        codeEntry.weight.amount === undefined ||
        codeEntry.weight.amount === null
      ) {
        warnings.push({
          key: `${VALIDATION_KEYS.RECEIPT_DISPOSAL_RECOVERY_CODES}[${index}].weight.amount`,
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight amount is required'
        })
      }

      if (
        codeEntry.weight.isEstimate === undefined ||
        codeEntry.weight.isEstimate === null
      ) {
        warnings.push({
          key: `${VALIDATION_KEYS.RECEIPT_DISPOSAL_RECOVERY_CODES}[${index}].weight.isEstimate`,
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight estimate flag is required'
        })
      }
    }
  })

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

  return warnings
}
