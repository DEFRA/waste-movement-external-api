import { hazardousPropertyCodes } from '../../common/constants/haz-codes.js'
import { HTTP_STATUS } from '../../common/constants/http-status-codes.js'
import { handleBackendResponse } from '../handle-backend-response.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()

export const handleGetHazardousPropertyCodes = async (_request, h) => {
  try {
    const response = {
      statusCode: HTTP_STATUS.OK
    }
    const responseData = mapGetHazardousPropertyCodesResponse()

    return handleBackendResponse(response, h, () => responseData)
  } catch (error) {
    logger.error({ err: error }, 'Error getting hazardous property codes')
    return h
      .response({
        error: 'Internal Server Error',
        message: 'Failed to get hazardous property codes'
      })
      .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

export const mapGetHazardousPropertyCodesResponse = () =>
  hazardousPropertyCodes.map(({ code, shortDesc, longDesc }) => ({
    code,
    shortDesc,
    longDesc
  }))
