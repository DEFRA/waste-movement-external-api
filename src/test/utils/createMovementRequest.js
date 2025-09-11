import { v4 as uuidv4 } from 'uuid'

export function createMovementRequest(overrides) {
  const defaultMovementRequest = {
    organisationApiId: uuidv4(),
    dateTimeReceived: '2021-01-01T00:00:00.000Z',
    carrier: {
      registrationNumber: 'CBDU123456',
      organisationName: 'Test Carrier',
      address: {
        postcode: 'TE1 1ST'
      },
      emailAddress: 'email@email.com',
      phoneNumber: '01234567890',
      vehicleRegistration: 'MK12 F89',
      meansOfTransport: 'Road'
    },
    receiver: {
      organisationName: 'Test Receiver',
      authorisations: [
        {
          authorisationType: 'type',
          authorisationNumber: ['1234']
        }
      ]
    },
    receipt: {
      address: {
        fullAddress: '123 Test St, Test City',
        postcode: 'TE1 1ST'
      }
    }
  }

  return {
    ...defaultMovementRequest,
    ...overrides
  }
}
