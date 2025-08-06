// Recovery codes enum
const RECOVERY_CODES = [
  'R1', // Use principally as a fuel or other means to generate energy
  'R2', // Solvent reclamation/regeneration
  'R3', // Recycling/reclamation of organic substances which are not used as solvents
  'R4', // Recycling/reclamation of metals and metal compounds
  'R5', // Recycling/reclamation of other inorganic materials
  'R6', // Regeneration of acids or bases
  'R7', // Recovery of components used for pollution abatement
  'R8', // Recovery of components from catalysts
  'R9', // Oil re-refining or other reuses of oil
  'R10', // Land treatment resulting in benefit to agriculture or ecological improvement
  'R11', // Use of wastes obtained from any of the operations numbered R1 to R10
  'R12', // Exchange of wastes for submission to any of the operations numbered R1 to R11
  'R13' // Storage of wastes pending any of the operations numbered R1 to R12
]

// Disposal codes enum
const DISPOSAL_CODES = [
  'D1', // Deposit into or onto land
  'D2', // Land treatment
  'D3', // Deep injection
  'D4', // Surface impoundment
  'D5', // Specially engineered landfill
  'D6', // Release into a water body except seas/oceans
  'D7', // Release into seas/oceans including sea-bed insertion
  'D8', // Biological treatment not specified elsewhere
  'D9', // Physico-chemical treatment not specified elsewhere
  'D10', // Incineration on land
  'D11', // Incineration at sea
  'D12', // Permanent storage
  'D13', // Blending or mixing prior to submission to any of the operations numbered D1 to D12
  'D14', // Repackaging prior to submission to any of the operations numbered D1 to D13
  'D15' // Storage pending any of the operations numbered D1 to D14
]

export const DISPOSAL_OR_RECOVERY_CODES = [...RECOVERY_CODES, ...DISPOSAL_CODES]
