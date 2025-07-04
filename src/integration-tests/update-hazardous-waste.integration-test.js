import { createServer } from '../server.js'
import { MongoClient } from 'mongodb'
import { createMovement } from './create.movement.js'

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
    const wasteTrackingId = await createMovement(server)

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
})
