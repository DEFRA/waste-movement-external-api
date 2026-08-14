import Hapi from '@hapi/hapi'
import { requestMetrics } from './request-metrics.js'
import * as metrics from '../common/helpers/metrics.js'

jest.mock('../common/helpers/metrics.js', () => ({
  logAttemptedDeveloperMetrics: jest.fn()
}))

const loggerInfo = jest.fn()

const submittingOrganisationStub = {
  plugin: {
    name: 'addSubmittingOrganisationToRequest',
    register: async (server) => {
      server.ext('onPostAuth', (request, h) => {
        request.submittingOrganisation = {
          defraCustomerOrganisationId: 'test-org-id'
        }
        return h.continue
      })
    }
  }
}

const buildServer = async ({ withAuth, withSubmittingOrganisation }) => {
  const server = Hapi.server()

  server.decorate('request', 'logger', { info: loggerInfo })

  if (withAuth) {
    server.auth.scheme('mock', () => ({
      authenticate: (request, h) =>
        h.authenticated({ credentials: { clientId: 'test-client-id' } })
    }))
    server.auth.strategy('mock', 'mock')
    server.auth.default('mock')
  }

  server.route([
    {
      method: 'POST',
      path: '/movements/receive',
      handler: () => ({ ok: true })
    },
    {
      method: 'PUT',
      path: '/movements/{wasteTrackingId}/receive',
      handler: () => ({ ok: true })
    },
    {
      method: 'GET',
      path: '/health',
      options: { auth: false },
      handler: () => ({ ok: true })
    }
  ])

  // Mirror the registration order in server.js: requestMetrics first,
  // addSubmittingOrganisationToRequest afterwards.
  await server.register(requestMetrics)
  if (withSubmittingOrganisation) {
    await server.register(submittingOrganisationStub)
  }
  return server
}

describe('requestMetrics plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('emits developers.attempted for authenticated POST receipt movement', async () => {
    const server = await buildServer({ withAuth: true })

    await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: {}
    })

    expect(metrics.logAttemptedDeveloperMetrics).toHaveBeenCalledWith(
      'test-client-id'
    )
    expect(metrics.logAttemptedDeveloperMetrics).toHaveBeenCalledTimes(1)
  })

  it('emits developers.attempted for authenticated PUT receipt movement', async () => {
    const server = await buildServer({ withAuth: true })

    await server.inject({
      method: 'PUT',
      url: '/movements/abc-123/receive',
      payload: {}
    })

    expect(metrics.logAttemptedDeveloperMetrics).toHaveBeenCalledWith(
      'test-client-id'
    )
    expect(metrics.logAttemptedDeveloperMetrics).toHaveBeenCalledTimes(1)
  })

  it('does not emit for non-receipt-movement routes', async () => {
    const server = await buildServer({ withAuth: true })

    await server.inject({
      method: 'GET',
      url: '/health'
    })

    expect(metrics.logAttemptedDeveloperMetrics).not.toHaveBeenCalled()
  })

  it('does not emit when clientId is absent (unauthenticated)', async () => {
    const server = await buildServer({ withAuth: false })

    await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: {}
    })

    expect(metrics.logAttemptedDeveloperMetrics).not.toHaveBeenCalled()
  })

  it('logs client and organisation ids for receipt movement attempts', async () => {
    const server = await buildServer({
      withAuth: true,
      withSubmittingOrganisation: true
    })

    await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: {}
    })

    expect(loggerInfo).toHaveBeenCalledTimes(1)
    expect(loggerInfo).toHaveBeenCalledWith(
      {
        client: { id: 'test-client-id' },
        organization: { id: 'test-org-id' }
      },
      'Receipt movement attempted'
    )
  })

  it('logs without organisation id when none is resolved', async () => {
    const server = await buildServer({ withAuth: true })

    await server.inject({
      method: 'PUT',
      url: '/movements/abc-123/receive',
      payload: {}
    })

    expect(loggerInfo).toHaveBeenCalledTimes(1)
    expect(loggerInfo).toHaveBeenCalledWith(
      {
        client: { id: 'test-client-id' },
        organization: undefined
      },
      'Receipt movement attempted'
    )
  })

  it('does not log attempts for non-receipt-movement routes', async () => {
    const server = await buildServer({ withAuth: true })

    await server.inject({
      method: 'GET',
      url: '/health'
    })

    expect(loggerInfo).not.toHaveBeenCalled()
  })
})
