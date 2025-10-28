import { HTTP_STATUS } from '../common/constants/http-status-codes.js'

export function handleBackendResponse(response, h, responseBodyFn) {
  if (
    response.statusCode >= HTTP_STATUS.OK &&
    response.statusCode < HTTP_STATUS.BAD_REQUEST
  ) {
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
