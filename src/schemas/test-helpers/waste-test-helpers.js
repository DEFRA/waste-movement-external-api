// Test Constants
import { validContainerTypes } from '../../common/constants/container-types.js'
import { createMovementRequest } from '../../test/utils/createMovementRequest.js'

export const TEST_CONSTANTS = {
  VALID_EWC_CODE: '010101',
  DEFAULT_WASTE_DESCRIPTION: 'Test waste',
  DEFAULT_PHYSICAL_FORM: 'Solid',
  DEFAULT_METRIC: 'Tonnes',
  DEFAULT_AMOUNT: 1,
  DEFAULT_IS_ESTIMATE: false
}

// Single flexible payload helper function
export const createTestPayload = (overrides = {}) => {
  const { wasteItemOverrides, ...rootOverrides } = overrides

  // Build waste item with defaults
  const defaultWasteItem = {
    ewcCodes: [TEST_CONSTANTS.VALID_EWC_CODE],
    wasteDescription: TEST_CONSTANTS.DEFAULT_WASTE_DESCRIPTION,
    physicalForm: TEST_CONSTANTS.DEFAULT_PHYSICAL_FORM,
    weight: {
      metric: TEST_CONSTANTS.DEFAULT_METRIC,
      amount: TEST_CONSTANTS.DEFAULT_AMOUNT,
      isEstimate: TEST_CONSTANTS.DEFAULT_IS_ESTIMATE
    },
    numberOfContainers: 1,
    typeOfContainers: validContainerTypes[0]
  }

  // Merge waste item overrides
  const wasteItem = wasteItemOverrides
    ? { ...defaultWasteItem, ...wasteItemOverrides }
    : defaultWasteItem

  // Build and return complete payload
  return {
    ...createMovementRequest(),
    wasteItems: [wasteItem],
    ...rootOverrides
  }
}
