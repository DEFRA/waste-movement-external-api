import Joi from 'joi'
import { isValidEwcCode } from '../common/constants/ewc-codes.js'
import { isValidPopName } from '../common/constants/pop-names.js'
import { weightSchema } from './weight.js'
import { isValidContainerType } from '../common/constants/container-types.js'
import { validHazCodes } from '../common/constants/haz-codes.js'
import { DISPOSAL_OR_RECOVERY_CODES } from '../common/constants/treatment-codes.js'
import { validSourceOfComponents } from '../common/constants/source-of-components.js'

const MAX_EWC_CODES_COUNT = 5
const CUSTOM_ERROR_TYPE = 'any.custom'
const ANY_REQUIRED_ERROR_MESSAGE = '{{ #label }} is required'

const disposalOrRecoveryCodeSchema = Joi.object({
  code: Joi.string()
    .valid(...DISPOSAL_OR_RECOVERY_CODES)
    .required(),
  weight: weightSchema.required()
}).label('DisposalOrRecoveryCode')

const hasComponents = (components) =>
  Array.isArray(components) && components.length > 0

const validatePopOrHazardousPresence = (value, helpers) => {
  const { sourceOfComponents, components } = value

  if (sourceOfComponents === 'NOT_PROVIDED') {
    if (hasComponents(components)) {
      return helpers.error('any.componentsNotAllowed')
    }

    return value
  }

  // For other sources (CARRIER_PROVIDED, GUIDANCE, OWN_TESTING),
  // components are recommended but not required - warnings are handled separately
  // This allows the submission to pass validation even without components

  return value
}

const validatePopOrHazardousAbsence = (value, helpers) => {
  // This function is called when containsPops/containsHazardous is false
  // When POPs/Hazardous are not present, no component details should be provided at all
  // This includes empty objects, as per business requirements
  if (hasComponents(value.components)) {
    return helpers.error('any.containsPopsHazardousFalse')
  }

  return value
}

const sourceOfComponentsSchema = (fieldName) =>
  Joi.string()
    .valid(...Object.values(validSourceOfComponents))
    .when(fieldName, {
      is: true,
      then: Joi.required().messages({
        'any.required': '{{ #label }} is required when components are present'
      })
    })

const concentrationSchema = () =>
  Joi.custom((value, helpers) => {
    if (typeof value === 'number') {
      if (value < 0) {
        return helpers.error('number.min')
      }
      return value
    }

    if (typeof value === 'string') {
      return helpers.error(CUSTOM_ERROR_TYPE)
    }

    // Any other type is invalid
    return helpers.error(CUSTOM_ERROR_TYPE)
  })
    .allow(null)
    .messages({
      'any.required': ANY_REQUIRED_ERROR_MESSAGE,
      'any.custom': '{{ #label }} must be a valid number',
      'number.min': '{{ #label }} concentration cannot be negative'
    })

const popsSchema = Joi.object({
  containsPops: Joi.boolean().required().messages({
    'any.required': ANY_REQUIRED_ERROR_MESSAGE
  }),
  sourceOfComponents: sourceOfComponentsSchema('containsPops'),
  components: Joi.array()
    .items(
      Joi.object({
        name: Joi.string()
          .empty('')
          .empty(null)
          .custom((value, helpers) => {
            if (!isValidPopName(value)) {
              return helpers.error('any.invalid')
            }
            return value
          })
          .required()
          .messages({
            'any.required': ANY_REQUIRED_ERROR_MESSAGE,
            'any.invalid': '{{ #label }} is not valid'
          }),
        concentration: concentrationSchema()
      }).label('PopComponent')
    )
    .empty(null)
    .when('containsPops', {
      is: true,
      then: Joi.when('sourceOfComponents', {
        is: 'NOT_PROVIDED',
        then: Joi.optional(),
        otherwise: Joi.required().messages({
          'any.required':
            '{{ #label }} is required when POPs components are present'
        })
      })
    })
})
  .empty(null)
  .custom((value, helpers) => {
    // Since containsPops is required and boolean, we can simplify
    return value.containsPops
      ? validatePopOrHazardousPresence(value, helpers)
      : validatePopOrHazardousAbsence(value, helpers)
  })
  .messages({
    'any.invalid': '{{ #label }} cannot be provided when POPs are not present',
    'any.componentsNotAllowed':
      'POPs components must not be provided when the source of components is NOT_PROVIDED',
    'pops.sourceNotAllowed':
      'Source of {{ #label }} can only be provided when POPs are present',
    'any.containsPopsHazardousFalse':
      'POPs components must not be provided when POPs components are not present'
  })
  .label('Pops')

