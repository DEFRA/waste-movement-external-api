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

/**
 * Logs receipt received metrics with endpoint type dimension and total
 * @param {string} endpointType - The endpoint type ('post' or 'put')
 * @param {string} [clientId] - Optional clientId for per-vendor breakdown
 */
const logReceiptMetrics = async (endpointType, clientId) => {
  await metricsCounter(METRIC_NAMES.RECEIPTS_RECEIVED, 1, { endpointType })
  await metricsCounter(METRIC_NAMES.RECEIPTS_RECEIVED, 1)
  if (clientId) {
    await metricsCounter(METRIC_NAMES.RECEIPTS_RECEIVED, 1, {
      endpointType,
      clientId
    })
    await metricsCounter(METRIC_NAMES.RECEIPTS_RECEIVED, 1, { clientId })
  }
}

/**
 * Logs validation warning metrics with endpoint type dimension and total
 * @param {Array} warnings - The validation warnings array
 * @param {string} endpointType - The endpoint type ('post' or 'put')
 * @param {string} [clientId] - Optional clientId for per-vendor breakdown
 */
const logWarningMetrics = async (warnings, endpointType, clientId) => {
  if (warnings.length > 0) {
    await metricsCounter(
      METRIC_NAMES.VALIDATION_WARNINGS_COUNT,
      warnings.length,
      { endpointType }
    )
    await metricsCounter(
      METRIC_NAMES.VALIDATION_WARNINGS_COUNT,
      warnings.length
    )
    await metricsCounter(METRIC_NAMES.VALIDATION_REQUESTS_WITH_WARNINGS, 1, {
      endpointType
    })
    await metricsCounter(METRIC_NAMES.VALIDATION_REQUESTS_WITH_WARNINGS, 1)

    if (clientId) {
      await metricsCounter(
        METRIC_NAMES.VALIDATION_WARNINGS_COUNT,
        warnings.length,
        { endpointType, clientId }
      )
      await metricsCounter(
        METRIC_NAMES.VALIDATION_WARNINGS_COUNT,
        warnings.length,
        { clientId }
      )
      await metricsCounter(METRIC_NAMES.VALIDATION_REQUESTS_WITH_WARNINGS, 1, {
        endpointType,
        clientId
      })
      await metricsCounter(METRIC_NAMES.VALIDATION_REQUESTS_WITH_WARNINGS, 1, {
        clientId
      })
    }

    // Per-warning breakdown metrics
    for (const warning of warnings) {
      const warningReason = normalizeArrayIndices(warning.message)
      await metricsCounter(METRIC_NAMES.VALIDATION_WARNING_REASON, 1, {
        endpointType,
        warningReason
      })
      await metricsCounter(METRIC_NAMES.VALIDATION_WARNING_REASON, 1, {
        warningReason
      })
      if (clientId) {
        await metricsCounter(METRIC_NAMES.VALIDATION_WARNING_REASON, 1, {
          endpointType,
          warningReason,
          clientId
        })
        await metricsCounter(METRIC_NAMES.VALIDATION_WARNING_REASON, 1, {
          warningReason,
          clientId
        })
      }
    }
  } else {
    await metricsCounter(METRIC_NAMES.VALIDATION_REQUESTS_WITHOUT_WARNINGS, 1, {
      endpointType
    })
    await metricsCounter(METRIC_NAMES.VALIDATION_REQUESTS_WITHOUT_WARNINGS, 1)
    if (clientId) {
      await metricsCounter(
        METRIC_NAMES.VALIDATION_REQUESTS_WITHOUT_WARNINGS,
        1,
        { endpointType, clientId }
      )
      await metricsCounter(
        METRIC_NAMES.VALIDATION_REQUESTS_WITHOUT_WARNINGS,
        1,
        { clientId }
      )
    }
  }
}

/**
 * Logs developer activity metrics with clientId dimension for unique counting.
 * Emitted on successful receipt movements only — represents developers
 * actively transacting.
 * @param {string} clientId - The developer's client ID
 */
const logDeveloperMetrics = async (clientId) => {
  await metricsCounter(METRIC_NAMES.DEVELOPERS_ACTIVE, 1, { clientId })
  await metricsCounter(METRIC_NAMES.DEVELOPERS_ACTIVE, 1)
}

/**
 * Logs attempted developer activity metrics with clientId dimension.
 * Emitted on every authenticated receipt movement attempt, regardless of
 * outcome — represents developers who have hit the API at all (the canonical
 * source for the "Active Client IDs" panel).
 * @param {string} clientId - The developer's client ID
 */
const logAttemptedDeveloperMetrics = async (clientId) => {
  await metricsCounter(METRIC_NAMES.DEVELOPERS_ATTEMPTED, 1, { clientId })
  await metricsCounter(METRIC_NAMES.DEVELOPERS_ATTEMPTED, 1)
}

export {
  metricsCounter,
  logReceiptMetrics,
  logWarningMetrics,
  logDeveloperMetrics,
  logAttemptedDeveloperMetrics
}
