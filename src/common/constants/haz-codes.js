export const validHazCodes = [
  'HP_1',
  'HP_2',
  'HP_3',
  'HP_4',
  'HP_5',
  'HP_6',
  'HP_7',
  'HP_8',
  'HP_9',
  'HP_10',
  'HP_11',
  'HP_12',
  'HP_13',
  'HP_14',
  'HP_15',
  'HP_POP'
]

/**
 * Validates if the provided haz code is in the list of valid codes
 *
 * @param {string} hazCode - The haz code to validate
 * @returns {boolean} - True if the code is valid, false otherwise
 */
export const isValidHazCode = (hazCode) => {
  // Check if the haz codeis in the list of valid types
  return validHazCodes.includes(hazCode)
}
