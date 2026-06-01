import {
  createMetricsLogger,
  Unit,
  StorageResolution
} from 'aws-embedded-metrics'
import { config } from '../../config.js'
import { createLogger } from './logging/logger.js'
import { normalizeArrayIndices } from './utils.js'
import { METRIC_NAMES } from '../constants/metric-names.js'

/**
 * Logs a counter metric with optional dimensions
 * @param {string} metricName - Metric name (dot notation recommended)
 * @param {number} value - Metric value (default 1)
 * @param {Object} dimensions - Optional dimensions object
 */
const metricsCounter = async (metricName, value = 1, dimensions = {}) => {
  if (!config.get('isMetricsEnabled')) {
    return
  }

  try {
    const metricsLogger = createMetricsLogger()
    if (Object.keys(dimensions).length > 0) {
      metricsLogger.putDimensions(dimensions)
    }
    metricsLogger.putMetric(
      metricName,
      value,
      Unit.Count,
      StorageResolution.Standard
    )
    await metricsLogger.flush()
  } catch (error) {
    createLogger().error(error, error.message)
  }
}

// Build dimensions object including clientId only when present.
// Dashboards aggregate across clientId via SEARCH() wildcards.
const withClientId = (dims, clientId) =>
  clientId ? { ...dims, clientId } : dims

/**
 * Logs receipt received metric.
 * @param {string} endpointType - The endpoint type ('post' or 'put')
 * @param {string} [clientId] - Optional clientId for per-vendor breakdown
 */
const logReceiptMetrics = async (endpointType, clientId) => {
  await metricsCounter(
    METRIC_NAMES.RECEIPTS_RECEIVED,
    1,
    withClientId({ endpointType }, clientId)
  )
}

/**
 * Logs validation warning metrics.
 * @param {Array} warnings - The validation warnings array
 * @param {string} endpointType - The endpoint type ('post' or 'put')
 * @param {string} [clientId] - Optional clientId for per-vendor breakdown
 */
const logWarningMetrics = async (warnings, endpointType, clientId) => {
  const baseDims = withClientId({ endpointType }, clientId)

  if (warnings.length > 0) {
    await metricsCounter(
      METRIC_NAMES.VALIDATION_WARNINGS_COUNT,
      warnings.length,
      baseDims
    )
    await metricsCounter(
      METRIC_NAMES.VALIDATION_REQUESTS_WITH_WARNINGS,
      1,
      baseDims
    )

    for (const warning of warnings) {
      const warningReason = normalizeArrayIndices(warning.message)
      await metricsCounter(METRIC_NAMES.VALIDATION_WARNING_REASON, 1, {
        ...baseDims,
        warningReason
      })
    }
  } else {
    await metricsCounter(
      METRIC_NAMES.VALIDATION_REQUESTS_WITHOUT_WARNINGS,
      1,
      baseDims
    )
  }
}

/**
 * Logs developer activity metric. Emitted on successful receipt movements
 * only — represents developers actively transacting.
 * @param {string} clientId - The developer's client ID
 */
const logDeveloperMetrics = async (clientId) => {
  await metricsCounter(METRIC_NAMES.DEVELOPERS_ACTIVE, 1, { clientId })
}

/**
 * Logs attempted developer activity metric. Emitted on every authenticated
 * receipt movement attempt regardless of outcome — represents developers
 * who have hit the API at all (canonical source for the "Active Client IDs"
 * panel).
 * @param {string} clientId - The developer's client ID
 */
const logAttemptedDeveloperMetrics = async (clientId) => {
  if (!clientId) {
    return
  }
  await metricsCounter(METRIC_NAMES.DEVELOPERS_ATTEMPTED, 1, { clientId })
}

export {
  metricsCounter,
  logReceiptMetrics,
  logWarningMetrics,
  logDeveloperMetrics,
  logAttemptedDeveloperMetrics
}
