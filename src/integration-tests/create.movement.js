import { createMovementRequest } from '../test/utils/createMovementRequest.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

export async function createMovement(server) {
  const response = await server.inject({
    method: 'POST',
    url: '/movements/receive',
    payload: createMovementRequest(),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  logger.debug(response.payload)
  expect(response.statusCode).toEqual(200)

  return response.result.globalMovementId
}
