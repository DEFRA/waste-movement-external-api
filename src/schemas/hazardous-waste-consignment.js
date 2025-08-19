import Joi from 'joi'
import { isValidHazardousEwcCode } from '../common/constants/ewc-codes.js'

export const NO_CONSIGNMENT_REASONS = [
  'Non-Hazardous Waste Transfer',
  'Carrier did not provide documentation',
  'Household Waste Recycling Centre Receipt'
]

// Consignment note code formats
const EA_NRW_PATTERN = /^[A-Za-z]{2,}\/[A-Za-z0-9]{5}[A-Za-z]?$/
const SEPA_PATTERN = /^S[ABC]\d{7}$/
const NIEA_PATTERN = /^D[ABC]\d{7}$/

export function hasHazardousEwcCodes(payload) {
  // Access root payload to inspect waste EWC codes
  const root = payload
  const wasteArray = Array.isArray(root.waste) ? root.waste : []
  const allEwcCodes = wasteArray
    .flatMap((w) => (Array.isArray(w.ewcCodes) ? w.ewcCodes : []))
    .filter(Boolean)

  return allEwcCodes.some((code) => isValidHazardousEwcCode(code))
}

export const hazardousWasteConsignmentCodeSchema = Joi.custom(
  (value, helpers) => {
    const hasHazardous = hasHazardousEwcCodes(helpers.state.ancestors[0])

    // If hazardous EWC codes are present, the field is required if missing (undefined or null)
    if (
      hasHazardous &&
      !value &&
      !helpers.state.ancestors[0].reasonForNoConsignmentCode &&
      helpers.state.ancestors[0].hazardousWasteConsignmentCode !== ''
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
  'string.consignmentFormat':
    'consignment note code must be in one of the valid formats: EA/NRW (e.g. CJTILE/A0001), SEPA (SA|SB|SC followed by 7 digits), or NIEA (DA|DB|DC followed by 7 digits)',
  'hazardousWasteConsignmentCode.required':
    'hazardousWasteConsignmentCode is required when hazardous EWC codes are present'
})

export const reasonForNoConsignmentCodeSchema = Joi.custom((value, helpers) => {
  const hasHazardous = hasHazardousEwcCodes(helpers.state.ancestors[0])
  if (
    hasHazardous &&
    !helpers.state.ancestors[0].hazardousWasteConsignmentCode &&
    helpers.state.ancestors[0].reasonForNoConsignmentCode !== '' &&
    !NO_CONSIGNMENT_REASONS.includes(value)
  ) {
    return helpers.error('any.only')
  }
  return value
}).messages({
  'any.only':
    'Reason for no consignment note code must be one of: Non-Hazardous Waste Transfer | Carrier did not provide documentation | Local Authority Receipt'
})
