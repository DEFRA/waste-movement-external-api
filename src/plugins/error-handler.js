import { metricsCounter } from '../common/helpers/metrics.js'
import { normalizeArrayIndices } from '../common/helpers/utils.js'

/**
 * Check if request is for receipt movement endpoints
 */
const isReceiptMovementEndpoint = (request) => {
  const path = request.route.path
  return (
    path === '/movements/receive' ||
    path === '/movements/{wasteTrackingId}/receive'
  )
}

export const errorHandler = {
  plugin: {
    name: 'errorHandler',
    register: async (server) => {
      server.ext('onPreResponse', async (request, h) => {
        const logger = request.logger
        const response = request.response

        if (response.isBoom) {
          logger.error({ err: response }, 'Request error')
        }

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
            // However, custom validators at the schema level don't have path context
            let key = err.path.join('.')

            // For schema-level custom validations that pass fieldName metadata via local context,
            // use that instead of the empty path
            // This allows custom validations to specify which field the error relates to
            if (!key && err.context?.local?.fieldName) {
              key = err.context.local.fieldName
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
            logger.error(
              { err: formattedErrors },
              `Validation failed ${JSON.stringify(formattedErrors)}`
            )
          }

          // Log validation error metrics for receipt movement endpoints
          if (isReceiptMovementEndpoint(request)) {
            const endpointType = request.method.toLowerCase()

            // Error count metrics
            await metricsCounter(
              'validation.errors.count',
              formattedErrors.length,
              {
                endpointType
              }
            )
            await metricsCounter(
              'validation.errors.count',
              formattedErrors.length
            )

            // Request with errors metric
            await metricsCounter('validation.requests.with_errors', 1, {
              endpointType
            })
            await metricsCounter('validation.requests.with_errors', 1)

            // Per-error breakdown metrics
            for (const error of formattedErrors) {
              const errorReason = normalizeArrayIndices(error.message)
              await metricsCounter('validation.error.reason', 1, {
                endpointType,
                errorReason
              })
              await metricsCounter('validation.error.reason', 1, {
                errorReason
              })
            }
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
