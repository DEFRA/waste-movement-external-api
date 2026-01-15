import { HTTP_STATUS } from '../constants/http-status-codes.js'

/**
 * Determines if a response status code is a success status code
 * @param {Number} statusCode - The response status code
 * @returns {Boolean} True if the status code is a success status code, otherwise false
 */
export const isSuccessStatusCode = (statusCode) =>
  statusCode >= HTTP_STATUS.OK && statusCode < HTTP_STATUS.BAD_REQUEST

/**
 * Normalize array indices in strings by replacing with wildcards
 * e.g., "wasteItems[0].physicalForm" -> "wasteItems[*].physicalForm"
 * @param {String} str - The string to normalize
 * @returns {String} The normalized string
 */
export const normalizeArrayIndices = (str) => {
  return str.replace(/\[\d+]/g, '[*]')
}
