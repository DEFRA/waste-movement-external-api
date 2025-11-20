import { VALIDATION_WARNING_TYPES } from '../../constants/validation-warning-messages.js'
import {
  generateAllValidationWarnings,
  processValidationWarnings
} from './validation-warnings.js'
import { v4 as uuidv4 } from 'uuid'
import { disposalOrRecoveryCodesWarningValidators } from './validators/disposal-or-recovery-codes.js'
import {
  hazardousComponentsWarningValidators,
  popsComponentsWarningValidators
} from './validators/pops-and-hazardous-components.js'
import { popsAndHazardousComponentWarningTests } from '../../../test/common/pop-and-hazardous-components/pops-and-hazardous-components-warning-tests.js'

describe('Validation Warnings', () => {
  describe('VALIDATION_WARNING_TYPES', () => {
    it('should export the correct error types', () => {
      expect(VALIDATION_WARNING_TYPES.NOT_PROVIDED).toBe('NotProvided')
      expect(VALIDATION_WARNING_TYPES.TBC).toBe('TBC')
    })
  })

  describe('POPs Components Validation Warnings', () => {
    popsAndHazardousComponentWarningTests(
      'POPs',
      popsComponentsWarningValidators
    )
  })

  describe('Hazardous Components Validation Warnings', () => {
    popsAndHazardousComponentWarningTests(
      'Hazardous',
      hazardousComponentsWarningValidators
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
