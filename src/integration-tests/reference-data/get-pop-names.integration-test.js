import { MongoClient } from 'mongodb'
import { createServer } from '../server.js'
import { mapGetPopNamesResponse } from '../../handlers/reference-data/get-pop-names.js'

describe('GET POP Names', () => {
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

  it('should get POP names', async () => {
    const expectedResponse = mapGetPopNamesResponse()

    const response = await server.inject({
      method: 'GET',
      url: '/reference-data/pop-names',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.statusCode).toBe(200)
    expect(response.result).toStrictEqual(expectedResponse)
  })
})
