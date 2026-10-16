import { handleGetContainerTypes } from '../../handlers/reference-data/get-container-types.js'

const getContainerTypes = {
  method: 'GET',
  path: '/reference-data/container-types',
  options: {
    tags: ['reference-data'],
    description: 'Endpoint to be used to get a list of container types.'
  },
  handler: handleGetContainerTypes
}

export { getContainerTypes }
