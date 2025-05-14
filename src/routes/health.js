import Joi from 'joi'

const health = {
  method: 'GET',
  path: '/health',
  options: {
    tags: ['health'],
    description: 'Health check endpoint',
    notes: 'Returns the health status of the API',
    response: {
      status: {
        200: Joi.object({
          message: Joi.string().description('Health status message')
        }).label('HealthResponse')
      }
    }
  },
  handler: (_request, h) => h.response({ message: 'success' })
}

export { health }
