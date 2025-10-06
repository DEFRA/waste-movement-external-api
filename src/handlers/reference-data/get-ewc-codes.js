import {
  isValidHazardousEwcCode,
  validEwcCodes
} from '../../common/constants/ewc-codes.js'
import { HTTP_STATUS } from '../../common/constants/http-status-codes.js'
import { handleBackendResponse } from '../handle-backend-response.js'

export const handleGetEwcCodes = async (request, h) => {
  try {
    console.debug('Auth Info:', request?.auth)

    const response = {
      statusCode: HTTP_STATUS.OK
    }
    const responseData = mapGetEwcCodesResponse()

    return handleBackendResponse(response, h, () => responseData)
  } catch (error) {
    console.error('Error getting EWC codes:', error)
    return h
      .response({
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Failed to get EWC codes'
      })
      .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

export const mapGetEwcCodesResponse = () =>
  validEwcCodes.map((code) => ({
    code,
    isHazardous: isValidHazardousEwcCode(code)
  }))
