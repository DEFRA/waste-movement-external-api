// BEGIN-NOSCAN

// RegEx per Gov UK recommendation: https://assets.publishing.service.gov.uk/media/5a7f3ff4ed915d74e33f5438/Bulk_Data_Transfer_-_additional_validation_valid_from_12_November_2015.pdf
export const UK_POSTCODE_REGEX =
  /^((GIR 0A{2})|((([A-Z]\d{1,2})|(([A-Z][A-HJ-Y]\d{1,2})|(([A-Z]\d[A-Z])|([A-Z][A-HJ-Y]\d?[A-Z])))) \d[A-Z]{2}))$/i // NOSONAR

// Ireland Eircode regex (routing key + unique identifier)
// Reference: https://www.eircode.ie
export const IRL_POSTCODE_REGEX =
  /^(?:D6W|[AC-FHKNPRTV-Y]\d{2}) ?[0-9AC-FHKNPRTV-Y]{4}$/i

export const ENGLAND_CARRIER_REGISTRATION_NUMBER_REGEX = /^CBD(L|U)[\d]{3,}$/

export const SEPA_CARRIER_REGISTRATION_NUMBER_REGEX =
  /^(WCR|SCO|SEA|SNO|SWE)\/[R/]*[\d]{6,7}$/

export const NRU_CARRIER_REGISTRATION_NUMBER_REGEX =
  ENGLAND_CARRIER_REGISTRATION_NUMBER_REGEX

export const NI_CARRIER_REGISTRATION_NUMBER_REGEX =
  /^ROC[\W]*[UT|LT]*[\W]*[\d]{1,5}$/

// END-NOSCAN
