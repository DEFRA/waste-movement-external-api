import { proxyWasteMovementBackend } from '../../handlers/proxyWasteMovementBackend.js'

const createReceipt = {
  method: 'POST',
  path: '/deliveries/{deliveryId}/receipt',
  options: {
    tags: ['deliveries'],
    description: 'Endpoint to be used to create a waste receipt event'
  },
  handler: proxyWasteMovementBackend
}

const createUndeliveredReceipt = {
  method: 'POST',
  path: '/receipts',
  options: {
    tags: ['deliveries'],
    description:
      'Endpoint to be used to create a waste receipt event with no deliveryId'
  },
  handler: proxyWasteMovementBackend
}

export { createReceipt, createUndeliveredReceipt }
