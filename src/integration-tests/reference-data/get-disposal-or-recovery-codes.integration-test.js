import { createServer } from '../server.js'
import { MongoClient } from 'mongodb'
import { mapGetDisposalOrRecoveryCodesResponse } from '../../handlers/reference-data/get-disposal-or-recovery-codes.js'

describe('GET Disposal or Recovery Codes', () => {
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

  it('should get disposal or recovery codes', async () => {
    const expectedResponse = mapGetDisposalOrRecoveryCodesResponse()

    const response = await server.inject({
      method: 'GET',
      url: '/reference-data/disposal-or-recovery-codes',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.statusCode).toBe(200)
    expect(response.result).toStrictEqual(expectedResponse)
  })
})
