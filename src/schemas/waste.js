import Joi from 'joi'
import { isValidEwcCode } from '../common/constants/ewc-codes.js'
import { isValidPopName } from '../common/constants/pop-names.js'
import {
  POP_COMPONENT_SOURCES,
  validPopComponentSources
} from '../common/constants/pop-component-sources.js'
import { weightSchema } from './weight.js'
import { isValidContainerType } from '../common/constants/container-types.js'
import { validHazCodes } from '../common/constants/haz-codes.js'
import { DISPOSAL_OR_RECOVERY_CODES } from '../common/constants/treatment-codes.js'

const MAX_EWC_CODES_COUNT = 5
const CUSTOM_ERROR_TYPE = 'any.custom'

const disposalOrRecoveryCodeSchema = Joi.object({
  code: Joi.string()
    .valid(...DISPOSAL_OR_RECOVERY_CODES)
    .required(),
  weight: weightSchema.required()
}).label('DisposalOrRecoveryCode')

const popComponentSchema = Joi.object({
  name: Joi.string()
    .allow('')
    .custom((value, helpers) => {
      if (value === undefined) {
        return value
      }

      if (!isValidPopName(value)) {
        return helpers.error('string.popNameInvalid')
      }

      return value
    })
    .messages({
      'string.popNameInvalid': 'POP name is not valid'
    }),
  concentration: Joi.number().messages({
    'number.base': 'POP concentration must be a number'
  })
}).label('PopComponent')

const popsSchema = Joi.object({
  containsPops: Joi.boolean().required().messages({
    'any.required':
      'Does the waste contain persistent organic pollutants (POPs)? is required'
  }),
  sourceOfComponents: Joi.string()
    .valid(...validPopComponentSources)
    .when('containsPops', {
      is: true,
      then: Joi.required().messages({
        'any.required':
          'Source of POP components is required when POPs are present'
      }),
      otherwise: Joi.forbidden().messages({
        'any.unknown':
          'Source of POP components can only be provided when POPs are present'
      })
    }),
  components: Joi.array().items(popComponentSchema)
})
  .custom((value, helpers) => {
    if (!value) {
      return value
    }

    if (value.containsPops === true) {
      const { sourceOfComponents, components } = value

      if (sourceOfComponents === POP_COMPONENT_SOURCES.NOT_PROVIDED) {
        if (components && components.length > 0) {
          return helpers.error('pops.componentsNotAllowed')
        }

        return value
      }

      const hasComponents = Array.isArray(components) && components.length > 0

      if (!hasComponents) {
        return helpers.error('pops.componentsRequired')
      }

      return value
    }

    if (value.containsPops === false) {
      if (value.sourceOfComponents !== undefined) {
        return helpers.error('pops.sourceNotAllowed')
      }

      if (value.components && value.components.length > 0) {
        const hasNonEmptyName = value.components.some((component) => {
          const name = component?.name
          return name !== undefined && name !== null && name !== ''
        })

        if (hasNonEmptyName) {
          return helpers.error('any.invalid')
        }
      }
    }

    return value
  })
  .messages({
    'any.invalid': 'A POP name cannot be provided when POPs are not present',
    'pops.componentsNotAllowed':
      'POP components must not be provided when the source is NOT_PROVIDED',
    'pops.componentsRequired':
      'At least one POP component must be provided when a source is specified',
    'pops.sourceNotAllowed':
      'Source of POP components can only be provided when POPs are present'
  })
  .label('Pops')

const hazardousSchema = Joi.object({
  containsHazardous: Joi.boolean().required().messages({
    'any.required':
      'Hazardous waste is any waste that is potentially harmful to human health or the environment.'
  }),
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
        name: Joi.string().required().invalid(null).messages({
          'any.required': 'Chemical or Biological Component name is required',
          'string.base':
            'Chemical or Biological Component name must be a string',
          'any.invalid':
            'Chemical or Biological Component name must be an actual component name, not null'
        }),
        concentration: Joi.custom((value, helpers) => {
          // Check if it's a valid number
          if (typeof value === 'number') {
            if (value < 0) {
              return helpers.error('number.min')
            }
            return value
          }

          // Check if it's a valid string
          if (typeof value === 'string') {
            if (value === 'Not Supplied') {
              return value
            }
            if (value === '') {
              return value
            }
            // Any other string is invalid
            return helpers.error(CUSTOM_ERROR_TYPE)
          }

          // Any other type is invalid
          return helpers.error(CUSTOM_ERROR_TYPE)
        })
          .required()
          .messages({
            'any.required':
              'Chemical or Biological concentration is required when hazardous properties are present',
            'number.min':
              'Chemical or Biological concentration cannot be negative',
            'any.custom':
              'Chemical or Biological concentration must be a valid number or "Not Supplied"'
          })
      }).label('ComponentItem')
    )
    .optional()
})
  .custom((value, helpers) => {
    // Custom validation to check components based on containsHazardous value
    if (value && value.containsHazardous === true) {
      // When hazardous, components are optional (can be provided or not)
      return value
    } else if (
      value?.containsHazardous === false &&
      value.components?.length > 0
    ) {
      // When not hazardous, components should not be provided
      return helpers.error('any.invalid')
    } else {
      // No validation needed when containsHazardous is undefined or null
      // Let the containsHazardous required validation handle it
      return value
    }
  })
  .messages({
    'any.required':
      'Chemical or Biological component name must be specified when hazardous properties are present',
    'any.invalid':
      'Chemical or Biological components cannot be provided when no hazardous properties are indicated'
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
