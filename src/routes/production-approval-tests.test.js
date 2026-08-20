import {
  HTTP_STATUS,
  productionApprovalTestsResults
} from '@defra/waste-movement-utils'
import { productionApprovalTests } from './production-approval-tests.js'
import { httpClients } from '../common/helpers/http-client.js'

jest.mock('../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteMovement: {
      post: jest.fn()
    }
  }
}))

describe('#productionApprovalTests', () => {
  it('should return a proxied response from Waste Movement Backend Service', async () => {
    const wasteMovementBackendSuccessPayload = {
      submissionId: '6a75b4bbe8624f6a79240d78',
      results: Object.values(productionApprovalTestsResults)
    }
    const request = {
      payload: Object.values(productionApprovalTestsResults)
    }
    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    httpClients.wasteMovement.post.mockResolvedValue({
      statusCode: HTTP_STATUS.OK,
      payload: wasteMovementBackendSuccessPayload
    })

    await productionApprovalTests.handler(request, h)

    expect(h.response).toHaveBeenCalledWith(wasteMovementBackendSuccessPayload)
    expect(h.code).toHaveBeenCalledWith(HTTP_STATUS.OK)
  })

  it('should handle an error', async () => {
    await expect(() =>
      productionApprovalTests.handler({}, {})
    ).rejects.toThrowError()
  })
})
