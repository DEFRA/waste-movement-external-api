import Joi from 'joi'
import { isValidEwcCode } from '../common/constants/ewc-codes.js'
import { isValidPopName } from '../common/constants/pop-names.js'
import { weightSchema } from './weight.js'
import { isValidContainerType } from '../common/constants/container-types.js'
import { validHazCodes } from '../common/constants/haz-codes.js'
import { DISPOSAL_OR_RECOVERY_CODES } from '../common/constants/treatment-codes.js'
import {
  HAZARDOUS_ERRORS,
  POPS_OR_HAZARDOUS_ERRORS,
  WASTE_ERRORS
} from '../common/constants/validation-error-messages.js'
import {
  sourceOfComponentsProvided,
  validSourceOfComponents
} from '../common/constants/source-of-components.js'

const MAX_EWC_CODES_COUNT = 5

const disposalOrRecoveryCodeSchema = Joi.object({
  code: Joi.string()
    .valid(...DISPOSAL_OR_RECOVERY_CODES)
    .required(),
  weight: weightSchema.required()
})

const hasArrayItems = (array) => Array.isArray(array) && array.length > 0

const validatePopOrHazardousPresence = (value, helpers, popsOrHazardous) => {
  const { sourceOfComponents, components } = value[popsOrHazardous]
  const currentIndex = helpers.state.path[1]
  const containsPopsOrHazardousField = `contains${String(popsOrHazardous).charAt(0).toUpperCase()}${String(popsOrHazardous).toLowerCase().slice(1)}`

  if (!sourceOfComponents) {
    return helpers.message(
      POPS_OR_HAZARDOUS_ERRORS.SOURCE_OF_COMPONENTS_REQUIRED(
        `wasteItems[${currentIndex}].${popsOrHazardous}.sourceOfComponents`,
        containsPopsOrHazardousField
      )
    )
  } else if (sourceOfComponents === 'NOT_PROVIDED') {
    if (hasArrayItems(components)) {
      return helpers.message(
        POPS_OR_HAZARDOUS_ERRORS.COMPONENTS_NOT_ALLOWED_NOT_PROVIDED(
          `wasteItems[${currentIndex}].${popsOrHazardous}.components`,
          `wasteItems[${currentIndex}].${popsOrHazardous}.sourceOfComponents`
        )
      )
    }
  } else if (
    Object.values(sourceOfComponentsProvided).includes(
      value[popsOrHazardous].sourceOfComponents
    ) &&
    (!value[popsOrHazardous].components ||
      value[popsOrHazardous].components === null)
  ) {
    return helpers.message(
      POPS_OR_HAZARDOUS_ERRORS.SOURCE_OF_COMPONENTS_REQUIRED(
        `wasteItems[${currentIndex}].${popsOrHazardous}.components`,
        containsPopsOrHazardousField
      )
    )
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
  const currentIndex = helpers.state.path[1]
  const containsPopsOrHazardousField = `contains${String(popsOrHazardous).charAt(0).toUpperCase()}${String(popsOrHazardous).toLowerCase().slice(1)}`

  if (
    value[popsOrHazardous] &&
    hasArrayItems(value[popsOrHazardous].components)
  ) {
    return helpers.message(
      POPS_OR_HAZARDOUS_ERRORS.COMPONENTS_NOT_ALLOWED_FALSE(
        `wasteItems[${currentIndex}].${popsOrHazardous}.components`,
        `wasteItems[${currentIndex}].${containsPopsOrHazardousField}`
      )
    )
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
  sourceOfComponents: sourceOfComponentsSchema(),
  components: Joi.array().items(popComponentSchema).empty(null)
}).empty(null)

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
  sourceOfComponents: sourceOfComponentsSchema(),
  hazCodes: Joi.array()
    .items(Joi.string().valid(...validHazCodes))
    .custom(deduplicateHazCodes, 'HP codes deduplication'),
  components: Joi.array().items(hazardousComponentSchema).empty(null)
})
  .empty(null)
  .custom((value, helpers) => {
    const wasteItemIndex = helpers.state.path[1]
    const wasteItem = helpers.state.ancestors[1][wasteItemIndex]

    if (
      wasteItem.containsHazardous &&
      wasteItem.hazardous.sourceOfComponents &&
      !hasArrayItems(wasteItem.hazardous.hazCodes)
    ) {
      return helpers.message(
        HAZARDOUS_ERRORS.HAZ_CODES_REQUIRED.replace(
          '{{#label}}',
          `"wasteItems[${wasteItemIndex}].hazardous.hazCodes"`
        )
      )
    }

    return value
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
  containsHazardous: Joi.boolean().required(),
  hazardous: hazardousSchema,
  disposalOrRecoveryCodes: Joi.array().items(disposalOrRecoveryCodeSchema)
})
  .custom((value, helpers) => {
    if (value.containsPops) {
      return validatePopOrHazardousPresence(value, helpers, 'pops')
    } else if (!value.containsPops) {
      return validatePopOrHazardousAbsence(value, helpers, 'pops')
    }

    return value
  })
  .custom((value, helpers) => {
    if (value.containsHazardous) {
      return validatePopOrHazardousPresence(value, helpers, 'hazardous')
    } else if (!value.containsHazardous) {
      return validatePopOrHazardousAbsence(value, helpers, 'hazardous')
    }

    return value
  })
