import { createMovement as createMovementBeta1 } from '../../routes/beta-1/create-movement.js'
import { createCollection as createCollectionBeta1 } from '../../routes/beta-1/create-collection.js'
import { createDelivery as createDeliveryBeta1 } from '../../routes/beta-1/create-delivery.js'
import {
  createReceipt as createReceiptBeta1,
  createUndeliveredReceipt as createUndeliveredReceiptBeta1
} from '../../routes/beta-1/create-receipt.js'
import { createMovement as createMovementBeta2 } from '../../routes/beta-2/create-movement.js'
import { createCollection as createCollectionBeta2 } from '../../routes/beta-2/create-collection.js'
import { createDelivery as createDeliveryBeta2 } from '../../routes/beta-2/create-delivery.js'
import {
  createReceipt as createReceiptBeta2,
  createUndeliveredReceipt as createUndeliveredReceiptBeta2
} from '../../routes/beta-2/create-receipt.js'

/**
 * The versions of the API, each served under the `/${id}` path prefix. Every
 * response from a `deprecated` version carries a `Deprecation: true` header
 * (see plugins/deprecation-header.js).
 */
export const apiVersions = [
  {
    id: 'beta-1',
    // Not deprecated yet: set to true once beta-2 is released, to start
    // sending `Deprecation: true` on every beta-1 response
    deprecated: false,
    routes: [
      createMovementBeta1,
      createCollectionBeta1,
      createDeliveryBeta1,
      createReceiptBeta1,
      createUndeliveredReceiptBeta1
    ]
  },
  {
    id: 'beta-2',
    routes: [
      createMovementBeta2,
      createCollectionBeta2,
      createDeliveryBeta2,
      createReceiptBeta2,
      createUndeliveredReceiptBeta2
    ]
  }
]

/**
 * The API version the request path is under, e.g. beta-1 for
 * /beta-1/movements, or undefined for an unversioned path. Uses the path
 * rather than the route, so it also matches paths no route was found for.
 * @param {string} path - The request path
 * @returns {Object|undefined}
 */
export const getApiVersionForPath = (path) =>
  apiVersions.find(({ id }) => path === `/${id}` || path.startsWith(`/${id}/`))
