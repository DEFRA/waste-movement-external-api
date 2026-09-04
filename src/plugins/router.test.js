import { router } from '../plugins/router.js'
import { health } from '../routes/health.js'
import { createMovement as createMovementBeta1 } from '../routes/beta-1/create-movement.js'
import { createCollection as createCollectionBeta1 } from '../routes/beta-1/create-collection.js'
import { createDelivery as createDeliveryBeta1 } from '../routes/beta-1/create-delivery.js'
import {
  createReceipt as createReceiptBeta1,
  createUndeliveredReceipt as createUndeliveredReceiptBeta1
} from '../routes/beta-1/create-receipt.js'
import { createReceiptMovement } from '../routes/create-receipt-movement.js'
import { updateReceiptMovement } from '../routes/update-receipt-movement.js'
import { getEwcCodes } from '../routes/reference-data/get-ewc-codes.js'
import { getDisposalOrRecoveryCodes } from '../routes/reference-data/get-disposal-or-recovery-codes.js'
import { getHazardousPropertyCodes } from '../routes/reference-data/get-hazardous-property-codes.js'
import { getContainerTypes } from '../routes/reference-data/get-container-types.js'
import { getPopNames } from '../routes/reference-data/get-pop-names.js'
import { config } from '../config.js'

jest.mock('../routes/health.js', () => ({
  health: { method: 'GET', path: '/health' }
}))
jest.mock('../routes/beta-1/create-movement.js', () => ({
  createMovement: { method: 'POST', path: '/movements' }
}))
jest.mock('../routes/beta-1/create-collection.js', () => ({
  createCollection: {
    method: 'POST',
    path: '/movements/{movementId}/collection'
  }
}))
jest.mock('../routes/beta-1/create-delivery.js', () => ({
  createCollection: {
    method: 'POST',
    path: '/deliveries'
  }
}))
jest.mock('../routes/beta-1/create-receipt.js', () => ({
  createUndeliveredReceiptBeta1: {
    method: 'POST',
    path: '/receipts'
  },
  createReceipt: {
    method: 'POST',
    path: '/deliveries/{deliveryId}/receipt'
  }
}))
jest.mock('../routes/create-receipt-movement.js', () => ({
  createReceiptMovement: { method: 'POST', path: '/receipt-movements' }
}))
jest.mock('../routes/update-receipt-movement.js', () => ({
  updateReceiptMovement: { method: 'PUT', path: '/receipt-movements/{id}' }
}))
jest.mock('../routes/reference-data/get-ewc-codes.js', () => ({
  getEwcCodes: { method: 'GET', path: '/ewc-codes' }
}))
jest.mock('../routes/reference-data/get-disposal-or-recovery-codes.js', () => ({
  getDisposalOrRecoveryCodes: {
    method: 'GET',
    path: '/disposal-or-recovery-codes'
  }
}))
jest.mock('../routes/reference-data/get-hazardous-property-codes.js', () => ({
  getHazardousPropertyCodes: {
    method: 'GET',
    path: '/hazardous-property-codes'
  }
}))
jest.mock('../routes/reference-data/get-container-types.js', () => ({
  getContainerTypes: { method: 'GET', path: '/container-types' }
}))
jest.mock('../routes/reference-data/get-pop-names.js', () => ({
  getPopNames: { method: 'GET', path: '/pop-names' }
}))

jest.mock('../config.js', () => ({
  config: {
    get: jest.fn()
  }
}))

function createMockServer() {
  const registeredPlugins = []
  const subServers = []

  const server = {
    route: jest.fn(),
    register: jest.fn(async (registration, options) => {
      registeredPlugins.push({ registration, options })

      const subServer = { route: jest.fn() }
      subServers.push(subServer)

      const { plugin } = registration
      await plugin.register(subServer, options)
    })
  }

  return { server, registeredPlugins, subServers }
}

describe('router plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('exposes the correct plugin name', () => {
    expect(router.plugin.name).toBe('router')
  })

  it('registers all base (unversioned) routes on the server', async () => {
    config.get.mockReturnValue('beta-1')
    const { server } = createMockServer()

    await router.plugin.register(server, {})

    expect(server.route).toHaveBeenCalledTimes(1)
    expect(server.route).toHaveBeenCalledWith([
      health,
      createReceiptMovement,
      updateReceiptMovement,
      getEwcCodes,
      getDisposalOrRecoveryCodes,
      getHazardousPropertyCodes,
      getContainerTypes,
      getPopNames
    ])
  })

  it('reads the apiVersionsEnabled feature flag from config', async () => {
    config.get.mockReturnValue('beta-1')
    const { server } = createMockServer()

    await router.plugin.register(server, {})

    expect(config.get).toHaveBeenCalledWith('featureFlags.apiVersionsEnabled')
  })

  describe('when the versioned API flag is enabled', () => {
    it('registers a versioned sub-plugin with the correct name and prefix', async () => {
      config.get.mockReturnValue('beta-1')
      const { server, registeredPlugins } = createMockServer()

      await router.plugin.register(server, {})

      expect(server.register).toHaveBeenCalledTimes(1)

      const [{ registration, options }] = registeredPlugins
      expect(registration.plugin.name).toBe('router-beta-1')
      expect(options).toEqual({ routes: { prefix: '/beta-1' } })
    })

    it('registers the beta-1 route(s) on the sub-server when the versioned plugin registers', async () => {
      config.get.mockReturnValue('beta-1')
      const { server, subServers } = createMockServer()

      await router.plugin.register(server, {})

      expect(subServers).toHaveLength(1)
      expect(subServers[0].route).toHaveBeenCalledTimes(1)
      expect(subServers[0].route).toHaveBeenCalledWith([
        createMovementBeta1,
        createCollectionBeta1,
        createDeliveryBeta1,
        createReceiptBeta1,
        createUndeliveredReceiptBeta1
      ])
    })
  })

  describe('when the versioned API flag is disabled', () => {
    it('does not call server.register for the versioned plugin', async () => {
      config.get.mockReturnValue('beta-11')
      const { server } = createMockServer()

      await router.plugin.register(server, {})

      expect(server.register).not.toHaveBeenCalled()
    })

    it('does not register the versioned routes anywhere', async () => {
      config.get.mockReturnValue('')
      const { subServers } = createMockServer()
      const { server } = createMockServer()

      await router.plugin.register(server, {})

      expect(subServers).toHaveLength(0)
    })
  })

  it('resolves successfully when the versioned flag is enabled', async () => {
    config.get.mockReturnValue('beta-1')
    const { server } = createMockServer()

    await expect(router.plugin.register(server, {})).resolves.toBeUndefined()
  })

  it('resolves successfully when the versioned flag is disabled', async () => {
    config.get.mockReturnValue('')
    const { server } = createMockServer()

    await expect(router.plugin.register(server, {})).resolves.toBeUndefined()
  })
})
