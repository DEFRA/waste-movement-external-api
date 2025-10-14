import Joi from 'joi'
import { isValidHazardousEwcCode } from '../common/constants/ewc-codes.js'
import { CONSIGNMENT_ERRORS } from '../common/constants/validation-error-messages.js'

export const NO_CONSIGNMENT_REASONS = [
  'Non-Hazardous Waste Transfer',
  'Carrier did not provide documentation',
  'Household Waste Recycling Centre Receipt'
]

// Consignment note code formats, e.g.
// CJTILE/A0001
// SA1234567
// DA1234567
const EA_NRW_PATTERN = /^[A-Za-z]{2,}\/[A-Za-z0-9]{5}[A-Za-z]?$/
const SEPA_PATTERN = /^S[ABC]\d{7}$/
const NIEA_PATTERN = /^D[ABC]\d{7}$/

export function hasHazardousEwcCodes(payload) {
  // Access root payload to inspect waste EWC codes
  const root = payload
  const wasteArray = Array.isArray(root.wasteItems) ? root.wasteItems : []
  const allEwcCodes = wasteArray
    .flatMap((w) => (Array.isArray(w.ewcCodes) ? w.ewcCodes : []))
    .filter(Boolean)

  return allEwcCodes.some((code) => isValidHazardousEwcCode(code))
}

export const hazardousWasteConsignmentCodeSchema = Joi.custom(
  (value, helpers) => {
    const payload = helpers.state.ancestors[0]
    const hasHazardous = hasHazardousEwcCodes(payload)

    // If hazardous EWC codes are present, the field is required if missing (undefined or null)
    if (
      hasHazardous &&
      !value &&
      !payload.reasonForNoConsignmentCode &&
      payload.hazardousWasteConsignmentCode !== ''
    ) {
      return helpers.error('hazardousWasteConsignmentCode.required')
    }
    if (value) {
      const valid =
        EA_NRW_PATTERN.test(value) ||
        SEPA_PATTERN.test(value) ||
        NIEA_PATTERN.test(value)
      if (!valid) {
        return helpers.error('string.consignmentFormat')
      }
    }
    return value
  }
).messages({
  'string.consignmentFormat': CONSIGNMENT_ERRORS.CODE_FORMAT,
  'hazardousWasteConsignmentCode.required': CONSIGNMENT_ERRORS.CODE_REQUIRED
})

export const reasonForNoConsignmentCodeSchema = Joi.custom((value, helpers) => {
  const payload = helpers.state.ancestors[0]
  const hasHazardous = hasHazardousEwcCodes(payload)

  if (hasHazardous && !payload.hazardousWasteConsignmentCode) {
    if (!payload.reasonForNoConsignmentCode) {
      return helpers.error('reasonForNoConsignmentCode.required')
    }

    if (!NO_CONSIGNMENT_REASONS.includes(value)) {
      return helpers.error('any.only')
    }
  }

  return value
}).messages({
  'any.only': `${CONSIGNMENT_ERRORS.REASON_INVALID_PREFIX} ${NO_CONSIGNMENT_REASONS.join(', ')}`,
  'reasonForNoConsignmentCode.required': CONSIGNMENT_ERRORS.REASON_REQUIRED
})
