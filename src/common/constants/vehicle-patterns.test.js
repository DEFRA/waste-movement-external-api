import {
  UK_VEHICLE_REGISTRATION_PATTERN,
  isVehicleRegistrationValid
} from './vehicle-patterns.js'

describe('Vehicle Registration Validation', () => {
  describe('UK_VEHICLE_REGISTRATION_PATTERN', () => {
    describe('Valid UK Vehicle Registration Formats', () => {
      it('should match format 1: ABC123 (3 letters + 1-3 digits)', () => {
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('ABC123')).toBe(true)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('ABC 123')).toBe(true)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('ABC1')).toBe(false) // Too short (4 chars)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('ABC12')).toBe(true)
      })

      it('should match format 2: A123BCD (1 letter + 1-3 digits + 3 letters)', () => {
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('A123BCD')).toBe(true)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('A 123 BCD')).toBe(true)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('A1BCD')).toBe(true)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('A12BCD')).toBe(true)
      })

      it('should match format 3: AB12CDE (2 letters + 2 digits + 3 letters)', () => {
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('AB12CDE')).toBe(true)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('AB 12 CDE')).toBe(true)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('AB02CDE')).toBe(true)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('AB10CDE')).toBe(true)
      })
    })

    describe('Invalid UK Vehicle Registration Formats', () => {
      it('should not match lowercase letters', () => {
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('abc123')).toBe(false)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('a123bcd')).toBe(false)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('ab12cde')).toBe(false)
      })

      it('should not match special characters', () => {
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('AB@12CD')).toBe(false)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('AB#123')).toBe(false)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('AB12!DE')).toBe(false)
      })

      it('should not match too short formats', () => {
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('AB1')).toBe(false)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('A1')).toBe(false)
        expect(UK_VEHICLE_REGISTRATION_PATTERN.test('ABC')).toBe(false)
      })
    })
  })

  describe('isVehicleRegistrationValid function', () => {
    describe('Valid vehicle registrations', () => {
      it('should return true for valid UK vehicle registration formats', () => {
        expect(isVehicleRegistrationValid('ABC123')).toBe(true)
        expect(isVehicleRegistrationValid('ABC 123')).toBe(true)
        expect(isVehicleRegistrationValid('A123BCD')).toBe(true)
        expect(isVehicleRegistrationValid('A 123 BCD')).toBe(true)
        expect(isVehicleRegistrationValid('AB12CDE')).toBe(true)
        expect(isVehicleRegistrationValid('AB 12 CDE')).toBe(true)
        expect(isVehicleRegistrationValid('AB1CDE')).toBe(true)
        expect(isVehicleRegistrationValid('AB12CDE')).toBe(true)
        expect(isVehicleRegistrationValid('AB123CDE')).toBe(true)
      })
    })

    describe('Invalid vehicle registrations', () => {
      it('should return false for invalid formats', () => {
        expect(isVehicleRegistrationValid('abc123')).toBe(false)
        expect(isVehicleRegistrationValid('AB@12CD')).toBe(false)
        expect(isVehicleRegistrationValid('AB1')).toBe(false)
        expect(isVehicleRegistrationValid('INVALID123')).toBe(false)
      })

      it('should return false for non-string inputs', () => {
        expect(isVehicleRegistrationValid(null)).toBe(false)
        expect(isVehicleRegistrationValid(undefined)).toBe(false)
        expect(isVehicleRegistrationValid(123)).toBe(false)
        expect(isVehicleRegistrationValid({})).toBe(false)
        expect(isVehicleRegistrationValid([])).toBe(false)
      })

      it('should return false for empty or whitespace-only strings', () => {
        expect(isVehicleRegistrationValid('')).toBe(false)
        expect(isVehicleRegistrationValid('   ')).toBe(false)
      })
    })

    describe('Edge cases', () => {
      it('should handle minimum length requirement', () => {
        expect(isVehicleRegistrationValid('ABC1')).toBe(false) // 4 chars - too short
        expect(isVehicleRegistrationValid('ABC12')).toBe(true) // 5 chars - valid
      })

      it('should handle spaces correctly', () => {
        expect(isVehicleRegistrationValid('ABC 123')).toBe(true)
        expect(isVehicleRegistrationValid('A 123 BCD')).toBe(true)
        expect(isVehicleRegistrationValid('AB 12 CDE')).toBe(true)
      })
    })
  })
})
