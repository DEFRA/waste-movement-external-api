/**
 * Header carrying the caller's apiCode on beta-2 routes. RoW and beta-1
 * routes still carry it in the request body.
 */
export const API_CODE_HEADER = 'x-api-code'

const usesApiCodeHeader = (request) => request.path.startsWith('/beta-2/')

/**
 * Returns the caller's apiCode: the x-api-code header on beta-2 routes, the
 * request body everywhere else. Until the backend stops accepting apiCode in
 * beta-2 bodies, beta-2 also falls back to the body so existing clients keep
 * working while they move to the header.
 * @param {Object} request - Hapi request (header names are lower-cased)
 * @returns {string|undefined}
 */
export const getApiCode = (request) => {
  if (usesApiCodeHeader(request)) {
    const apiCode = request.headers?.[API_CODE_HEADER]
    if (apiCode) {
      return apiCode
    }
  }

  return request.payload?.apiCode
}
