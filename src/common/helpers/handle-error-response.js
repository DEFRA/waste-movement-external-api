import Boom from '@hapi/boom'
import { PaymentRequiredError } from './errors/payment-required-error.js'

/**
 * Detects the type of error and throws a relevent Boom error.
 *
 * @param {Object} error - The error
 *
 * @returns {void}
 */
export function handleErrorResponse(error) {
  if (error instanceof PaymentRequiredError) {
    throw Boom.paymentRequired(error.message)
  }

  if (error.name === 'NotFoundError') {
    throw Boom.notFound('Movement not found')
  }

  throw Boom.internal(error.message)
}
