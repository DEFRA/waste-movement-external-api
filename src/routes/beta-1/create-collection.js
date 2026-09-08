import { proxyWasteMovementBackend } from '../../handlers/proxyWasteMovementBackend.js'

const createCollection = {
  method: 'POST',
  path: '/movements/{movementId}/collection',
  options: {
    tags: ['movements'],
    description: 'Endpoint to be used to create a waste collection event'
  },
  handler: proxyWasteMovementBackend
}

export { createCollection }
