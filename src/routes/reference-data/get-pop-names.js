import { handleGetPopNames } from '../../handlers/reference-data/get-pop-names.js'

const getPopNames = {
  method: 'GET',
  path: '/reference-data/pop-names',
  options: {
    tags: ['reference-data'],
    description:
      'Endpoint to be used to get a list of POP (Persistent Organic Pollutant) names.'
  },
  handler: handleGetPopNames
}

export { getPopNames }
