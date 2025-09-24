import { receiveMovementRequestSchema } from './receipt.js'
import { createTestPayload } from './test-helpers/waste-test-helpers.js'
import { isValidPopName, validPopNames } from '../common/constants/pop-names.js'
import {
  sourceOfComponentsProvided,
  validSourceOfComponents
} from '../common/constants/source-of-components.js'

describe('Receipt Schema Validation - POPs', () => {
  describe('POPs Indicator Validation', () => {
    it('should accept valid POPs indicator (true)', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          pops: {
            containsPops: true,
            sourceOfComponents: 'CARRIER_PROVIDED',
            components: [
              {
                name: 'Aldrin',
                concentration: 30
              }
            ]
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid POPs indicator (false)', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { pops: { containsPops: false } }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeUndefined()
    })

    it('should accept missing POPs section', () => {
      const payload = createTestPayload()
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeUndefined()
    })

    it('should accept payload when POPs property is omitted', () => {
      const payload = createTestPayload()
      delete payload.wasteItems[0].pops

      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeUndefined()
    })

    it('should reject missing containsPops field', () => {
      const payload = createTestPayload({
        wasteItemOverrides: { pops: {} } // Empty pops object without containsPops
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        'Does the waste contain persistent organic pollutants (POPs)? is required'
      )
    })
  })

  describe('POP validation', () => {
    for (const containsPopsValue of [true, false]) {
      /*
       * item   contains<Haz/Pops>	sourceOfComponents	                    components			                          expected outcome
       * 1	    FALSE			          NOT_PROVIDED		                        []					                              ACCEPT
       * 6	    FALSE			          Other (e.g GUIDANCE, OWN TESTING etc)   []                                        ACCEPT
       * 11     TRUE                NOT_PROVIDED                            []                                        ACCEPT
       * 16     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   []                                        WARNING
       */
      it.each(Object.values(validSourceOfComponents))(
        `should accept POPs when components is [], containsPops is ${containsPopsValue} and sourceOfComponents is %s`,
        (value) => {
          const payload = createTestPayload({
            wasteItemOverrides: {
              pops: {
                containsPops: containsPopsValue,
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
       * item   contains<Haz/Pops>	sourceOfComponents	                    components			                          expected outcome
       * 2	    FALSE			          NOT_PROVIDED		                        [{}] 				                              REJECT
       * 7      FALSE               Other (e.g GUIDANCE, OWN TESTING etc)   [{}]                                      REJECT
       * 12     TRUE                NOT_PROVIDED                            [{}]                                      REJECT
       * 17     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   [{}]                                      REJECT
       */
      it.each(Object.values(validSourceOfComponents))(
        `should reject POPs when an empty component is provided, containsPops is ${containsPopsValue} and sourceOfComponents is %s`,
        (value) => {
          const payload = createTestPayload({
            wasteItemOverrides: {
              pops: {
                containsPops: containsPopsValue,
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
            '"wasteItems[0].pops.components[1].name" is required'
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
      'should reject when components are provided, containsPops is false and sourceOfComponents is %s',
      (value) => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: false,
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
          'POP components must not be provided when POPs are not present'
        )
      }
    )

    /*
     * item   contains<Haz/Pops>	sourceOfComponents	                    components			                          expected outcome
     * 13     TRUE                NOT_PROVIDED                            [{ name: 'Aldrin' }]                      REJECT
     * 14     TRUE                NOT_PROVIDED                            [{ concentration: 1.8 }]                  REJECT
     * 15     TRUE                NOT_PROVIDED                            [{ name: 'Aldrin', concentration: 1.8 }]  REJECT
     */
    it('should reject when components are provided, containsPops is true and sourceOfComponents is "NOT_PROVIDED', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          pops: {
            containsPops: true,
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
        'POP components must not be provided when the source of components is NOT_PROVIDED'
      )
    })

    /*
     * item   contains<Haz/Pops>	sourceOfComponents	                    components			                          expected outcome
     * 20     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   [{ name: 'Aldrin', concentration: 1.8 }]  ACCEPT
     */
    it.each(Object.values(sourceOfComponentsProvided))(
      'should accept when components are provided, containsPops is true and sourceOfComponents is %s',
      (value) => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
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
     * item   contains<Haz/Pops>	sourceOfComponents	                    components			                          expected outcome
     * 19     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   [{ concentration: 1.8 }]                  REJECT
     */
    it.each([undefined, null])(
      'should reject when components are provided without a name, containsPops is true and sourceOfComponents is other than NOT_PROVIDED',
      (value) => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
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
          '"wasteItems[0].pops.components[1].name" is required'
        )
      }
    )

    /*
     * item   contains<Haz/Pops>	sourceOfComponents	                    components			                          expected outcome
     * 18     TRUE                Other (e.g GUIDANCE, OWN TESTING etc)   [{ name: 'Aldrin' }]                      WARNING
     */
    it.each([undefined, null])(
      'should accept when components are provided without a concentration, containsPops is true and sourceOfComponents is other than NOT_PROVIDED',
      (value) => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
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
          pops: {
            containsPops: true,
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
        '"wasteItems[0].pops.components[1].name" is not allowed to be empty'
      )
    })

    it('should reject POP name with an invalid value', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          pops: {
            containsPops: true,
            sourceOfComponents: 'CARRIER_PROVIDED',
            components: [
              {
                name: 'Invalid POP Name',
                concentration: 100
              }
            ]
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        '"wasteItems[0].pops.components[0].name" is not valid'
      )
    })

    it.each(validPopNames)('should accept valid POP name: "%s"', (popName) => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          pops: {
            containsPops: true,
            sourceOfComponents: 'CARRIER_PROVIDED',
            components: [
              {
                name: popName,
                concentration: 100
              }
            ]
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeUndefined()
    })

    it.each([12.5, 9.12345678, 500, 0])(
      'should accept valid POP concentration value: "%s"',
      (value) => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
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

    it('should reject POPs when containsPops is true and concentration is not a number', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          pops: {
            containsPops: true,
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
        '"wasteItems[0].pops.components[1].concentration" must be a valid number'
      )
    })

    it('should reject POPs when containsPops is true and concentration is a negatve number', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          pops: {
            containsPops: true,
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
        '"wasteItems[0].pops.components[1].concentration" concentration cannot be negative'
      )
    })

    it('should reject POPs when containsPops is true and sourceOfComponents is missing', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          pops: {
            containsPops: true
          }
        }
      })
      const result = receiveMovementRequestSchema.validate(payload)
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe(
        'Source of POP components is required when POPs are present'
      )
    })

    it('should reject POPs when containsPops is true and sourceOfComponents is invalid', () => {
      const payload = createTestPayload({
        wasteItemOverrides: {
          pops: {
            containsPops: true,
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
        `"wasteItems[0].pops.sourceOfComponents" must be one of [${Object.values(validSourceOfComponents).join(', ')}]`
      )
    })

    it.each([undefined, null])(
      'should accept POPs when containsPops is false and no components are provided: "%s"',
      (value) => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: false,
              components: value
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      }
    )

    it.each([undefined, null])(
      'should reject POPs when containsPops is true and no components are provided: "%s"',
      (value) => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: {
              containsPops: true,
              sourceOfComponents: 'CARRIER_PROVIDED',
              components: value
            }
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeDefined()
        expect(result.error.message).toBe(
          '"wasteItems[0].pops.components" is required when POPs are present'
        )
      }
    )

    it.each([undefined, null])(
      'should accepts POPs when pops is not provided: "%s"',
      (value) => {
        const payload = createTestPayload({
          wasteItemOverrides: {
            pops: value
          }
        })
        const result = receiveMovementRequestSchema.validate(payload)
        expect(result.error).toBeUndefined()
      }
    )
  })

  describe('isValidPopName function unit tests', () => {
    describe('returns true for valid POP names', () => {
      it.each(validPopNames)('should return true for: "%s"', (popName) => {
        expect(isValidPopName(popName)).toBe(true)
      })
    })

    describe('returns false for invalid inputs', () => {
      const invalidInputs = [
        [null, 'null'],
        [undefined, 'undefined'],
        ['Invalid POP Name', 'invalid string'],
        ['Carrier did not provide detail', 'deprecated entry'],
        [123, 'number'],
        [true, 'boolean'],
        [{}, 'object'],
        [[], 'array'],
        ['pfos', 'wrong case']
      ]

      it.each(invalidInputs)('should return false for %s (%s)', (input) => {
        expect(isValidPopName(input)).toBe(false)
      })
    })
  })
})
