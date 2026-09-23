import { proxyWasteMovementBackend } from '../../handlers/proxyWasteMovementBackend.js'

const deliveryValidity = {
  method: 'GET',
  path: '/deliveries/{deliveryId}/validity',
  options: {
    tags: ['deliveries'],
    description:
      'Endpoint to be used to check whether a Delivery ID is live before accepting waste against it'
  },
  handler: proxyWasteMovementBackend
}

export { deliveryValidity }
