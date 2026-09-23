import { proxyWasteMovementBackend } from '../../handlers/proxyWasteMovementBackend.js'

const reserveDelivery = {
  method: 'POST',
  path: '/deliveries/reserve',
  options: {
    tags: ['deliveries'],
    description:
      'Endpoint to be used to reserve a batch of Delivery IDs for offline use'
  },
  handler: proxyWasteMovementBackend
}

export { reserveDelivery }
