import { HTTP_STATUS } from '../../common/constants/http-status-codes.js'
import { handleGetPopNames } from '../../handlers/reference-data/get-pop-names.js'

const getPopNames = {
  method: 'GET',
  path: '/reference-data/pop-names',
  options: {
    tags: ['reference-data'],
    description:
      'Endpoint to be used to get a list of POP (Persistent Organic Pollutant) names.',
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.OK]: {
            description: 'The list of POP names has been returned.'
          }
        }
      }
    }
  },
  handler: handleGetPopNames
}

export { getPopNames }
