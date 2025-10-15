import { DISPOSAL_OR_RECOVERY_CODES } from '../../common/constants/treatment-codes.js'
import { HTTP_STATUS } from '../../common/constants/http-status-codes.js'
import { handleBackendResponse } from '../handle-backend-response.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()

export const handleGetDisposalOrRecoveryCodes = async (_request, h) => {
  try {
    const response = {
      statusCode: HTTP_STATUS.OK
    }
    const responseData = mapGetDisposalOrRecoveryCodesResponse()

    return handleBackendResponse(response, h, () => responseData)
  } catch (error) {
    logger.error({ err: error }, 'Error getting disposal or recovery codes')
    return h
      .response({
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Failed to get disposal or recovery codes'
      })
      .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

export const mapGetDisposalOrRecoveryCodesResponse = () =>
  DISPOSAL_OR_RECOVERY_CODES.map((code) => ({
    code
  }))
