import {
  logWarningMetrics,
  logReceiptMetrics,
  logDeveloperMetrics,
  logAttemptedDeveloperMetrics
} from './metrics.js'
import { METRIC_NAMES } from '@defra/waste-movement-utils'

const mockLoggerInfo = jest.fn()

jest.mock('./logging/logger.js', () => ({
  createLogger: () => ({
    info: (...args) => mockLoggerInfo(...args)
  })
}))

describe('#logWarningMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should log a reason for each warning', () => {
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

    logWarningMetrics(warnings)

    // Array indices are normalized, [0] -> [*]
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      METRIC_NAMES.VALIDATION_REQUESTS_WITH_WARNINGS
    )
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      `${METRIC_NAMES.VALIDATION_WARNING_REASON} - "wasteItems[*].weight.metric" is missing`
    )
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      `${METRIC_NAMES.VALIDATION_WARNING_REASON} - "wasteItems[*].weight.isEstimate" is missing`
    )
  })

  test('Should normalize array indices in warning messages', () => {
    const warnings = [
      {
        key: 'wasteItems[5].code',
        errorType: 'Warning',
        message: '"wasteItems[5].disposalOrRecoveryCodes[2].code" is missing'
      }
    ]

    logWarningMetrics(warnings)

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      `${METRIC_NAMES.VALIDATION_WARNING_REASON} - "wasteItems[*].disposalOrRecoveryCodes[*].code" is missing`
    )
  })

  test('Should not log a warning reason when there are no warnings', () => {
    logWarningMetrics([])

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      METRIC_NAMES.VALIDATION_REQUESTS_WITHOUT_WARNINGS
    )
    expect(mockLoggerInfo).toHaveBeenCalledTimes(1)
  })
})

describe('#logReceiptMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each(['post', 'put'])(
    'Should log the receipt received for the %s endpoint',
    (endpointType) => {
      logReceiptMetrics(endpointType)

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        `${METRIC_NAMES.RECEIPTS_RECEIVED} - ${endpointType}`
      )
    }
  )
})

describe('#logDeveloperMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should log the active developer', () => {
    logDeveloperMetrics()

    expect(mockLoggerInfo).toHaveBeenCalledWith(METRIC_NAMES.DEVELOPERS_ACTIVE)
  })
})

describe('#logAttemptedDeveloperMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should log the attempted developer', () => {
    logAttemptedDeveloperMetrics()

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      METRIC_NAMES.DEVELOPERS_ATTEMPTED
    )
  })
})
