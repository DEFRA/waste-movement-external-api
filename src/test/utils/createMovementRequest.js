export function createMovementRequest(overrides) {
  const defaultMovementRequest = {
    receivingSiteId: 'site123',
    carrier: {
      registrationNumber: '123456789',
      organisationName: 'Test Carrier',
      address: {
        postCode: 'TE1 1ST'
      },
      emailAddress: 'email@email.com',
      phoneNumber: '01234567890',
      vehicleRegistration: 'MK12 F89',
      meansOfTransport: 'Road'
    },
    receiver: {
      authorisations: [
        {
          authorisationType: 'type',
          authorisationNumber: '1234'
        }
      ]
    },
    receipt: {
      dateTimeReceived: '2021-01-01T00:00:00.000Z'
    }
  }

  return {
    ...defaultMovementRequest,
    ...overrides
  }
}
