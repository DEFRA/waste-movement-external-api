import Joi from 'joi'

export const weightSchema = Joi.object({
  metric: Joi.string().valid('Grams', 'Kilograms', 'Tonnes').required(),
  amount: Joi.number().strict().required().min(0).greater(0).messages({
    'number.min': '{{ #label }} must be greater than 0',
    'number.greater': '{{ #label }} must be greater than 0',
    'number.integer': '{{ #label }} must be an integer'
  }),
  isEstimate: Joi.bool().required().messages({
    'any.required':
      'isEstimate is required. Please indicate whether the quantity is an estimate (true) or actual measurement (false)',
    'boolean.base':
      'isEstimate must be either true or false. Please indicate whether the quantity is an estimate (true) or actual measurement (false)'
  })
})
