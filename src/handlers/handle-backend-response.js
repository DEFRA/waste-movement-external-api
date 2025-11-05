import { HTTP_STATUS } from '../common/constants/http-status-codes.js'
import { isSuccessStatusCode } from '../common/helpers/utils.js'

export function handleBackendResponse(response, h, responseBodyFn) {
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
