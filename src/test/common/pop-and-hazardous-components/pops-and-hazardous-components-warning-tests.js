import { sourceOfComponentsProvided } from '../../../common/constants/source-of-components.js'
import {
  processValidationWarnings,
  VALIDATION_ERROR_TYPES
} from '../../../common/helpers/validation-warnings.js'

export function popsAndHazardousComponentWarningTests(
  popsOrHazardous,
  validationWarnings
) {
  if (!['POPs', 'Hazardous'].includes(popsOrHazardous)) {
    throw new Error('Expecting popsOrHazardous to be one of: POPs, Hazardous')
  }

  const popsOrHazardousObjectProperty = String(popsOrHazardous).toLowerCase()
  const containsPopsOrHazardousField = `contains${String(popsOrHazardous).charAt(0).toUpperCase()}${String(popsOrHazardous).toLowerCase().slice(1)}`

  describe(`"${popsOrHazardous}" Components Warnings`, () => {
    it.each([undefined, null])(
      'should return empty array when payload is %s',
      (value) => {
        const payload = value

        const warnings = processValidationWarnings(payload, validationWarnings)
        expect(warnings).toEqual([])
      }
    )

    it.each([undefined, null])(
      'should return empty array when wasteItems is %s',
      (value) => {
        const payload = value

        const warnings = processValidationWarnings(payload, validationWarnings)
        expect(warnings).toEqual([])
      }
    )

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

      const warnings = processValidationWarnings(payload, validationWarnings)
      expect(warnings).toEqual([])
    })

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

      const warnings = processValidationWarnings(payload, validationWarnings)
      expect(warnings).toEqual([])
    })

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

      const warnings = processValidationWarnings(payload, validationWarnings)
      expect(warnings).toEqual([])
    })

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

      const warnings = processValidationWarnings(payload, validationWarnings)
      expect(warnings).toEqual([
        {
          key: `wasteItems.0.${popsOrHazardousObjectProperty}.components`,
          errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
          message: `wasteItems[0].${popsOrHazardousObjectProperty}.components are recommended when source of components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`
        }
      ])
    })

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

        processValidationWarnings(payload, validationWarnings)
      }
    )

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

        const warnings = processValidationWarnings(payload, validationWarnings)
        expect(warnings).toEqual([
          {
            key: `wasteItems.0.${popsOrHazardousObjectProperty}.components.1.concentration`,
            errorType: VALIDATION_ERROR_TYPES.NOT_PROVIDED,
            message: `wasteItems[0].${popsOrHazardousObjectProperty}.components[1].concentration is recommended when source of components is one of ${Object.values(sourceOfComponentsProvided).join(', ')}`
          }
        ])
      }
    )
  })
}
