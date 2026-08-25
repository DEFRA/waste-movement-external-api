import { expect, describe, it, jest } from '@jest/globals'
import {
  requestCustomLogger,
  getOrganisationId
} from './request-custom-logger.js'

const registerAndCaptureOnPostAuth = () => {
  const server = { ext: jest.fn() }
  requestCustomLogger.plugin.register(server, {})

  expect(server.ext).toHaveBeenCalledTimes(1)
  const [lifecyclePoint, handler] = server.ext.mock.calls[0]
  expect(lifecyclePoint).toBe('onPostAuth')

  return handler
}

const buildRequest = ({ organisationId, clientId, lifecycleImpl } = {}) => ({
  payload: organisationId
    ? {
        movement: {
          submittingOrganisation: {
            defraCustomerOrganisationId: organisationId
          }
        }
      }
    : undefined,
  auth: { credentials: clientId ? { clientId } : {} },
  _lifecycle: jest.fn(lifecycleImpl)
})

const h = { continue: Symbol('continue') }

describe('Request Custom Logger Plugin', () => {
  describe('plugin metadata', () => {
    it('should expose the expected name, version and once flag', () => {
      expect(requestCustomLogger.plugin.name).toBe('request-custom-logger')
      expect(requestCustomLogger.plugin.version).toBe('0.1.0')
      expect(requestCustomLogger.plugin.once).toBe(true)
    })
  })

  describe('register', () => {
    it('should register a single onPostAuth extension', () => {
      registerAndCaptureOnPostAuth()
    })

    it('should return h.continue', () => {
      const onPostAuth = registerAndCaptureOnPostAuth()
      const request = buildRequest({
        organisationId: 'org-123',
        clientId: 'client-1'
      })

      const result = onPostAuth(request, h)

      expect(result).toBe(h.continue)
    })

    it('should wrap request._lifecycle', () => {
      const onPostAuth = registerAndCaptureOnPostAuth()
      const request = buildRequest({
        organisationId: 'org-123',
        clientId: 'client-1'
      })
      const originalLifecycle = request._lifecycle

      onPostAuth(request, h)

      expect(request._lifecycle).not.toBe(originalLifecycle)
    })
  })

  describe('organisationId availability during the wrapped lifecycle', () => {
    it('should make organisationId available via getOrganisationId when present in the payload', async () => {
      const onPostAuth = registerAndCaptureOnPostAuth()
      let captured
      const request = buildRequest({
        organisationId: 'org-123',
        clientId: 'client-1',
        lifecycleImpl: () => {
          captured = getOrganisationId()
        }
      })

      onPostAuth(request, h)
      await request._lifecycle()

      expect(captured).toBe('org-123')
    })

    it('should resolve to undefined when the payload has no submittingOrganisation', async () => {
      const onPostAuth = registerAndCaptureOnPostAuth()
      let captured
      const request = buildRequest({
        clientId: 'client-1',
        lifecycleImpl: () => {
          captured = getOrganisationId()
        }
      })

      onPostAuth(request, h)
      await request._lifecycle()

      expect(captured).toBeUndefined()
    })

    it('should still wire up the store (and not throw) when clientId is absent', async () => {
      const onPostAuth = registerAndCaptureOnPostAuth()
      let captured
      const request = buildRequest({
        organisationId: 'org-456',
        lifecycleImpl: () => {
          captured = getOrganisationId()
        }
      })

      expect(() => onPostAuth(request, h)).not.toThrow()
      await request._lifecycle()

      expect(captured).toBe('org-456')
    })

    it('should call the original _lifecycle, bound to the request', async () => {
      const onPostAuth = registerAndCaptureOnPostAuth()
      const request = buildRequest({
        organisationId: 'org-123',
        clientId: 'client-1'
      })
      const originalLifecycle = request._lifecycle

      onPostAuth(request, h)
      await request._lifecycle()

      expect(originalLifecycle).toHaveBeenCalledTimes(1)
    })
  })

  describe('getOrganisationId', () => {
    it('should return undefined when called outside of any request lifecycle', () => {
      expect(getOrganisationId()).toBeUndefined()
    })
  })
})
