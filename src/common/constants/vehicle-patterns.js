/**
 * UK Vehicle Registration Number Patterns
 *
 * This file contains regex patterns for validating UK vehicle registration numbers.
 * The patterns support three main formats:
 * 1. ABC123 - 3 letters + 1-3 digits
 * 2. A123BCD - 1 letter + 1-3 digits + 3 letters
 * 3. AB12CDE - 2 letters + 2 digits + 3 letters (year format)
 */

export const UK_VEHICLE_REGISTRATION_PATTERN =
  /^([A-Z]{3}\s?(\d{3}|\d{2}|\d{1}))|([A-Z]\s?(\d{3}|\d{2}|\d{1})\s?[A-Z]{3})|(([A-HK-PRSVWY][A-HJ-PR-Y])\s?([0][2-9]|[1-9][0-9])\s?[A-HJ-PR-Z]{3})$/

/**
 * UK Vehicle Registration Format Examples
 * Used in error messages to help users understand the expected format
 */
export const UK_VEHICLE_REGISTRATION_EXAMPLES = 'ABC123, A123BCD, AB12CDE'
