/**
 * Check if request is for a beta route (/beta-1/*, /beta-2/*, ...). Uses the
 * request path rather than the route, so it also works in onRequest, before
 * the route is matched.
 * @param {Object} request - The Hapi request object
 * @returns {boolean}
 */
export const isBetaRoute = (request) => request.path.startsWith('/beta-')
