// Test data constants for RPS and receiver validation tests
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
      postCode: 'TE1 1ST'
    },
    INVALID_POSTCODE: {
      fullAddress: '1 Receiver St, Town',
      postCode: 'INVALID'
    },
    IRELAND: {
      fullAddress: '1 Receiver St, Dublin',
      postCode: 'P85 YH98'
    }
  },

  RPS: {
    VALID: {
      SINGLE: [123],
      MULTIPLE: [123, 1, 45],
      SEQUENCE: [1, 2, 3],
      LARGE: [123456],
      DEFAULT: [343]
    },
    INVALID: {
      STRINGS: ['123RPS', 'RPS-123', 'RPS12A3'],
      NEGATIVE: [-123],
      ZERO: [0],
      DECIMAL: [12.5]
    }
  }
}
