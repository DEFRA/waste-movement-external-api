import Joi from 'joi'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'

export const errorResponseSchema = (statusCode) =>
  Joi.object({
    statusCode: Joi.number().valid(statusCode),
    error: Joi.string(),
    message: Joi.string()
  })

export const successResponseSchema = Joi.object({
  message: Joi.string().description('Success message')
})

export const commonSwaggerResponses = {
  [HTTP_STATUS.OK]: {
    description: 'OK',
    schema: successResponseSchema
  },
  [HTTP_STATUS.BAD_REQUEST]: {
    description: 'Bad Request',
    schema: errorResponseSchema(HTTP_STATUS.BAD_REQUEST)
  },
  [HTTP_STATUS.NOT_FOUND]: {
    description: 'Not Found',
    schema: errorResponseSchema(HTTP_STATUS.NOT_FOUND)
  }
}
