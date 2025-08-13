/**
 * Valid hazardous property codes (HP codes) for waste classification
 * HP1-HP15 are represented as integers 1-15 in the system
 */
export const VALID_HAZARD_CODES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
]

/**
 * Descriptions for each hazardous property code
 * Based on UK waste classification guidance
 */
export const HAZARD_CODE_DESCRIPTIONS = {
  1: 'HP1 - Explosive',
  2: 'HP2 - Oxidizing',
  3: 'HP3 - Flammable',
  4: 'HP4 - Irritant - skin irritation and eye damage',
  5: 'HP5 - Specific Target Organ Toxicity/Aspiration Toxicity',
  6: 'HP6 - Acute Toxicity',
  7: 'HP7 - Carcinogenic',
  8: 'HP8 - Corrosive',
  9: 'HP9 - Infectious',
  10: 'HP10 - Toxic for Reproduction',
  11: 'HP11 - Mutagenic',
  12: 'HP12 - Release of acute toxic gas',
  13: 'HP13 - Sensitising',
  14: 'HP14 - Ecotoxic',
  15: 'HP15 - Waste capable of exhibiting a hazardous property listed above not directly displayed by the original waste'
}
