import {
  sourceOfComponentsNotProvided,
  sourceOfComponentsProvided
} from '../../common/constants/source-of-components.js'
import { TEST_DATA } from '../../schemas/test-constants.js'
import { validPopNames } from '../../common/constants/pop-names.js'
import { apiCodes } from '../../test/data/api-codes.js'

export function createMovementRequest(overrides) {
  const defaultMovementRequest = {
    apiCode: apiCodes[0],
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
      authorisationNumbers: [
        TEST_DATA.AUTHORISATION_NUMBERS.VALID.ENGLAND_XX9999XX
      ],
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
          sourceOfComponents: sourceOfComponentsProvided.CARRIER_PROVIDED,
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
