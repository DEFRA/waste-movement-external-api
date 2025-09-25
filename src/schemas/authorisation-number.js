import Joi from 'joi'

/**
 * UK Site Authorization Number Validation
 *
 * Validates site waste authorization numbers across all UK nations.
 * All nation formats are accepted without nation-specific validation.
 */

// England patterns
const ENGLAND_PATTERNS = [
  /^[A-Z]{2}\d{4}[A-Z]{2}$/i, // XX9999XX
  /^[A-Z]{2}\d{4}[A-Z]{2}\/D\d{4}$/i, // XX9999XX/D9999
  /^EPR\/[A-Z]{2}\d{4}[A-Z]{2}$/i, // EPR/XX9999XX
  /^EPR\/[A-Z]{2}\d{4}[A-Z]{2}\/D\d{4}$/i, // EPR/XX9999XX/D9999
  /^EAWML\d{6}$/i, // EAWML999999
  /^WML\d{6}$/i // WML999999
]

// Scotland (SEPA) patterns
const SCOTLAND_PATTERNS = [
  /^PPC\/[AWEN]\/\d{7}$/i, // PPC/A/9999999
  /^WML\/[LWEN]\/\d{7}$/i, // WML/L/9999999
  /^PPC\/A\/SEPA\d{4}-\d{4}$/i, // PPC/A/SEPA9999-9999
  /^WML\/L\/SEPA\d{4}-\d{4}$/i, // WML/L/SEPA9999-9999
  /^EAS\/P\/\d{6}$/i // EAS/P/999999
]

// Wales (NRW) patterns - shares patterns with England
const WALES_PATTERNS = [
  /^[A-Z]{2}\d{4}[A-Z]{2}$/i, // XX9999XX
  /^EPR\/[A-Z]{2}\d{4}[A-Z]{2}$/i // EPR/XX9999XX
]

// Northern Ireland patterns
const NI_PATTERNS = [
  /^P\d{4}\/\d{2}[A-Z]$/i, // P9999/99X
  /^WPPC \d{2}\/\d{2}$/i // WPPC 99/99
]

// Combine all patterns for validation
const ALL_PATTERNS = [
  ...ENGLAND_PATTERNS,
  ...SCOTLAND_PATTERNS,
  ...WALES_PATTERNS,
  ...NI_PATTERNS
]

/**
 * Validates a site authorization number against all UK nation formats
 */
const isValidAuthorisationNumber = (value) => {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()
  return ALL_PATTERNS.some((pattern) => pattern.test(trimmedValue))
}

/**
 * Joi schema for validating site authorization numbers
 */
export const authorisationNumberSchema = Joi.string()
  .custom((value, helpers) => {
    if (isValidAuthorisationNumber(value)) {
      return value
    }
    return helpers.error('authorisation.invalid')
  })
  .messages({
    'authorisation.invalid':
      'Site authorisation number must be in a valid UK format'
  })

/**
 * Joi schema for validating an array of authorization numbers
 */
export const authorisationNumbersArraySchema = Joi.array()
  .items(authorisationNumberSchema)
  .min(1)
  .required()
  .messages({
    'array.min': 'At least one site authorisation number is required',
    'any.required': 'Site authorisation number is required'
  })
