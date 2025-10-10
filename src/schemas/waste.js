import Joi from 'joi'
import { isValidEwcCode } from '../common/constants/ewc-codes.js'
import { isValidPopName } from '../common/constants/pop-names.js'
import { weightSchema } from './weight.js'
import { isValidContainerType } from '../common/constants/container-types.js'
import { validHazCodes } from '../common/constants/haz-codes.js'
import { DISPOSAL_OR_RECOVERY_CODES } from '../common/constants/treatment-codes.js'
import { validSourceOfComponents } from '../common/constants/source-of-components.js'
import {
  POPS_ERRORS,
  HAZARDOUS_ERRORS,
  WASTE_ERRORS
} from '../common/constants/validation-error-messages.js'

const MAX_EWC_CODES_COUNT = 5

const disposalOrRecoveryCodeSchema = Joi.object({
  code: Joi.string()
    .valid(...DISPOSAL_OR_RECOVERY_CODES)
    .required(),
  weight: weightSchema.required()
})

const hasComponents = (components) =>
  Array.isArray(components) && components.length > 0

const validatePopOrHazardousPresence = (value, helpers, popsOrHazardous) => {
  // NOTE: THE '|| value' IN THE NEXT LINE IS TEMPORARY TO PROVIDE BACKWARDS COMPATIBILITY
  // UNTIL WE HAVE DONE THE TICKET TO MOVE containsHazardous UP A LEVEL (DWT-828) THEN IT
  // CAN BE REMOVED
  const { sourceOfComponents, components } = value[popsOrHazardous] || value

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

const validatePopOrHazardousAbsence = (value, helpers, popsOrHazardous) => {
  // This function is called when containsPops/containsHazardous is false
  // When POPs/Hazardous are not present, no component details should be provided at all
  // This includes empty objects, as per business requirements

  // NOTE: THIS ADDITIONAL CONDITIONAL IS TEMPORARY TO PROVIDE BACKWARDS COMPATIBILITY
  // UNTIL WE HAVE DONE THE TICKET TO MOVE containsHazardous UP A LEVEL (DWT-828) THEN IT
  // CAN BE REMOVED
  if (popsOrHazardous === 'pops' && value[popsOrHazardous]) {
    if (hasComponents(value[popsOrHazardous].components)) {
      return helpers.error('any.containsPopsHazardousFalse')
    }
  } else if (hasComponents(value.components)) {
    return helpers.error('any.containsPopsHazardousFalse')
  }

  return value
}

const sourceOfComponentsSchema = () =>
  Joi.string().valid(...Object.values(validSourceOfComponents))

const concentrationSchema = () => Joi.number().strict().positive().allow(null)

const popComponentSchema = Joi.object({
  name: Joi.string()
    .empty('')
    .empty(null)
    .custom((value, helpers) => {
      if (!isValidPopName(value)) {
        return helpers.error('any.invalid')
      }
      return value
    })
    .required(),
  concentration: concentrationSchema()
})

const popsSchema = Joi.object({
  sourceOfComponents: sourceOfComponentsSchema('containsPops'),
  components: Joi.array()
    .items(popComponentSchema)
    .empty(null)
    .custom((value, helpers) => {
      const wasteItem = helpers.state.ancestors[1]

      if (
        wasteItem.containsPops === true &&
        wasteItem.pops.sourceOfComponents !== 'NOT_PROVIDED' &&
        (!wasteItem.pops.components || wasteItem.pops.components === null)
      ) {
        return helpers.error('pops.required')
      }

      return value
    })
})
  .empty(null)
  .custom((value, helpers) => {
    const wasteItem = helpers.state.ancestors[0]
    const currentPath = helpers.state.path

    if (wasteItem.containsPops === true) {
      if (!wasteItem.pops.sourceOfComponents) {
        return helpers.message(
          `"wasteItems[${currentPath[1]}].pops.sourceOfComponents" is required when components are present`
        )
      } else if (
        wasteItem.pops.sourceOfComponents !== 'NOT_PROVIDED' &&
        (!wasteItem.pops.components || wasteItem.pops.components === null)
      ) {
        return helpers.message(
          `"wasteItems[${currentPath[1]}].pops.components" is required when POPs components are present`
        )
      }
    }

    return value
  })
  .messages({
    'pops.sourceNotAllowed': POPS_ERRORS.SOURCE_NOT_ALLOWED
  })

const deduplicateHazCodes = (value) => {
  // Automatically deduplicate HP codes if duplicates exist
  if (value && value.length > 0) {
    return [...new Set(value)]
  }
  return value
}

const hazardousComponentSchema = Joi.object({
  name: Joi.string().empty('').empty(null).required(),
  concentration: concentrationSchema()
})

const hazardousSchema = Joi.object({
  containsHazardous: Joi.boolean().required(),
  sourceOfComponents: sourceOfComponentsSchema('containsHazardous'),
  hazCodes: Joi.when('containsHazardous', {
    is: true,
    then: Joi.array()
      .items(Joi.string().valid(...validHazCodes))
      .min(1)
      .required()
      .custom(deduplicateHazCodes, 'HP codes deduplication'),
    otherwise: Joi.array()
      .items(Joi.string().valid(...validHazCodes))
      .custom(deduplicateHazCodes, 'HP codes deduplication')
  }),
  components: Joi.array()
    .items(hazardousComponentSchema)
    .empty(null)
    .when('containsHazardous', {
      is: true,
      then: Joi.when('sourceOfComponents', {
        is: 'NOT_PROVIDED',
        then: Joi.optional(),
        otherwise: Joi.required().messages({
          'any.required':
            '{{#label}} is required when Hazardous components are present'
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
    'any.componentsNotAllowed':
      HAZARDOUS_ERRORS.COMPONENTS_NOT_ALLOWED_NOT_PROVIDED,
    'pops.sourceNotAllowed': HAZARDOUS_ERRORS.SOURCE_NOT_ALLOWED,
    'any.containsPopsHazardousFalse':
      HAZARDOUS_ERRORS.COMPONENTS_NOT_ALLOWED_FALSE
  })

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
  containsPops: Joi.boolean().required(),
  pops: popsSchema,
  hazardous: hazardousSchema,
  disposalOrRecoveryCodes: Joi.array().items(disposalOrRecoveryCodeSchema)
})
