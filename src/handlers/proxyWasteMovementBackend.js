import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { httpClients } from '../common/helpers/http-client.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { boomify } from '@hapi/boom'

const logger = createLogger()

export const proxyWasteMovementBackend = async (request, h) => {
  const { path, payload } = request

  try {
    const backendResponse = await httpClients.wasteMovement.post(path, payload)

    return h
      .response(backendResponse?.payload)
      .code(backendResponse?.statusCode)
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
