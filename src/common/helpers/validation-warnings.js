/**
 * Validation warning types as defined in the API specification
 */
export const VALIDATION_ERROR_TYPES = {
  NOT_PROVIDED: 'NotProvided',
  TBC: 'TBC'
}

/**
 * Generate validation warnings for disposal/recovery codes
 * @param {Object} payload - The request payload
 * @returns {Array} Array of validation warnings
 */
export const generateDisposalRecoveryWarnings = (payload) => {
  const warnings = []

  // Check if receipt section exists
  if (!payload.receipt) {
    warnings.push({
      key: 'receipt.disposalOrRecoveryCodes',
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message:
        'Disposal or Recovery codes are required for proper waste tracking and compliance'
    })
    return warnings
  }

  // Check if disposalOrRecoveryCodes array exists
  if (!payload.receipt.disposalOrRecoveryCodes) {
    warnings.push({
      key: 'receipt.disposalOrRecoveryCodes',
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message:
        'Disposal or Recovery codes are required for proper waste tracking and compliance'
    })
    return warnings
  }

  // Check if disposalOrRecoveryCodes array is empty
  if (payload.receipt.disposalOrRecoveryCodes.length === 0) {
    warnings.push({
      key: 'receipt.disposalOrRecoveryCodes',
      errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
      message:
        'At least one Disposal or Recovery code must be specified with associated quantity'
    })
    return warnings
  }

  // Check each disposal/recovery code entry
  // Note: Missing codes and quantities are handled by schema validation (rejection)
  // This warning logic only handles cases where the request passes schema validation
  // but still has business rule violations that should generate warnings
  payload.receipt.disposalOrRecoveryCodes.forEach((codeEntry, index) => {
    // Check if code is missing (this should be caught by schema validation)
    if (!codeEntry.code) {
      warnings.push({
        key: `receipt.disposalOrRecoveryCodes[${index}].code`,
        errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
        message: 'Disposal or Recovery code is required for each entry'
      })
    }

    // Check if quantity is missing (this should be caught by schema validation)
    if (!codeEntry.quantity) {
      warnings.push({
        key: `receipt.disposalOrRecoveryCodes[${index}].quantity`,
        errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
        message: `Quantity is required for Disposal/Recovery code: ${codeEntry.code || 'UNKNOWN'}`
      })
    } else {
      // Check if quantity has required fields (these should be caught by schema validation)
      if (!codeEntry.quantity.metric) {
        warnings.push({
          key: `receipt.disposalOrRecoveryCodes[${index}].quantity.metric`,
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Quantity metric is required'
        })
      }

      if (
        codeEntry.quantity.amount === undefined ||
        codeEntry.quantity.amount === null
      ) {
        warnings.push({
          key: `receipt.disposalOrRecoveryCodes[${index}].quantity.amount`,
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Quantity amount is required'
        })
      }

      if (
        codeEntry.quantity.isEstimate === undefined ||
        codeEntry.quantity.isEstimate === null
      ) {
        warnings.push({
          key: `receipt.disposalOrRecoveryCodes[${index}].quantity.isEstimate`,
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Quantity estimate flag is required'
        })
      }
    }
  })

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

  //Add other validation warnings as needed

  return warnings
}
