import { HTTP_STATUS } from '@defra/waste-movement-utils'
import { httpClients } from '../common/helpers/http-client.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

export const proxyWasteMovementBackend = async (request, h) => {
  const { path, payload } = request

  try {
    const backendResponse = await httpClients.wasteMovement.post(path, payload)

    return h
      .response(backendResponse?.result)
      .code(backendResponse?.statusCode)
      .message(backendResponse?.statusMessage)
  } catch (error) {
    logger.error(
      { err: error, path, payload },
      'Waste Movement Backend Service Error'
    )
    return h
      .response({
        error: 'Internal Server Error',
        message: 'Waste Movement Backend Service Error'
      })
      .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
