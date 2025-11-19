import { popsAndHazardousComponentWarningTests } from '../../../test/common/pop-and-hazardous-components/pops-and-hazardous-components-warning-tests.js'
import { REASONS_FOR_NO_REGISTRATION_NUMBER } from '../../constants/reasons-for-no-registration-number.js'
import { VALIDATION_WARNING_TYPES } from '../../constants/validation-warning-messages.js'
import {
  generateAllValidationWarnings,
  processValidationWarnings
} from './validation-warnings.js'
import { v4 as uuidv4 } from 'uuid'
import {
  hazardousComponentsWarningValidators,
  popsComponentsWarningValidators
} from './validators/hazardous-and-pops-components.js'
import { disposalOrRecoveryCodesWarningValidators } from './validators/disposal-or-recovery-codes.js'
import { reasonForNoRegistrationNumberWarningValidators } from './validators/reason-for-no-registration-number.js'

// Test helpers
const createDisposalRecoveryPayload = (disposalOrRecoveryCodes) => ({
  wasteItems: [
    {
      ewcCodes: ['200101'],
      wasteDescription: 'Test waste',
      disposalOrRecoveryCodes
    }
  ]
})

const createWeightObject = (overrides = {}) => ({
  metric: 'Tonnes',
  amount: 10,
  isEstimate: false,
  ...overrides
})

const createExpectedWarning = (key, message) => ({
  key,
  errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
  message
})

