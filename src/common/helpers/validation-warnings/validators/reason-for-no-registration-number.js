import {
  CARRIER_WARNINGS,
  VALIDATION_WARNING_TYPES
} from '../../../constants/validation-warning-messages.js'

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
