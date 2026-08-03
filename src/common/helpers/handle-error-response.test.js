import Boom from '@hapi/boom'
import { handleErrorResponse } from './handle-error-response.js'

describe('#handleErrorResponse', () => {
  it('should throw a Not Found Error', () => {
    const error = { name: 'NotFoundError' }

    expect(() => handleErrorResponse(error)).toThrowError(
      Boom.notFound('Movement not found')
    )
  })

  it('should throw an Internal Server Error', () => {
    const error = { message: 'API Error' }

    expect(() => handleErrorResponse(error)).toThrowError(
      Boom.internal('API Error')
    )
  })
})
