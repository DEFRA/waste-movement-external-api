import {
  createMetricsLogger,
  Unit,
  StorageResolution
} from 'aws-embedded-metrics'
import { config } from '../../config.js'
import { createLogger } from './logging/logger.js'

const metricsCounter = async (metricName, value = 1) => {
  if (!config.get('isMetricsEnabled')) {
    return
  }

  try {
    const metricsLogger = createMetricsLogger()
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

const logWarningMetrics = async (warningCount, endpointType) => {
  await metricsCounter(`warningsReturned${endpointType}`, warningCount)
  await metricsCounter('warningsReturnedTotal', warningCount)

  if (warningCount > 0) {
    await metricsCounter(`requestsWithWarnings${endpointType}`)
    await metricsCounter('requestsWithWarningsTotal')
  } else {
    await metricsCounter(`requestsWithoutWarnings${endpointType}`)
    await metricsCounter('requestsWithoutWarningsTotal')
  }
}

export { metricsCounter, logWarningMetrics }
