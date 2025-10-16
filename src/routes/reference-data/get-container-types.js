import { HTTP_STATUS } from '../../common/constants/http-status-codes.js'
import { handleGetContainerTypes } from '../../handlers/reference-data/get-container-types.js'

const getContainerTypes = {
  method: 'GET',
  path: '/reference-data/container-types',
  options: {
    tags: ['reference-data'],
    description: 'Endpoint to be used to get a list of container types.',
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.OK]: {
            description: 'The list of container types has been returned.'
          }
        }
      }
    }
  },
  handler: handleGetContainerTypes
}

export { getContainerTypes }
