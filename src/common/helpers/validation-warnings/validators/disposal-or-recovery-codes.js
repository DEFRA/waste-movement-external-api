import {
  RECEIPT_WARNINGS,
  VALIDATION_WARNING_TYPES,
  WASTE_WARNINGS
} from '../../../constants/validation-warning-messages'

export const disposalOrRecoveryCodesWarningValidators = {
  key: 'wasteItems.disposalOrRecoveryCodes',
  validators: [
    {
      field: 'code',
      validator: isDisposalOrRecoveryCodeMissing,
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: WASTE_WARNINGS.DISPOSAL_OR_RECOVERY_CODE_REQUIRED
    },
    {
      field: 'weight',
      validator: isDisposalOrRecoveryWeightMissing,
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: RECEIPT_WARNINGS.IS_REQUIRED
    },
    {
      field: 'weight.metric',
      validator: isDisposalOrRecoveryWeightMetricMissing,
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: RECEIPT_WARNINGS.IS_REQUIRED
    },
    {
      field: 'weight.amount',
      validator: isDisposalOrRecoveryWeightAmountMissing,
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: RECEIPT_WARNINGS.IS_REQUIRED
    },
    {
      field: 'weight.isEstimate',
      validator: isDisposalOrRecoveryWeightIsEstimateMissing,
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: WASTE_WARNINGS.DISPOSAL_OR_RECOVERY_CODE_WEIGHT_IS_REQUIRED
    }
  ]
}

/**
 * Determines if Disposal or Recovery weight is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isDisposalOrRecoveryWeightMissing(wasteItem) {
  if (!wasteItem) {
    return { isValid: true }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: true }
  }

  const invalidIndices = disposalOrRecoveryCodes?.reduce(
    (indices, item, index) => {
      if (!item?.weight) {
        indices.push(index)
      }
      return indices
    },
    []
  )

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Disposal or Recovery weight is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isDisposalOrRecoveryWeightMetricMissing(wasteItem) {
  if (!wasteItem) {
    return { isValid: true }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: true }
  }

  const invalidIndices = disposalOrRecoveryCodes?.reduce(
    (indices, item, index) => {
      if (item?.weight && !item.weight.metric) {
        indices.push(index)
      }
      return indices
    },
    []
  )

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Disposal or Recovery weight amount is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isDisposalOrRecoveryWeightAmountMissing(wasteItem) {
  if (!wasteItem) {
    return { isValid: true }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: true }
  }

  const invalidIndices = disposalOrRecoveryCodes?.reduce(
    (indices, item, index) => {
      if (item?.weight && !item.weight.amount) {
        indices.push(index)
      }
      return indices
    },
    []
  )

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Disposal or Recovery weight isEstimate flag is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isDisposalOrRecoveryWeightIsEstimateMissing(wasteItem) {
  if (!wasteItem) {
    return { isValid: true }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: true }
  }

  const invalidIndices = disposalOrRecoveryCodes?.reduce(
    (indices, item, index) => {
      if (item?.weight && ![true, false].includes(item.weight.isEstimate)) {
        indices.push(index)
      }
      return indices
    },
    []
  )

  return { isValid: invalidIndices.length === 0, invalidIndices }
}

/**
 * Determines if Disposal or Recovery code is missing
 * @param {Object} wasteItem - The waste item
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isDisposalOrRecoveryCodeMissing(wasteItem) {
  if (!wasteItem) {
    return { isValid: false }
  }

  const { disposalOrRecoveryCodes } = wasteItem

  if (!disposalOrRecoveryCodes || disposalOrRecoveryCodes.length === 0) {
    return { isValid: false }
  }

  const invalidIndices = disposalOrRecoveryCodes?.reduce(
    (indices, item, index) => {
      if (!item.code) {
        indices.push(index)
      }
      return indices
    },
    []
  )

  return { isValid: invalidIndices.length === 0, invalidIndices }
}