describe('Validation Warnings', () => {
  describe('VALIDATION_WARNING_TYPES', () => {
    it('should export the correct error types', () => {
      expect(VALIDATION_WARNING_TYPES.NOT_PROVIDED).toBe('NotProvided')
      expect(VALIDATION_WARNING_TYPES.TBC).toBe('TBC')
    })
  })

  describe('Disposal or Recovery Code Warnings', () => {
    it('should return empty array when payload has valid disposal/recovery codes', () => {
      const payload = createDisposalRecoveryPayload([
        {
          code: 'R1',
          weight: createWeightObject()
        }
      ])

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([])
    })

    it('should generate warning when wasteItems are missing', () => {
      const payload = {
        apiCode: uuidv4()
        // No wasteItems section
      }

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes is required for proper waste tracking and compliance'
        }
      ])
    })

    it('should generate warning when disposalOrRecoveryCodes is missing from wasteItem', () => {
      const payload = {
        wasteItems: [
          {
            ewcCodes: ['200101'],
            wasteDescription: 'Test waste'
            // No disposalOrRecoveryCodes
          }
        ]
      }

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes is required for proper waste tracking and compliance'
        }
      ])
    })

    it('should generate warning when disposalOrRecoveryCodes array is empty', () => {
      const payload = createDisposalRecoveryPayload([])

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes is required for proper waste tracking and compliance'
        }
      ])
    })

    it('should generate warning when code is missing in an entry', () => {
      const payload = createDisposalRecoveryPayload([
        {
          // Missing code
          weight: createWeightObject()
        }
      ])

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes.0.code',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes[0].code is required for proper waste tracking and compliance'
        }
      ])
    })

    it('should generate warning when weight is missing in an entry', () => {
      const payload = createDisposalRecoveryPayload([
        {
          code: 'R1'
          // Missing weight
        }
      ])

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes.0.weight',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message: 'wasteItems[0].disposalOrRecoveryCodes[0].weight is required'
        }
      ])
    })

    it('should generate warning when weight is missing and code is also missing', () => {
      const payload = {
        wasteItems: [
          {
            ewcCodes: ['200101'],
            wasteDescription: 'Test waste',
            disposalOrRecoveryCodes: [
              {
                code: null
                // Missing quantity
              }
            ]
          }
        ]
      }

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes.0.code',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes[0].code is required for proper waste tracking and compliance'
        },
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes.0.weight',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message: 'wasteItems[0].disposalOrRecoveryCodes[0].weight is required'
        }
      ])
    })

    it('should generate warning when weight metric is missing', () => {
      const payload = {
        wasteItems: [
          {
            ewcCodes: ['200101'],
            wasteDescription: 'Test waste',
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
        ]
      }

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes.0.weight.metric',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes[0].weight.metric is required'
        }
      ])
    })

    // Test weight field validation using parameterized approach
    it.each([
      {
        field: 'amount',
        value: undefined,
        message:
          'wasteItems[0].disposalOrRecoveryCodes[0].weight.amount is required'
      },
      {
        field: 'amount',
        value: null,
        message:
          'wasteItems[0].disposalOrRecoveryCodes[0].weight.amount is required'
      },
      {
        field: 'isEstimate',
        value: undefined,
        message:
          'wasteItems[0].disposalOrRecoveryCodes[0].weight.isEstimate flag is required'
      },
      {
        field: 'isEstimate',
        value: null,
        message:
          'wasteItems[0].disposalOrRecoveryCodes[0].weight.isEstimate flag is required'
      }
    ])(
      'should generate warning when weight $field is $value',
      ({ field, value, message }) => {
        const payload = createDisposalRecoveryPayload([
          {
            code: 'R1',
            weight: createWeightObject({ [field]: value })
          }
        ])

        const warnings = processValidationWarnings(
          payload,
          disposalOrRecoveryCodesWarningValidators
        )
        expect(warnings).toEqual([
          createExpectedWarning(
            `wasteItems.0.disposalOrRecoveryCodes.0.weight.${field}`,
            message
          )
        ])
      }
    )

    it('should generate multiple warnings for multiple entries with issues', () => {
      const payload = {
        wasteItems: [
          {
            ewcCodes: ['200101'],
            wasteDescription: 'Test waste',
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
        ]
      }

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes.1.code',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes[1].code is required for proper waste tracking and compliance'
        },
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes.1.weight',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message: 'wasteItems[0].disposalOrRecoveryCodes[1].weight is required'
        },
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes.2.weight.amount',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes[2].weight.amount is required'
        }
      ])
    })

    it('should handle multiple weight field issues in the same entry', () => {
      const payload = {
        wasteItems: [
          {
            ewcCodes: ['200101'],
            wasteDescription: 'Test waste',
            disposalOrRecoveryCodes: [
              {
                code: 'R1',
                weight: {
                  // Missing metric, amount, and isEstimate
                }
              }
            ]
          }
        ]
      }

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes.0.weight.metric',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes[0].weight.metric is required'
        },
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes.0.weight.amount',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes[0].weight.amount is required'
        },
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes.0.weight.isEstimate',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes[0].weight.isEstimate flag is required'
        }
      ])
    })
  })

  popsAndHazardousComponentWarningTests('POPs', popsComponentsWarningValidators)
  popsAndHazardousComponentWarningTests(
    'Hazardous',
    hazardousComponentsWarningValidators
  )

  describe('Reason For No Registration Number Warnings', () => {
    it('should return empty array when registrationNumber is provided and reasonForNoRegistrationNumber is not provided - valid scenario', () => {
      const payload = {
        carrier: {
          registrationNumber: 'CBDU123456',
          reasonForNoRegistrationNumber: undefined
        }
      }

      const warnings = processValidationWarnings(
        payload,
        reasonForNoRegistrationNumberWarningValidators
      )
      expect(warnings).toEqual([])
    })

    it('should return empty array when registrationNumber is not provided and reasonForNoRegistrationNumber is provided - valid scenario', () => {
      const payload = {
        carrier: {
          registrationNumber: undefined,
          reasonForNoRegistrationNumber: REASONS_FOR_NO_REGISTRATION_NUMBER[0]
        }
      }

      const warnings = processValidationWarnings(
        payload,
        reasonForNoRegistrationNumberWarningValidators
      )
      expect(warnings).toEqual([])
    })

    it('should return empty array when neither registrationNumber or reasonForNoRegistrationNumber are provided - error scenario', () => {
      const payload = {
        carrier: {
          registrationNumber: undefined,
          reasonForNoRegistrationNumber: undefined
        }
      }

      const warnings = processValidationWarnings(
        payload,
        reasonForNoRegistrationNumberWarningValidators
      )
      expect(warnings).toEqual([])
    })

    it('should return empty array when both registrationNumber and reasonForNoRegistrationNumber are provided - error scenario', () => {
      const payload = {
        carrier: {
          registrationNumber: 'CBDU123456',
          reasonForNoRegistrationNumber: REASONS_FOR_NO_REGISTRATION_NUMBER[0]
        }
      }

      const warnings = processValidationWarnings(
        payload,
        reasonForNoRegistrationNumberWarningValidators
      )
      expect(warnings).toEqual([])
    })

    it.each([null, '', ...REASONS_FOR_NO_REGISTRATION_NUMBER])(
      'should return empty array when registrationNumber is not provided and reasonForNoRegistrationNumber is "%s" - error scenario',
      (value) => {
        const payload = {
          carrier: {
            registrationNumber: undefined,
            reasonForNoRegistrationNumber: value
          }
        }

        const warnings = processValidationWarnings(
          payload,
          reasonForNoRegistrationNumberWarningValidators
        )
        expect(warnings).toEqual([])
      }
    )

    it.each([null, ''])(
      'should generate warning when registrationNumber is "null" and reasonForNoRegistrationNumber is "%s"',
      (value) => {
        const payload = {
          carrier: {
            registrationNumber: null,
            reasonForNoRegistrationNumber: value
          }
        }

        const warnings = processValidationWarnings(
          payload,
          reasonForNoRegistrationNumberWarningValidators
        )
        expect(warnings).toEqual([
          {
            key: 'carrier.reasonForNoRegistrationNumber',
            errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
            message: `carrier.reasonForNoRegistrationNumber must be one of: ${REASONS_FOR_NO_REGISTRATION_NUMBER.join(', ')}`
          }
        ])
      }
    )

    it.each([null, ''])(
      'should generate warning when registrationNumber is "" and reasonForNoRegistrationNumber is "%s"',
      (value) => {
        const payload = {
          carrier: {
            registrationNumber: '',
            reasonForNoRegistrationNumber: value
          }
        }

        const warnings = processValidationWarnings(
          payload,
          reasonForNoRegistrationNumberWarningValidators
        )
        expect(warnings).toEqual([
          {
            key: 'carrier.reasonForNoRegistrationNumber',
            errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
            message: `carrier.reasonForNoRegistrationNumber must be one of: ${REASONS_FOR_NO_REGISTRATION_NUMBER.join(', ')}`
          }
        ])
      }
    )
  })

  describe('generateAllValidationWarnings', () => {
    it('should return empty array when no warnings are generated', () => {
      const payload = {
        wasteItems: [
          {
            ewcCodes: ['200101'],
            wasteDescription: 'Test waste',
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
        ],
        carrier: {
          registrationNumber: 'CBDU123456'
        }
      }

      const warnings = generateAllValidationWarnings(payload)
      expect(warnings).toEqual([])
    })

    it('should return disposal/recovery warnings when they exist', () => {
      const payload = {
        wasteItems: [
          {
            ewcCodes: ['200101'],
            wasteDescription: 'Test waste',
            disposalOrRecoveryCodes: []
          }
        ]
      }

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes is required for proper waste tracking and compliance'
        }
      ])
    })

    it('should handle payload without wasteItems section', () => {
      const payload = {
        apiCode: uuidv4()
      }

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes is required for proper waste tracking and compliance'
        }
      ])
    })

    it('should generate warning when no wasteItems have disposalOrRecoveryCodes', () => {
      const payload = {
        wasteItems: [
          {
            ewcCodes: ['200101'],
            wasteDescription: 'Test waste'
            // No disposalOrRecoveryCodes
          },
          {
            ewcCodes: ['200102'],
            wasteDescription: 'Another test waste'
            // No disposalOrRecoveryCodes
          }
        ]
      }

      const warnings = processValidationWarnings(
        payload,
        disposalOrRecoveryCodesWarningValidators
      )
      expect(warnings).toEqual([
        {
          key: 'wasteItems.0.disposalOrRecoveryCodes',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[0].disposalOrRecoveryCodes is required for proper waste tracking and compliance'
        },
        {
          key: 'wasteItems.1.disposalOrRecoveryCodes',
          errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
          message:
            'wasteItems[1].disposalOrRecoveryCodes is required for proper waste tracking and compliance'
        }
      ])
    })
  })
})
