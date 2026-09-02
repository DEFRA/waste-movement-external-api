import {
  HTTP_STATUS,
  productionApprovalTestsResults
} from '@defra/waste-movement-utils'
import { httpClients } from '../common/helpers/http-client.js'
import { handleProductionApprovalTests } from './production-approval-tests.js'
import * as handleBackendResponse from './handle-backend-response.js'

jest.mock('../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteMovement: {
      post: jest.fn()
    }
  }
}))

describe('#handleProductionApprovalTests', () => {
  const h = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  }
  const wasteMovementBackendSuccessPayload = {
    submissionId: '6a75b4bbe8624f6a79240d78',
    results: Object.values(productionApprovalTestsResults)
  }

  it('should handle a response from Waste Movement Backend Service', async () => {
    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: HTTP_STATUS.OK,
      payload: wasteMovementBackendSuccessPayload
    })

    const handleBackendResponseSpy = jest.spyOn(
      handleBackendResponse,
      'handleBackendResponse'
    )

    const result = await handleProductionApprovalTests(
      { payload: Object.values(productionApprovalTestsResults) },
      h
    )

    expect(handleBackendResponseSpy).toHaveBeenCalledWith(
      {
        statusCode: HTTP_STATUS.OK,
        payload: wasteMovementBackendSuccessPayload
      },
      h,
      expect.any(Function)
    )

    expect(result).toEqual(h)
  })

  it('should handle an error', async () => {
    await expect(() =>
      handleProductionApprovalTests({}, {})
    ).rejects.toThrowError()
  })
})
