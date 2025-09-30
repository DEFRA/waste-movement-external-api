import { receiveMovementRequestSchema } from '../../../schemas/receipt.js'
import {
  invalidCarrierRegistrationNumbers,
  validCarrierRegistrationNumbers,
  validNiCarrierRegistrationNumbers
} from '../../data/carrier-registration-numbers.js'
import { createMovementRequest } from '../../utils/createMovementRequest.js'

const basePayload = createMovementRequest()
const validate = (objectProperty, testPayload, registrationNumber) => {
  return receiveMovementRequestSchema.validate({
    ...basePayload,
    [objectProperty]: {
      ...testPayload,
      registrationNumber
    }
  })
}

export function carrierBrokerDealerRegistrationNumberErrorTests(
  carrierOrBrokerDealer,
  testPayload
) {
  if (!['Carrier', 'BrokerOrDealer'].includes(carrierOrBrokerDealer)) {
    throw new Error(
      'Expecting popsOrHazardous to be one of: Carrier, BrokerOrDealer'
    )
  }

  const carrierOrBrokerDealerObjectProperty = `${String(carrierOrBrokerDealer).charAt(0).toLowerCase()}${String(carrierOrBrokerDealer).slice(1)}`

  describe(`${carrierOrBrokerDealer} Registration Number Validation`, () => {
    it.each(validCarrierRegistrationNumbers)(
      `accepts submission with valid ${carrierOrBrokerDealer} registration number: "%s"`,
      (value) => {
        const { error } = validate(
          carrierOrBrokerDealerObjectProperty,
          testPayload,
          value
        )
        expect(error).toBeUndefined()
      }
    )

    it.each(validCarrierRegistrationNumbers.map((v) => v.toLowerCase()))(
      `accepts submission with lowercase ${carrierOrBrokerDealer} registration number: "%s"`,
      (value) => {
        const { error } = validate(
          carrierOrBrokerDealerObjectProperty,
          testPayload,
          value
        )
        expect(error).toBeUndefined()
      }
    )

    it.each(
      validNiCarrierRegistrationNumbers.map((v) => v.replaceAll(' ', ''))
    )(
      `accepts submission with NI ${carrierOrBrokerDealer} registration number without spaces: "%s"`,
      (value) => {
        const { error } = validate(
          carrierOrBrokerDealerObjectProperty,
          testPayload,
          value
        )
        expect(error).toBeUndefined()
      }
    )

    it.each(invalidCarrierRegistrationNumbers)(
      `rejects submission with an invalid ${carrierOrBrokerDealer} registration number: "%s"`,
      (value) => {
        const { error } = validate(
          carrierOrBrokerDealerObjectProperty,
          testPayload,
          value
        )
        expect(error).toBeDefined()
        expect(error.message).toBe(
          `"${carrierOrBrokerDealerObjectProperty}.registrationNumber" must be in a valid England, SEPA, NRW or NI format`
        )
      }
    )
  })
}
