import { handleGetHazardousPropertyCodes } from '../../handlers/reference-data/get-hazardous-property-codes.js'

const getHazardousPropertyCodes = {
  method: 'GET',
  path: '/reference-data/hazardous-property-codes',
  options: {
    tags: ['reference-data'],
    description:
      'Endpoint to be used to get a list of hazardous property codes.'
  },
  handler: handleGetHazardousPropertyCodes
}

export { getHazardousPropertyCodes }
