import {
  sourceOfComponentsProvided,
  validSourceOfComponents
} from '../../../common/constants/source-of-components.js'
import { receiveMovementRequestSchema } from '../../../schemas/receipt.js'
import { createTestPayload } from '../../../schemas/test-helpers/waste-test-helpers.js'
import { formatPopsOrHazardousFields } from '../../../schemas/waste.js'

const DECIMAL_CONCENTRATION = 12.5
const ZERO_NUMBER = 0

export function popsAndHazardousComponentsErrorTests(
  popsOrHazardous,
  overrides
) {
  if (!['POPs', 'Hazardous'].includes(popsOrHazardous)) {
    throw new Error('Expecting popsOrHazardous to be one of: POPs, Hazardous')
  }

  const { popsOrHazardousObjectProperty, containsPopsOrHazardousField } =
    formatPopsOrHazardousFields(popsOrHazardous)
  const isHazardous = popsOrHazardous === 'Hazardous'

  // Helper to add hazCodes when testing Hazardous and containsHazardous is true
  const createTestPayloadWithHazCodes = (overrides) => {
    const wasteItemOverrides = overrides.wasteItemOverrides || {}
    const hazardousData = wasteItemOverrides[popsOrHazardousObjectProperty]

    // If testing Hazardous and containsHazardous is true, add hazCodes
    if (
      isHazardous &&
      hazardousData &&
      hazardousData[containsPopsOrHazardousField] === true
    ) {
      wasteItemOverrides[popsOrHazardousObjectProperty] = {
        ...hazardousData,
        hazCodes: hazardousData.hazCodes || ['HP_1']
      }
    }

    return createTestPayload({
      ...overrides,
      wasteItemOverrides
    })
  }

  describe(`${popsOrHazardous} Components Validation`, () => {
    for (const containsPopsOrHazardousValue of [true, false]) {
      /*
       * item   contains<Haz/Pops>	sourceOfComponents	                    components  expected outcome
       * 1	    FALSE			          NOT_PROVIDED		                        []				  ACCEPT
       * 6	    FALSE			          Other (e.g GUIDANCE, OWN TESTING etc)   []          ACCEPT
       * 11     TRUE                NOT_PROVIDED                            []          ACCEPT
       * 16     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   []          WARNING
       */
      it.each(Object.values(validSourceOfComponents))(
        `should accept components when components is [], ${containsPopsOrHazardousField} is ${containsPopsOrHazardousValue} and sourceOfComponents is %s`,
        (value) => {
          const payload = createTestPayloadWithHazCodes({
            wasteItemOverrides: {
              [containsPopsOrHazardousField]: containsPopsOrHazardousValue,
              [popsOrHazardousObjectProperty]: {
                sourceOfComponents: value,
                components: [],
                ...overrides
              }
            }
          })
          const result = receiveMovementRequestSchema.validate(payload)
          expect(result.error).toBeUndefined()
        }
      )

      /*
       * item   contains<Haz/Pops>	sourceOfComponents	                    components  expected outcome
       * 2	    FALSE			          NOT_PROVIDED		                        [{}] 			  REJECT
       * 7      FALSE               Other (e.g GUIDANCE, OWN TESTING etc)   [{}]        REJECT
       * 12     TRUE                NOT_PROVIDED                            [{}]        REJECT
       * 17     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   [{}]        REJECT
       */
      it.each(Object.values(validSourceOfComponents))(
        `should reject components when an empty component is provided, ${containsPopsOrHazardousField} is ${containsPopsOrHazardousValue} and sourceOfComponents is %s`,
        (value) => {
          const payload = createTestPayloadWithHazCodes({
            wasteItemOverrides: {
              [containsPopsOrHazardousField]: containsPopsOrHazardousValue,
              [popsOrHazardousObjectProperty]: {
                sourceOfComponents: value,
                components: [
                  {
                    name: 'Aldrin',
                    concentration: 100
                  },
                  {}
                ]
              }
            }
          })
          const result = receiveMovementRequestSchema.validate(payload)
          expect(result.error).toBeDefined()
          expect(result.error.message).toBe(
            `"wasteItems[0].${popsOrHazardousObjectProperty}.components[1].name" is required`
          )
        }
      )
    }

    /*
     * item   contains<Haz/Pops>	sourceOfComponents	                    components			                          expected outcome
     * 3	    FALSE			          NOT_PROVIDED		                        [{ name: 'Aldrin' }]			                REJECT
     * 8      FALSE               Other (e.g GUIDANCE, OWN TESTING etc)   [{ name: 'Aldrin' }]                      REJECT
     * 4	    FALSE			          NOT_PROVIDED		                        [{ concentration: 1.8 }]			            REJECT
     * 5	    FALSE			          NOT_PROVIDED		                        [{ name: 'Aldrin', concentration: 1.8 }]  REJECT
     * 9      FALSE               Other (e.g GUIDANCE, OWN TESTING etc)   [{ concentration: 1.8 }]                  REJECT
     * 10     FALSE               Other (e.g GUIDANCE, OWN TESTING etc)   [{ name: 'Aldrin', concentration: 1.8 }]  REJECT
     */
    it.each(Object.values(validSourceOfComponents))(
      `should reject when components are provided, ${containsPopsOrHazardousField} is false and sourceOfComponents is %s`,
      (value) => {
        const payload = createTestPayloadWithHazCodes({
          wasteItemOverrides: {
            [containsPopsOrHazardousField]: false,
            [popsOrHazardousObjectProperty]: {
              sourceOfComponents: value,
              components: [
                {
                  name: 'Aldrin',
                  concentration: 100
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toBe(
          `"wasteItems[0].${popsOrHazardousObjectProperty}.components" must not be provided when ${containsPopsOrHazardousField} is false`
        )
      }
    )

    /*
     * item   contains<Haz/Pops>	sourceOfComponents	                    components			                          expected outcome
     * 13     TRUE                NOT_PROVIDED                            [{ name: 'Aldrin' }]                      REJECT
     * 14     TRUE                NOT_PROVIDED                            [{ concentration: 1.8 }]                  REJECT
     * 15     TRUE                NOT_PROVIDED                            [{ name: 'Aldrin', concentration: 1.8 }]  REJECT
     */
    it(`should reject when components are provided, ${containsPopsOrHazardousField} is true and sourceOfComponents is "NOT_PROVIDED`, () => {
      const payload = createTestPayloadWithHazCodes({
        wasteItemOverrides: {
          [containsPopsOrHazardousField]: true,
          [popsOrHazardousObjectProperty]: {
            sourceOfComponents: 'NOT_PROVIDED',
            components: [
              {
                name: 'Aldrin',
                concentration: 100
              }
            ],
            ...overrides
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        `"wasteItems[0].${popsOrHazardousObjectProperty}.components" must not be provided when sourceOfComponents is NOT_PROVIDED`
      )
    })

    /*
     * item   contains<Haz/Pops>	sourceOfComponents	                    components			                          expected outcome
     * 20     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   [{ name: 'Aldrin', concentration: 1.8 }]  ACCEPT
     */
    it.each(Object.values(sourceOfComponentsProvided))(
      `should accept when components are provided, ${containsPopsOrHazardousField} is true and sourceOfComponents is %s`,
      (value) => {
        const payload = createTestPayloadWithHazCodes({
          wasteItemOverrides: {
            [containsPopsOrHazardousField]: true,
            [popsOrHazardousObjectProperty]: {
              sourceOfComponents: value,
              components: [
                {
                  name: 'Aldrin',
                  concentration: 100
                }
              ],
              ...overrides
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      }
    )

    /*
     * item   contains<Haz/Pops>	sourceOfComponents	                    components			          expected outcome
     * 19     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   [{ concentration: 1.8 }]  REJECT
     */
    it.each([undefined, null])(
      `should reject when components are provided without a name, ${containsPopsOrHazardousField} is true and sourceOfComponents is other than NOT_PROVIDED`,
      (value) => {
        const payload = createTestPayloadWithHazCodes({
          wasteItemOverrides: {
            [containsPopsOrHazardousField]: true,
            [popsOrHazardousObjectProperty]: {
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: [
                {
                  name: 'Aldrin',
                  concentration: 100
                },
                {
                  name: value,
                  concentration: 30
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        // When containsHazardous/containsPops is true and sourceOfComponents is not NOT_PROVIDED,
        // the conditional requirement message cascades to child fields
        expect(result.error.message).toBe(
          `"wasteItems[0].${popsOrHazardousObjectProperty}.components[1].name" is required`
        )
      }
    )

    /*
     * item   contains<Haz/Pops>	sourceOfComponents	                    components			      expected outcome
     * 18     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   [{ name: 'Aldrin' }]  WARNING
     */
    it.each([undefined, null])(
      `should accept when components are provided without a concentration, ${containsPopsOrHazardousField} is true and sourceOfComponents is other than NOT_PROVIDED`,
      (value) => {
        const payload = createTestPayloadWithHazCodes({
          wasteItemOverrides: {
            [containsPopsOrHazardousField]: true,
            [popsOrHazardousObjectProperty]: {
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: [
                {
                  name: 'Aldrin',
                  concentration: 100
                },
                {
                  name: 'Chlordane',
                  concentration: value
                }
              ],
              ...overrides
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      }
    )

    it('should reject invalid POP name: ""', () => {
      const payload = createTestPayloadWithHazCodes({
        wasteItemOverrides: {
          [containsPopsOrHazardousField]: true,
          [popsOrHazardousObjectProperty]: {
            sourceOfComponents: 'CARRIER_PROVIDED',
            components: [
              {
                name: 'Aldrin',
                concentration: 100
              },
              {
                name: '',
                concentration: 100
              }
            ]
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        `"wasteItems[0].${popsOrHazardousObjectProperty}.components[1].name" is not allowed to be empty`
      )
    })

    it(`should reject components when ${containsPopsOrHazardousField} is true and concentration is not a number`, () => {
      const payload = createTestPayloadWithHazCodes({
        wasteItemOverrides: {
          [containsPopsOrHazardousField]: true,
          [popsOrHazardousObjectProperty]: {
            sourceOfComponents: 'OWN_TESTING',
            components: [
              {
                name: 'Aldrin',
                concentration: 100
              },
              {
                name: 'Endosulfan',
                concentration: 'ten'
              }
            ]
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        `"wasteItems[0].${popsOrHazardousObjectProperty}.components[1].concentration" must be a number`
      )
    })

    it(`should accept components when ${containsPopsOrHazardousField} is true and concentration is a decimal`, () => {
      const payload = createTestPayloadWithHazCodes({
        wasteItemOverrides: {
          [containsPopsOrHazardousField]: true,
          [popsOrHazardousObjectProperty]: {
            sourceOfComponents: 'OWN_TESTING',
            components: [
              {
                name: 'Aldrin',
                concentration: 100
              },
              {
                name: 'Endosulfan',
                concentration: DECIMAL_CONCENTRATION
              }
            ],
            ...overrides
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeUndefined()
    })

    it(`should reject components when ${containsPopsOrHazardousField} is true and concentration is zero`, () => {
      const payload = createTestPayloadWithHazCodes({
        wasteItemOverrides: {
          [containsPopsOrHazardousField]: true,
          [popsOrHazardousObjectProperty]: {
            sourceOfComponents: 'OWN_TESTING',
            components: [
              {
                name: 'Aldrin',
                concentration: 100
              },
              {
                name: 'Endosulfan',
                concentration: ZERO_NUMBER
              }
            ]
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        `"wasteItems[0].${popsOrHazardousObjectProperty}.components[1].concentration" must be a positive number`
      )
    })

    it(`should reject components when ${containsPopsOrHazardousField} is true and concentration is a negative number`, () => {
      const payload = createTestPayloadWithHazCodes({
        wasteItemOverrides: {
          [containsPopsOrHazardousField]: true,
          [popsOrHazardousObjectProperty]: {
            sourceOfComponents: 'OWN_TESTING',
            components: [
              {
                name: 'Aldrin',
                concentration: 100
              },
              {
                name: 'Endosulfan',
                concentration: -10
              }
            ]
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        `"wasteItems[0].${popsOrHazardousObjectProperty}.components[1].concentration" must be a positive number`
      )
    })

    it(`should reject components when ${containsPopsOrHazardousField} is true and sourceOfComponents is missing`, () => {
      const payload = createTestPayloadWithHazCodes({
        wasteItemOverrides: {
          [containsPopsOrHazardousField]: true,
          [popsOrHazardousObjectProperty]: {}
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        `"wasteItems[0].${popsOrHazardousObjectProperty}.sourceOfComponents" is required when ${containsPopsOrHazardousField} is true`
      )
    })

    it(`should reject components when ${containsPopsOrHazardousField} is true and sourceOfComponents is invalid`, () => {
      const payload = createTestPayloadWithHazCodes({
        wasteItemOverrides: {
          [containsPopsOrHazardousField]: true,
          [popsOrHazardousObjectProperty]: {
            sourceOfComponents: 'INVALID_SOURCE',
            components: [
              {
                name: 'Aldrin',
                concentration: 100
              }
            ]
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        `"wasteItems[0].${popsOrHazardousObjectProperty}.sourceOfComponents" must be one of [${Object.values(validSourceOfComponents).join(', ')}]`
      )
    })

    it.each([undefined, null])(
      `should accept components when ${containsPopsOrHazardousField} is false and no components are provided: "%s"`,
      (value) => {
        const payload = createTestPayloadWithHazCodes({
          wasteItemOverrides: {
            [containsPopsOrHazardousField]: false,
            [popsOrHazardousObjectProperty]: {
              components: value
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      }
    )

    it.each([undefined, null])(
      `should reject components when ${containsPopsOrHazardousField} is true, sourceOfComponents is other than NOT_PROVIDED and no components are provided: "%s"`,
      (value) => {
        const payload = createTestPayloadWithHazCodes({
          wasteItemOverrides: {
            [containsPopsOrHazardousField]: true,
            [popsOrHazardousObjectProperty]: {
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: value,
              ...overrides
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toBe(
          `"wasteItems[0].${popsOrHazardousObjectProperty}.components" is required when ${containsPopsOrHazardousField} is true`
        )
      }
    )

    it.each([undefined, null])(
      `should accept components when ${containsPopsOrHazardousField} is true, sourceOfComponents is NOT_PROVIDED and no components are provided: "%s"`,
      (value) => {
        const payload = createTestPayloadWithHazCodes({
          wasteItemOverrides: {
            [containsPopsOrHazardousField]: true,
            [popsOrHazardousObjectProperty]: {
              sourceOfComponents: 'NOT_PROVIDED',
              components: value,
              ...overrides
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      }
    )

    it.each([undefined, null])(
      `should accept components when ${containsPopsOrHazardousField} is not provided: "%s"`,
      (value) => {
        const payload = createTestPayloadWithHazCodes({
          wasteItemOverrides: {
            [containsPopsOrHazardousField]: false,
            [popsOrHazardousObjectProperty]: value
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      }
    )
  })
}
