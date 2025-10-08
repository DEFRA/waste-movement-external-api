import Joi from 'joi'
import { isValidEwcCode } from '../common/constants/ewc-codes.js'
import { isValidPopName } from '../common/constants/pop-names.js'
import { weightSchema } from './weight.js'
import { isValidContainerType } from '../common/constants/container-types.js'
import { validHazCodes } from '../common/constants/haz-codes.js'
import { DISPOSAL_OR_RECOVERY_CODES } from '../common/constants/treatment-codes.js'
import { validSourceOfComponents } from '../common/constants/source-of-components.js'
import {
  GENERIC_ERRORS,
  POPS_ERRORS,
  HAZARDOUS_ERRORS,
  WASTE_ERRORS
} from './validation-error-messages.js'

const MAX_EWC_CODES_COUNT = 5

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
        'any.required': POPS_ERRORS.SOURCE_REQUIRED_WHEN_PRESENT
      })
    })

const concentrationSchema = () => Joi.number().strict().positive().allow(null)

const popsSchema = Joi.object({
  containsPops: Joi.boolean().required(),
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
            'any.invalid': GENERIC_ERRORS.INVALID,
            'any.required': '{{#label}} is required' // Override to prevent parent message inheritance
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
          'any.required': POPS_ERRORS.COMPONENTS_REQUIRED
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
    'any.invalid': POPS_ERRORS.COMPONENTS_INVALID_WHEN_NOT_PRESENT,
    'any.componentsNotAllowed': POPS_ERRORS.COMPONENTS_NOT_ALLOWED_NOT_PROVIDED,
    'pops.sourceNotAllowed': POPS_ERRORS.SOURCE_NOT_ALLOWED,
    'any.containsPopsHazardousFalse': POPS_ERRORS.COMPONENTS_NOT_ALLOWED_FALSE
  })
  .label('Pops')

const deduplicateHazCodes = (value) => {
  // Automatically deduplicate HP codes if duplicates exist
  if (value && value.length > 0) {
    return [...new Set(value)]
  }
  return value
}

const hazardousSchema = Joi.object({
  containsHazardous: Joi.boolean().required().messages({
    'any.required': HAZARDOUS_ERRORS.CONTAINS_HAZARDOUS_REQUIRED
  }),
  sourceOfComponents: sourceOfComponentsSchema('containsHazardous'),
  hazCodes: Joi.when('containsHazardous', {
    is: true,
    then: Joi.array()
      .items(Joi.string().valid(...validHazCodes))
      .min(1)
      .required()
      .custom(deduplicateHazCodes, 'HP codes deduplication')
      .label('HazardCodes'),
    otherwise: Joi.array()
      .items(Joi.string().valid(...validHazCodes))
      .custom(deduplicateHazCodes, 'HP codes deduplication')
      .label('HazardCodes')
  }),
  components: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().empty('').empty(null).required().messages({
          'any.invalid': GENERIC_ERRORS.INVALID,
          'any.required': '{{#label}} is required' // Override to prevent parent message inheritance
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
          'any.required': HAZARDOUS_ERRORS.COMPONENTS_REQUIRED
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
    'any.invalid': HAZARDOUS_ERRORS.COMPONENTS_INVALID_WHEN_NOT_PRESENT,
    'any.componentsNotAllowed':
      HAZARDOUS_ERRORS.COMPONENTS_NOT_ALLOWED_NOT_PROVIDED,
    'pops.sourceNotAllowed': HAZARDOUS_ERRORS.SOURCE_NOT_ALLOWED,
    'any.containsPopsHazardousFalse':
      HAZARDOUS_ERRORS.COMPONENTS_NOT_ALLOWED_FALSE
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
        'string.ewcCodeFormat': WASTE_ERRORS.EWC_CODE_FORMAT,
        'string.ewcCodeInvalid': WASTE_ERRORS.EWC_CODE_INVALID
      })
    )
    .required()
    .max(MAX_EWC_CODES_COUNT)
    .messages({
      'array.max': WASTE_ERRORS.EWC_CODES_MAX
    }),
  wasteDescription: Joi.string().required(),
  physicalForm: Joi.string()
    .valid('Gas', 'Liquid', 'Solid', 'Powder', 'Sludge', 'Mixed')
    .required(),
  numberOfContainers: Joi.number().strict().integer().required().min(0),
  typeOfContainers: Joi.string()
    .required()
    .custom(validateContainerType, 'Container type validation')
    .messages({
      'string.containerTypeInvalid': WASTE_ERRORS.CONTAINER_TYPE_INVALID
    }),
  weight: weightSchema,
  pops: popsSchema,
  hazardous: hazardousSchema,
  disposalOrRecoveryCodes: Joi.array().items(disposalOrRecoveryCodeSchema)
}).label('Waste')
