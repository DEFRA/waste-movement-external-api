import { StorageResolution, Unit } from 'aws-embedded-metrics'

import { config } from '../../config.js'
import { metricsCounter, logWarningMetrics } from './metrics.js'

const mockPutMetric = jest.fn()
const mockFlush = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('aws-embedded-metrics', () => ({
  ...jest.requireActual('aws-embedded-metrics'),
  createMetricsLogger: () => ({
    putMetric: mockPutMetric,
    flush: mockFlush
  })
}))
jest.mock('./logging/logger.js', () => ({
  createLogger: () => ({ error: (...args) => mockLoggerError(...args) })
}))

const mockMetricsName = 'mock-metrics-name'
const defaultMetricsValue = 1
const mockValue = 200

describe('#metrics', () => {
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

    test('Should send metric', async () => {
      await metricsCounter(mockMetricsName, mockValue)

      expect(mockPutMetric).toHaveBeenCalledWith(
        mockMetricsName,
        mockValue,
        Unit.Count,
        StorageResolution.Standard
      )
    })

    test('Should not call flush', async () => {
      await metricsCounter(mockMetricsName, mockValue)
      expect(mockFlush).toHaveBeenCalled()
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

  describe('When there are warnings', () => {
    test('Should log warning count metric for Post endpoint', async () => {
      await logWarningMetrics(5, 'Post')

      expect(mockPutMetric).toHaveBeenCalledWith(
        'warningsReturnedPost',
        5,
        Unit.Count,
        StorageResolution.Standard
      )
    })

    test('Should log warning count metric for Put endpoint', async () => {
      await logWarningMetrics(3, 'Put')

      expect(mockPutMetric).toHaveBeenCalledWith(
        'warningsReturnedPut',
        3,
        Unit.Count,
        StorageResolution.Standard
      )
    })

    test('Should log warningsReturnedTotal metric', async () => {
      await logWarningMetrics(5, 'Post')

      expect(mockPutMetric).toHaveBeenCalledWith(
        'warningsReturnedTotal',
        5,
        Unit.Count,
        StorageResolution.Standard
      )
    })

    test('Should log requestsWithWarnings metric when warnings > 0', async () => {
      await logWarningMetrics(2, 'Post')

      expect(mockPutMetric).toHaveBeenCalledWith(
        'requestsWithWarningsPost',
        1,
        Unit.Count,
        StorageResolution.Standard
      )
    })

    test('Should log requestsWithWarningsTotal metric when warnings > 0', async () => {
      await logWarningMetrics(2, 'Post')

      expect(mockPutMetric).toHaveBeenCalledWith(
        'requestsWithWarningsTotal',
        1,
        Unit.Count,
        StorageResolution.Standard
      )
    })
  })

  describe('When there are no warnings', () => {
    test('Should log zero warning count', async () => {
      await logWarningMetrics(0, 'Post')

      expect(mockPutMetric).toHaveBeenCalledWith(
        'warningsReturnedPost',
        0,
        Unit.Count,
        StorageResolution.Standard
      )
    })

    test('Should log warningsReturnedTotal with zero', async () => {
      await logWarningMetrics(0, 'Post')

      expect(mockPutMetric).toHaveBeenCalledWith(
        'warningsReturnedTotal',
        0,
        Unit.Count,
        StorageResolution.Standard
      )
    })

    test('Should log requestsWithoutWarnings metric when warnings = 0', async () => {
      await logWarningMetrics(0, 'Put')

      expect(mockPutMetric).toHaveBeenCalledWith(
        'requestsWithoutWarningsPut',
        1,
        Unit.Count,
        StorageResolution.Standard
      )
    })

    test('Should log requestsWithoutWarningsTotal metric when warnings = 0', async () => {
      await logWarningMetrics(0, 'Put')

      expect(mockPutMetric).toHaveBeenCalledWith(
        'requestsWithoutWarningsTotal',
        1,
        Unit.Count,
        StorageResolution.Standard
      )
    })
  })
})
