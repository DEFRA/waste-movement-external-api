import { createLogger } from './logging/logger.js'
import { normalizeArrayIndices } from './utils.js'
import { METRIC_NAMES } from '@defra/waste-movement-utils'

const logger = createLogger()

/**
 * Logs receipt received.
 * @param {string} endpointType - The endpoint type ('post' or 'put')
 */
const logReceiptMetrics = (endpointType) => {
  logger.info(`${METRIC_NAMES.RECEIPTS_RECEIVED} - ${endpointType}`)
}

/**
 * Logs validation warnings.
 * @param {Array} warnings - The validation warnings array
 */
const logWarningMetrics = (warnings) => {
  if (warnings.length === 0) {
    logger.info(METRIC_NAMES.VALIDATION_REQUESTS_WITHOUT_WARNINGS)
    return
  }

  logger.info(METRIC_NAMES.VALIDATION_REQUESTS_WITH_WARNINGS)

  for (const warning of warnings) {
    logger.info(
      `${METRIC_NAMES.VALIDATION_WARNING_REASON} - ${normalizeArrayIndices(warning.message)}`
    )
  }
}

/**
 * Logs developer activity. Emitted on successful receipt movements
 * only — represents developers actively transacting.
 */
const logDeveloperMetrics = () => {
  logger.info(METRIC_NAMES.DEVELOPERS_ACTIVE)
}

/**
 * Logs attempted developer activity. Emitted on every authenticated
 * receipt movement attempt regardless of outcome — represents developers
 * who have hit the API at all.
 */
const logAttemptedDeveloperMetrics = () => {
  logger.info(METRIC_NAMES.DEVELOPERS_ATTEMPTED)
}

export {
  logReceiptMetrics,
  logWarningMetrics,
  logDeveloperMetrics,
  logAttemptedDeveloperMetrics
}
