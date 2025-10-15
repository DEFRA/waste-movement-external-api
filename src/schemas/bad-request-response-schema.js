import Joi from 'joi'

export const badRequestResponseSchema = Joi.object({
  validation: Joi.object({
    errors: Joi.array().items(
      Joi.object({
        key: Joi.string().description('Field path that failed validation'),
        errorType: Joi.string().valid(
          'NotProvided',
          'NotAllowed',
          'UnexpectedError'
        ),
        message: Joi.string().description('Validation error message')
      })
    )
  })
})
