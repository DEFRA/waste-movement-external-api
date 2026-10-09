import { API_CODE_HEADER, getApiCode } from './api-code.js'

describe('getApiCode', () => {
  const headerApiCode = '25b14080-5e77-4f91-9957-2482a0cb8775'
  const bodyApiCode = 'c0e0d9a4-3f4c-4d7e-9a43-2c1f0b6f1d11'

  it('reads the x-api-code header on beta-2 routes', () => {
    expect(
      getApiCode({
        path: '/beta-2/movements',
        headers: { [API_CODE_HEADER]: headerApiCode },
        payload: { apiCode: bodyApiCode }
      })
    ).toEqual(headerApiCode)
  })

  it('does not read apiCode from the body on beta-2 routes', () => {
    expect(
      getApiCode({
        path: '/beta-2/movements',
        headers: {},
        payload: { apiCode: bodyApiCode }
      })
    ).toBeUndefined()
  })

  it.each(['/beta-1/movements', '/movements/receive'])(
    'ignores the x-api-code header on %s',
    (path) => {
      expect(
        getApiCode({
          path,
          headers: { [API_CODE_HEADER]: headerApiCode },
          payload: { apiCode: bodyApiCode }
        })
      ).toEqual(bodyApiCode)
    }
  )

  it('returns undefined when there is no apiCode', () => {
    expect(
      getApiCode({ path: '/beta-2/movements', headers: {}, payload: {} })
    ).toBeUndefined()
    expect(getApiCode({ path: '/beta-2/deliveries' })).toBeUndefined()
  })
})
