import { receiveMovementRequestSchema } from './receipt.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import { carrierBrokerDealerRegistrationNumberErrorTests } from '../test/common/carrier-broker-dealer-regisration-number/carrier-broker-dealer-registration-number-error-tests.js'

describe('BrokerOrDealer Validation', () => {
  const basePayload = createMovementRequest()

  const validate = (brokerOrDealer) =>
    receiveMovementRequestSchema.validate({ ...basePayload, brokerOrDealer })

  carrierBrokerDealerRegistrationNumberErrorTests('BrokerOrDealer', {
    organisationName: 'Test Broker',
    registrationNumber: undefined
  })

  it('accepts submission with an undefined registration number', () => {
    const broker = {
      organisationName: 'Test Broker',
      registrationNumber: undefined
    }

    const { error } = validate(broker)
    expect(error).toBeUndefined()
  })

  it('rejects submission with a null registration number: "%s"', () => {
    const broker = {
      organisationName: 'Test Broker',
      registrationNumber: null
    }

    const { error } = validate(broker)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"brokerOrDealer.registrationNumber" must be one of [string]'
    )
  })

  it('rejects submission with an empty string registration number: "%s"', () => {
    const broker = {
      organisationName: 'Test Broker',
      registrationNumber: ''
    }

    const { error } = validate(broker)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"brokerOrDealer.registrationNumber" must be in a valid England, SEPA, NRW or NI format'
    )
  })

  it('accepts complete broker info with UK postcode, email and phone', () => {
    const broker = {
      organisationName: 'Test Broker',
      address: { fullAddress: '1 Broker St, Town', postcode: 'TE1 1ST' },
      emailAddress: 'broker@example.com',
      phoneNumber: '01234567890'
    }

    const { error } = validate(broker)
    expect(error).toBeUndefined()
  })

  it('accepts when no broker contact details are provided', () => {
    const { error } = receiveMovementRequestSchema.validate(basePayload)
    expect(error).toBeUndefined()
  })

  it('rejects when any properties provided but organisationName missing', () => {
    const broker = {
      address: { fullAddress: '1 Broker St, Town', postcode: 'TE1 1ST' },
      emailAddress: 'broker@example.com',
      phoneNumber: '01234567890'
    }

    const { error } = validate(broker)
    expect(error).toBeDefined()
    expect(error.message).toBe('"brokerOrDealer.organisationName" is required')
  })

  it('accepts valid broker contact address with UK postcode', () => {
    const broker = {
      organisationName: 'Test Broker',
      address: { fullAddress: '1 Broker St, Town', postcode: 'TE1 1ST' }
    }

    const { error } = validate(broker)
    expect(error).toBeUndefined()
  })

  it('rejects incomplete broker address without postcode', () => {
    const broker = {
      organisationName: 'Test Broker',
      address: { fullAddress: '1 Broker St, Town' }
    }

    const { error } = validate(broker)
    expect(error).toBeDefined()
    expect(error.message).toBe('"brokerOrDealer.address.postcode" is required')
  })

  it('accepts valid Ireland Eircode', () => {
    const broker = {
      organisationName: 'Irish Broker',
      address: { fullAddress: '1 Broker St, Dublin', postcode: 'A65 F4E2' }
    }

    const { error } = validate(broker)
    expect(error).toBeUndefined()
  })

  it('accept valid Ireland Eircode without space', () => {
    const broker = {
      organisationName: 'Irish Broker',
      address: { fullAddress: '1 Broker St, Dublin', postcode: 'A65F4E2' }
    }

    const { error } = validate(broker)
    expect(error).toBeUndefined()
  })

  it('rejects invalid broker postcode', () => {
    const broker = {
      organisationName: 'Invalid Postcode Broker',
      address: { fullAddress: '1 Broker St, Town', postcode: 'INVALID' }
    }

    const { error } = validate(broker)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"brokerOrDealer.address.postcode" must be in valid UK or Ireland format'
    )
  })

  it('rejects invalid broker email address', () => {
    const broker = {
      organisationName: 'Invalid Email Broker',
      emailAddress: 'not-an-email'
    }

    const { error } = validate(broker)
    expect(error).toBeDefined()
    expect(error.message).toBe(
      '"brokerOrDealer.emailAddress" must be a valid email'
    )
  })
})
