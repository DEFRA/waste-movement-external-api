import { StorageResolution, Unit } from 'aws-embedded-metrics'

import { config } from '../../config.js'
import { metricsCounter, logWarningMetrics } from './metrics.js'

const mockPutMetric = jest.fn()
const mockPutDimensions = jest.fn()
const mockFlush = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('aws-embedded-metrics', () => ({
  ...jest.requireActual('aws-embedded-metrics'),
  createMetricsLogger: () => ({
    putMetric: mockPutMetric,
    putDimensions: mockPutDimensions,
    flush: mockFlush
  })
}))
jest.mock('./logging/logger.js', () => ({
  createLogger: () => ({ error: (...args) => mockLoggerError(...args) })
}))

const mockMetricsName = 'mock-metrics-name'
const defaultMetricsValue = 1
const mockValue = 200

describe('#metricsCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('When metrics is not enabled', () => {
    beforeEach(async () => {
      config.set('isMetricsEnabled', false)
      await metricsCounter(mockMetricsName, mockValue)
    })

    test('Should not call metric', () => {
      expect(mockPutMetric).not.toHaveBeenCalled()
    })

    test('Should not call flush', () => {
      expect(mockFlush).not.toHaveBeenCalled()
    })
  })

  describe('When metrics is enabled', () => {
    beforeEach(() => {
      config.set('isMetricsEnabled', true)
    })

    test('Should send metric with default value', async () => {
      await metricsCounter(mockMetricsName)

      expect(mockPutMetric).toHaveBeenCalledWith(
        mockMetricsName,
        defaultMetricsValue,
        Unit.Count,
        StorageResolution.Standard
      )
    })

    test('Should send metric with provided value', async () => {
      await metricsCounter(mockMetricsName, mockValue)

      expect(mockPutMetric).toHaveBeenCalledWith(
        mockMetricsName,
        mockValue,
        Unit.Count,
        StorageResolution.Standard
      )
    })

    test('Should call flush', async () => {
      await metricsCounter(mockMetricsName, mockValue)
      expect(mockFlush).toHaveBeenCalled()
    })

    test('Should not call putDimensions when no dimensions provided', async () => {
      await metricsCounter(mockMetricsName, mockValue)
      expect(mockPutDimensions).not.toHaveBeenCalled()
    })

    test('Should call putDimensions when dimensions provided', async () => {
      const dimensions = { endpointType: 'post' }
      await metricsCounter(mockMetricsName, mockValue, dimensions)
      expect(mockPutDimensions).toHaveBeenCalledWith(dimensions)
    })

    test('Should work with dot notation metric names', async () => {
      await metricsCounter('validation.warnings.count', 5, {
        endpointType: 'post'
      })

      expect(mockPutDimensions).toHaveBeenCalledWith({ endpointType: 'post' })
      expect(mockPutMetric).toHaveBeenCalledWith(
        'validation.warnings.count',
        5,
        Unit.Count,
        StorageResolution.Standard
      )
    })
  })

  describe('When metrics throws', () => {
    const mockError = 'mock-metrics-put-error'

    beforeEach(async () => {
      config.set('isMetricsEnabled', true)
      mockFlush.mockRejectedValue(new Error(mockError))

      await metricsCounter(mockMetricsName, mockValue)
    })

    test('Should log expected error', () => {
      expect(mockLoggerError).toHaveBeenCalledWith(Error(mockError), mockError)
    })
  })
})

describe('#logWarningMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    config.set('isMetricsEnabled', true)
  })

  test('Should emit per-warning metrics with warningReason dimension', async () => {
    const warnings = [
      {
        key: 'wasteItems[0].weight',
        errorType: 'Warning',
        message: '"wasteItems[0].weight.metric" is missing'
      },
      {
        key: 'wasteItems[0].isEstimate',
        errorType: 'Warning',
        message: '"wasteItems[0].weight.isEstimate" is missing'
      }
    ]

    await logWarningMetrics(warnings, 'post')

    // Should emit validation.warning.reason for each warning
    // With normalized array indices [0] -> [*]
    expect(mockPutDimensions).toHaveBeenCalledWith({
      endpointType: 'post',
      warningReason: '"wasteItems[*].weight.metric" is missing'
    })
    expect(mockPutDimensions).toHaveBeenCalledWith({
      warningReason: '"wasteItems[*].weight.metric" is missing'
    })
    expect(mockPutDimensions).toHaveBeenCalledWith({
      endpointType: 'post',
      warningReason: '"wasteItems[*].weight.isEstimate" is missing'
    })
    expect(mockPutDimensions).toHaveBeenCalledWith({
      warningReason: '"wasteItems[*].weight.isEstimate" is missing'
    })
  })

  test('Should normalize array indices in warning messages', async () => {
    const warnings = [
      {
        key: 'wasteItems[5].code',
        errorType: 'Warning',
        message: '"wasteItems[5].disposalOrRecoveryCodes[2].code" is missing'
      }
    ]

    await logWarningMetrics(warnings, 'put')

    // Array indices should be normalized to [*]
    expect(mockPutDimensions).toHaveBeenCalledWith({
      endpointType: 'put',
      warningReason:
        '"wasteItems[*].disposalOrRecoveryCodes[*].code" is missing'
    })
  })

  test('Should not emit per-warning metrics when no warnings', async () => {
    await logWarningMetrics([], 'post')

    // Should only emit without_warnings metrics, not warning.reason
    expect(mockPutMetric).toHaveBeenCalledWith(
      'validation.requests.without_warnings',
      1,
      Unit.Count,
      StorageResolution.Standard
    )
    expect(mockPutDimensions).not.toHaveBeenCalledWith(
      expect.objectContaining({ warningReason: expect.any(String) })
    )
  })
})
