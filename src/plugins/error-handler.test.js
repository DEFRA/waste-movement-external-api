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

  test('should log per-error reason metrics with correct dimension values', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: { yourUniqueReference: 'test' }
    })

    const responseBody = JSON.parse(response.payload)
    const errorCount = responseBody.validation.errors.length

    // Should have:
    // - 2 calls for errors.count (with dimension + without)
    // - 2 calls for requests.with_errors (with dimension + without)
    // - 2 calls per validation error for error.reason (with dimension + without)
    const expectedCalls = 4 + errorCount * 2
    expect(metrics.metricsCounter).toHaveBeenCalledTimes(expectedCalls)

    // Helper functions matching production normalization logic
    const sanitizeErrorMessage = (msg) =>
      msg.replace(/ with value "[^"]*"/g, '')
    const normalizeArrayIndices = (str) => str.replace(/\[\d+\]/g, '[*]')
    const normalizeErrorReason = (msg) =>
      normalizeArrayIndices(sanitizeErrorMessage(msg))

    // Verify each validation error has its normalized message emitted as errorReason
    for (const error of responseBody.validation.errors) {
      const expectedReason = normalizeErrorReason(error.message)

      // Should be called with endpointType + errorReason
      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'validation.error.reason',
        1,
        { endpointType: 'post', errorReason: expectedReason }
      )
      // Should also be called with just errorReason (for totals)
      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'validation.error.reason',
        1,
        { errorReason: expectedReason }
      )
    }
  })

  test('should normalize array indices in error reason metrics', async () => {
    // Create a payload that will trigger array-indexed validation errors
    const response = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: {
        apiCode: '00000000-0000-0000-0000-000000000000',
        dateTimeReceived: new Date().toISOString(),
        receiver: {
          siteName: 'Test Site',
          authorisationNumber: 'HP3456XX',
          address: {
            fullAddress: '123 Test St',
            postcode: 'SW1A 1AA'
          }
        },
        receipt: {
          wasteAccepted: true
        },
        wasteItems: [
          {
            ewcCodes: ['170504'],
            // Invalid value to trigger array-indexed error message
            physicalForm: 'InvalidValue'
          }
        ]
      }
    })

    expect(response.statusCode).toBe(400)

    // Check that array indices are normalized in the errorReason
    const calls = metrics.metricsCounter.mock.calls
    const reasonCalls = calls.filter(
      (call) => call[0] === 'validation.error.reason'
    )

    // Find any call with wasteItems in the errorReason
    const arrayIndexedCalls = reasonCalls.filter((call) =>
      call[2]?.errorReason?.includes('wasteItems')
    )

    // Assert that we actually produced array-indexed errors to test normalization
    expect(arrayIndexedCalls.length).toBeGreaterThan(0)

    // Verify all array-indexed errors use [*] not [0]
    for (const call of arrayIndexedCalls) {
      expect(call[2].errorReason).not.toMatch(/\[\d+\]/)
      expect(call[2].errorReason).toMatch(/\[\*\]/)
    }
  })

  test('should sanitize user values from error messages in metrics', async () => {
    // Create a payload with an invalid value that Joi will include in the message
    const response = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: {
        apiCode: '00000000-0000-0000-0000-000000000000',
        dateTimeReceived: new Date().toISOString(),
        receiver: {
          siteName: 'Test Site',
          authorisationNumber: 'HP3456XX',
          address: {
            fullAddress: '123 Test St',
            postcode: 'SW1A 1AA'
          }
        },
        receipt: {
          wasteAccepted: true
        },
        carrier: {
          // Invalid registration number that will appear in "with value" message
          registrationNumber: 'INVALID_REG_123'
        }
      }
    })

    expect(response.statusCode).toBe(400)

    // Check that no metric contains "with value" (user data)
    const calls = metrics.metricsCounter.mock.calls
    const reasonCalls = calls.filter(
      (call) => call[0] === 'validation.error.reason'
    )

    for (const call of reasonCalls) {
      expect(call[2].errorReason).not.toMatch(/with value/)
    }
  })
})
