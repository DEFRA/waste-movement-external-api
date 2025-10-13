import Joi from 'joi'
import { WEIGHT_ERRORS } from '../common/constants/validation-error-messages.js'

export const weightSchema = Joi.object({
  metric: Joi.string().valid('Grams', 'Kilograms', 'Tonnes').required(),
  amount: Joi.number().strict().required().positive(),
  isEstimate: Joi.bool().required().messages({
    'any.required': WEIGHT_ERRORS.IS_ESTIMATE_REQUIRED,
    'boolean.base': WEIGHT_ERRORS.IS_ESTIMATE_BOOLEAN
  })
})
