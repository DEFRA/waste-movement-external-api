import Wreck from '@hapi/wreck'
import { config } from '../../config.js'

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
 * @param {Object} config - Client configuration
 * @returns {Object} Configured Wreck client
 */
function createClient(config = {}) {
  return Wreck.defaults({
    timeout: config.timeout || defaultConfig.timeout,
    headers: {
      ...defaultConfig.headers,
      ...config.headers
    },
    redirects: 3,
    maxBytes: 10485760, // 10MB
    rejectUnauthorized: true
  })
}

/**
 * Makes an HTTP request with retry logic
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response object
 */
async function makeRequest(options) {
  const { url, method, payload, headers = {}, retryCount = 0 } = options
  const client = createClient({ headers })

  try {
    const { res, payload: responsePayload } = await client.request(
      method,
      url,
      {
        payload: payload ? JSON.stringify(payload) : undefined
      }
    )

    return {
      statusCode: res.statusCode,
      headers: res.headers,
      payload: responsePayload
    }
  } catch (error) {
    if (retryCount < defaultConfig.maxRetries) {
      await new Promise((resolve) =>
        setTimeout(resolve, defaultConfig.retryDelay)
      )
      return makeRequest({ ...options, retryCount: retryCount + 1 })
    }
    throw error
  }
}

/**
 * Creates a service-specific client
 * @param {string} baseUrl - Base URL for the service
 * @returns {Object} Service client
 */
function createServiceClient(baseUrl) {
  return {
    /**
     * Make a GET request
     * @param {string} path - API path
     * @param {Object} [headers] - Request headers
     * @returns {Promise<Object>} Response object
     */
    async get(path, headers = {}) {
      return makeRequest({
        url: `${baseUrl}${path}`,
        method: 'GET',
        headers
      })
    },

    /**
     * Make a POST request
     * @param {string} path - API path
     * @param {Object} payload - Request payload
     * @param {Object} [headers] - Request headers
     * @returns {Promise<Object>} Response object
     */
    async post(path, payload, headers = {}) {
      return makeRequest({
        url: `${baseUrl}${path}`,
        method: 'POST',
        payload,
        headers
      })
    },

    /**
     * Make a PUT request
     * @param {string} path - API path
     * @param {Object} payload - Request payload
     * @param {Object} [headers] - Request headers
     * @returns {Promise<Object>} Response object
     */
    async put(path, payload, headers = {}) {
      return makeRequest({
        url: `${baseUrl}${path}`,
        method: 'PUT',
        payload,
        headers
      })
    },

    /**
     * Make a DELETE request
     * @param {string} path - API path
     * @param {Object} [headers] - Request headers
     * @returns {Promise<Object>} Response object
     */
    async delete(path, headers = {}) {
      return makeRequest({
        url: `${baseUrl}${path}`,
        method: 'DELETE',
        headers
      })
    }
  }
}

/**
 * HTTP clients for different services
 */
const httpClients = {
  wasteTracking: createServiceClient(config.get('services.wasteTracking')),
  wasteMovement: createServiceClient(config.get('services.wasteMovement')),

  /**
   * Configure the HTTP clients
   * @param {Object} newConfig - New configuration
   */
  configure(newConfig) {
    Object.assign(defaultConfig, newConfig)
  }
}

export { httpClients }
