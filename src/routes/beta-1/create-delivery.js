import { proxyWasteMovementBackend } from '../../handlers/proxyWasteMovementBackend.js'

const createDelivery = {
  method: 'POST',
  path: '/deliveries',
  options: {
    tags: ['deliveries'],
    description: 'Endpoint to be used to create a waste delivery'
  },
  handler: proxyWasteMovementBackend
}

export { createDelivery }
