import { isBetaRoute } from './beta-route.js'

describe('isBetaRoute', () => {
  it.each([
    '/beta-1/movements',
    '/beta-1/deliveries/25KMT4Z9/receipt',
    '/beta-2/movements'
  ])('returns true for %s', (path) => {
    expect(isBetaRoute({ path })).toBe(true)
  })

  it.each([
    '/movements/receive',
    '/movements/2578ZCY8/receive',
    '/health',
    '/reference-data/ewc-codes'
  ])('returns false for %s', (path) => {
    expect(isBetaRoute({ path })).toBe(false)
  })
})
