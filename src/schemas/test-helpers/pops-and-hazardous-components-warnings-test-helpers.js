import { sourceOfComponentsProvided } from '../../common/constants/source-of-components.js'
import {
  generatePopAndHazardousComponentWarnings,
  VALIDATION_ERROR_TYPES
} from '../../common/helpers/validation-warnings.js'

function test1(popsOrHazardous) {
  it.each([undefined, null])(
    'should return empty array when payload is %s',
    (value) => {
      const payload = value

      const warnings = generatePopAndHazardousComponentWarnings(
        payload,
        popsOrHazardous
      )
      expect(warnings).toEqual([])
    }
  )
}

function test2(popsOrHazardous) {
  it.each([undefined, null])(
    'should return empty array when wasteItems is %s',
    (value) => {
      const payload = value

      const warnings = generatePopAndHazardousComponentWarnings(
        payload,
        popsOrHazardous
      )
      expect(warnings).toEqual([])
    }
  )
}

function test3(
  containsPopsOrHazardousField,
  popsOrHazardousObjectProperty,
  popsOrHazardous
) {
  it(`should return empty array when ${containsPopsOrHazardousField} is false`, () => {
    const payload = {
      wasteItems: [
        {
          [popsOrHazardousObjectProperty]: {
            [containsPopsOrHazardousField]: false
          }
        }
      ]
    }

    const warnings = generatePopAndHazardousComponentWarnings(
      payload,
      popsOrHazardous
    )
    expect(warnings).toEqual([])
  })
}

function test4(
  popsOrHazardousObjectProperty,
  containsPopsOrHazardousField,
  popsOrHazardous
) {
  it('should return empty array when sourceOfComponents is NOT_PROVIDED', () => {
    const payload = {
      wasteItems: [
        {
          [popsOrHazardousObjectProperty]: {
            [containsPopsOrHazardousField]: true,
            sourceOfComponents: 'NOT_PROVIDED'
          }
        }
      ]
    }

    const warnings = generatePopAndHazardousComponentWarnings(
      payload,
      popsOrHazardous
    )
    expect(warnings).toEqual([])
  })
}

function test5(
  popsOrHazardous,
  popsOrHazardousObjectProperty,
  containsPopsOrHazardousField
) {
  it(`should return empty array when ${popsOrHazardous} components is provided with name and concentration values`, () => {
    const payload = {
      wasteItems: [
        {
          [popsOrHazardousObjectProperty]: {
            [containsPopsOrHazardousField]: true,
            sourceOfComponents: 'CARRIER_SUPPLIED',
            components: [
              {
                name: 'Aldrin',
                concentration: 100
              },
              {
                name: 'Chlordane',
                concentration: 30
              }
            ]
          }
        }
      ]
    }

    const warnings = generatePopAndHazardousComponentWarnings(
      payload,
      popsOrHazardous
    )
    expect(warnings).toEqual([])
  })
}

function test6(
  popsOrHazardous,
  popsOrHazardousObjectProperty,
  containsPopsOrHazardousField
) {
  it(`should generate warning when ${popsOrHazardous} components is an empty array`, () => {
    const payload = {
      wasteItems: [
        {
          [popsOrHazardousObjectProperty]: {
            [containsPopsOrHazardousField]: true,
            sourceOfComponents: 'CARRIER_SUPPLIED',
            components: []
          }
        }
      ]
    }

    const warnings = generatePopAndHazardousComponentWarnings(
      payload,
      popsOrHazardous
    )
    expect(warnings).toEqual([
      {
        key: `wasteItems[0].${popsOrHazardousObjectProperty}.components`,
        errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
        message: `${popsOrHazardous} components are recommended when source of components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`
      }
    ])
  })
}

function test7(
  popsOrHazardous,
  popsOrHazardousObjectProperty,
  containsPopsOrHazardousField
) {
  it.each([undefined, null])(
    `should handle when ${popsOrHazardous} components is not provided: "%s"`,
    (value) => {
      const payload = {
        wasteItems: [
          {
            [popsOrHazardousObjectProperty]: {
              [containsPopsOrHazardousField]: true,
              sourceOfComponents: 'CARRIER_SUPPLIED',
              components: value
            }
          }
        ]
      }

      generatePopAndHazardousComponentWarnings(payload, popsOrHazardous)
    }
  )
}

function test8(
  popsOrHazardous,
  popsOrHazardousObjectProperty,
  containsPopsOrHazardousField
) {
  it.each([undefined, null])(
    `should generate warning when ${popsOrHazardous} components is provided with a missing concentration value: "%s"`,
    (value) => {
      const payload = {
        wasteItems: [
          {
            [popsOrHazardousObjectProperty]: {
              [containsPopsOrHazardousField]: true,
              sourceOfComponents: 'CARRIER_SUPPLIED',
              components: [
                {
                  name: 'Aldrin',
                  concentration: 100
                },
                {
                  name: 'Chlordane',
                  concentration: value
                }
              ]
            }
          }
        ]
      }

      const warnings = generatePopAndHazardousComponentWarnings(
        payload,
        popsOrHazardous
      )
      expect(warnings).toEqual([
        {
          key: `wasteItems[0].${popsOrHazardousObjectProperty}.components`,
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: `${popsOrHazardous} concentration is recommended when source of components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`
        }
      ])
    }
  )
}

export function testPopsAndHazardousComponentWarnings(popsOrHazardous) {
  if (!['POPs', 'Hazardous'].includes(popsOrHazardous)) {
    throw new Error('Expecting popsOrHazardous to be one of: POPs, Hazardous')
  }

  const popsOrHazardousObjectProperty = String(popsOrHazardous).toLowerCase()
  const containsPopsOrHazardousField = `contains${String(popsOrHazardous).charAt(0).toUpperCase()}${String(popsOrHazardous).toLowerCase().slice(1)}`

  describe(`generatePopAndHazardousComponentWarnings: "${popsOrHazardous}"`, () => {
    test1(popsOrHazardous)

    test2(popsOrHazardous)

    test3(
      containsPopsOrHazardousField,
      popsOrHazardousObjectProperty,
      popsOrHazardous
    )

    test4(
      popsOrHazardousObjectProperty,
      containsPopsOrHazardousField,
      popsOrHazardous
    )

    test5(
      popsOrHazardous,
      popsOrHazardousObjectProperty,
      containsPopsOrHazardousField
    )

    test6(
      popsOrHazardous,
      popsOrHazardousObjectProperty,
      containsPopsOrHazardousField
    )

    test7(
      popsOrHazardous,
      popsOrHazardousObjectProperty,
      containsPopsOrHazardousField
    )

    test8(
      popsOrHazardous,
      popsOrHazardousObjectProperty,
      containsPopsOrHazardousField
    )
  })
}
