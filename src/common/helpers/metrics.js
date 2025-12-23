import {
  createMetricsLogger,
  Unit,
  StorageResolution
} from 'aws-embedded-metrics'
import { config } from '../../config.js'
import { createLogger } from './logging/logger.js'

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
 */
const logReceiptMetrics = async (endpointType) => {
  await metricsCounter('receipts.received', 1, { endpointType })
  await metricsCounter('receipts.received', 1)
}

/**
 * Logs validation warning metrics with endpoint type dimension and total
 * @param {Array} warnings - The validation warnings array
 * @param {string} endpointType - The endpoint type ('post' or 'put')
 */
const logWarningMetrics = async (warnings, endpointType) => {
  if (warnings.length > 0) {
    await metricsCounter('validation.warnings.count', warnings.length, {
      endpointType
    })
    await metricsCounter('validation.warnings.count', warnings.length)
    await metricsCounter('validation.requests.with_warnings', 1, {
      endpointType
    })
    await metricsCounter('validation.requests.with_warnings', 1)
  } else {
    await metricsCounter('validation.requests.without_warnings', 1, {
      endpointType
    })
    await metricsCounter('validation.requests.without_warnings', 1)
  }
}

/**
 * Logs developer activity metrics with clientId dimension for unique counting
 * @param {string} clientId - The developer's client ID
 */
const logDeveloperMetrics = async (clientId) => {
  await metricsCounter('developers.active', 1, { clientId })
  await metricsCounter('developers.active', 1)
}

export {
  metricsCounter,
  logReceiptMetrics,
  logWarningMetrics,
  logDeveloperMetrics
}
