import { StorageResolution, Unit } from 'aws-embedded-metrics'

import { config } from '../../config.js'
import { metricsCounter } from './metrics.js'

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
