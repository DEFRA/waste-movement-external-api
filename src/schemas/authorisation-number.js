import Joi from 'joi'

/**
 * UK Site Authorization Number Validation
 *
 * This module validates site waste authorization numbers across all UK nations.
 * Each nation has specific format requirements that are documented below.
 *
 * Reference: Gov UK Bulk Data Transfer validation specifications
 */

// ============================================================================
// ENGLAND Authorization Formats
// ============================================================================
/**
 * England accepts the following authorization formats:
 * - Standard format: Two letters, four digits, two letters (e.g., HP3456XX)
 * - With deployment: Standard format with /D and four digits (e.g., AB1234CD/D5678)
 * - EPR prefixed: EPR/ followed by standard format (e.g., EPR/AB1234CD)
 * - EPR with deployment: EPR/ with standard format and deployment (e.g., EPR/AB1234CD/D5678)
 * - EAWML: Environment Agency Waste Management License (e.g., EAWML123456)
 * - WML: Waste Management License (e.g., WML987654)
 */
const ENGLAND_FORMAT_DEFINITIONS = {
  STANDARD: {
    pattern: /^[A-Z]{2}\d{4}[A-Z]{2}$/i,
    example: 'HP3456XX',
    description: 'Two letters, four digits, two letters'
  },
  STANDARD_WITH_DEPLOYMENT: {
    pattern: /^[A-Z]{2}\d{4}[A-Z]{2}\/D\d{4}$/i,
    example: 'AB1234CD/D5678',
    description: 'Standard format with deployment number'
  },
  EPR_STANDARD: {
    pattern: /^EPR\/[A-Z]{2}\d{4}[A-Z]{2}$/i,
    example: 'EPR/AB1234CD',
    description: 'Environmental Permitting Regulations format'
  },
  EPR_WITH_DEPLOYMENT: {
    pattern: /^EPR\/[A-Z]{2}\d{4}[A-Z]{2}\/D\d{4}$/i,
    example: 'EPR/AB1234CD/D5678',
    description: 'EPR format with deployment number'
  },
  EAWML: {
    pattern: /^EAWML\d{6}$/i,
    example: 'EAWML123456',
    description: 'Environment Agency Waste Management License'
  },
  WML: {
    pattern: /^WML\d{6}$/i,
    example: 'WML987654',
    description: 'Waste Management License'
  }
}

const ENGLAND_PATTERNS = Object.values(ENGLAND_FORMAT_DEFINITIONS).map(
  (def) => def.pattern
)

// ============================================================================
// SCOTLAND (SEPA) Authorization Formats
// ============================================================================
/**
 * Scotland (SEPA - Scottish Environment Protection Agency) accepts:
 * - PPC permits: Pollution Prevention and Control with various categories (A/W/E/N)
 * - WML permits: Waste Management License with various categories (L/W/E/N)
 * - SEPA reference numbers: Special format with SEPA prefix
 * - EAS permits: Environmental Authorisation Scotland
 */
const SCOTLAND_FORMAT_DEFINITIONS = {
  PPC_CATEGORY: {
    pattern: /^PPC\/[AWEN]\/\d{7}$/i,
    example: 'PPC/A/1234567',
    description: 'Pollution Prevention Control (categories: A/W/E/N)'
  },
  WML_CATEGORY: {
    pattern: /^WML\/[LWEN]\/\d{7}$/i,
    example: 'WML/L/7654321',
    description: 'Waste Management License (categories: L/W/E/N)'
  },
  PPC_SEPA_REF: {
    pattern: /^PPC\/A\/SEPA\d{4}-\d{4}$/i,
    example: 'PPC/A/SEPA1234-5678',
    description: 'PPC with SEPA reference number'
  },
  WML_SEPA_REF: {
    pattern: /^WML\/L\/SEPA\d{4}-\d{4}$/i,
    example: 'WML/L/SEPA1234-5678',
    description: 'WML with SEPA reference number'
  },
  EAS_PERMIT: {
    pattern: /^EAS\/P\/\d{6}$/i,
    example: 'EAS/P/123456',
    description: 'Environmental Authorisation Scotland permit'
  }
}

const SEPA_PATTERNS = Object.values(SCOTLAND_FORMAT_DEFINITIONS).map(
  (def) => def.pattern
)

