import { httpClients } from '../common/helpers/http-client.js'
import { handleBackendResponse } from './handle-backend-response.js'
import { handleErrorResponse } from '../common/helpers/handle-error-response.js'

export const handleProductionApprovalTests = async (request, h) => {
  try {
    const wasteMovementResponse = await httpClients.wasteMovement.post(
      '/production-approval-tests',
      request.payload
    )

    return handleBackendResponse(
      wasteMovementResponse,
      h,
      () => wasteMovementResponse.payload
    )
  } catch (error) {
    return handleErrorResponse(error)
  }
}
