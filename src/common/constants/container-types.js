export const validContainerTypes = [
  'BAG', // Bag / Sack (e.g. rubble bag, refuse sack)
  'BAL', // Bale
  'BOX', // Box / Carton / Crate
  'CAN', // Can / Jerrycan
  'CAR', // Carrier (e.g. pallet cage)
  'CAS', // Cask
  'CON', // Container (unspecified)
  'DRU', // Drum (typically 205L)
  'FIB', // Fibre drum
  'IBC', // Intermediate Bulk Container (e.g. 1000L)
  'LOO', // Loose (no container)
  'PAL', // Pallet (e.g. shrink‑wrapped items)
  'ROR', // Roll‑on Roll‑off container (RoRo)
  'SKI', // Skip
  'TAN', // Tanker / Tank
  'WBI' // Wheelie Bin (any size)
]

/**
 * Validates if the provided container type is in the list of valid codes
 * Accepts codes with or without spaces
 *
 * @param {string} code - The container type to validate
 * @returns {boolean} - True if the code is valid, false otherwise
 */
export const isValidContainerType = (containerType) => {
  if (!containerType) {
    return false
  }

  // Check if the container type is in the list of valid types
  return validContainerTypes.includes(containerType)
}
