import { REASONS_FOR_NO_REGISTRATION_NUMBER } from '../../../constants/reasons-for-no-registration-number.js'
import { VALIDATION_WARNING_TYPES } from '../../../constants/validation-warning-messages.js'
import { processValidationWarnings } from '../validation-warnings.js'
import { reasonForNoRegistrationNumberWarningValidators } from './reason-for-no-registration-number.js'

describe('Reason For No Registration Number Validation Warnings', () => {
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
