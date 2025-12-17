export const RECOVERY_CODES = [
  {
    code: 'R1',
    isNotRecoveryToFinalProduct: true,
    description: 'Use principally as a fuel or other means to generate energy'
  },
  {
    code: 'R2',
    isNotRecoveryToFinalProduct: false,
    description: 'Solvent reclamation/regeneration'
  },
  {
    code: 'R3',
    isNotRecoveryToFinalProduct: false,
    description:
      'Recycling/reclamation of organic substances which are not used as solvents (including composting and other biological transformation processes)'
  },
  {
    code: 'R4',
    isNotRecoveryToFinalProduct: false,
    description: 'Recycling/reclamation of metals and metal compounds'
  },
  {
    code: 'R5',
    isNotRecoveryToFinalProduct: false,
    description: 'Recycling/reclamation of other inorganic materials'
  },
  {
    code: 'R6',
    isNotRecoveryToFinalProduct: false,
    description: 'Regeneration of acids or bases'
  },
  {
    code: 'R7',
    isNotRecoveryToFinalProduct: false,
    description: 'Recovery of components used for pollution abatement'
  },
  {
    code: 'R8',
    isNotRecoveryToFinalProduct: false,
    description: 'Recovery of components from catalysts'
  },
  {
    code: 'R9',
    isNotRecoveryToFinalProduct: false,
    description: 'Oil re-refining or other reuses of oil'
  },
  {
    code: 'R10',
    isNotRecoveryToFinalProduct: false,
    description:
      'Land treatment resulting in benefit to agriculture or ecological improvement'
  },
  {
    code: 'R11',
    isNotRecoveryToFinalProduct: false,
    description:
      'Use of wastes obtained from any of the operations numbered R1 to R10'
  },
  {
    code: 'R12',
    isNotRecoveryToFinalProduct: true,
    description:
      'Exchange of wastes for submission to any of the operations numbered R1 to R11'
  },
  {
    code: 'R13',
    isNotRecoveryToFinalProduct: true,
    description:
      'Storage of wastes pending any of the operations numbered R1 to R12 (excluding temporary storage, pending collection, on the site where it is produced)'
  }
]

export const DISPOSAL_CODES = [
  {
    code: 'D1',
    isNotRecoveryToFinalProduct: false,
    description: 'Deposit into or onto land, e.g. landfill'
  },
  {
    code: 'D2',
    isNotRecoveryToFinalProduct: false,
    description:
      'Land treatment, e.g. biodegradation of liquid or sludgy discards in soils'
  },
  {
    code: 'D3',
    isNotRecoveryToFinalProduct: false,
    description:
      'Deep injection, e.g. injection of pumpable discards into wells, salt domes or naturally occurring repositories'
  },
  {
    code: 'D4',
    isNotRecoveryToFinalProduct: false,
    description:
      'Surface impoundment, e.g. placement of liquid or sludgy discards into pits, ponds or lagoons'
  },
  {
    code: 'D5',
    isNotRecoveryToFinalProduct: false,
    description:
      'Specially engineered landfill, e.g. placement into lined discrete cells which are capped and isolated from one another and the environment'
  },
  {
    code: 'D6',
    isNotRecoveryToFinalProduct: false,
    description: 'Release into a water body, except seas/oceans'
  },
  {
    code: 'D7',
    isNotRecoveryToFinalProduct: false,
    description: 'Release into seas/oceans, including sea-bed insertion'
  },
  {
    code: 'D8',
    isNotRecoveryToFinalProduct: false,
    description:
      'Biological treatment resulting in final compounds or mixtures which are discarded by any of the operations numbered D1 to D12'
  },
  {
    code: 'D9',
    isNotRecoveryToFinalProduct: false,
    description:
      'Physico-chemical treatment resulting in final compounds or mixtures which are discarded by any of the operations numbered D1 to D12, e.g. evaporation, drying, calcination'
  },
  {
    code: 'D10',
    isNotRecoveryToFinalProduct: false,
    description: 'Incineration on land'
  },
  {
    code: 'D11',
    isNotRecoveryToFinalProduct: false,
    description: 'Incineration at sea'
  },
  {
    code: 'D12',
    isNotRecoveryToFinalProduct: false,
    description: 'Permanent storage, e.g. emplacement of containers in a mine'
  },
  {
    code: 'D13',
    isNotRecoveryToFinalProduct: false,
    description:
      'Blending or mixing prior to submission to any of the operations numbered D1 to D12'
  },
  {
    code: 'D14',
    isNotRecoveryToFinalProduct: false,
    description:
      'Repackaging prior to submission to any of the operations numbered D1 to D13'
  },
  {
    code: 'D15',
    isNotRecoveryToFinalProduct: false,
    description:
      'Storage pending any of the operations numbered D1 to D14 (excluding temporary storage, pending collection, on the site where it is produced)'
  }
]

export const DISPOSAL_OR_RECOVERY_CODES = [
  ...RECOVERY_CODES.map(({ code }) => code),
  ...DISPOSAL_CODES.map(({ code }) => code)
]
