import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

export const errorHandler = {
  plugin: {
    name: 'errorHandler',
    register: async (server) => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        // Check if it's a validation error (Boom error with status 400)
        if (response.isBoom && response.output.statusCode === 400) {
          // Access the validation error details
          const validationErrors = response.details || []

          // Transform validation errors to the required format
          const formattedErrors = validationErrors.map((err) => {
            // Determine error type - default to TBC if we can't determine it's NotProvided
            let errorType = 'Unexpected' // Default value
            switch (err.type) {
              case 'any.required':
                errorType = 'NotProvided'
                break
              case 'object.unknown':
                errorType = 'NotAllowed'
                break
              default:
                logger.error(
                  { err },
                  'Unexpected error returned from the library, mapping to default UnexpectedError'
                )
                errorType = 'UnexpectedError'
            }

            return {
              key: err.path.join('.'),
              errorType,
              message: err.message
            }
          })

          // Create the custom error format
          const customError = {
            validation: {
              errors: formattedErrors
            }
          }

          logger.debug({ validationErrors }, 'Formatted validation errors')

          // Return the custom formatted error
          return h.response(customError).code(400)
        }

        // If not a validation error, continue with the default response
        return h.continue
      })
    }
  }
}
