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
          const unexpectedErrors = []

          // Transform validation errors to the required format
          const formattedErrors = validationErrors.map((err) => {
            let errorType
            switch (err.type) {
              case 'any.required':
                errorType = 'NotProvided'
                break
              case 'object.unknown':
                errorType = 'NotAllowed'
                break
              default:
                errorType = 'UnexpectedError'
                unexpectedErrors.push(err)
            }

            // Determine the error key
            // For most errors, Joi provides the path (e.g., ['fieldName'])
            // However, custom validators at the schema level don't have path context,
            // so we extract the field name from the error type for those cases
            let key = err.path.join('.')

            // Handle schema-level custom validation errors that reference specific fields
            // These errors have empty paths but include the field name in the error type
            // Only apply this for our custom error types (not Joi built-ins like 'any.required')
            const CUSTOM_FIELD_ERROR_PREFIXES = ['reasonForNoConsignmentCode']

            if (!key && err.type && err.type.includes('.')) {
              const fieldName = err.type.split('.')[0]

              // Only use the extracted field name if it's one of our known custom validations
              if (CUSTOM_FIELD_ERROR_PREFIXES.includes(fieldName)) {
                key = fieldName
              }
              // Otherwise leave key as empty string (original behavior for unknown cases)
            }

            return {
              key,
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

          // Log all validation errors in a single consolidated entry
          if (unexpectedErrors.length > 0) {
            logger.error(
              {
                validationErrors: formattedErrors,
                unexpectedErrors,
                totalErrors: formattedErrors.length,
                unexpectedCount: unexpectedErrors.length
              },
              `Validation failed with unexpected error types, mapped to UnexpectedError`
            )
          } else {
            logger.error({ errors: formattedErrors }, 'Validation failed')
          }

          // Return the custom formatted error
          return h.response(customError).code(400)
        }

        // If not a validation error, continue with the default response
        return h.continue
      })
    }
  }
}
