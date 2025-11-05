import { HTTP_STATUS } from '../common/constants/http-status-codes.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { isSuccessStatusCode } from '../common/helpers/utils.js'

const logger = createLogger()

export function handleBackendResponse(response, h, responseBodyFn) {
  logger.debug(`handleBackendResponse response.error ${response.error}`)
  logger.debug(`handleBackendResponse response.message ${response.message}`)
  logger.debug(
    `handleBackendResponse response.statusCode ${response.statusCode}`
  )
  logger.debug(`handleBackendResponse response ${JSON.stringify(response)}`)

  if (isSuccessStatusCode(response.statusCode)) {
    const successStatusCode =
      response.statusCode === HTTP_STATUS.CREATED
        ? HTTP_STATUS.CREATED
        : HTTP_STATUS.OK

    return responseBodyFn
      ? h.response(responseBodyFn()).code(successStatusCode)
      : h.code(successStatusCode)
  } else {
    return h
      .response({
        error: response.error,
        message: response.message
      })
      .code(response.statusCode)
  }
}
