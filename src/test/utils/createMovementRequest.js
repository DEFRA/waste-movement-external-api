import { v4 as uuidv4 } from 'uuid'
import { sourceOfComponentsNotProvided } from '../../common/constants/source-of-components.js'

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
      authorisationNumbers: ['1234'],
      regulatoryPositionStatements: [343]
    },
    receipt: {
      address: {
        fullAddress: '123 Test St, Test City',
        postcode: 'TE1 1ST'
      }
    },
    wasteItems: [
      {
        ewcCodes: ['200101'],
        wasteDescription: 'Default test waste description',
        physicalForm: 'Solid',
        numberOfContainers: 1,
        typeOfContainers: 'SKI',
        weight: {
          metric: 'Tonnes',
          amount: 1.0,
          isEstimate: false
        },
        pops: {
          containsPops: false
        },
        hazardous: {
          containsHazardous: false,
          sourceOfComponents: sourceOfComponentsNotProvided.NOT_PROVIDED
        }
      }
    ]
  }

  return {
    ...defaultMovementRequest,
    ...overrides
  }
}
