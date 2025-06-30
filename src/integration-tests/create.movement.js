export async function createMovement(server) {
  const movementCreation = {
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
