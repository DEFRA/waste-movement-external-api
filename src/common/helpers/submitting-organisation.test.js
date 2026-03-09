import { config } from '../../config.js'
import { addSubmittingOrganisationToRequest } from './submitting-organisation.js'

jest.mock('./http-client.js', () => ({
  httpClients: {
    wasteOrganisation: {
      get: jest
        .fn()
        .mockResolvedValueOnce({
          payload: {
            defraCustomerOrganisationId: 'd829f66d-857f-401d-b5e9-5061b7dbb29d'
          }
        })
        .mockResolvedValueOnce({
          payload: {
            statusCode: 404
          }
        })
    }
  }
}))

describe('submitting-organisation', () => {
  describe('#addSubmittingOrganisationToRequest', () => {
    const requestData = {
      movement: { apiCode: '3ba4f421-e165-4c96-8280-4087939025ed' }
    }

    it('should add submittingOrganisation to the request when isWasteOrganisationBackendAvailable is true and Organisation Id is found', async () => {
      config.set('isWasteOrganisationBackendAvailable', true)

      const result = await addSubmittingOrganisationToRequest(requestData)

      expect(result).toEqual({
        ...requestData,
        submittingOrganisation: {
          defraCustomerOrganisationId: 'd829f66d-857f-401d-b5e9-5061b7dbb29d'
        }
      })
    })

    it('should not add submittingOrganisation to the request when isWasteOrganisationBackendAvailable is true and Organisation Id is not found', async () => {
      config.set('isWasteOrganisationBackendAvailable', true)

      const result = await addSubmittingOrganisationToRequest(requestData)

      expect(result).toEqual(requestData)
    })

    it('should not add submittingOrganisation to the request when isWasteOrganisationBackendAvailable is false (explicitly set)', async () => {
      config.set('isWasteOrganisationBackendAvailable', false)

      const result = await addSubmittingOrganisationToRequest(requestData)

      expect(result).toEqual(requestData)
    })

    it('should not add submittingOrganisation to the request when isWasteOrganisationBackendAvailable is false (default value)', async () => {
      config.set('isWasteOrganisationBackendAvailable', undefined)

      const result = await addSubmittingOrganisationToRequest(requestData)

      expect(result).toEqual(requestData)
    })
  })
})
