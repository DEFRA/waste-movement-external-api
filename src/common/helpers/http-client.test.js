import { makeRequest } from './http-client.js'
import Wreck from '@hapi/wreck'
import * as hapiTracing from '@defra/hapi-tracing'

jest.mock('@hapi/wreck', () => ({
  defaults: jest.fn().mockReturnValue({
    request: jest.fn().mockReturnValue({})
  }),
  read: jest.fn()
}))

describe('http-client', () => {
  describe('#makeRequest', () => {
    it('should create a client with the correct headers', async () => {
      const basicHeaders = { 'Content-Type': 'application/json' }
      const headers = {
        ...basicHeaders,
        'x-cdp-request-id': 'request-id-123'
      }
      const wreckDefaultsSpy = jest.spyOn(Wreck, 'defaults')

      jest.spyOn(hapiTracing, 'withTraceId').mockReturnValue(headers)

      await makeRequest({
        url: 'http://localhost:3000',
        method: 'POST',
        payload: { wasteTrackingId: 12 },
        headers: basicHeaders,
        retryCount: 0
      })

      expect(wreckDefaultsSpy).toHaveBeenCalledWith({
        timeout: 5000,
        headers,
        redirects: 3,
        maxBytes: 10485760,
        rejectUnauthorized: true
      })
    })
  })
})
