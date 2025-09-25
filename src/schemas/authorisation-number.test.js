import {
  authorisationNumberSchema,
  authorisationNumbersArraySchema,
  identifyAuthorisationFormat,
  getFormatExamples
} from './authorisation-number.js'
import { TEST_DATA } from './test-constants.js'

describe('Authorization Number Validation Module', () => {
  describe('identifyAuthorisationFormat helper function', () => {
    it('identifies England standard format', () => {
      const result = identifyAuthorisationFormat('HP3456XX')
      expect(result).toEqual({
        nation: 'England',
        format: 'STANDARD',
        example: 'HP3456XX',
        description: 'Two letters, four digits, two letters'
      })
    })

    it('identifies England EPR with deployment format', () => {
      const result = identifyAuthorisationFormat('EPR/AB1234CD/D5678')
      expect(result).toEqual({
        nation: 'England',
        format: 'EPR_WITH_DEPLOYMENT',
        example: 'EPR/AB1234CD/D5678',
        description: 'EPR format with deployment number'
      })
    })

    it('identifies Scotland PPC format', () => {
      const result = identifyAuthorisationFormat('PPC/A/1234567')
      expect(result).toEqual({
        nation: 'Scotland',
        format: 'PPC_CATEGORY',
        example: 'PPC/A/1234567',
        description: 'Pollution Prevention Control (categories: A/W/E/N)'
      })
    })

    it('identifies Scotland SEPA reference format', () => {
      const result = identifyAuthorisationFormat('PPC/A/SEPA1234-5678')
      expect(result).toEqual({
        nation: 'Scotland',
        format: 'PPC_SEPA_REF',
        example: 'PPC/A/SEPA1234-5678',
        description: 'PPC with SEPA reference number'
      })
    })

    it('identifies Wales standard format (shared with England)', () => {
      // Note: Since Wales and England share the same XX9999XX pattern,
      // and England is checked first, it will be identified as England
      const result = identifyAuthorisationFormat('NW1234CD')
      expect(result).toEqual({
        nation: 'England',
        format: 'STANDARD',
        example: 'HP3456XX',
        description: 'Two letters, four digits, two letters'
      })
    })

    it('identifies Wales EPR format (shared with England)', () => {
      // Note: Since Wales and England share the same EPR/XX9999XX pattern,
      // and England is checked first, it will be identified as England
      const result = identifyAuthorisationFormat('EPR/NW1234CD')
      expect(result).toEqual({
        nation: 'England',
        format: 'EPR_STANDARD',
        example: 'EPR/AB1234CD',
        description: 'Environmental Permitting Regulations format'
      })
    })

    it('identifies Northern Ireland P format', () => {
      const result = identifyAuthorisationFormat('P1234/56A')
      expect(result).toEqual({
        nation: 'Northern Ireland',
        format: 'P_FORMAT',
        example: 'P1234/56A',
        description: 'Permit number with division and letter suffix'
      })
    })

    it('identifies Northern Ireland WPPC format', () => {
      const result = identifyAuthorisationFormat('WPPC 12/34')
      expect(result).toEqual({
        nation: 'Northern Ireland',
        format: 'WPPC',
        example: 'WPPC 12/34',
        description: 'Waste Prevention and Control permit'
      })
    })

    it('handles case-insensitive matching', () => {
      const result = identifyAuthorisationFormat('hp3456xx')
      expect(result).toEqual({
        nation: 'England',
        format: 'STANDARD',
        example: 'HP3456XX',
        description: 'Two letters, four digits, two letters'
      })
    })

    it('trims whitespace before matching', () => {
      const result = identifyAuthorisationFormat('  HP3456XX  ')
      expect(result).toEqual({
        nation: 'England',
        format: 'STANDARD',
        example: 'HP3456XX',
        description: 'Two letters, four digits, two letters'
      })
    })

    it('returns null for invalid format', () => {
      const result = identifyAuthorisationFormat('INVALID-123')
      expect(result).toBeNull()
    })

    it('returns null for null input', () => {
      const result = identifyAuthorisationFormat(null)
      expect(result).toBeNull()
    })

    it('returns null for undefined input', () => {
      const result = identifyAuthorisationFormat(undefined)
      expect(result).toBeNull()
    })

    it('returns null for non-string input', () => {
      const result = identifyAuthorisationFormat(123)
      expect(result).toBeNull()
    })

    it('returns null for empty string', () => {
      const result = identifyAuthorisationFormat('')
      expect(result).toBeNull()
    })

    // Test priority - England format should be identified before Wales for shared patterns
    it('identifies shared XX9999XX pattern as England (first match)', () => {
      const result = identifyAuthorisationFormat('AB1234CD')
      expect(result.nation).toBe('England')
      expect(result.format).toBe('STANDARD')
    })
  })

  describe('getFormatExamples helper function', () => {
    it('returns all format examples grouped by nation', () => {
      const examples = getFormatExamples()

      expect(examples).toHaveProperty('England')
      expect(examples).toHaveProperty('Scotland')
      expect(examples).toHaveProperty('Wales')
      expect(examples).toHaveProperty('Northern Ireland')

      expect(examples.England).toContain('HP3456XX')
      expect(examples.England).toContain('EPR/AB1234CD/D5678')
      expect(examples.England).toContain('EAWML123456')
      expect(examples.England).toContain('WML987654')

      expect(examples.Scotland).toContain('PPC/A/1234567')
      expect(examples.Scotland).toContain('WML/L/7654321')
      expect(examples.Scotland).toContain('EAS/P/123456')

      expect(examples.Wales).toContain('NW1234CD')
      expect(examples.Wales).toContain('EPR/NW1234CD')

      expect(examples['Northern Ireland']).toContain('P1234/56A')
      expect(examples['Northern Ireland']).toContain('WPPC 12/34')
    })

    it('returns correct number of examples for each nation', () => {
      const examples = getFormatExamples()

      expect(examples.England).toHaveLength(6) // 6 England formats
      expect(examples.Scotland).toHaveLength(5) // 5 Scotland formats
      expect(examples.Wales).toHaveLength(2) // 2 Wales formats
      expect(examples['Northern Ireland']).toHaveLength(2) // 2 NI formats
    })
  })

  describe('authorisationNumberSchema Joi validation', () => {
    it('accepts valid England format', () => {
      const { error } = authorisationNumberSchema.validate('HP3456XX')
      expect(error).toBeUndefined()
    })

    it('accepts valid Scotland format', () => {
      const { error } = authorisationNumberSchema.validate('PPC/A/1234567')
      expect(error).toBeUndefined()
    })

    it('accepts valid Wales format', () => {
      const { error } = authorisationNumberSchema.validate('EPR/NW1234CD')
      expect(error).toBeUndefined()
    })

    it('accepts valid Northern Ireland format', () => {
      const { error } = authorisationNumberSchema.validate('WPPC 12/34')
      expect(error).toBeUndefined()
    })

    it('accepts lowercase format', () => {
      const { error } = authorisationNumberSchema.validate('hp3456xx')
      expect(error).toBeUndefined()
    })

    it('accepts format with spaces to trim', () => {
      const { error } = authorisationNumberSchema.validate('  HP3456XX  ')
      expect(error).toBeUndefined()
    })

    it('rejects invalid format', () => {
      const { error } = authorisationNumberSchema.validate('INVALID-123')
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'Site authorisation number must be in a valid UK format'
      )
    })

    it('rejects empty string', () => {
      const { error } = authorisationNumberSchema.validate('')
      expect(error).toBeDefined()
      expect(error.message).toBe('"value" is not allowed to be empty')
    })

    it('rejects null value', () => {
      const { error } = authorisationNumberSchema.validate(null)
      expect(error).toBeDefined()
      expect(error.message).toContain('must be a string')
    })

    it('rejects numeric value', () => {
      const { error } = authorisationNumberSchema.validate(123456)
      expect(error).toBeDefined()
      expect(error.message).toContain('must be a string')
    })

    // Test all valid formats from TEST_DATA
    it('accepts all TEST_DATA valid formats', () => {
      const validFormats = Object.values(TEST_DATA.AUTHORISATION_NUMBERS.VALID)

      validFormats.forEach((format) => {
        const { error } = authorisationNumberSchema.validate(format)
        expect(error).toBeUndefined()
      })
    })

    // Test all invalid formats from TEST_DATA
    it('rejects all TEST_DATA invalid formats', () => {
      const invalidFormats = Object.values(
        TEST_DATA.AUTHORISATION_NUMBERS.INVALID
      )

      invalidFormats.forEach((format) => {
        const { error } = authorisationNumberSchema.validate(format)
        expect(error).toBeDefined()
        expect(error.message).toBe(
          'Site authorisation number must be in a valid UK format'
        )
      })
    })
  })

  describe('authorisationNumbersArraySchema Joi validation', () => {
    it('accepts single valid authorization number', () => {
      const { error } = authorisationNumbersArraySchema.validate(['HP3456XX'])
      expect(error).toBeUndefined()
    })

    it('accepts multiple valid authorization numbers', () => {
      const { error } = authorisationNumbersArraySchema.validate([
        'HP3456XX',
        'PPC/A/1234567',
        'WPPC 12/34'
      ])
      expect(error).toBeUndefined()
    })

    it('accepts mixed case authorization numbers', () => {
      const { error } = authorisationNumbersArraySchema.validate([
        'hp3456xx',
        'EPR/AB1234CD',
        'wppc 12/34'
      ])
      expect(error).toBeUndefined()
    })

    it('rejects empty array', () => {
      const { error } = authorisationNumbersArraySchema.validate([])
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'At least one site authorisation number is required'
      )
    })

    it('rejects missing field', () => {
      const { error } = authorisationNumbersArraySchema.validate(undefined)
      expect(error).toBeDefined()
      expect(error.message).toBe('Site authorisation number is required')
    })

    it('rejects null value', () => {
      const { error } = authorisationNumbersArraySchema.validate(null)
      expect(error).toBeDefined()
      expect(error.message).toContain('must be an array')
    })

    it('rejects non-array value', () => {
      const { error } = authorisationNumbersArraySchema.validate('HP3456XX')
      expect(error).toBeDefined()
      expect(error.message).toContain('must be an array')
    })

    it('rejects array with invalid format', () => {
      const { error } = authorisationNumbersArraySchema.validate([
        'INVALID-123'
      ])
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'Site authorisation number must be in a valid UK format'
      )
    })

    it('rejects array with mix of valid and invalid formats', () => {
      const { error } = authorisationNumbersArraySchema.validate([
        'HP3456XX',
        'INVALID-123',
        'PPC/A/1234567'
      ])
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'Site authorisation number must be in a valid UK format'
      )
    })

    it('rejects array with non-string values', () => {
      const { error } = authorisationNumbersArraySchema.validate([123456])
      expect(error).toBeDefined()
      expect(error.message).toContain('must be a string')
    })
  })

  describe('Edge cases and special scenarios', () => {
    it('handles Scotland WML with different category letters', () => {
      const validCategories = ['L', 'W', 'E', 'N']
      validCategories.forEach((cat) => {
        const format = `WML/${cat}/1234567`
        const { error } = authorisationNumberSchema.validate(format)
        expect(error).toBeUndefined()
      })
    })

    it('handles Scotland PPC with different category letters', () => {
      const validCategories = ['A', 'W', 'E', 'N']
      validCategories.forEach((cat) => {
        const format = `PPC/${cat}/1234567`
        const { error } = authorisationNumberSchema.validate(format)
        expect(error).toBeUndefined()
      })
    })

    it('rejects Scotland PPC with invalid category letter', () => {
      const { error } = authorisationNumberSchema.validate('PPC/Z/1234567')
      expect(error).toBeDefined()
      expect(error.message).toBe(
        'Site authorisation number must be in a valid UK format'
      )
    })

    it('handles England formats with different letter combinations', () => {
      const validFormats = ['AB1234CD', 'XY9999ZZ', 'AA0000BB']
      validFormats.forEach((format) => {
        const { error } = authorisationNumberSchema.validate(format)
        expect(error).toBeUndefined()
      })
    })

    it('rejects England format with incorrect digit/letter placement', () => {
      const invalidFormats = ['1234ABCD', 'AB12CD34', 'ABCD1234']
      invalidFormats.forEach((format) => {
        const { error } = authorisationNumberSchema.validate(format)
        expect(error).toBeDefined()
        expect(error.message).toBe(
          'Site authorisation number must be in a valid UK format'
        )
      })
    })

    it('handles NI format variations', () => {
      const validFormats = ['P0000/00A', 'P9999/99Z', 'P1234/56B']
      validFormats.forEach((format) => {
        const { error } = authorisationNumberSchema.validate(format)
        expect(error).toBeUndefined()
      })
    })

    it('handles WPPC format with different digit combinations', () => {
      const validFormats = ['WPPC 00/00', 'WPPC 99/99', 'WPPC 12/34']
      validFormats.forEach((format) => {
        const { error } = authorisationNumberSchema.validate(format)
        expect(error).toBeUndefined()
      })
    })
  })
})
