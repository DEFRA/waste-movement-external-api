import { HTTP_STATUS } from 'waste-movement-utils'
import { handleGetEwcCodes } from '../../handlers/reference-data/get-ewc-codes.js'

const getEwcCodes = {
  method: 'GET',
  path: '/reference-data/ewc-codes',
  options: {
    tags: ['reference-data'],
    description: 'Endpoint to be used to get a list of EWC codes.',
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.OK]: {
            description: 'The list of EWC codes has been returned.'
          }
        }
      }
    }
  },
  handler: handleGetEwcCodes
}

export { getEwcCodes }
