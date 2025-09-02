import Joi from 'joi'

export const weightSchema = Joi.object({
  metric: Joi.string().valid('Grams', 'Kilograms', 'Tonnes').required(),
  amount: Joi.number().required(),
  isEstimate: Joi.bool().required()
}).label('Quantity')