const hazardousSchema = Joi.object({
  containsHazardous: Joi.boolean().required().messages({
    'any.required':
      'Hazardous waste is any waste that is potentially harmful to human health or the environment.'
  }),
  sourceOfComponents: sourceOfComponentsSchema('containsHazardous'),
  hazCodes: Joi.array()
    .items(Joi.string().valid(...validHazCodes))
    .custom((value) => {
      // Automatically deduplicate HP codes if duplicates exist
      if (value && value.length > 0) {
        return [...new Set(value)]
      }
      return value
    }, 'HP codes deduplication')
    .optional()
    .label('HazardCodes'),
  components: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().empty('').empty(null).required().messages({
          'any.required': ANY_REQUIRED_ERROR_MESSAGE,
          'any.invalid': '{{ #label }} is not valid'
        }),
        concentration: concentrationSchema()
      }).label('ComponentItem')
    )
    .empty(null)
    .when('containsHazardous', {
      is: true,
      then: Joi.when('sourceOfComponents', {
        is: 'NOT_PROVIDED',
        then: Joi.optional(),
        otherwise: Joi.required().messages({
          'any.required':
            '{{ #label }} is required when Hazardous components are present'
        })
      })
    })
})
  .empty(null)
  .custom((value, helpers) => {
    // Since containsHazardous is required and boolean, we can simplify
    return value.containsHazardous
      ? validatePopOrHazardousPresence(value, helpers)
      : validatePopOrHazardousAbsence(value, helpers)
  })
  .messages({
    'any.invalid':
      '{{ #label }} cannot be provided when Hazardous components are not present',
    'any.componentsNotAllowed':
      'Hazardous components must not be provided when the source of components is NOT_PROVIDED',
    'pops.sourceNotAllowed':
      '{{ #label }} can only be provided when Hazardous components are present',
    'any.containsPopsHazardousFalse':
      'Hazardous components must not be provided when Hazardous components are not present'
  })
  .label('Hazardous')

function validateEwcCode(value, helpers) {
  // Check if it's a 6-digit numeric code
  if (!/^\d{6}$/.test(value)) {
    return helpers.error('string.ewcCodeFormat', { value })
  }

  // Check if it's in the list of valid EWC codes
  if (!isValidEwcCode(value)) {
    return helpers.error('string.ewcCodeInvalid', { value })
  }

  return value
}

function validateContainerType(value, helpers) {
  // Check if it's in the list of valid container types
  if (!isValidContainerType(value)) {
    return helpers.error('string.containerTypeInvalid', { value })
  }

  return value
}

export const wasteItemsSchema = Joi.object({
  ewcCodes: Joi.array()
    .items(
      Joi.string().custom(validateEwcCode, 'EWC code validation').messages({
        'string.ewcCodeFormat':
          '{{#label}} must be a valid 6-digit numeric code',
        'string.ewcCodeInvalid':
          '{{#label}} must be a valid EWC code from the official list'
      })
    )
    .required()
    .max(MAX_EWC_CODES_COUNT)
    .messages({
      'array.max': '{{#label}} must contain no more than 5 EWC codes'
    }),
  wasteDescription: Joi.string().required(),
  physicalForm: Joi.string()
    .valid('Gas', 'Liquid', 'Solid', 'Powder', 'Sludge', 'Mixed')
    .required(),
  numberOfContainers: Joi.number().required().min(0),
  typeOfContainers: Joi.string()
    .required()
    .custom(validateContainerType, 'Container type validation')
    .messages({
      'string.containerTypeInvalid': '{{#label}} must be a valid container type'
    }),
  weight: weightSchema,
  pops: popsSchema,
  hazardous: hazardousSchema,
  disposalOrRecoveryCodes: Joi.array().items(disposalOrRecoveryCodeSchema)
}).label('Waste')
