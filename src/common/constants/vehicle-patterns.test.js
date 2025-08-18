import {
  UK_VEHICLE_REGISTRATION_PATTERN,
  UK_VEHICLE_REGISTRATION_EXAMPLES
} from './vehicle-patterns.js'

describe('Vehicle Patterns Constants', () => {
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

  describe('UK_VEHICLE_REGISTRATION_EXAMPLES', () => {
    it('should contain the expected format examples', () => {
      expect(UK_VEHICLE_REGISTRATION_EXAMPLES).toBe('ABC123, A123BCD, AB12CDE')
    })
  })
})