// ============================================================================
// WALES (NRW) Authorization Formats
// ============================================================================
/**
 * Wales (Natural Resources Wales) accepts:
 * - Standard format: Same as England standard format
 * - EPR format: Environmental Permitting Regulations format
 */
const WALES_FORMAT_DEFINITIONS = {
  STANDARD: {
    pattern: /^[A-Z]{2}\d{4}[A-Z]{2}$/i,
    example: 'NW1234CD',
    description: 'Two letters, four digits, two letters'
  },
  EPR_STANDARD: {
    pattern: /^EPR\/[A-Z]{2}\d{4}[A-Z]{2}$/i,
    example: 'EPR/NW1234CD',
    description: 'Environmental Permitting Regulations format'
  }
}

const WALES_PATTERNS = Object.values(WALES_FORMAT_DEFINITIONS).map(
  (def) => def.pattern
)

// ============================================================================
// NORTHERN IRELAND Authorization Formats
// ============================================================================
/**
 * Northern Ireland accepts:
 * - P format: P followed by numbers and division (e.g., P1234/56A)
 * - WPPC format: Waste Prevention and Control permit (e.g., WPPC 12/34)
 */
const NI_FORMAT_DEFINITIONS = {
  P_FORMAT: {
    pattern: /^P\d{4}\/\d{2}[A-Z]$/i,
    example: 'P1234/56A',
    description: 'Permit number with division and letter suffix'
  },
  WPPC: {
    pattern: /^WPPC \d{2}\/\d{2}$/i,
    example: 'WPPC 12/34',
    description: 'Waste Prevention and Control permit'
  }
}

const NI_PATTERNS = Object.values(NI_FORMAT_DEFINITIONS).map(
  (def) => def.pattern
)

// ============================================================================
// Combined Patterns for Validation
// ============================================================================
const ALL_PATTERNS = [
  ...ENGLAND_PATTERNS,
  ...SEPA_PATTERNS,
  ...WALES_PATTERNS,
  ...NI_PATTERNS
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Identifies which nation and format type an authorization number belongs to
 * @param {string} value - The authorization number to identify
 * @returns {object|null} - Object with nation, format, example, and description, or null if invalid
 */
export const identifyAuthorisationFormat = (value) => {
  if (!value || typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()

  // Check each nation's formats
  const nations = [
    { name: 'England', formats: ENGLAND_FORMAT_DEFINITIONS },
    { name: 'Scotland', formats: SCOTLAND_FORMAT_DEFINITIONS },
    { name: 'Wales', formats: WALES_FORMAT_DEFINITIONS },
    { name: 'Northern Ireland', formats: NI_FORMAT_DEFINITIONS }
  ]

  for (const nation of nations) {
    for (const [formatName, definition] of Object.entries(nation.formats)) {
      if (definition.pattern.test(trimmedValue)) {
        return {
          nation: nation.name,
          format: formatName,
          example: definition.example,
          description: definition.description
        }
      }
    }
  }

  return null
}

/**
 * Gets all valid format examples grouped by nation
 * @returns {object} - Object with nation names as keys and arrays of examples as values
 */
export const getFormatExamples = () => {
  return {
    England: Object.values(ENGLAND_FORMAT_DEFINITIONS).map(
      (def) => def.example
    ),
    Scotland: Object.values(SCOTLAND_FORMAT_DEFINITIONS).map(
      (def) => def.example
    ),
    Wales: Object.values(WALES_FORMAT_DEFINITIONS).map((def) => def.example),
    'Northern Ireland': Object.values(NI_FORMAT_DEFINITIONS).map(
      (def) => def.example
    )
  }
}

/**
 * Validates a site authorization number against all UK nation formats
 * @param {string} value - The authorization number to validate
 * @returns {boolean} - True if the value matches any valid pattern
 */
const isValidAuthorisationNumber = (value) => {
  if (!value || typeof value !== 'string') {
    return false
  }

  // Remove any leading/trailing whitespace
  const trimmedValue = value.trim()

  // Check against all patterns
  return ALL_PATTERNS.some((pattern) => pattern.test(trimmedValue))
}

// ============================================================================
// Joi Schemas
// ============================================================================

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
