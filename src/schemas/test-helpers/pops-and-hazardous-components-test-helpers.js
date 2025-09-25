import {
  sourceOfComponentsProvided,
  validSourceOfComponents
} from '../../common/constants/source-of-components.js'
import { receiveMovementRequestSchema } from '../receipt.js'
import { createTestPayload } from './waste-test-helpers.js'

export function testPopsAndHazardousComponents(popsOrHazardous) {
  if (!['POPs', 'Hazardous'].includes(popsOrHazardous)) {
    throw new Error('Expecting popsOrHazardous to be one of: POPs, Hazardous')
  }

  const popsOrHazardousObjectProperty = String(popsOrHazardous).toLowerCase()
  const containsPopsOrHazardousField = `contains${String(popsOrHazardous).charAt(0).toUpperCase()}${String(popsOrHazardous).toLowerCase().slice(1)}`

  describe(`Components Validation`, () => {
    for (const containsHazardousValue of [true, false]) {
      /*
       * item   contains<Haz/Pops>	sourceOfComponents	                    components  expected outcome
       * 1	    FALSE			          NOT_PROVIDED		                        []				  ACCEPT
       * 6	    FALSE			          Other (e.g GUIDANCE, OWN TESTING etc)   []          ACCEPT
       * 11     TRUE                NOT_PROVIDED                            []          ACCEPT
       * 16     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   []          WARNING
       */
      it.each(Object.values(validSourceOfComponents))(
        `should accept components when components is [], ${containsPopsOrHazardousField} is ${containsHazardousValue} and sourceOfComponents is %s`,
        (value) => {
          const payload = createTestPayload({
            wasteItemOverrides: {
              [popsOrHazardousObjectProperty]: {
                [containsPopsOrHazardousField]: containsHazardousValue,
                sourceOfComponents: value,
                components: []
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
        `should reject components when an empty component is provided, ${containsPopsOrHazardousField} is ${containsHazardousValue} and sourceOfComponents is %s`,
        (value) => {
          const payload = createTestPayload({
            wasteItemOverrides: {
              [popsOrHazardousObjectProperty]: {
                [containsPopsOrHazardousField]: containsHazardousValue,
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
        const payload = createTestPayload({
          wasteItemOverrides: {
            [popsOrHazardousObjectProperty]: {
              [containsPopsOrHazardousField]: false,
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
          `${popsOrHazardous} components must not be provided when ${popsOrHazardous} components are not present`
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
      const payload = createTestPayload({
        wasteItemOverrides: {
          [popsOrHazardousObjectProperty]: {
            [containsPopsOrHazardousField]: true,
            sourceOfComponents: 'NOT_PROVIDED',
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
        `${popsOrHazardous} components must not be provided when the source of components is NOT_PROVIDED`
      )
    })

    /*
     * item   contains<Haz/Pops>	sourceOfComponents	                    components			                          expected outcome
     * 20     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   [{ name: 'Aldrin', concentration: 1.8 }]  ACCEPT
     */
    it.each(Object.values(sourceOfComponentsProvided))(
      `should accept when components are provided, ${containsPopsOrHazardousField} is true and sourceOfComponents is %s`,
      (value) => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            [popsOrHazardousObjectProperty]: {
              [containsPopsOrHazardousField]: true,
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
        const payload = createTestPayload({
          wasteItemOverrides: {
            [popsOrHazardousObjectProperty]: {
              [containsPopsOrHazardousField]: true,
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
        const payload = createTestPayload({
          wasteItemOverrides: {
            [popsOrHazardousObjectProperty]: {
              [containsPopsOrHazardousField]: true,
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
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      }
    )

    it('should reject invalid POP name: ""', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          [popsOrHazardousObjectProperty]: {
            [containsPopsOrHazardousField]: true,
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

    it.each([12.5, 9.12345678, 500, 0])(
      'should accept valid POP concentration value: "%s"',
      (value) => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            [popsOrHazardousObjectProperty]: {
              [containsPopsOrHazardousField]: true,
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: [
                {
                  name: 'Aldrin',
                  concentration: 100
                },
                {
                  name: 'Aldrin',
                  concentration: value
                }
              ]
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      }
    )

    it(`should reject components when ${containsPopsOrHazardousField} is true and concentration is not a number`, () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          [popsOrHazardousObjectProperty]: {
            [containsPopsOrHazardousField]: true,
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
        `"wasteItems[0].${popsOrHazardousObjectProperty}.components[1].concentration" must be a valid number`
      )
    })

    it(`should reject components when ${containsPopsOrHazardousField} is true and concentration is a negative number`, () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          [popsOrHazardousObjectProperty]: {
            [containsPopsOrHazardousField]: true,
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
        `"wasteItems[0].${popsOrHazardousObjectProperty}.components[1].concentration" concentration cannot be negative`
      )
    })

    it(`should reject components when ${containsPopsOrHazardousField} is true and sourceOfComponents is missing`, () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          [popsOrHazardousObjectProperty]: {
            [containsPopsOrHazardousField]: true
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        `"wasteItems[0].${popsOrHazardousObjectProperty}.sourceOfComponents" is required when ${popsOrHazardous} components are present`
      )
    })

    it(`should reject components when ${containsPopsOrHazardousField} is true and sourceOfComponents is invalid`, () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          [popsOrHazardousObjectProperty]: {
            [containsPopsOrHazardousField]: true,
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
        const payload = createTestPayload({
          wasteItemOverrides: {
            [popsOrHazardousObjectProperty]: {
              [containsPopsOrHazardousField]: false,
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
        const payload = createTestPayload({
          wasteItemOverrides: {
            [popsOrHazardousObjectProperty]: {
              [containsPopsOrHazardousField]: true,
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: value
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toBe(
          `"wasteItems[0].${popsOrHazardousObjectProperty}.components" is required when ${popsOrHazardous} components are present`
        )
      }
    )

    it.each([undefined, null])(
      `should accept components when ${containsPopsOrHazardousField} is true, sourceOfComponents is NOT_PROVIDED and no components are provided: "%s"`,
      (value) => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            [popsOrHazardousObjectProperty]: {
              [containsPopsOrHazardousField]: true,
              sourceOfComponents: 'NOT_PROVIDED',
              components: value
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
        const payload = createTestPayload({
          wasteItemOverrides: {
            [popsOrHazardousObjectProperty]: value
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      }
    )
  })
}
