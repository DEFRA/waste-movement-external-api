import { createMovementRequest } from '../test/utils/createMovementRequest.js'

export async function createMovement(server) {
  const response = await server.inject({
    method: 'POST',
    url: '/movements/receive',
    payload: createMovementRequest(),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  console.log(response.payload)
  expect(response.statusCode).toEqual(200)

  return response.result.globalMovementId
}
