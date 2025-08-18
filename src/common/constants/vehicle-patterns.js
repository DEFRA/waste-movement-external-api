/**
 * UK Vehicle Registration Number Patterns
 *
 * This file contains regex patterns for validating UK vehicle registration numbers.
 * The patterns support three main formats:
 * 1. ABC123 - 3 letters + 1-3 digits
 * 2. A123BCD - 1 letter + 1-3 digits + 3 letters
 * 3. AB12CDE - 2 letters + 2 digits + 3 letters (year format)
 */

// UK Vehicle Registration Pattern - Simplified for SonarQube complexity requirements
// Supports UK vehicle registration formats with letters, digits, and optional spaces
// Requires minimum 5 characters total for valid UK registration
export const UK_VEHICLE_REGISTRATION_PATTERN =
  /^(?=.{5,})[A-Z]{1,3}\s?\d{1,3}\s?[A-Z]{0,3}$/

/**
 * UK Vehicle Registration Format Examples
 * Used in error messages to help users understand the expected format
 */
export const UK_VEHICLE_REGISTRATION_EXAMPLES = 'ABC123, A123BCD, AB12CDE'
