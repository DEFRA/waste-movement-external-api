import { HTTP_STATUS } from '../../common/constants/http-status-codes.js'
import { handleGetHazardousPropertyCodes } from '../../handlers/reference-data/get-hazardous-property-codes.js'

const getHazardousPropertyCodes = {
  method: 'GET',
  path: '/reference-data/hazardous-property-codes',
  options: {
    tags: ['reference-data'],
    description:
      'Endpoint to be used to get a list of hazardous property codes.',
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.OK]: {
            description:
              'The list of hazardous property codes has been returned.'
          }
        }
      }
    }
  },
  handler: handleGetHazardousPropertyCodes
}

export { getHazardousPropertyCodes }
