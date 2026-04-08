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
      movement: {
        apiCode: '3ba4f421-e165-4c96-8280-4087939025ed',
        dateTimeReceived: '2021-01-01T00:00:00.000Z'
      }
    }

    it('should add submittingOrganisation inside movement and strip apiCode when org backend is available and Organisation Id is found', async () => {
      config.set('isWasteOrganisationBackendAvailable', true)

      const result = await addSubmittingOrganisationToRequest({
        ...requestData,
        movement: { ...requestData.movement }
      })

      expect(result).toEqual({
        movement: {
          dateTimeReceived: '2021-01-01T00:00:00.000Z',
          submittingOrganisation: {
            defraCustomerOrganisationId: 'd829f66d-857f-401d-b5e9-5061b7dbb29d'
          }
        }
      })
    })

    it('should not add submittingOrganisation when org backend is available but Organisation Id is not found', async () => {
      config.set('isWasteOrganisationBackendAvailable', true)

      const result = await addSubmittingOrganisationToRequest({
        ...requestData,
        movement: { ...requestData.movement }
      })

      expect(result).toEqual({
        movement: requestData.movement
      })
    })

    it('should not add submittingOrganisation when org backend is not available', async () => {
      config.set('isWasteOrganisationBackendAvailable', false)

      const result = await addSubmittingOrganisationToRequest({
        ...requestData,
        movement: { ...requestData.movement }
      })

      expect(result).toEqual({
        movement: requestData.movement
      })
    })
  })
})
