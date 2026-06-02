import { createServer } from '../server.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import * as metrics from '../common/helpers/metrics.js'
import { httpClients } from '../common/helpers/http-client.js'

jest.mock('../common/helpers/metrics.js', () => ({
  metricsCounter: jest.fn()
}))

jest.mock('../common/helpers/http-client.js', () => ({
  httpClients: {
    wasteMovement: {
      put: jest.fn()
    },
    wasteTracking: {
      get: jest.fn()
    },
    wasteOrganisation: {
      get: jest.fn().mockResolvedValue({
        payload: {
          defraCustomerOrganisationId: 'd829f66d-857f-401d-b5e9-5061b7dbb29d'
        }
      })
    }
  }
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

    // Find the reasonForNoConsignmentCode error
    const reasonError = responseBody.validation.errors.find(
      (err) => err.message && err.message.includes('reasonForNoConsignmentCode')
    )

    // Verify the key is set correctly (not empty string)
    expect(reasonError).toBeDefined()
    expect(reasonError.key).toBe('reasonForNoConsignmentCode')
    expect(reasonError.errorType).toBe('BusinessRuleViolation')
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

    // Single emission per metric with endpointType dim (no clientId in test env)
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.errors.count',
      errorCount,
      { endpointType: 'post' }
    )
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.requests.with_errors',
      1,
      { endpointType: 'post' }
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

    // Single emission per metric with endpointType dim (no clientId in test env)
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.errors.count',
      errorCount,
      { endpointType: 'put' }
    )
    expect(metrics.metricsCounter).toHaveBeenCalledWith(
      'validation.requests.with_errors',
      1,
      { endpointType: 'put' }
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

    // Single emission per metric (no clientId in this test — auth disabled):
    // - 1 call for errors.count
    // - 1 call for requests.with_errors
    // - 1 call per error for error.reason
    // - 1 call per error for error.category
    // - 1 call for errors.by_status_code
    const expectedCalls = 3 + errorCount * 2
    expect(metrics.metricsCounter).toHaveBeenCalledTimes(expectedCalls)

    // Helper function matching production normalization logic
    const normalizeArrayIndices = (str) => str.replace(/\[\d+]/g, '[*]')

    // Verify each validation error has its normalized message emitted as errorReason
    for (const error of responseBody.validation.errors) {
      const expectedReason = normalizeArrayIndices(error.message)

      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'validation.error.reason',
        1,
        { endpointType: 'post', errorReason: expectedReason }
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
      expect(call[2].errorReason).not.toMatch(/\[\d+]/)
      expect(call[2].errorReason).toMatch(/\[\*]/)
    }
  })

  describe('Granular Error Categories', () => {
    test('should return InvalidType for wrong data type (string where number expected)', async () => {
      const basePayload = createMovementRequest()
      const payload = {
        ...basePayload,
        wasteItems: [
          {
            ...basePayload.wasteItems[0],
            numberOfContainers: '100' // String instead of number, with .strict() this should fail
          }
        ]
      }

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      const typeError = responseBody.validation.errors.find(
        (err) => err.key === 'wasteItems.0.numberOfContainers'
      )
      expect(typeError).toBeDefined()
      expect(typeError.errorType).toBe('InvalidType')
    })

    test('should return InvalidFormat for invalid UUID', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload: {
          apiCode: 'not-a-valid-uuid',
          dateTimeReceived: new Date().toISOString(),
          receiver: {
            siteName: 'Test Site',
            authorisationNumber: 'HP3456XX'
          },
          receipt: {
            address: {
              fullAddress: '123 Test St',
              postcode: 'SW1A 1AA'
            }
          }
        }
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      const formatError = responseBody.validation.errors.find(
        (err) => err.key === 'apiCode'
      )
      expect(formatError).toBeDefined()
      expect(formatError.errorType).toBe('InvalidFormat')
    })

    test('should return InvalidValue for invalid enum value', async () => {
      const basePayload = createMovementRequest()
      const payload = {
        ...basePayload,
        wasteItems: [
          {
            ...basePayload.wasteItems[0],
            physicalForm: 'InvalidPhysicalForm' // Not in the valid enum list
          }
        ]
      }

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      const valueError = responseBody.validation.errors.find(
        (err) => err.key === 'wasteItems.0.physicalForm'
      )
      expect(valueError).toBeDefined()
      expect(valueError.errorType).toBe('InvalidValue')
    })

    test('should return OutOfRange for negative number where min(0) required', async () => {
      const basePayload = createMovementRequest()
      const payload = {
        ...basePayload,
        wasteItems: [
          {
            ...basePayload.wasteItems[0],
            numberOfContainers: -5 // Negative number where min(0) is required
          }
        ]
      }

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      const rangeError = responseBody.validation.errors.find(
        (err) => err.key === 'wasteItems.0.numberOfContainers'
      )
      expect(rangeError).toBeDefined()
      expect(rangeError.errorType).toBe('OutOfRange')
    })

    test('should return BusinessRuleViolation for hazardous waste without consignment code or reason', async () => {
      const basePayload = createMovementRequest()
      const payload = {
        ...basePayload,
        wasteItems: [
          {
            ...basePayload.wasteItems[0],
            ewcCodes: ['200121'] // Hazardous EWC code
          }
        ]
      }

      // Remove consignment code and reason to trigger business rule violation
      delete payload.hazardousWasteConsignmentCode
      delete payload.reasonForNoConsignmentCode

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      // Should have a business rule violation error for the missing reason
      const businessRuleError = responseBody.validation.errors.find(
        (err) => err.errorType === 'BusinessRuleViolation'
      )
      expect(businessRuleError).toBeDefined()
    })

    test('should return InvalidFormat for invalid EWC code format', async () => {
      const basePayload = createMovementRequest()
      const payload = {
        ...basePayload,
        wasteItems: [
          {
            ...basePayload.wasteItems[0],
            ewcCodes: ['INVALID'] // Not a 6-digit code
          }
        ]
      }

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      const formatError = responseBody.validation.errors.find(
        (err) =>
          err.key === 'wasteItems.0.ewcCodes.0' &&
          err.errorType === 'InvalidFormat'
      )
      expect(formatError).toBeDefined()
    })

    test('should return InvalidValue for invalid EWC code value (not in list)', async () => {
      const basePayload = createMovementRequest()
      const payload = {
        ...basePayload,
        wasteItems: [
          {
            ...basePayload.wasteItems[0],
            ewcCodes: ['999999'] // 6-digit format but not a valid code
          }
        ]
      }

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      const valueError = responseBody.validation.errors.find(
        (err) =>
          err.key === 'wasteItems.0.ewcCodes.0' &&
          err.errorType === 'InvalidValue'
      )
      expect(valueError).toBeDefined()
    })

    test('should return InvalidFormat for invalid consignment code format', async () => {
      const basePayload = createMovementRequest()
      const payload = {
        ...basePayload,
        hazardousWasteConsignmentCode: 'INVALID_FORMAT',
        wasteItems: [
          {
            ...basePayload.wasteItems[0],
            ewcCodes: ['200121'] // Hazardous EWC code
          }
        ]
      }

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      const formatError = responseBody.validation.errors.find(
        (err) =>
          err.key === 'hazardousWasteConsignmentCode' &&
          err.errorType === 'InvalidFormat'
      )
      expect(formatError).toBeDefined()
    })

    test('should return InvalidFormat for invalid authorisation number', async () => {
      const basePayload = createMovementRequest()
      const payload = {
        ...basePayload,
        receiver: {
          ...basePayload.receiver,
          authorisationNumber: 'INVALID_AUTH_NUMBER'
        }
      }

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      const formatError = responseBody.validation.errors.find(
        (err) =>
          err.key === 'receiver.authorisationNumber' &&
          err.errorType === 'InvalidFormat'
      )
      expect(formatError).toBeDefined()
    })

    test('should return NotAllowed for unknown field in payload', async () => {
      const basePayload = createMovementRequest()
      const payload = {
        ...basePayload,
        unknownField: 'some value'
      }

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      const notAllowedError = responseBody.validation.errors.find(
        (err) => err.key === 'unknownField' && err.errorType === 'NotAllowed'
      )
      expect(notAllowedError).toBeDefined()
    })
  })

  describe('Error Category Metrics', () => {
    test('should log error category metrics for each validation error', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload: {
          yourUniqueReference: 'test-reference'
        }
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      // Single emission per error with endpointType + errorCategory
      for (const error of responseBody.validation.errors) {
        expect(metrics.metricsCounter).toHaveBeenCalledWith(
          'validation.error.category',
          1,
          { endpointType: 'post', errorCategory: error.errorType }
        )
      }
    })

    test('should log error category metrics with correct categories', async () => {
      const basePayload = createMovementRequest()
      const payload = {
        ...basePayload,
        unknownField: 'value', // NotAllowed
        wasteItems: [
          {
            ...basePayload.wasteItems[0],
            physicalForm: 'InvalidValue' // InvalidValue
          }
        ]
      }

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload
      })

      expect(response.statusCode).toBe(400)

      // Check NotAllowed category metric was logged
      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'validation.error.category',
        1,
        { endpointType: 'post', errorCategory: 'NotAllowed' }
      )

      // Check InvalidValue category metric was logged
      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'validation.error.category',
        1,
        { endpointType: 'post', errorCategory: 'InvalidValue' }
      )
    })

    test('should log error category metrics for PUT endpoint', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/movements/test-tracking-id/receive',
        payload: {
          yourUniqueReference: 'test-reference'
        }
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      // Single emission per error with endpointType + errorCategory
      for (const error of responseBody.validation.errors) {
        expect(metrics.metricsCounter).toHaveBeenCalledWith(
          'validation.error.category',
          1,
          { endpointType: 'put', errorCategory: error.errorType }
        )
      }
    })
  })

  describe('HTTP Status Code Metrics', () => {
    test('should log HTTP status code metric for 400 validation errors', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload: {
          yourUniqueReference: 'test-reference'
        }
      })

      expect(response.statusCode).toBe(400)

      // Single emission with endpointType + statusCode
      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'errors.by_status_code',
        1,
        { endpointType: 'post', statusCode: '400' }
      )
    })

    test('should log HTTP status code metric for PUT endpoint', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/movements/test-tracking-id/receive',
        payload: {
          yourUniqueReference: 'test-reference'
        }
      })

      expect(response.statusCode).toBe(400)

      // Single emission with endpointType + statusCode
      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'errors.by_status_code',
        1,
        { endpointType: 'put', statusCode: '400' }
      )
    })

    test('should log HTTP status code metric for non-400 errors (404)', async () => {
      // Mock the httpClient to throw a NotFoundError
      const notFoundError = new Error('Movement not found')
      notFoundError.name = 'NotFoundError'
      httpClients.wasteMovement.put.mockRejectedValueOnce(notFoundError)

      const response = await server.inject({
        method: 'PUT',
        url: '/movements/test-tracking-id/receive',
        payload: createMovementRequest()
      })

      expect(response.statusCode).toBe(404)

      // Single emission with endpointType + statusCode
      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'errors.by_status_code',
        1,
        { endpointType: 'put', statusCode: '404' }
      )
    })
  })

  describe('ClientId-scoped metrics', () => {
    let injectClientId

    beforeAll(() => {
      // JWT is disabled in test/local env (no strategy registered).
      // Use an onPostAuth hook (fires after auth, before validation) to
      // inject mock credentials so error-handler's
      // request.auth?.credentials?.clientId resolves even when validation
      // short-circuits the handler.
      server.ext('onPostAuth', (request, h) => {
        if (injectClientId && request.auth) {
          request.auth.credentials = { clientId: injectClientId }
        }
        return h.continue
      })
    })

    beforeEach(() => {
      injectClientId = 'test-client-id'
    })

    afterEach(() => {
      injectClientId = null
    })

    test('should include clientId in all metric dim sets for POST validation errors', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload: { yourUniqueReference: 'test' }
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      // Aggregate counts — single emission with endpointType + clientId
      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'validation.errors.count',
        responseBody.validation.errors.length,
        { endpointType: 'post', clientId: 'test-client-id' }
      )
      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'validation.requests.with_errors',
        1,
        { endpointType: 'post', clientId: 'test-client-id' }
      )

      // Per-error breakdown with endpointType + clientId
      const normalizeArrayIndices = (str) => str.replace(/\[\d+]/g, '[*]')
      for (const error of responseBody.validation.errors) {
        const errorReason = normalizeArrayIndices(error.message)
        expect(metrics.metricsCounter).toHaveBeenCalledWith(
          'validation.error.reason',
          1,
          { endpointType: 'post', errorReason, clientId: 'test-client-id' }
        )
        expect(metrics.metricsCounter).toHaveBeenCalledWith(
          'validation.error.category',
          1,
          {
            endpointType: 'post',
            errorCategory: error.errorType,
            clientId: 'test-client-id'
          }
        )
      }

      // Status code with endpointType + clientId
      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'errors.by_status_code',
        1,
        {
          endpointType: 'post',
          statusCode: '400',
          clientId: 'test-client-id'
        }
      )

      // Old un-clientId-scoped emissions no longer happen
      expect(metrics.metricsCounter).not.toHaveBeenCalledWith(
        'validation.requests.with_errors',
        1,
        { endpointType: 'post' }
      )
    })

    test('should include clientId for PUT validation errors', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/movements/test-tracking-id/receive',
        payload: { yourUniqueReference: 'test' }
      })

      expect(response.statusCode).toBe(400)

      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'validation.requests.with_errors',
        1,
        { endpointType: 'put', clientId: 'test-client-id' }
      )
      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'errors.by_status_code',
        1,
        { endpointType: 'put', statusCode: '400', clientId: 'test-client-id' }
      )
    })

    test('should include clientId for non-400 errors', async () => {
      const notFoundError = new Error('Movement not found')
      notFoundError.name = 'NotFoundError'
      httpClients.wasteMovement.put.mockRejectedValueOnce(notFoundError)

      const response = await server.inject({
        method: 'PUT',
        url: '/movements/test-tracking-id/receive',
        payload: createMovementRequest()
      })

      expect(response.statusCode).toBe(404)

      expect(metrics.metricsCounter).toHaveBeenCalledWith(
        'errors.by_status_code',
        1,
        { endpointType: 'put', statusCode: '404', clientId: 'test-client-id' }
      )
    })

    test('should omit clientId from dim sets when clientId absent', async () => {
      injectClientId = null

      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        payload: { yourUniqueReference: 'test' }
      })

      expect(response.statusCode).toBe(400)
      expect(metrics.metricsCounter).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        expect.objectContaining({ clientId: expect.anything() })
      )
    })
  })
})
