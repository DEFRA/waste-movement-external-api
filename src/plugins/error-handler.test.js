import { createServer } from '../server.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import * as metrics from '../common/helpers/metrics.js'

jest.mock('../common/helpers/metrics.js', () => ({
  metricsCounter: jest.fn()
}))

describe('Error Handler', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should format validation errors correctly', async () => {
    // Send a request with missing required fields
    const response = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: {
        // Missing required organisationApiKey
        yourUniqueReference: 'test-reference'
      }
    })

    // Check status code
    expect(response.statusCode).toBe(400)

    // Parse response
    const responseBody = JSON.parse(response.payload)

    // Check response structure
    expect(responseBody).toHaveProperty('validation')
    expect(responseBody.validation).toHaveProperty('errors')
    expect(Array.isArray(responseBody.validation.errors)).toBe(true)

    // Check at least one error exists
    expect(responseBody.validation.errors.length).toBeGreaterThan(0)

    // Check error format
    const error = responseBody.validation.errors[0]
    expect(error).toHaveProperty('key')
    expect(error).toHaveProperty('errorType')
    expect(error).toHaveProperty('message')

    // Check that the required field error has errorType 'NotProvided'
    const requiredFieldError = responseBody.validation.errors.find(
      (err) => err.key === 'apiCode'
    )
    expect(requiredFieldError).toBeDefined()
    expect(requiredFieldError.errorType).toBe('NotProvided')

    // Log the full response for debugging
    console.log(
      '[DEBUG_LOG] Validation error response:',
      JSON.stringify(responseBody, null, 2)
    )
  })

  test('should set correct key for custom schema-level validation errors', async () => {
    // Test the reasonForNoConsignmentCode validation error
    // When hazardous EWC code is used without consignment code or reason
    const basePayload = createMovementRequest()

    // Modify to use hazardous EWC code and remove consignment code fields
    const payload = {
      ...basePayload,
      wasteItems: [
        {
          ...basePayload.wasteItems[0],
          ewcCodes: ['200121'] // hazardous code
        }
      ]
    }

    // Ensure we don't send the hazardous fields to trigger the validation
    delete payload.hazardousWasteConsignmentCode
    delete payload.reasonForNoConsignmentCode

    const response = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload
    })

    expect(response.statusCode).toBe(400)
    const responseBody = JSON.parse(response.payload)

    // Debug: log all errors to see what we got
    console.log(
      '[DEBUG] All validation errors:',
      JSON.stringify(responseBody.validation.errors, null, 2)
    )

    // Find the reasonForNoConsignmentCode error
    const reasonError = responseBody.validation.errors.find(
      (err) => err.message && err.message.includes('reasonForNoConsignmentCode')
    )

    // Verify the key is set correctly (not empty string)
    expect(reasonError).toBeDefined()
    expect(reasonError.key).toBe('reasonForNoConsignmentCode')
    expect(reasonError.errorType).toBe('UnexpectedError')
  })

  test('should not create misleading keys from built-in Joi error types', async () => {
    // This test ensures that built-in Joi errors like 'any.required' don't get
    // their error type prefix extracted as a key (which would result in key: 'any')
    const response = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: {
        // Send minimal payload to trigger various validation errors
        apiCode: 'not-a-uuid' // Invalid format
      }
    })

    expect(response.statusCode).toBe(400)
    const responseBody = JSON.parse(response.payload)

    // Ensure no error has key 'any' (which would be a regression)
    const misleadingKeyError = responseBody.validation.errors.find(
      (err) => err.key === 'any'
    )
    expect(misleadingKeyError).toBeUndefined()

    // All errors should have either a proper field name or empty string
    responseBody.validation.errors.forEach((err) => {
      expect(err.key).not.toBe('any')
      expect(err.key).not.toBe('object')
      expect(err.key).not.toBe('string')
    })
  })

  test('should log validation error metrics for POST receipt movement endpoint', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: {
        yourUniqueReference: 'test-reference'
      }
    })

    expect(response.statusCode).toBe(400)
    const responseBody = JSON.parse(response.payload)
    const errorCount = responseBody.validation.errors.length

    // Verify metrics were called with correct arguments
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.errors.count',
      errorCount,
      { endpointType: 'post' }
    )
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.errors.count',
      errorCount
    )
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.requests.with_errors',
      1,
      { endpointType: 'post' }
    )
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.requests.with_errors',
      1
    )
  })

  test('should log validation error metrics for PUT receipt movement endpoint', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: '/movements/test-tracking-id/receive',
      payload: {
        yourUniqueReference: 'test-reference'
      }
    })

    expect(response.statusCode).toBe(400)
    const responseBody = JSON.parse(response.payload)
    const errorCount = responseBody.validation.errors.length

    // Verify metrics were called with correct arguments
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.errors.count',
      errorCount,
      { endpointType: 'put' }
    )
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.errors.count',
      errorCount
    )
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.requests.with_errors',
      1,
      { endpointType: 'put' }
    )
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.requests.with_errors',
      1
    )
  })

  test('should not log metrics for non-receipt-movement endpoints', async () => {
    // Hit a non-receipt-movement endpoint
    const response = await server.inject({
      method: 'GET',
      url: '/health'
    })

    expect(response.statusCode).toBe(200)

    // Verify metricsCounter was NOT called for non-receipt endpoints
    expect(metrics.metricsCounter).not.toHaveBeenCalled()
  })

  test('should log correct number of metrics for validation errors', async () => {
    await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: { yourUniqueReference: 'test' }
    })

    // Should have exactly 4 calls (2 for errors.count, 2 for requests.with_errors)
    expect(metrics.metricsCounter).toHaveBeenCalledTimes(4)
  })
})
