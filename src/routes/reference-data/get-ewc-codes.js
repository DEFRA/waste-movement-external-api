import { handleGetEwcCodes } from '../../handlers/reference-data/get-ewc-codes.js'

const getEwcCodes = {
  method: 'GET',
  path: '/reference-data/ewc-codes',
  options: {
    tags: ['reference-data'],
    description: 'Endpoint to be used to get a list of EWC codes.'
  },
  handler: handleGetEwcCodes
}

export { getEwcCodes }
