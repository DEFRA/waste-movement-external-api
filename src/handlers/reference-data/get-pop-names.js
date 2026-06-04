import { HTTP_STATUS, validPopNames } from 'waste-movement-utils'
import { handleBackendResponse } from '../handle-backend-response.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()

export const handleGetPopNames = async (_request, h) => {
  try {
    const response = {
      statusCode: HTTP_STATUS.OK
    }
    const responseData = mapGetPopNamesResponse()

    return handleBackendResponse(response, h, () => responseData)
  } catch (error) {
    logger.error({ err: error }, 'Error getting POP names')
    return h
      .response({
        error: 'Internal Server Error',
        message: 'Failed to get POP names'
      })
      .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

export const mapGetPopNamesResponse = () =>
  validPopNames.map(({ code, name }) => ({
    code,
    chemicalName: name
  }))
