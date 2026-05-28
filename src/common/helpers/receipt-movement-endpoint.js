/**
 * Check if request is for receipt movement endpoints
 * @param {Object} request - The Hapi request object
 * @returns {boolean}
 */
export const isReceiptMovementEndpoint = (request) => {
  const path = request.route?.path
  return (
    path === '/movements/receive' ||
    path === '/movements/{wasteTrackingId}/receive'
  )
}
