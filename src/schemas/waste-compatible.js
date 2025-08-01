import Joi from 'joi'
import { isValidEwcCode } from '../common/constants/ewc-codes.js'
import { quantitySchema } from './quantity.js'

const MAX_EWC_CODES_COUNT = 5

const popsSchema = Joi.object({
  containsPops: Joi.boolean(),
  pops: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      concentration: Joi.number()
    }).label('PopsItem')
  )
}).label('Pops')

const hazardousSchema = Joi.object({
  components: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      concentration: Joi.number()
    }).label('ComponentItem')
  )
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

// Schema that matches the API specification (single ewcCode string)
export const wasteSchema = Joi.object({
  ewcCode: Joi.string()
    .custom(validateEwcCode, 'EWC code validation')
    .required()
    .messages({
      'string.ewcCodeFormat':
        '{{#label}} must be a valid 6-digit numeric code',
      'string.ewcCodeInvalid':
        '{{#label}} must be a valid EWC code from the official list'
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

// Alternative schema for future use (array of ewcCodes)
export const wasteSchemaWithMultipleCodes = Joi.object({
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