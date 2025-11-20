import Joi from 'joi'
import { isValidEwcCode } from '../common/constants/ewc-codes.js'
import { isValidPopCode } from '../common/constants/pop-names.js'
import { weightSchema } from './weight.js'
import { isValidContainerType } from '../common/constants/container-types.js'
import { validHazCodes } from '../common/constants/haz-codes.js'
import { DISPOSAL_OR_RECOVERY_CODES } from '../common/constants/treatment-codes.js'
import {
  HAZARDOUS_ERRORS,
  POPS_ERRORS,
  POPS_OR_HAZARDOUS_ERRORS,
  WASTE_ERRORS
} from '../common/constants/validation-error-messages.js'
import { validSourceOfComponents } from '../common/constants/source-of-components.js'

const MAX_EWC_CODES_COUNT = 5

const disposalOrRecoveryCodeSchema = Joi.object({
  code: Joi.string()
    .valid(...DISPOSAL_OR_RECOVERY_CODES)
    .required(),
  weight: weightSchema.required()
})

const hasArrayItems = (array) => Array.isArray(array) && array.length > 0

export const formatPopsOrHazardousFields = (popsOrHazardous) => ({
  popsOrHazardousObjectProperty: popsOrHazardous.toLowerCase(),
  containsPopsOrHazardousField: `contains${popsOrHazardous.charAt(0).toUpperCase()}${popsOrHazardous.toLowerCase().slice(1)}`
})

const validatePopOrHazardousPresence = (value, helpers, popsOrHazardous) => {
  const wasteItem = helpers.state.ancestors[0]
  const { sourceOfComponents, components } = wasteItem[popsOrHazardous]
  const currentIndex = helpers.state.path[1]
  const { containsPopsOrHazardousField } =
    formatPopsOrHazardousFields(popsOrHazardous)
  // Joi doesn't run custom functions on undefined fields so this can't be attached
  // to the components/sourceOfComponents fields and needs to set {{#label}} dynamically
  const validationMessage = (field) =>
    (popsOrHazardous === 'pops'
      ? POPS_ERRORS.REQUIRED_WHEN_CONTAINS_POPS_TRUE
      : HAZARDOUS_ERRORS.REQUIRED_WHEN_CONTAINS_HAZARDOUS_TRUE
    ).replace(
      '{{#label}}',
      `"wasteItems[${currentIndex}].${popsOrHazardous}.${field}"`
    )

  if (wasteItem[containsPopsOrHazardousField] === true) {
    if (!sourceOfComponents) {
      return helpers.message(validationMessage('sourceOfComponents'))
    }

    // GUIDANCE and OWN_TESTING require components because the user actively determined them
    // Only PROVIDED_WITH_WASTE can omit components (they may not have been provided with the waste)
    if (
      ['GUIDANCE', 'OWN_TESTING'].includes(sourceOfComponents) &&
      [undefined, null].includes(components)
    ) {
      return helpers.message(validationMessage('components'))
    }

    // PROVIDED_WITH_WASTE: components are recommended but not required
    // Warnings are handled separately - this allows submission to pass even without components
  }

  return value
}

const validatePopsOrHazardousComponents = (value, helpers, popsOrHazardous) => {
  const wasteItem = helpers.state.ancestors[1]
  const { sourceOfComponents, components } = wasteItem[popsOrHazardous]
  const { containsPopsOrHazardousField } =
    formatPopsOrHazardousFields(popsOrHazardous)

  if (
    wasteItem[containsPopsOrHazardousField] === true &&
    sourceOfComponents === 'NOT_PROVIDED' &&
    hasArrayItems(components)
  ) {
    return helpers.message(
      POPS_OR_HAZARDOUS_ERRORS.COMPONENTS_NOT_ALLOWED_NOT_PROVIDED
    )
  }

  if (
    wasteItem[containsPopsOrHazardousField] === false &&
    hasArrayItems(components)
  ) {
    return helpers.message(
      popsOrHazardous === 'pops'
        ? POPS_ERRORS.COMPONENTS_NOT_ALLOWED_FALSE
        : HAZARDOUS_ERRORS.COMPONENTS_NOT_ALLOWED_FALSE
    )
  }

  return value
}

const sourceOfComponentsSchema = Joi.string().valid(
  ...Object.values(validSourceOfComponents)
)

const concentrationSchema = () => Joi.number().strict().positive().allow(null)

const popComponentSchema = Joi.object({
  code: Joi.string()
    .empty('')
    .empty(null)
    .custom((value, helpers) => {
      if (!isValidPopCode(value)) {
        return helpers.error('any.invalid')
      }
      return value
    })
    .required()
    .messages({
      'any.invalid': POPS_ERRORS.POP_CODE_INVALID
    }),
  concentration: concentrationSchema()
})

const popsSchema = Joi.object({
  sourceOfComponents: sourceOfComponentsSchema,
  components: Joi.array()
    .items(popComponentSchema)
    .empty(null)
    .custom((value, helpers) =>
      validatePopsOrHazardousComponents(value, helpers, 'pops')
    )
})
  .empty(null)
  .custom((value, helpers) =>
    validatePopOrHazardousPresence(value, helpers, 'pops')
  )

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
  sourceOfComponents: sourceOfComponentsSchema,
  hazCodes: Joi.array()
    .items(Joi.string().valid(...validHazCodes))
    .custom(deduplicateHazCodes, 'HP codes deduplication'),
  components: Joi.array()
    .items(hazardousComponentSchema)
    .empty(null)
    .custom((value, helpers) =>
      validatePopsOrHazardousComponents(value, helpers, 'hazardous')
    )
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
        // Joi doesn't run custom functions on undefined fields so this can't be attached
        // to the hazCodes field and needs to set {{#label}} dynamically
        HAZARDOUS_ERRORS.HAZ_CODES_REQUIRED.replace(
          '{{#label}}',
          `"wasteItems[${wasteItemIndex}].hazardous.hazCodes"`
        )
      )
    }

    return value
  })
  .custom((value, helpers) =>
    validatePopOrHazardousPresence(value, helpers, 'hazardous')
  )

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
  containsPops: Joi.boolean().strict().required(),
  pops: popsSchema,
  containsHazardous: Joi.boolean().strict().required(),
  hazardous: hazardousSchema,
  disposalOrRecoveryCodes: Joi.array().items(disposalOrRecoveryCodeSchema)
})
