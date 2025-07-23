import { createServer } from '../server.js'
import { MongoClient } from 'mongodb'
import { createMovement } from './create.movement.js'
import { createMovementRequest } from '../test/utils/createMovementRequest.js'

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
    db.close()
    mongoConnection.close()
  })

  it('should movement waste details', async () => {
    const wasteTrackingId = await createMovement(server)

    const movementUpdate = createMovementRequest({
      receivingSiteId: 'site123updated'
    })

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
