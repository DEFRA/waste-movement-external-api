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
    SITE_NAME: 'Test Receiver',
    EMAIL: 'receiver@example.com',
    PHONE: '01234567890'
  },

  AUTHORISATION_NUMBERS: {
    SIMPLE: 'HP3456XX',
    COMPLEX: 'EPR/AB1234CD/D6789',
    // Valid formats from acceptance criteria
    VALID: {
      ENGLAND_XX9999XX: 'HP3456XX',
      ENGLAND_LOWERCASE: 'hp3456xx',
      ENGLAND_WITH_DEPLOYMENT: 'EPR/AB1234CD/D6789',
      ENGLAND_EAWML: 'EAWML123456',
      ENGLAND_WML: 'WML987654',
      SCOTLAND_PPC_A: 'PPC/A/1234567',
      SCOTLAND_WML_L: 'WML/L/7654321',
      SCOTLAND_SEPA: 'PPC/A/SEPA1234-5678',
      SCOTLAND_EAS: 'EAS/P/123456',
      WALES_XX9999XX: 'NW1234CD',
      WALES_EPR: 'EPR/NW1234CD',
      NI_P_FORMAT: 'P1234/56A',
      NI_WPPC: 'WPPC 12/34',
      NI_P_WITH_VERSION: 'P1234/56A/V1',
      NI_WPPC_WITH_VERSION: 'WPPC 12/34/V2',
      NI_COMBINED: 'WML 07/61 LN/13/02/M/V2',
      NI_COMBINED_NO_SUFFIX: 'WML 07/61 LN/13/02',
      NI_COMBINED_PAC: 'WML 04/38 PAC/2014/WCL001'
    },
    // Invalid formats from acceptance criteria
    INVALID: {
      EAWML_WITH_DASH: 'EAWML-10001',
      GMB_FORMAT: 'GMB383838X',
      WEF_FORMAT: 'WEF1234567',
      PLAIN_TEXT: 'INVALID-AUTH',
      NUMERIC_ONLY: '1234567890',
      // NI standalone formats (must be combined with WML reference)
      NI_WML_ALONE: 'WML 07/61',
      NI_WML_TRANSFER_ALONE: 'WML 19/36/T',
      NI_LN_ALONE: 'LN/13/02',
      NI_LN_WITH_SUFFIXES_ALONE: 'LN/13/02/M/V2',
      NI_PAC_ALONE: 'PAC/2014/WCL001'
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
      STRINGS: ['123RPS', 'RPS-123', 'RPS12A3', '111'],
      NEGATIVE: [RPS_NEGATIVE_VALUE],
      ZERO: [RPS_ZERO_VALUE],
      DECIMAL: [RPS_DECIMAL_VALUE]
    }
  }
}
