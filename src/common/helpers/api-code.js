/**
 * Header carrying the caller's apiCode on beta-2 routes. RoW and beta-1
 * routes still carry it in the request body.
 */
export const API_CODE_HEADER = 'x-api-code'

export const API_CODE_MISSING_MESSAGE = 'The x-api-code header is required'
export const API_CODE_INVALID_MESSAGE =
  'The x-api-code header does not contain a valid API code'

/**
 * Whether the route takes the apiCode as a credential in the x-api-code
 * header (beta-2), rather than as a body field.
 * @param {Object} request - Hapi request
 * @returns {boolean}
 */
export const usesApiCodeHeader = (request) =>
  request.path.startsWith('/beta-2/')

/**
 * Returns the caller's apiCode: the x-api-code header on beta-2 routes, the
 * request body everywhere else. beta-2 never reads the body, so a client that
 * still sends apiCode there gets a 401 for the missing header.
 * @param {Object} request - Hapi request (header names are lower-cased)
 * @returns {string|undefined}
 */
export const getApiCode = (request) =>
  usesApiCodeHeader(request)
    ? request.headers?.[API_CODE_HEADER]
    : request.payload?.apiCode
