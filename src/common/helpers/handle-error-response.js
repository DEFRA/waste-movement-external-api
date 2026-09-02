import Boom from '@hapi/boom'

/**
 * Detects the type of error and throws a relevant Boom error.
 *
 * @param {Object} error - The error
 *
 * @returns {void}
 */
export function handleErrorResponse(error) {
  if (error.name === 'NotFoundError') {
    throw Boom.notFound('Movement not found')
  }

  throw Boom.internal(error.message)
}
