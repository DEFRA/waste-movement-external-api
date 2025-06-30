import { createServer } from '../server.js'
import { MongoClient } from 'mongodb'
import { createMovement } from './create.movement.js'

describe('Update Movement', () => {
  let server
  let mongoConnection
  let db

  beforeAll(async () => {
    server = await createServer()
    mongoConnection = await MongoClient.connect('mongodb://localhost:27017', {})
    db = await mongoConnection.db('waste-movement-backend')
  })

  afterAll(async () => {
    server.stop()
    mongoConnection.close()
  })

  it('should movement waste details', async () => {
    const wasteTrackingId = await createMovement(server)

    const movementUpdate = {
      receivingSiteId: 'site123updated',
      receiverReference: 'ref123updated',
      carrier: {
        registrationNumber: '123456789',
        organisationName: 'Test Carrier',
        address: '123 Test St, Test City, TE1 1ST',
        emailAddress: 'email@email.com',
        phoneNumber: '01234567890',
        vehicleRegistration: 'MK12 F89',
        meansOfTransport: 'Road'
      },
      acceptance: {
        acceptingAll: true
      },
      receiver: {
        authorisationType: 'type',
        authorisationNumber: '1234'
      },
      receipt: {
        estimateOrActual: 'Estimate',
        dateTimeReceived: '2021-01-01T00:00:00.000Z'
      }
    }

    const response = await server.inject({
      method: 'PUT',
      url: `/movements/${wasteTrackingId}/receive`,
      payload: movementUpdate
    })

    console.log(response.payload)
    expect(response.statusCode).toEqual(200)

    const movement = await db
      .collection('waste-inputs')
      .findOne({ _id: wasteTrackingId })
    console.log(movement)
    expect(movement.wasteTrackingId).toEqual(wasteTrackingId)
    expect(movement.receipt.movement).toEqual(movementUpdate)
  })
})
