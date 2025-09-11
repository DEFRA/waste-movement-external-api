// Test data constants for RPS and receiver validation tests

// RPS number constants - representing typical regulatory position statement codes
const RPS_STANDARD = 123 // Standard RPS code for testing
const RPS_MINIMAL = 1 // Minimum valid RPS number
const RPS_ADDITIONAL_FIRST = 45 // Additional RPS code for multiple entries
const RPS_SEQUENCE_TWO = 2 // Sequential RPS number 2
const RPS_SEQUENCE_THREE = 3 // Sequential RPS number 3
const RPS_LARGE_VALUE = 123456 // Large valid RPS number
const RPS_DEFAULT_VALUE = 343 // Default RPS from OpenAPI example
const RPS_NEGATIVE_VALUE = -123 // Invalid negative RPS
const RPS_ZERO_VALUE = 0 // Invalid zero RPS
const RPS_DECIMAL_VALUE = 12.5 // Invalid decimal RPS

export const TEST_DATA = {
  RECEIVER: {
    ORGANISATION_NAME: 'Test Receiver',
    EMAIL: 'receiver@example.com',
    PHONE: '01234567890'
  },

  AUTHORISATION: {
    TYPE: 'permit',
    NUMBERS: {
      SIMPLE: 'EPR123',
      COMPLEX: 'EPR/AB1234CD'
    }
  },

  ADDRESS: {
    RECEIVER: {
      fullAddress: '1 Receiver St, Town',
      postcode: 'TE1 1ST'
    },
    INVALID_POSTCODE: {
      fullAddress: '1 Receiver St, Town',
      postcode: 'INVALID'
    },
    IRELAND: {
      fullAddress: '1 Receiver St, Dublin',
      postcode: 'P85 YH98'
    }
  },

  RPS: {
    VALID: {
      SINGLE: [RPS_STANDARD],
      MULTIPLE: [RPS_STANDARD, RPS_MINIMAL, RPS_ADDITIONAL_FIRST],
      SEQUENCE: [RPS_MINIMAL, RPS_SEQUENCE_TWO, RPS_SEQUENCE_THREE],
      LARGE: [RPS_LARGE_VALUE],
      DEFAULT: [RPS_DEFAULT_VALUE]
    },
    INVALID: {
      STRINGS: ['123RPS', 'RPS-123', 'RPS12A3'],
      NEGATIVE: [RPS_NEGATIVE_VALUE],
      ZERO: [RPS_ZERO_VALUE],
      DECIMAL: [RPS_DECIMAL_VALUE]
    }
  }
}
