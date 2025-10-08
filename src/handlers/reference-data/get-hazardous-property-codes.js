import { validHazCodes } from '../../common/constants/haz-codes.js'
import { HTTP_STATUS } from '../../common/constants/http-status-codes.js'
import { handleBackendResponse } from '../handle-backend-response.js'

export const handleGetHazardousPropertyCodes = async (_request, h) => {
  try {
    const response = {
      statusCode: HTTP_STATUS.OK
    }
    const responseData = mapGetHazardousPropertyCodesResponse()

    return handleBackendResponse(response, h, () => responseData)
  } catch (error) {
    console.error('Error getting hazardous property codes:', error)
    return h
      .response({
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Failed to get hazardous property codes'
      })
      .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

export const mapGetHazardousPropertyCodesResponse = () =>
  validHazCodes.map((code) => ({
    code
  }))
