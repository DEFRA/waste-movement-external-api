import { createServer } from '../server.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import { handleErrors } from './error-handler.js'
import { HTTP_STATUS, METRIC_NAMES } from '@defra/waste-movement-utils'

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

// The receive routes require authentication (DWTA-337 removed the local-env
// bypass), so stub jwt-auth with a scheme that authenticates with empty
// credentials.
jest.mock('./jwt-auth.js', () => ({
  jwtAuth: {
    plugin: {
      name: 'jwt-auth',
      register(server) {
        server.auth.scheme('jwt', () => ({
          authenticate(request, h) {
            return h.authenticated({ credentials: {} })
          }
        }))
        server.auth.strategy('jwt', 'jwt')
        server.auth.default('jwt')
      }
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
      (err) => err.errorType === 'NotProvided'
    )
    expect(requiredFieldError).toBeDefined()
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

  describe('Malformed JSON payload', () => {
    test('should return 400 with validation error for invalid JSON escape sequence', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        headers: { 'content-type': 'application/json' },
        payload: '{"receiver":{"authorisationNumber":"po9099ci\\D12345"}}'
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      expect(responseBody).toEqual({
        validation: {
          errors: [
            {
              key: 'payload',
              errorType: 'InvalidFormat',
              message: 'Invalid request payload JSON format'
            }
          ]
        }
      })
    })

    test('should return 400 for structurally malformed JSON', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/movements/receive',
        headers: { 'content-type': 'application/json' },
        payload: '{"receiver" "value"}'
      })

      expect(response.statusCode).toBe(400)
      const responseBody = JSON.parse(response.payload)

      expect(responseBody.validation.errors[0].errorType).toBe('InvalidFormat')
    })
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

  describe('#handleErrors', () => {
    let request

    const h = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    beforeEach(() => {
      request = {
        response: {
          isBoom: true,
          output: {},
          details: [
            {
              message: '"apiCode" is required',
              path: ['apiCode'],
              type: 'any.required',
              context: { label: 'apiCode', key: 'apiCode' }
            },
            {
              message: '"dateTimeReceived" is required',
              path: ['dateTimeReceived'],
              type: 'any.required',
              context: { label: 'dateTimeReceived', key: 'dateTimeReceived' }
            }
          ]
        },
        logger: {
          info: jest.fn(),
          error: jest.fn()
        },
        method: 'POST',
        route: {
          path: '/movements/receive'
        }
      }
    })

    it('should log errors with a 400 response code', async () => {
      const infoLoggerSpy = jest.spyOn(request.logger, 'info')

      request.response.output.statusCode = HTTP_STATUS.BAD_REQUEST

      await handleErrors(request, h)

      expect(infoLoggerSpy).toHaveBeenCalledWith(
        `${METRIC_NAMES.VALIDATION_REQUESTS_WITH_ERRORS} - post`
      )
      expect(infoLoggerSpy).toHaveBeenCalledWith(
        `${METRIC_NAMES.VALIDATION_ERROR_REASON} - "apiCode" is required`
      )
      expect(infoLoggerSpy).toHaveBeenCalledWith(
        `${METRIC_NAMES.VALIDATION_ERROR_REASON} - "dateTimeReceived" is required`
      )
      expect(infoLoggerSpy).toHaveBeenCalledWith(
        `${METRIC_NAMES.VALIDATION_ERROR_CATEGORY} - NotProvided`
      )
      expect(infoLoggerSpy).toHaveBeenCalledWith(
        `${METRIC_NAMES.ERRORS_BY_STATUS_CODE} - ${HTTP_STATUS.BAD_REQUEST}`
      )
      expect(infoLoggerSpy).toHaveBeenCalledTimes(6)
    })

    it('should log errors with a non-400 response code', async () => {
      const infoLoggerSpy = jest.spyOn(request.logger, 'info')

      request.response.output.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR

      await handleErrors(request, h)

      expect(infoLoggerSpy).toHaveBeenCalledWith(
        `${METRIC_NAMES.ERRORS_BY_STATUS_CODE} - ${HTTP_STATUS.INTERNAL_SERVER_ERROR}`
      )
      expect(infoLoggerSpy).toHaveBeenCalledTimes(1)
    })

    it('should normalize array indices in the logged error reason', async () => {
      const infoLoggerSpy = jest.spyOn(request.logger, 'info')

      request.response.output.statusCode = HTTP_STATUS.BAD_REQUEST
      request.response.details = [
        {
          message: '"wasteItems[0].weight.metric" is required',
          path: ['wasteItems', 0, 'weight', 'metric'],
          type: 'any.required',
          context: { label: 'wasteItems[0].weight.metric', key: 'metric' }
        }
      ]

      await handleErrors(request, h)

      expect(infoLoggerSpy).toHaveBeenCalledWith(
        `${METRIC_NAMES.VALIDATION_ERROR_REASON} - "wasteItems[*].weight.metric" is required`
      )
    })

    it('should log the endpoint type for PUT requests', async () => {
      const infoLoggerSpy = jest.spyOn(request.logger, 'info')

      request.method = 'PUT'
      request.route.path = '/movements/{wasteTrackingId}/receive'
      request.response.output.statusCode = HTTP_STATUS.BAD_REQUEST

      await handleErrors(request, h)

      expect(infoLoggerSpy).toHaveBeenCalledWith(
        `${METRIC_NAMES.VALIDATION_REQUESTS_WITH_ERRORS} - put`
      )
    })

    it('should not log for non-receipt-movement endpoints', async () => {
      const infoLoggerSpy = jest.spyOn(request.logger, 'info')

      request.route.path = '/health'
      request.response.output.statusCode = HTTP_STATUS.BAD_REQUEST

      await handleErrors(request, h)

      expect(infoLoggerSpy).not.toHaveBeenCalled()
    })
  })
})
