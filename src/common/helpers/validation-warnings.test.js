import {
  VALIDATION_ERROR_TYPES,
  generateDisposalRecoveryWarnings,
  generateAllValidationWarnings
} from './validation-warnings.js'

describe('Validation Warnings', () => {
  describe('VALIDATION_ERROR_TYPES', () => {
    it('should export the correct error types', () => {
      expect(VALIDATION_ERROR_TYPES.NOT_PROVIDED).toBe('NotProvided')
      expect(VALIDATION_ERROR_TYPES.TBC).toBe('TBC')
    })
  })

  describe('generateDisposalRecoveryWarnings', () => {
    it('should return empty array when payload has valid disposal/recovery codes', () => {
      const payload = {
        disposalOrRecoveryCodes: [
          {
            code: 'R1',
            weight: {
              metric: 'Tonnes',
              amount: 10,
              isEstimate: false
            }
          }
        ]
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([])
    })

    it('should generate warning when receipt section is missing', () => {
      const payload = {
        receivingSiteId: 'site123'
        // No receipt section
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message:
            'Disposal or Recovery codes are required for proper waste tracking and compliance'
        }
      ])
    })

    it('should generate warning when disposalOrRecoveryCodes is missing', () => {
      const payload = {
        receipt: {
          // No disposalOrRecoveryCodes
        }
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message:
            'Disposal or Recovery codes are required for proper waste tracking and compliance'
        }
      ])
    })

    it('should generate warning when disposalOrRecoveryCodes array is empty', () => {
      const payload = {
        disposalOrRecoveryCodes: []
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message:
            'At least one Disposal or Recovery code must be specified with associated weight'
        }
      ])
    })

    it('should generate warning when code is missing in an entry', () => {
      const payload = {
        disposalOrRecoveryCodes: [
          {
            // Missing code
            weight: {
              metric: 'Tonnes',
              amount: 10,
              isEstimate: false
            }
          }
        ]
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes[0].code',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Disposal or Recovery code is required for each entry'
        }
      ])
    })

    it('should generate warning when weight is missing in an entry', () => {
      const payload = {
        disposalOrRecoveryCodes: [
          {
            code: 'R1'
            // Missing quantity
          }
        ]
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes[0].weight',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight is required for Disposal/Recovery code: R1'
        }
      ])
    })

    it('should generate warning when weight is missing and code is also missing', () => {
      const payload = {
        disposalOrRecoveryCodes: [
          {
            code: null
            // Missing quantity
          }
        ]
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes[0].code',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Disposal or Recovery code is required for each entry'
        },
        {
          key: 'receipt.disposalOrRecoveryCodes[0].weight',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight is required for Disposal/Recovery code: UNKNOWN'
        }
      ])
    })

    it('should generate warning when weight metric is missing', () => {
      const payload = {
        disposalOrRecoveryCodes: [
          {
            code: 'R1',
            weight: {
              // Missing metric
              amount: 10,
              isEstimate: false
            }
          }
        ]
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes[0].weight.metric',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight metric is required'
        }
      ])
    })

    it('should generate warning when weight amount is undefined', () => {
      const payload = {
        disposalOrRecoveryCodes: [
          {
            code: 'R1',
            weight: {
              metric: 'Tonnes',
              amount: undefined,
              isEstimate: false
            }
          }
        ]
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes[0].weight.amount',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight amount is required'
        }
      ])
    })

    it('should generate warning when weight amount is null', () => {
      const payload = {
        disposalOrRecoveryCodes: [
          {
            code: 'R1',
            weight: {
              metric: 'Tonnes',
              amount: null,
              isEstimate: false
            }
          }
        ]
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes[0].weight.amount',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight amount is required'
        }
      ])
    })

    it('should generate warning when weight isEstimate is undefined', () => {
      const payload = {
        disposalOrRecoveryCodes: [
          {
            code: 'R1',
            weight: {
              metric: 'Tonnes',
              amount: 10,
              isEstimate: undefined
            }
          }
        ]
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes[0].weight.isEstimate',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight estimate flag is required'
        }
      ])
    })

    it('should generate warning when weight isEstimate is null', () => {
      const payload = {
        disposalOrRecoveryCodes: [
          {
            code: 'R1',
            weight: {
              metric: 'Tonnes',
              amount: 10,
              isEstimate: null
            }
          }
        ]
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes[0].weight.isEstimate',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight estimate flag is required'
        }
      ])
    })

    it('should generate multiple warnings for multiple entries with issues', () => {
      const payload = {
        disposalOrRecoveryCodes: [
          {
            code: 'R1',
            weight: {
              metric: 'Tonnes',
              amount: 10,
              isEstimate: false
            }
          },
          {
            // Missing code and quantity
          },
          {
            code: 'D1',
            weight: {
              metric: 'Tonnes',
              amount: undefined,
              isEstimate: true
            }
          }
        ]
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes[1].code',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Disposal or Recovery code is required for each entry'
        },
        {
          key: 'receipt.disposalOrRecoveryCodes[1].weight',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight is required for Disposal/Recovery code: UNKNOWN'
        },
        {
          key: 'receipt.disposalOrRecoveryCodes[2].weight.amount',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight amount is required'
        }
      ])
    })

    it('should handle multiple weight field issues in the same entry', () => {
      const payload = {
        disposalOrRecoveryCodes: [
          {
            code: 'R1',
            weight: {
              // Missing metric, amount, and isEstimate
            }
          }
        ]
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes[0].weight.metric',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight metric is required'
        },
        {
          key: 'receipt.disposalOrRecoveryCodes[0].weight.amount',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight amount is required'
        },
        {
          key: 'receipt.disposalOrRecoveryCodes[0].weight.isEstimate',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight estimate flag is required'
        }
      ])
    })
  })

  describe('generateAllValidationWarnings', () => {
    it('should return empty array when no warnings are generated', () => {
      const payload = {
        disposalOrRecoveryCodes: [
          {
            code: 'R1',
            weight: {
              metric: 'Tonnes',
              amount: 10,
              isEstimate: false
            }
          }
        ]
      }

      const warnings = generateAllValidationWarnings(payload)
      expect(warnings).toEqual([])
    })

    it('should return disposal/recovery warnings when they exist', () => {
      const payload = {
        disposalOrRecoveryCodes: []
      }

      const warnings = generateAllValidationWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message:
            'At least one Disposal or Recovery code must be specified with associated weight'
        }
      ])
    })

    it('should handle payload without receipt section', () => {
      const payload = {
        receivingSiteId: 'site123'
      }

      const warnings = generateAllValidationWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message:
            'Disposal or Recovery codes are required for proper waste tracking and compliance'
        }
      ])
    })
  })
})
