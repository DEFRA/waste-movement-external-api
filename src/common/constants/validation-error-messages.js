/**
 * Validation Error Messages
 *
 * Centralized error messages for Joi schema validation.
 * Messages use {{ #label }} to reference the field name at the beginning where appropriate.
 */

// Carrier validation messages
export const CARRIER_ERRORS = {
  REGISTRATION_OR_REASON_REQUIRED:
    'Either carrier.registrationNumber or carrier.reasonForNoRegistrationNumber is required',
  REASON_ONLY_FOR_NULL:
    'carrier.reasonForNoRegistrationNumber should only be provided when carrier.registrationNumber is not provided',
  VEHICLE_REG_REQUIRED_FOR_ROAD:
    'If carrier.meansOfTransport is "Road" then carrier.vehicleRegistration is required',
  VEHICLE_REG_ONLY_ALLOWED_FOR_ROAD:
    'If carrier.meansOfTransport is not "Road" then carrier.vehicleRegistration is not applicable',
  REGISTRATION_NUMBER_FORMAT:
    '{{#label}} must be in a valid England, SEPA, NRW or NI format'
}

// Address validation messages
export const ADDRESS_ERRORS = {
  POSTCODE_UK_IRELAND_FORMAT:
    '{{#label}} must be in valid UK or Ireland format',
  POSTCODE_UK_FORMAT: '{{#label}} must be in valid UK format'
}

// Waste validation messages
export const WASTE_ERRORS = {
  EWC_CODE_FORMAT: '{{#label}} must be a valid 6-digit numeric code',
  EWC_CODE_INVALID:
    '{{#label}} must be a valid EWC code from the official list',
  EWC_CODES_MAX: '{{#label}} must contain no more than 5 EWC codes',
  CONTAINER_TYPE_INVALID: '{{#label}} must be a valid container type'
}

// Hazardous waste consignment messages
export const CONSIGNMENT_ERRORS = {
  CODE_FORMAT:
    '{{#label}} must be in one of the valid formats: EA/NRW (e.g. CJTILE/A0001), SEPA (SA|SB|SC followed by 7 digits), or NIEA (DA|DB|DC followed by 7 digits)',
  CODE_REQUIRED: '{{#label}} is required when hazardous EWC codes are present',
  REASON_REQUIRED:
    '"reasonForNoConsignmentCode" is required when wasteItems[*].ewcCodes contains a hazardous code and hazardousWasteConsignmentCode is not provided',
  REASON_INVALID_PREFIX: `"reasonForNoConsignmentCode" must be one of:`
}

// Authorisation number messages
export const AUTHORISATION_ERRORS = {
  INVALID: '{{#label}} must be in a valid UK format'
}
