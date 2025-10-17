import { MongoClient } from 'mongodb'
import { createServer } from '../server.js'
import { mapGetContainerTypesResponse } from '../../handlers/reference-data/get-container-types.js'

describe('GET Container Types', () => {
  let server
  let mongoConnection

  beforeAll(async () => {
    server = await createServer()
    mongoConnection = await MongoClient.connect('mongodb://localhost:27017', {})
  })

  afterAll(async () => {
    server.stop()
    mongoConnection.close()
  })

  it('should get container types', async () => {
    const expectedResponse = mapGetContainerTypesResponse()

    const response = await server.inject({
      method: 'GET',
      url: '/reference-data/container-types',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.statusCode).toBe(200)
    expect(response.result).toStrictEqual(expectedResponse)
  })
})
