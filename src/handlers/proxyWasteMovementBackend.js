import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { httpClients } from '../common/helpers/http-client.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { boomify } from '@hapi/boom'

const logger = createLogger()
const headersToPassThrough = ['Content-Type', 'x-request-id']

/**
 * Header used to forward the organisation resolved for the apiCode by
 * waste-organisation-backend to the backend service. It is only set by this
 * proxy: inbound client headers are never forwarded.
 */
export const ORGANISATION_ID_HEADER = 'x-dwt-organisation-id'

const API_CODE_VISIBLE_CHARS = 4
const API_CODE_MASK = '****'

/**
 * Masks an API code for logging, keeping only its last
 * API_CODE_VISIBLE_CHARS characters.
 * @param {string} apiCode
 * @returns {string}
 */
export const maskApiCode = (apiCode) =>
  typeof apiCode === 'string' && apiCode.length > API_CODE_VISIBLE_CHARS
    ? `${API_CODE_MASK}${apiCode.slice(-API_CODE_VISIBLE_CHARS)}`
    : API_CODE_MASK

const logBetaRequest = (request, organisationId, statusCode) => {
  const clientId = request.auth?.credentials?.clientId
  // CDP's log pipeline only indexes its allowlisted ECS fields
  // (cdp-documentation how-to/logging.md) and drops flattened keys where
  // nested are expected, so these must stay nested objects.
  const fields = {
    tenant: clientId ? { id: clientId } : undefined,
    url: { path: request.path },
    http: {
      request: { method: request.method?.toUpperCase() },
      response: { status_code: statusCode }
    }
  }

  if (organisationId) {
    logger.info(
      {
        ...fields,
        event: { action: 'beta-request-proxied', reference: organisationId }
      },
      'Beta request proxied'
    )
    return
  }

  // waste-organisation-backend returned 404: the API code is unknown or disabled
  logger.warn(
    {
      ...fields,
      event: {
        action: 'beta-request-proxied',
        reason: `No organisation resolved for API code ${maskApiCode(request.payload?.apiCode)}`
      }
    },
    'Beta request proxied'
  )
}

export const proxyWasteMovementBackend = async (request, h) => {
  const { path, payload } = request
  const organisationId =
    request.submittingOrganisation?.defraCustomerOrganisationId
  const headers = organisationId
    ? { [ORGANISATION_ID_HEADER]: organisationId }
    : {}

  try {
    const backendResponse = await httpClients.wasteMovement.post(
      path,
      payload,
      headers
    )

    logBetaRequest(request, organisationId, backendResponse?.statusCode)

    const res = h.response(backendResponse?.payload)

    res.code(backendResponse?.statusCode)

    for (const [key, value] of Object.entries(backendResponse?.headers || {})) {
      headersToPassThrough.forEach((allowedKey) => {
        if (allowedKey.toLowerCase() === key.toLowerCase()) {
          res.header(key, value)
        }
      })
    }

    return res
  } catch (error) {
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR

    logger.error(
      { err: error, path, apiCode: maskApiCode(payload?.apiCode) },
      'Waste Movement Backend Service Error'
    )
    logBetaRequest(request, organisationId, statusCode)

    return boomify(error, {
      statusCode,
      override: false
    })
  }
}
