import Hapi from '@hapi/hapi'
import { requestMetrics } from './request-metrics.js'
import * as metrics from '../common/helpers/metrics.js'

jest.mock('../common/helpers/metrics.js', () => ({
  logAttemptedDeveloperMetrics: jest.fn()
}))

const buildServer = async ({ withAuth }) => {
  const server = Hapi.server()

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

  await server.register(requestMetrics)
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
})
