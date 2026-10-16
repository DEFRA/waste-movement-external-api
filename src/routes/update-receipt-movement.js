import { handleUpdateReceiptMovement } from '../handlers/update-receipt-movement.js'
import Joi from 'joi'
import { receiveMovementInputSchema } from '../schemas/receive-movement-input.js'

const updateReceiptMovement = {
  method: 'PUT',
  path: '/movements/{wasteTrackingId}/receive',
  options: {
    tags: ['movements'],
    description:
      'Endpoint to be used when waste is received and the carrier has a waste tracking id.',
    validate: {
      params: Joi.object({
        wasteTrackingId: Joi.string()
          .required()
          .description('The globally unique id of the movement.')
      }),
      payload: receiveMovementInputSchema
    }
  },
  handler: handleUpdateReceiptMovement
}

export { updateReceiptMovement }
