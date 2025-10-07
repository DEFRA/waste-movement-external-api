import { HTTP_STATUS } from '../../common/constants/http-status-codes.js'
import { handleGetDisposalOrRecoveryCodes } from '../../handlers/reference-data/get-disposal-or-recovery-codes.js'

const getDisposalOrRecoveryCodes = {
  method: 'GET',
  path: '/reference-data/disposal-or-recovery-codes',
  options: {
    tags: ['reference-data'],
    description:
      'Endpoint to be used to get a list of disposal or recovery codes.',
    plugins: {
      'hapi-swagger': {
        responses: {
          [HTTP_STATUS.OK]: {
            description:
              'The list of disposal or recovery codes has been returned.'
          }
        }
      }
    }
  },
  handler: handleGetDisposalOrRecoveryCodes
}

export { getDisposalOrRecoveryCodes }
