import { v4 as uuidv4 } from 'uuid'
import {
  sourceOfComponentsNotProvided,
  sourceOfComponentsProvided,
  validPopNames,
  TEST_DATA
} from 'waste-movement-utils'

export function createMovementRequest(overrides) {
  const defaultMovementRequest = {
    apiCode: uuidv4(),
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
      siteName: 'Test Receiver',
      authorisationNumber:
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_XX9999XX,
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
        containsPops: true,
        pops: {
          sourceOfComponents: sourceOfComponentsProvided.PROVIDED_WITH_WASTE,
          components: [
            {
              code: validPopNames[0].code,
              concentration: 10
            }
          ]
        },
        containsHazardous: false,
        hazardous: {
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
