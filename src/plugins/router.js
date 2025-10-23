import { health } from '../routes/health.js'
import { createReceiptMovement } from '../routes/create-receipt-movement.js'
import { updateReceiptMovement } from '../routes/update-receipt-movement.js'
import { getEwcCodes } from '../routes/reference-data/get-ewc-codes.js'
import { getDisposalOrRecoveryCodes } from '../routes/reference-data/get-disposal-or-recovery-codes.js'
import { getHazardousPropertyCodes } from '../routes/reference-data/get-hazardous-property-codes.js'
import { getContainerTypes } from '../routes/reference-data/get-container-types.js'
import { getPopNames } from '../routes/reference-data/get-pop-names.js'

const router = {
  plugin: {
    name: 'router',
    register: async (server, _options) => {
      // Register all routes
      const routes = [
        health,
        createReceiptMovement,
        updateReceiptMovement,
        getEwcCodes,
        getDisposalOrRecoveryCodes,
        getHazardousPropertyCodes,
        getContainerTypes,
        getPopNames
      ]

      // Register routes directly
      server.route(routes)
    }
  }
}

export { router }
