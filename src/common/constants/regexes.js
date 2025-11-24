// RegEx per Gov UK recommendation: https://assets.publishing.service.gov.uk/media/5a7f3ff4ed915d74e33f5438/Bulk_Data_Transfer_-_additional_validation_valid_from_12_November_2015.pdf
export const UK_POSTCODE_REGEX =
  /^((GIR 0A{2})|((([A-Z]\d{1,2})|(([A-Z][A-HJ-Y]\d{1,2})|(([A-Z]\d[A-Z])|([A-Z][A-HJ-Y]\d?[A-Z])))) \d[A-Z]{2}))$/i // NOSONAR

// Ireland Eircode regex (routing key + unique identifier)
// Reference: https://www.eircode.ie
export const IRL_POSTCODE_REGEX =
  /^(?:D6W|[AC-FHKNPRTV-Y]\d{2}) ?[0-9AC-FHKNPRTV-Y]{4}$/i

/*
 * Carrier Registration Numbers
 * See src/test/data/carrier-registration-numbers.js for examples
 */
export const ENGLAND_CARRIER_REGISTRATION_NUMBER_REGEX = /^CBD[LU]\d{3,}$/i

export const SEPA_CARRIER_REGISTRATION_NUMBER_REGEX =
  /^((WCR\/R\/\d{7})|((SCO|SEA|SNO|SWE|WCR)\/\d{6}))$/i

export const NRU_CARRIER_REGISTRATION_NUMBER_REGEX =
  ENGLAND_CARRIER_REGISTRATION_NUMBER_REGEX

export const NI_CARRIER_REGISTRATION_NUMBER_REGEX = /^ROC\W*[UL]T\W*\d{1,5}$/i

// England site authorisation number patterns
const ENGLAND_SITE_AUTHORISATION_NUMBER_PATTERNS = [
  /^[A-Z]{2}\d{4}[A-Z]{2}$/i, // XX9999XX
  /^[A-Z]{2}\d{4}[A-Z]{2}\/D\d{4}$/i, // XX9999XX/D9999
  /^EPR\/[A-Z]{2}\d{4}[A-Z]{2}$/i, // EPR/XX9999XX
  /^EPR\/[A-Z]{2}\d{4}[A-Z]{2}\/D\d{4}$/i, // EPR/XX9999XX/D9999
  /^EAWML\d{6}$/i, // EAWML999999
  /^WML\d{6}$/i // WML999999
]

// Scotland (SEPA) site authorisation number patterns
const SCOTLAND_SITE_AUTHORISATION_NUMBER_PATTERNS = [
  /^PPC\/[AWEN]\/\d{7}$/i, // PPC/A/9999999
  /^WML\/[LWEN]\/\d{7}$/i, // WML/L/9999999
  /^PPC\/A\/SEPA\d{4}-\d{4}$/i, // PPC/A/SEPA9999-9999
  /^WML\/L\/SEPA\d{4}-\d{4}$/i, // WML/L/SEPA9999-9999
  /^EAS\/P\/\d{6}$/i // EAS/P/999999
]

// Wales (NRW) site authorisation number patterns - shares patterns with England
const WALES_SITE_AUTHORISATION_NUMBER_PATTERNS = [
  /^[A-Z]{2}\d{4}[A-Z]{2}$/i, // XX9999XX
  /^EPR\/[A-Z]{2}\d{4}[A-Z]{2}$/i // EPR/XX9999XX
]

// Northern Ireland site authorisation number patterns
const NI_SITE_AUTHORISATION_NUMBER_PATTERNS = [
  /^P\d{4}\/\d{2}[A-Z]$/i, // P9999/99X
  /^P\d{4}\/\d{2}[A-Z]\/V\d+$/i, // P9999/99X/V# (with version)
  /^WPPC \d{2}\/\d{2}$/i, // WPPC 99/99
  /^WPPC \d{2}\/\d{2}\/V\d+$/i, // WPPC 99/99/V# (with version)
  // WML, LN, and PAC formats are only valid when combined (see below)
  /^WML \d{2}\/\d+(\/T)? LN\/\d{2}\/\d+(\/([MTCN]|V\d+))*$/i, // Combined WML + LN formats (suffixes optional)
  /^WML \d{2}\/\d+ PAC\/\d{4}\/WCL\d{3}$/i // Combined WML + PAC formats
]

// Combine all site authorisation number patterns for validation
export const ALL_SITE_AUTHORISATION_NUMBER_PATTERNS = [
  ...ENGLAND_SITE_AUTHORISATION_NUMBER_PATTERNS,
  ...SCOTLAND_SITE_AUTHORISATION_NUMBER_PATTERNS,
  ...WALES_SITE_AUTHORISATION_NUMBER_PATTERNS,
  ...NI_SITE_AUTHORISATION_NUMBER_PATTERNS
]
