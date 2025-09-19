import {
  POP_COMPONENT_SOURCES,
  validPopComponentSources,
  isValidPopComponentSource
} from './pop-component-sources.js'

describe('POP component sources constants', () => {
  it('should expose all enum values in the valid list', () => {
    expect(validPopComponentSources).toEqual(
      Object.values(POP_COMPONENT_SOURCES)
    )
  })

  it('should recognise each valid source value', () => {
    for (const source of validPopComponentSources) {
      expect(isValidPopComponentSource(source)).toBe(true)
    }
  })

  it('should reject invalid or undefined values', () => {
    const invalidValues = [undefined, null, 'invalid', 123, {}, []]

    for (const value of invalidValues) {
      expect(isValidPopComponentSource(value)).toBe(false)
    }
  })
})
