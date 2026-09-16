import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { httpClients } from '../common/helpers/http-client.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { boomify } from '@hapi/boom'

const logger = createLogger()
const headersToPassThrough = ['Content-Type', 'x-request-id']

export const proxyWasteMovementBackend = async (request, h) => {
  const { path, payload } = request

  try {
    const backendResponse = await httpClients.wasteMovement.post(path, payload)

    const res = h.response(backendResponse?.payload)

    res.code(backendResponse?.statusCode)

    for (const [key, value] of Object.entries(backendResponse?.headers || [])) {
      headersToPassThrough.forEach((allowedKey) => {
        if (allowedKey.toLowerCase() === key.toLowerCase()) {
          res.header(key, value)
        }
      })
    }

    return res
  } catch (error) {
    logger.error(
      { err: error, path, payload },
      'Waste Movement Backend Service Error'
    )
    return boomify(error, {
      statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      override: false
    })
  }
}
