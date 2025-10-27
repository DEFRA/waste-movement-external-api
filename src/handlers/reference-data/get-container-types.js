import { HTTP_STATUS } from '../../common/constants/http-status-codes.js'
import { handleBackendResponse } from '../handle-backend-response.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { validContainerTypes } from '../../common/constants/container-types.js'

const logger = createLogger()

export const handleGetContainerTypes = async (_request, h) => {
  try {
    const response = {
      statusCode: HTTP_STATUS.OK
    }
    const responseData = mapGetContainerTypesResponse()

    return handleBackendResponse(response, h, () => responseData)
  } catch (error) {
    logger.error({ err: error }, 'Error getting container types')
    return h
      .response({
        error: 'Internal Server Error',
        message: 'Failed to get container types'
      })
      .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

export const mapGetContainerTypesResponse = () =>
  validContainerTypes.map((containerType) => ({
    code: containerType
  }))
