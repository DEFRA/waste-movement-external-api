import { HTTP_STATUS } from 'waste-movement-utils'

export class PaymentRequiredError extends Error {
  constructor(message = 'Payment Required') {
    super(message)
    this.name = 'PaymentRequiredError'
    this.statusCode = HTTP_STATUS.PAYMENT_REQUIRED
  }
}
