export const validContainerTypes = [
  {
    code: 'BAG',
    description: 'Bag / Sack (e.g. rubble bag, refuse sack)'
  },
  {
    code: 'BAL',
    description: 'Bale'
  },
  {
    code: 'BOX',
    description: 'Box / Carton / Crate'
  },
  {
    code: 'CAN',
    description: 'Can / Jerrycan'
  },
  {
    code: 'CAR',
    description: 'Carrier (e.g. pallet cage)'
  },
  {
    code: 'CAS',
    description: 'Cask'
  },
  {
    code: 'CON',
    description: 'Container (unspecified)'
  },
  {
    code: 'DRU',
    description: 'Drum (typically 205L)'
  },
  {
    code: 'FIB',
    description: 'Fibre drum'
  },
  {
    code: 'IBC',
    description: 'Intermediate Bulk Container (e.g. 1000L)'
  },
  {
    code: 'LOO',
    description: 'Loose (no container)'
  },
  {
    code: 'PAL',
    description: 'Pallet (e.g. shrink‑wrapped items)'
  },
  {
    code: 'ROR',
    description: 'Roll‑on Roll‑off container (RoRo)'
  },
  {
    code: 'SKI',
    description: 'Skip'
  },
  {
    code: 'TAN',
    description: 'Tanker / Tank'
  },
  {
    code: 'WBI',
    description: 'Wheelie Bin (any size)'
  }
]

/**
 * Validates if the provided container type is in the list of valid codes
 * Accepts codes with or without spaces
 *
 * @param {string} code - The container type to validate
 * @returns {boolean} - True if the code is valid, false otherwise
 */
export const isValidContainerType = (containerType) => {
  // Check if the container type is in the list of valid types
  return validContainerTypes.map(({ code }) => code).includes(containerType)
}
