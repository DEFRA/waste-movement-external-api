import { HTTP_STATUS } from 'waste-movement-utils'
import { PaymentRequiredError } from './payment-required-error.js'

function basePaymentRequiredErrorChecks(error) {
  expect(error).toBeInstanceOf(PaymentRequiredError)
  expect(error.name).toEqual('PaymentRequiredError')
  expect(error.statusCode).toEqual(HTTP_STATUS.PAYMENT_REQUIRED)
}

describe('PaymentRequiredError', () => {
  it('should create a Payment Required Error with the default message', () => {
    const error = new PaymentRequiredError()

    basePaymentRequiredErrorChecks(error)
    expect(error.message).toEqual('Payment Required')
  })

  it('should create a Payment Required Error with a custom message', () => {
    const error = new PaymentRequiredError('Payment is required')

    basePaymentRequiredErrorChecks(error)
    expect(error.message).toEqual('Payment is required')
  })
})
