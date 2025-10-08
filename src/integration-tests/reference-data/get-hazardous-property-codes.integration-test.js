import { createServer } from '../server.js'
import { MongoClient } from 'mongodb'
import { mapGetHazardousPropertyCodesResponse } from '../../handlers/reference-data/get-hazardous-property-codes.js'

describe('GET Hazardous Property Codes', () => {
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

  it('should get hazardous property codes', async () => {
    const expectedResponse = mapGetHazardousPropertyCodesResponse()

    const response = await server.inject({
      method: 'GET',
      url: '/reference-data/hazardous-property-codes',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.statusCode).toBe(200)
    expect(response.result).toStrictEqual(expectedResponse)
  })
})
