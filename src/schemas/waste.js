import Joi from 'joi'
import { isValidEwcCode } from '../common/constants/ewc-codes.js'
import { quantitySchema } from './quantity.js'

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

export const wasteSchema = Joi.object({
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
    .max(5)
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
