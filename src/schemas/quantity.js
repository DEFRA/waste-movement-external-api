import Joi from 'joi'

export const quantitySchema = Joi.object({
  metric: Joi.string().valid('Tonnes').required(),
  amount: Joi.number()
    .positive()
    .custom((value, helpers) => {
      // Handle leading zeros by converting to proper decimal
      if (typeof value === 'number') {
        // Ensure it's a positive decimal
        if (value <= 0) {
          return helpers.error('number.positive')
        }
        return value
      }

      // If it's a string, try to parse it
      if (typeof value === 'string') {
        const parsed = parseFloat(value)
        if (isNaN(parsed)) {
          return helpers.error('number.base')
        }
        if (parsed <= 0) {
          return helpers.error('number.positive')
        }
        return parsed
      }

      return helpers.error('number.base')
    }, 'positive decimal validation')
    .required()
    .messages({
      'number.base': 'Quantity amount must be a valid number',
      'number.positive': 'Quantity amount must be a positive decimal',
      'any.required': 'Quantity amount is required'
    }),
  isEstimate: Joi.bool().required()
}).label('Quantity')
