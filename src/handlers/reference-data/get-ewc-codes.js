import {
  isValidHazardousEwcCode,
  validEwcCodes
} from '../../common/constants/ewc-codes.js'
import { HTTP_STATUS } from '../../common/constants/http-status-codes.js'
import { handleBackendResponse } from '../handle-backend-response.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()

export const handleGetEwcCodes = async (_request, h) => {
  try {
    const response = {
      statusCode: HTTP_STATUS.OK
    }
    const responseData = mapGetEwcCodesResponse()

    return handleBackendResponse(response, h, () => responseData)
  } catch (error) {
    logger.error({ err: error }, 'Error getting EWC codes')
    return h
      .response({
        error: 'Internal Server Error',
        message: 'Failed to get EWC codes'
      })
      .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

export const mapGetEwcCodesResponse = () =>
  validEwcCodes.map(({ code }) => ({
    code,
    isHazardous: isValidHazardousEwcCode(code)
  }))
