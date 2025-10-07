import { createServer } from '../server.js'
import { MongoClient } from 'mongodb'
import { mapGetEwcCodesResponse } from '../../handlers/reference-data/get-ewc-codes.js'

describe('GET EWC Codes', () => {
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

  it('should get EWC codes', async () => {
    const expectedResponse = mapGetEwcCodesResponse()

    const response = await server.inject({
      method: 'GET',
      url: '/reference-data/ewc-codes',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.statusCode).toBe(200)
    expect(response.result).toStrictEqual(expectedResponse)
  })
})
