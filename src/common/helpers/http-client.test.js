import Wreck from '@hapi/wreck'
import { createServiceClient, makeRequest } from './http-client.js'

jest.mock('@hapi/wreck', () => ({
  defaults: jest.fn().mockReturnValue({
    request: jest.fn()
  })
}))

describe('#http-client', () => {
  let mockRequest

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = Wreck.defaults().request

    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('makeRequest', () => {
    const mockOptions = {
      url: 'https://example.com/api',
      method: 'GET',
      headers: { 'X-Test': 'test' }
    }

    const mockResponse = {
      statusCode: 200,
      headers: { 'content-type': 'application/json' }
    }

    const mockPayload = { data: 'test data' }

    test('should make a successful request', async () => {
      mockRequest.mockResolvedValueOnce({
        res: mockResponse,
        payload: Buffer.from(JSON.stringify(mockPayload))
      })

      const mockClient = {
        request: mockRequest
      }

      const result = await makeRequest(mockOptions, mockClient)

      expect(mockRequest).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        statusCode: mockResponse.statusCode,
        headers: mockResponse.headers,
        payload: expect.any(Buffer)
      })
    })

    test('should call client.request with correct parameters', async () => {
      mockRequest.mockResolvedValueOnce({
        res: mockResponse,
        payload: Buffer.from(JSON.stringify(mockPayload))
      })

      const mockClient = {
        request: mockRequest
      }

      await makeRequest(mockOptions, mockClient)

      expect(mockRequest).toHaveBeenCalledTimes(1)
      expect(mockRequest).toHaveBeenCalledWith(
        mockOptions.method,
        mockOptions.url,
        expect.objectContaining({
          payload: undefined
        })
      )
    })

    test('should throw an error when client.request throws an error', async () => {
      const error = new Error('Request failed')
      mockRequest.mockRejectedValue(error)

      const mockClient = {
        request: mockRequest
      }

      const response = makeRequest(mockOptions, mockClient)

      expect(response).rejects.toThrow('Request failed')
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })

    test('should handle GET requests', async () => {
      mockRequest.mockResolvedValueOnce({
        res: mockResponse,
        payload: Buffer.from(JSON.stringify({ success: true }))
      })

      const mockClient = {
        request: mockRequest
      }

      const result = await createServiceClient(
        'https://example.com/api',
        mockClient
      ).get('/endpoint-path')

      expect(mockRequest).toHaveBeenCalledTimes(1)
      expect(mockRequest).toHaveBeenCalledWith(
        'GET',
        'https://example.com/api/endpoint-path',
        expect.objectContaining({
          payload: JSON.stringify(undefined)
        })
      )
      expect(result.statusCode).toBe(200)
    })

    test('should handle POST requests with payload', async () => {
      mockRequest.mockResolvedValueOnce({
        res: mockResponse,
        payload: Buffer.from(JSON.stringify({ success: true }))
      })

      const postPayload = { name: 'Test', value: 123 }

      const mockClient = {
        request: mockRequest
      }

      const result = await createServiceClient(
        'https://example.com/api',
        mockClient
      ).post('/endpoint-path', postPayload)

      expect(mockRequest).toHaveBeenCalledTimes(1)
      expect(mockRequest).toHaveBeenCalledWith(
        'POST',
        'https://example.com/api/endpoint-path',
        expect.objectContaining({
          payload: JSON.stringify(postPayload)
        })
      )
      expect(result.statusCode).toBe(200)
    })

    test('should handle PUT requests with payload', async () => {
      mockRequest.mockResolvedValueOnce({
        res: mockResponse,
        payload: Buffer.from(JSON.stringify({ success: true }))
      })

      const putPayload = { id: 1, name: 'Updated Test' }

      const mockClient = {
        request: mockRequest
      }

      const result = await createServiceClient(
        'https://example.com/api',
        mockClient
      ).put('/endpoint-path', putPayload)

      expect(mockRequest).toHaveBeenCalledTimes(1)
      expect(mockRequest).toHaveBeenCalledWith(
        'PUT',
        'https://example.com/api/endpoint-path',
        expect.objectContaining({
          payload: JSON.stringify(putPayload)
        })
      )
      expect(result.statusCode).toBe(200)
    })

    test('should handle requests with custom headers', async () => {
      mockRequest.mockResolvedValueOnce({
        res: mockResponse,
        payload: Buffer.from(JSON.stringify(mockPayload))
      })

      const customHeaders = {
        Authorization: 'Bearer token123',
        'X-Custom-Header': 'custom-value'
      }

      const mockClient = {
        request: mockRequest
      }

      await makeRequest(
        {
          ...mockOptions,
          headers: customHeaders
        },
        mockClient
      )

      expect(mockRequest).toHaveBeenCalledTimes(1)
      expect(mockRequest).toHaveBeenCalledWith(
        mockOptions.method,
        mockOptions.url,
        expect.anything()
      )
    })

    test('should handle undefined payload', async () => {
      mockRequest.mockResolvedValueOnce({
        res: mockResponse,
        payload: undefined
      })

      const mockClient = {
        request: mockRequest
      }

      const result = await makeRequest(mockOptions, mockClient)

      expect(result.payload).toBeUndefined()
    })
  })
})
