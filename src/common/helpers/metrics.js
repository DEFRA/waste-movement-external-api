import {
  createMetricsLogger,
  Unit,
  StorageResolution
} from 'aws-embedded-metrics'
import { config } from '../../config.js'
import { createLogger } from './logging/logger.js'
import { normalizeArrayIndices } from './utils.js'

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
  await metricsCounter('receipts.received', 1, { endpointType })
  await metricsCounter('receipts.received', 1)
  if (clientId) {
    await metricsCounter('receipts.received', 1, { endpointType, clientId })
    await metricsCounter('receipts.received', 1, { clientId })
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
    await metricsCounter('validation.warnings.count', warnings.length, {
      endpointType
    })
    await metricsCounter('validation.warnings.count', warnings.length)
    await metricsCounter('validation.requests.with_warnings', 1, {
      endpointType
    })
    await metricsCounter('validation.requests.with_warnings', 1)

    if (clientId) {
      await metricsCounter('validation.warnings.count', warnings.length, {
        endpointType,
        clientId
      })
      await metricsCounter('validation.warnings.count', warnings.length, {
        clientId
      })
      await metricsCounter('validation.requests.with_warnings', 1, {
        endpointType,
        clientId
      })
      await metricsCounter('validation.requests.with_warnings', 1, {
        clientId
      })
    }

    // Per-warning breakdown metrics
    for (const warning of warnings) {
      const warningReason = normalizeArrayIndices(warning.message)
      await metricsCounter('validation.warning.reason', 1, {
        endpointType,
        warningReason
      })
      await metricsCounter('validation.warning.reason', 1, {
        warningReason
      })
      if (clientId) {
        await metricsCounter('validation.warning.reason', 1, {
          endpointType,
          warningReason,
          clientId
        })
        await metricsCounter('validation.warning.reason', 1, {
          warningReason,
          clientId
        })
      }
    }
  } else {
    await metricsCounter('validation.requests.without_warnings', 1, {
      endpointType
    })
    await metricsCounter('validation.requests.without_warnings', 1)
    if (clientId) {
      await metricsCounter('validation.requests.without_warnings', 1, {
        endpointType,
        clientId
      })
      await metricsCounter('validation.requests.without_warnings', 1, {
        clientId
      })
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
  await metricsCounter('developers.active', 1, { clientId })
  await metricsCounter('developers.active', 1)
}

/**
 * Logs attempted developer activity metrics with clientId dimension.
 * Emitted on every authenticated receipt movement attempt, regardless of
 * outcome — represents developers who have hit the API at all (the canonical
 * source for the "Active Client IDs" panel).
 * @param {string} clientId - The developer's client ID
 */
const logAttemptedDeveloperMetrics = async (clientId) => {
  await metricsCounter('developers.attempted', 1, { clientId })
  await metricsCounter('developers.attempted', 1)
}

export {
  metricsCounter,
  logReceiptMetrics,
  logWarningMetrics,
  logDeveloperMetrics,
  logAttemptedDeveloperMetrics
}
