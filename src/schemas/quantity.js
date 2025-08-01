import Joi from 'joi'

export const quantitySchema = Joi.object({
  metric: Joi.string().valid('Tonnes').required(),
  amount: Joi.number().required(),
  isEstimate: Joi.bool().required()
}).label('Quantity')
