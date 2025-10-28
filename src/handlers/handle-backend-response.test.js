import { jest } from '@jest/globals'
import { handleBackendResponse } from './handle-backend-response.js'
import { HTTP_STATUS } from '../common/constants/http-status-codes.js'

describe('handleBackendResponse', () => {
  const mockH = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return error response when status code is a client error (400-500)', () => {
    const response = {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      error: 'Bad Request',
      message: 'Invalid input'
    }

    handleBackendResponse(response, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      error: 'Bad Request',
      message: 'Invalid input'
    })
    expect(mockH.code).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
  })

  it('should handle 450 error response', () => {
    const response = {
      statusCode: 450,
      error: 'Custom Error',
      message: 'Custom error message'
    }

    handleBackendResponse(response, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      error: 'Custom Error',
      message: 'Custom error message'
    })
    expect(mockH.code).toHaveBeenCalledWith(450)
  })

  it('should handle INTERNAL_SERVER_ERROR response', () => {
    const response = {
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Server error occurred'
    }

    handleBackendResponse(response, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Server error occurred'
    })
    expect(mockH.code).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  })

  it('should return response with body when responseBodyFn is provided', () => {
    const response = {
      statusCode: HTTP_STATUS.OK
    }
    const responseBodyFn = jest.fn().mockReturnValue({ data: 'test data' })

    handleBackendResponse(response, mockH, responseBodyFn)

    expect(responseBodyFn).toHaveBeenCalled()
    expect(mockH.response).toHaveBeenCalledWith({ data: 'test data' })
    expect(mockH.code).toHaveBeenCalledWith(HTTP_STATUS.OK)
  })

  it('should return empty response when responseBodyFn is not provided', () => {
    const response = {
      statusCode: HTTP_STATUS.OK
    }

    handleBackendResponse(response, mockH)

    expect(mockH.response).not.toHaveBeenCalled()
    expect(mockH.code).toHaveBeenCalledWith(HTTP_STATUS.OK)
  })

  it('should handle NOT_FOUND error response', () => {
    const response = {
      statusCode: HTTP_STATUS.NOT_FOUND,
      error: 'Not Found',
      message: 'Resource not found'
    }

    handleBackendResponse(response, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      error: 'Not Found',
      message: 'Resource not found'
    })
    expect(mockH.code).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND)
  })

  it('should handle FORBIDDEN error response', () => {
    const response = {
      statusCode: HTTP_STATUS.FORBIDDEN,
      error: 'Forbidden',
      message: 'Access denied'
    }

    handleBackendResponse(response, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      error: 'Forbidden',
      message: 'Access denied'
    })
    expect(mockH.code).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN)
  })
})
