import { HTTP_STATUS } from '../common/constants/http-status-codes.js'

export function handleBackendResponse(response, h, responseBodyFn) {
  if (
    response.statusCode >= HTTP_STATUS.BAD_REQUEST &&
    response.statusCode < HTTP_STATUS.INTERNAL_SERVER_ERROR
  ) {
    return h
      .response({
        statusCode: response.statusCode,
        error: response.error,
        message: response.message
      })
      .code(response.statusCode)
  }

  if (responseBodyFn) {
    return h.response(responseBodyFn()).code(HTTP_STATUS.OK)
  } else {
    return h.code(HTTP_STATUS.OK)
  }
}
