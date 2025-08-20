import Joi from 'joi'
import { isValidEwcCode } from '../common/constants/ewc-codes.js'
import { quantitySchema } from './quantity.js'

const MAX_EWC_CODES_COUNT = 5
const MIN_HAZARD_CODE = 1
const MAX_HAZARD_CODE = 15
const CUSTOM_ERROR_TYPE = 'any.custom'

const popsSchema = Joi.object({
  containsPops: Joi.boolean().required().messages({
    'any.required':
      'Does the waste contain persistent organic pollutants (POPs)? is required'
  }),
  pops: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      concentration: Joi.number()
    }).label('PopsItem')
  )
}).label('Pops')

const hazardousSchema = Joi.object({
  containsHazardous: Joi.boolean().required().messages({
    'any.required':
      'Hazardous waste is any waste that is potentially harmful to human health or the environment.'
  }),
  hazCodes: Joi.array()
    .items(
      Joi.number()
        .integer()
        .min(MIN_HAZARD_CODE)
        .max(MAX_HAZARD_CODE)
        .messages({
          'number.base': 'Hazard code must be a number',
          'number.integer': 'Hazard code must be an integer',
          'number.min': 'Hazard code must be between 1 and 15 (HP1-HP15)',
          'number.max': 'Hazard code must be between 1 and 15 (HP1-HP15)'
        })
    )
    .custom((value) => {
      // Automatically deduplicate HP codes if duplicates exist
      if (value && value.length > 0) {
        return [...new Set(value)]
      }
      return value
    }, 'HP codes deduplication')
    .optional()
    .label('HazardCodes'),
  components: Joi.array().items(
    Joi.object({
      name: Joi.string().required().messages({
        'any.required': 'Chemical or Biological Component name is required'
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
})
  .custom((value, helpers) => {
    // Custom validation to check if components are provided when containsHazardous is false
    if (
      value &&
      value.containsHazardous === false &&
      value.components &&
      value.components.length > 0
    ) {
      return helpers.error(CUSTOM_ERROR_TYPE)
    }
    return value
  })
  .messages({
    'any.custom':
      'Chemical or Biological concentration cannot be provided when hazardous properties are not present'
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
  form: Joi.string()
    .valid('Gas', 'Liquid', 'Solid', 'Powder', 'Sludge', 'Mixed')
    .required(),
  numberOfContainers: Joi.number(),
  typeOfContainers: Joi.string(),
  quantity: quantitySchema,
  pops: popsSchema,
  hazardous: hazardousSchema
}).label('Waste')
