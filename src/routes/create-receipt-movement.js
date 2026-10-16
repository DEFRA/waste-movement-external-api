import { handleCreateReceiptMovement } from '../handlers/create-receipt-movement.js'
import { receiveMovementInputSchema } from '../schemas/receive-movement-input.js'

const createReceiptMovement = {
  method: 'POST',
  path: '/movements/receive',
  options: {
    tags: ['movements'],
    description:
      'Endpoint to be used when waste is received but the carrier has not already recorded the waste movement so has no id.',
    validate: {
      payload: receiveMovementInputSchema
    }
  },
  handler: handleCreateReceiptMovement
}

export { createReceiptMovement }
