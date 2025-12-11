import Wreck from '@hapi/wreck'
import { config } from '../../config.js'
import { withTraceId } from '@defra/hapi-tracing'

/**
 * Base configuration for the HTTP clients
 */
const defaultConfig = {
  timeout: 5000, // 5 seconds timeout
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  headers: {
    'Content-Type': 'application/json'
  }
}

/**
 * Creates a Wreck client with the given configuration
 * @param {Object} clientConfig - Client configuration
 * @returns {Object} Configured Wreck client
 */
function createClient(clientConfig = {}) {
  return Wreck.defaults({
    timeout: clientConfig.timeout || defaultConfig.timeout,
    headers: {
      ...defaultConfig.headers,
      ...clientConfig.headers
    },
    redirects: 3,
    maxBytes: 10485760, // 10MB
    rejectUnauthorized: true
  })
}

/**
 * Makes an HTTP request with retry logic
 * @param {Object} options - Request options
 * @param httpClient - httpClient to make requests
 * @returns {Promise<Object>} Response object
 */
async function makeRequest(options, httpClient) {
  const { url, method, payload, headers = {}, retryCount = 0 } = options
  const client =
    httpClient ||
    createClient({
      headers: withTraceId(config.get('tracing.header'), headers)
    })

  try {
    const response = await client.request(method, url, {
      payload: payload ? JSON.stringify(payload) : undefined
    })

    const responsePayload = await Wreck.read(response, { json: true })

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      payload: responsePayload
    }
  } catch (error) {
    if (retryCount < defaultConfig.maxRetries) {
      await new Promise((resolve) =>
        setTimeout(resolve, defaultConfig.retryDelay)
      )
      return makeRequest({ ...options, retryCount: retryCount + 1 }, httpClient)
    }
    throw error
  }
}

/**
 * Creates a service-specific client
 * @param {string} baseUrl - Base URL for the service
 * @param httpClient - used for mocking in tests
 * @returns {Object} Service client
 */
function createServiceClient(baseUrl, httpClient) {
  return {
    /**
     * Make a GET request
     * @param {string} path - API path
     * @param {Object} [headers] - Request headers
     * @returns {Promise<Object>} Response object
     */
    async get(path, headers = {}) {
      return makeRequest(
        {
          url: `${baseUrl}${path}`,
          method: 'GET',
          headers
        },
        httpClient
      )
    },

    /**
     * Make a POST request
     * @param {string} path - API path
     * @param {Object} payload - Request payload
     * @param {Object} [headers] - Request headers
     * @returns {Promise<Object>} Response object
     */
    async post(path, payload, headers = {}) {
      return makeRequest(
        {
          url: `${baseUrl}${path}`,
          method: 'POST',
          payload,
          headers
        },
        httpClient
      )
    },

    /**
     * Make a PUT request
     * @param {string} path - API path
     * @param {Object} payload - Request payload
     * @param {Object} [headers] - Request headers
     * @returns {Promise<Object>} Response object
     */
    async put(path, payload, headers = {}) {
      return makeRequest(
        {
          url: `${baseUrl}${path}`,
          method: 'PUT',
          payload,
          headers
        },
        httpClient
      )
    }
  }
}

/**
 * HTTP clients for different services
 */
const httpClients = {
  wasteTracking: createServiceClient(config.get('services.wasteTracking')),
  wasteMovement: createServiceClient(config.get('services.wasteMovement'))
}

export { httpClients, makeRequest, createServiceClient }
