import { sourceOfComponentsProvided } from '../constants/source-of-components.js'
import {
  VALIDATION_ERROR_TYPES,
  generateDisposalRecoveryWarnings,
  generateAllValidationWarnings,
  generateSourceOfComponentsWarnings
} from './validation-warnings.js'
import { v4 as uuidv4 } from 'uuid'

// Test constants
const TEST_MESSAGES = {
  DISPOSAL_RECOVERY_REQUIRED:
    'Disposal or Recovery codes are required for proper waste tracking and compliance',
  AT_LEAST_ONE_REQUIRED:
    'At least one Disposal or Recovery code must be specified with associated weight',
  CODE_REQUIRED: 'Disposal or Recovery code is required for each entry',
  WEIGHT_METRIC_REQUIRED: 'Weight metric is required',
  WEIGHT_AMOUNT_REQUIRED: 'Weight amount is required',
  WEIGHT_ESTIMATE_FLAG_REQUIRED: 'Weight estimate flag is required'
}

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
  errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
  message
})

describe('Validation Warnings', () => {
  describe('VALIDATION_ERROR_TYPES', () => {
    it('should export the correct error types', () => {
      expect(VALIDATION_ERROR_TYPES.NOT_PROVIDED).toBe('NotProvided')
      expect(VALIDATION_ERROR_TYPES.TBC).toBe('TBC')
    })
  })

  describe('generateDisposalRecoveryWarnings', () => {
    it('should return empty array when payload has valid disposal/recovery codes', () => {
      const payload = createDisposalRecoveryPayload([
        {
          code: 'R1',
          weight: createWeightObject()
        }
      ])

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([])
    })

    it('should generate warning when wasteItems are missing', () => {
      const payload = {
        organisationApiId: uuidv4()
        // No wasteItems section
      }

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message:
            'Disposal or Recovery codes are required for proper waste tracking and compliance'
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

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message:
            'Disposal or Recovery codes are required for proper waste tracking and compliance'
        }
      ])
    })

    it('should generate warning when disposalOrRecoveryCodes array is empty', () => {
      const payload = createDisposalRecoveryPayload([])

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message:
            'At least one Disposal or Recovery code must be specified with associated weight'
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

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes[0].code',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Disposal or Recovery code is required for each entry'
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

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes[0].weight',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight is required for Disposal/Recovery code: R1'
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

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes[0].code',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Disposal or Recovery code is required for each entry'
        },
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes[0].weight',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight is required for Disposal/Recovery code: UNKNOWN'
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

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes[0].weight.metric',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight metric is required'
        }
      ])
    })

    // Test weight field validation using parameterized approach
    it.each([
      {
        field: 'amount',
        value: undefined,
        message: TEST_MESSAGES.WEIGHT_AMOUNT_REQUIRED
      },
      {
        field: 'amount',
        value: null,
        message: TEST_MESSAGES.WEIGHT_AMOUNT_REQUIRED
      },
      {
        field: 'isEstimate',
        value: undefined,
        message: TEST_MESSAGES.WEIGHT_ESTIMATE_FLAG_REQUIRED
      },
      {
        field: 'isEstimate',
        value: null,
        message: TEST_MESSAGES.WEIGHT_ESTIMATE_FLAG_REQUIRED
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

        const warnings = generateDisposalRecoveryWarnings(payload)
        expect(warnings).toEqual([
          createExpectedWarning(
            `wasteItems[0].disposalOrRecoveryCodes[0].weight.${field}`,
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

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes[1].code',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Disposal or Recovery code is required for each entry'
        },
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes[1].weight',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight is required for Disposal/Recovery code: UNKNOWN'
        },
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes[2].weight.amount',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight amount is required'
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

      const warnings = generateDisposalRecoveryWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes[0].weight.metric',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight metric is required'
        },
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes[0].weight.amount',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight amount is required'
        },
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes[0].weight.isEstimate',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: 'Weight estimate flag is required'
        }
      ])
    })
  })

  describe('generateSourceOfComponentsWarnings', () => {
    it.each([undefined, null])(
      'should return empty array when receipt payload is %s',
      (value) => {
        const payload = value

        const warnings = generateSourceOfComponentsWarnings(payload)
        expect(warnings).toEqual([])
      }
    )

    it.each([undefined, null])(
      'should return empty array when waste payload is %s',
      (value) => {
        const payload = {
          waste: value
        }

        const warnings = generateSourceOfComponentsWarnings(payload)
        expect(warnings).toEqual([])
      }
    )

    it.each([undefined, null])(
      'should return empty array when hazardous payload is %s',
      (value) => {
        const payload = {
          waste: {
            hazardous: value
          }
        }

        const warnings = generateSourceOfComponentsWarnings(payload)
        expect(warnings).toEqual([])
      }
    )

    it.each(Object.keys(sourceOfComponentsProvided))(
      'should return empty array when source of components is %s and hazardous components is provided',
      (value) => {
        const payload = {
          waste: {
            hazardous: {
              sourceOfComponents: value,
              components: [
                {
                  name: 'Mercury',
                  concentration: 30
                },
                {
                  name: 'Mercury',
                  concentration: 30
                }
              ]
            }
          }
        }

        const warnings = generateSourceOfComponentsWarnings(payload)
        expect(warnings).toEqual([])
      }
    )

    it.each(Object.keys(sourceOfComponentsProvided))(
      'should generate warning when source of components is %s and hazardous components is an empty array',
      (value) => {
        const payload = {
          waste: {
            hazardous: {
              sourceOfComponents: value,
              components: []
            }
          }
        }

        const warnings = generateSourceOfComponentsWarnings(payload)
        expect(warnings).toEqual([
          {
            key: 'wasteItems.hazardous.components',
            errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
            message: `Hazardous components must be provided with both name and concentration if source of components is one of: ${Object.keys(sourceOfComponentsProvided).join(', ')}`
          }
        ])
      }
    )

    it.each(Object.keys(sourceOfComponentsProvided))(
      'should generate warning when source of components is %s and hazardous components contains an empty object',
      (value) => {
        const payload = {
          waste: {
            hazardous: {
              sourceOfComponents: value,
              components: [
                {
                  name: 'Mercury',
                  concentration: 30
                },
                {}
              ]
            }
          }
        }

        const warnings = generateSourceOfComponentsWarnings(payload)
        expect(warnings).toEqual([
          {
            key: 'wasteItems.hazardous.components',
            errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
            message: `Hazardous components must be provided with both name and concentration if source of components is one of: ${Object.keys(sourceOfComponentsProvided).join(', ')}`
          }
        ])
      }
    )

    it.each(Object.keys(sourceOfComponentsProvided))(
      'should generate warning when source of components is %s and hazardous component name is undefined',
      (componentSource) => {
        const payload = {
          waste: {
            hazardous: {
              sourceOfComponents: componentSource,
              components: [
                {
                  name: 'Mercury',
                  concentration: 30
                },
                {
                  name: undefined,
                  concentration: 30
                }
              ]
            }
          }
        }

        const warnings = generateSourceOfComponentsWarnings(payload)
        expect(warnings).toEqual([
          {
            key: 'wasteItems.hazardous.components',
            errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
            message: `Hazardous components must be provided with both name and concentration if source of components is one of: ${Object.keys(sourceOfComponentsProvided).join(', ')}`
          }
        ])
      }
    )

    it.each(Object.keys(sourceOfComponentsProvided))(
      'should generate warning when source of components is %s and hazardous component name is an empty string',
      (componentSource) => {
        const payload = {
          waste: {
            hazardous: {
              sourceOfComponents: componentSource,
              components: [
                {
                  name: 'Mercury',
                  concentration: 30
                },
                {
                  name: '',
                  concentration: 30
                }
              ]
            }
          }
        }

        const warnings = generateSourceOfComponentsWarnings(payload)
        expect(warnings).toEqual([
          {
            key: 'wasteItems.hazardous.components',
            errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
            message: `Hazardous components must be provided with both name and concentration if source of components is one of: ${Object.keys(sourceOfComponentsProvided).join(', ')}`
          }
        ])
      }
    )

    it.each(Object.keys(sourceOfComponentsProvided))(
      'should generate warning when source of components is %s and hazardous component concentration is undefined',
      (componentSource) => {
        const payload = {
          waste: {
            hazardous: {
              sourceOfComponents: componentSource,
              components: [
                {
                  name: 'Mercury',
                  concentration: 30
                },
                {
                  name: 'Mercury',
                  concentration: undefined
                }
              ]
            }
          }
        }

        const warnings = generateSourceOfComponentsWarnings(payload)
        expect(warnings).toEqual([
          {
            key: 'wasteItems.hazardous.components',
            errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
            message: `Hazardous components must be provided with both name and concentration if source of components is one of: ${Object.keys(sourceOfComponentsProvided).join(', ')}`
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
        ]
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

      const warnings = generateAllValidationWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message:
            'At least one Disposal or Recovery code must be specified with associated weight'
        }
      ])
    })

    it('should handle payload without wasteItems section', () => {
      const payload = {
        organisationApiId: uuidv4()
      }

      const warnings = generateAllValidationWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message:
            'Disposal or Recovery codes are required for proper waste tracking and compliance'
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

      const warnings = generateAllValidationWarnings(payload)
      expect(warnings).toEqual([
        {
          key: 'wasteItems[0].disposalOrRecoveryCodes',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message:
            'Disposal or Recovery codes are required for proper waste tracking and compliance'
        },
        {
          key: 'wasteItems[1].disposalOrRecoveryCodes',
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message:
            'Disposal or Recovery codes are required for proper waste tracking and compliance'
        }
      ])
    })
  })
})
