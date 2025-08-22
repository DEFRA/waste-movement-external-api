import Joi from 'joi'

export const weightSchema = Joi.object({
  metric: Joi.string().valid('Tonnes').required(),
  amount: Joi.number().required(),
  isEstimate: Joi.bool().required().messages({
    'any.required':
      'isEstimate is required. Please indicate whether the quantity is an estimate (true) or actual measurement (false)',
    'boolean.base':
      'isEstimate must be either true or false. Please indicate whether the quantity is an estimate (true) or actual measurement (false)'
  })
}).label('Quantity')
