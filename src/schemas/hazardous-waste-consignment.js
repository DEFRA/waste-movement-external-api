import Joi from 'joi'

export const NO_CONSIGNMENT_REASONS = [
  'Non-Hazardous Waste Transfer',
  'Carrier did not provide documentation',
  'Local Authority Receipt'
]

// Consignment note code formats
const EA_NRW_PATTERN = /^[A-Za-z]{2,}\/[A-Za-z0-9]{5}[A-Za-z]?$/
const SEPA_PATTERN = /^S[ABC]\d{7}$/
const NIEA_PATTERN = /^D[ABC]\d{7}$/

export const hazardousWasteConsignmentCodeSchema = Joi.string()
  .trim()
  .allow('')
  .custom((value, helpers) => {
    if (!value) return value
    const valid =
      EA_NRW_PATTERN.test(value) ||
      SEPA_PATTERN.test(value) ||
      NIEA_PATTERN.test(value)
    if (!valid) {
      return helpers.error('string.consignmentFormat')
    }
    return value
  })
  .messages({
    'string.consignmentFormat':
      'consignment note code must be in one of the valid formats: EA/NRW (e.g. CJTILE/A0001), SEPA (SA|SB|SC followed by 7 digits), or NIEA (DA|DB|DC followed by 7 digits)'
  })

export const reasonForNoConsignmentCodeSchema = Joi.string()
  .trim()
  .allow('')
  .valid(...NO_CONSIGNMENT_REASONS)
  .messages({
    'any.only':
      'Reason for no consignment note code must be one of: Non-Hazardous Waste Transfer | Carrier did not provide documentation | Local Authority Receipt'
  })
