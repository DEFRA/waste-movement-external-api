import { createServer } from '../server.js'
import { MongoClient } from 'mongodb'

describe('Update Hazardous Waste', () => {
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

  it('should update hazardous waste details', async () => {
    const wasteTrackingId = await createMovement()

    const hazardousRequest = {
      isHazardousWaste: true,
      components: [
        {
          component: 'Test Component',
          concentration: 0.5,
          hazCode: 'H200'
        }
      ]
    }

    const response = await server.inject({
      method: 'PUT',
      url: `/movements/${wasteTrackingId}/receive/hazardous`,
      payload: hazardousRequest
    })

    console.log(response.payload)
    expect(response.statusCode).toEqual(200)

    const movement = await db
      .collection('waste-inputs')
      .findOne({ _id: wasteTrackingId })
    console.log(movement)
    expect(movement.wasteTrackingId).toEqual(wasteTrackingId)
    expect(movement.receipt.hazardousWaste).toEqual(hazardousRequest)
  })

  async function createMovement() {
    const movementCreation = {
      movement: {
        receivingSiteId: 'site123',
        receiverReference: 'ref123',
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
    }

    const response = await server.inject({
      method: 'POST',
      url: '/movements/receive',
      payload: movementCreation,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log(response.payload)
    expect(response.statusCode).toEqual(200)

    return response.result.globalMovementId
  }
})
