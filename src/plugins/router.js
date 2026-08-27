import { health } from '../routes/health.js'
import { createMovement as createMovementBeta1 } from '../routes/beta-1/create-movement.js'
import { createReceiptMovement } from '../routes/create-receipt-movement.js'
import { updateReceiptMovement } from '../routes/update-receipt-movement.js'
import { getEwcCodes } from '../routes/reference-data/get-ewc-codes.js'
import { getDisposalOrRecoveryCodes } from '../routes/reference-data/get-disposal-or-recovery-codes.js'
import { getHazardousPropertyCodes } from '../routes/reference-data/get-hazardous-property-codes.js'
import { getContainerTypes } from '../routes/reference-data/get-container-types.js'
import { getPopNames } from '../routes/reference-data/get-pop-names.js'
import { config } from '../config.js'

const router = {
  plugin: {
    name: 'router',
    register: async (server, _options) => {
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

      server.route(routes)

      const apiVersionsToSupport = [
        {
          id: 'beta-1',
          routes: [createMovementBeta1]
        }
      ]

      const versionedRouteGroups = apiVersionsToSupport.map((version) => {
        return {
          prefix: `/${version.id}`,
          routes: version.routes,
          enabled: config
            .get('featureFlags.apiVersionsEnabled')
            .includes(version.id)
        }
      })

      await Promise.all(
        versionedRouteGroups.map(
          ({ prefix, routes: groupRoutes, enabled }) =>
            enabled &&
            server.register(
              {
                plugin: {
                  name: `router-${prefix.replace('/', '')}`,
                  register: (srv) => {
                    srv.route(groupRoutes)
                  }
                }
              },
              {
                routes: { prefix }
              }
            )
        )
      )
    }
  }
}

export { router }
