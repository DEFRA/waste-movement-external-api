import { proxyWasteMovementBackend } from '../../handlers/proxyWasteMovementBackend.js'

const createMovement = {
  method: 'POST',
  path: '/movements',
  options: {
    tags: ['movements'],
    description: 'Endpoint to be used to create a waste movement'
  },
  handler: proxyWasteMovementBackend
}

export { createMovement }
