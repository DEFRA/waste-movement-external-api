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

export { metricsCounter }
