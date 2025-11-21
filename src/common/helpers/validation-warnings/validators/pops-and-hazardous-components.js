import { formatPopsOrHazardousFields } from '../../../../schemas/waste.js'
import {
  POPS_OR_HAZARDOUS_WARNINGS,
  VALIDATION_WARNING_TYPES
} from '../../../constants/validation-warning-messages.js'

export const hazardousComponentsWarningValidators = {
  key: 'wasteItems.hazardous.components',
  validators: [
    {
      field: null,
      validator: (wasteItem) =>
        validatePopOrHazardousComponents(
          wasteItem,
          'Hazardous',
          hasPopsOrHazardousComponents
        ),
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: POPS_OR_HAZARDOUS_WARNINGS.COMPONENTS_RECOMMENDED
    },
    {
      field: 'concentration',
      validator: (wasteItem) =>
        validatePopOrHazardousComponents(
          wasteItem,
          'Hazardous',
          isPopOrHazardousConcentrationValid
        ),
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: POPS_OR_HAZARDOUS_WARNINGS.CONCENTRATION_RECOMMENDED
    }
  ]
}

export const popsComponentsWarningValidators = {
  key: 'wasteItems.pops.components',
  validators: [
    {
      field: null,
      validator: (wasteItem) =>
        validatePopOrHazardousComponents(
          wasteItem,
          'POPs',
          hasPopsOrHazardousComponents
        ),
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: POPS_OR_HAZARDOUS_WARNINGS.COMPONENTS_RECOMMENDED
    },
    {
      field: 'concentration',
      validator: (wasteItem) =>
        validatePopOrHazardousComponents(
          wasteItem,
          'POPs',
          isPopOrHazardousConcentrationValid
        ),
      errorType: VALIDATION_WARNING_TYPES.NOT_PROVIDED,
      message: POPS_OR_HAZARDOUS_WARNINGS.CONCENTRATION_RECOMMENDED
    }
  ]
}

/**
 * Determines if POPs/Hazardous components is an empty array
 * @param {Object} wasteItem - The waste item
 * @param {String} popsOrHazardous - One of: POPs, Hazardous
 * @param {Function} validate - The validation function
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function validatePopOrHazardousComponents(
  wasteItem,
  popsOrHazardous,
  validate
) {
  if (!wasteItem) {
    return { isValid: true }
  }

  if (!['POPs', 'Hazardous'].includes(popsOrHazardous)) {
    throw new Error('Expecting popsOrHazardous to be one of: POPs, Hazardous')
  }

  const { popsOrHazardousObjectProperty, containsPopsOrHazardousField } =
    formatPopsOrHazardousFields(popsOrHazardous)

  if (!wasteItem[popsOrHazardousObjectProperty]) {
    return { isValid: true }
  }

  const { sourceOfComponents, components } =
    wasteItem[popsOrHazardousObjectProperty]

  if (
    wasteItem[containsPopsOrHazardousField] === false ||
    sourceOfComponents === 'NOT_PROVIDED'
  ) {
    return { isValid: true }
  }

  return validate(components)
}

/**
 * Determines if POPs/Hazardous components is an empty array
 * @param {Object} components - The POPs/Hazardous components
 * @returns {Boolean} True if POPs/Hazardous components array is empty, otherwise false
 */
function isPopOrHazardousComponentsEmpty(components) {
  return (
    (Array.isArray(components) && components.length === 0) ||
    !Array.isArray(components)
  )
}

/**
 * Determines if POPs/Hazardous components is an empty array
 * @param {Object} components - The POPs/Hazardous components
 * @returns {Object} { isValid: Boolean }
 */
function hasPopsOrHazardousComponents(components) {
  return { isValid: Array.isArray(components) && components.length > 0 }
}

/**
 * Determines if any of the POPs/Hazardous components has a missing concentration value
 * @param {Object} components - The POPs/Hazardous components
 * @returns {Object} { isValid: Boolean, invalidIndices: Optional numeric array }
 */
function isPopOrHazardousConcentrationValid(components) {
  let invalidIndices = []

  if (!isPopOrHazardousComponentsEmpty(components)) {
    invalidIndices = components.reduce((indices, item, index) => {
      if (item.concentration === undefined || item.concentration === null) {
        indices.push(index)
      }
      return indices
    }, [])
  }

  return { isValid: invalidIndices.length === 0, invalidIndices }
}
