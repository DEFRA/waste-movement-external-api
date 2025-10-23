// Valid POP (Persistent Organic Pollutant) names based on UK and EU regulations
// Combined list from UK legislation (https://www.legislation.gov.uk/eur/2019/1021/annex/IV)
// and EU Regulation (EUR-Lex - 02019R1021-20250804)

export const validPopNames = [
  { name: 'Endosulfan', code: 'END' },
  { name: 'Hexachlorobutadiene', code: 'HCBD' },
  { name: 'Polychlorinated naphthalenes', code: 'PCNS' },
  { name: 'Short-chain chlorinated paraffins', code: 'SCCPS' },
  { name: 'Tetrabromodiphenyl ether', code: 'TETRABDE' },
  { name: 'Pentabromodiphenyl ether', code: 'PENTABDE' },
  { name: 'Hexabromodiphenyl ether', code: 'HEXABDE' },
  { name: 'Heptabromodiphenyl ether', code: 'HEPTABDE' },
  { name: 'Decabromodiphenyl ether', code: 'DECABDE' },
  { name: 'Tetra-, penta-, hexa-, hepta-, and deca- BDEs', code: 'PBDES' },
  { name: 'Perfluorooctane sulfonic acid (and derivatives)', code: 'PFOS' },
  { name: 'Polychlorinated dibenzo-p-dioxins/furans', code: 'PCDD_PCDF' },
  { name: 'Dichlorodiphenyltrichloroethane', code: 'DDT' },
  { name: 'Chlordane', code: 'CHL' },
  { name: 'Hexachlorocyclohexanes (including lindane)', code: 'HCH' },
  { name: 'Dieldrin', code: 'DLD' },
  { name: 'Endrin', code: 'ENDN' },
  { name: 'Heptachlor', code: 'HPT' },
  { name: 'Hexachlorobenzene', code: 'HCB' },
  { name: 'Chlordecone', code: 'CLD' },
  { name: 'Aldrin', code: 'ALD' },
  { name: 'Pentachlorobenzene', code: 'PECBZ' },
  { name: 'Polychlorinated biphenyls', code: 'PCB' },
  { name: 'Mirex', code: 'MRX' },
  { name: 'Toxaphene', code: 'TOX' },
  { name: 'Hexabromobiphenyl', code: 'HBB' },
  { name: 'Hexabromocyclododecane', code: 'HBCD' },
  { name: 'Pentachlorophenol', code: 'PCP' },
  { name: 'Perfluorooctanoic acid', code: 'PFOA' },
  { name: 'Dicofol', code: 'DCF' },
  { name: 'Perfluorohexane sulfonic acid', code: 'PFHXS' }
]

/**
 * Validates if the provided POP name is in the list of valid names
 *
 * @param {string} name - The POP name to validate
 * @returns {boolean} - True if the name is valid, false otherwise
 */
export const isValidPopName = (name) => {
  return validPopNames.some((pop) => pop.name === name)
}

/**
 * Validates if the provided POP code is in the list of valid codes
 *
 * @param {string} code - The POP code to validate
 * @returns {boolean} - True if the code is valid, false otherwise
 */
export const isValidPopCode = (code) => {
  return validPopNames.some((pop) => pop.code === code)
}
