// Valid POP (Persistent Organic Pollutant) names based on UK and EU regulations
// Combined list from UK legislation (https://www.legislation.gov.uk/eur/2019/1021/annex/IV)
// and EU Regulation (EUR-Lex - 02019R1021-20250804)

export const validPopNames = [
  'Endosulfan',
  'Hexachlorobutadiene',
  'Polychlorinated naphthalenes',
  'SCCPs',
  'Tetrabromodiphenyl ether',
  'Pentabromodiphenyl ether',
  'Hexabromodiphenyl ether',
  'Heptabromodiphenyl ether',
  'Decabromodiphenyl ether',
  'Tetra-, penta-, hexa-, hepta- and deca- bromodiphenyl ether',
  'PFOS',
  'PCDD/PCDF',
  'DDT',
  'Chlordane',
  'Hexachlorocyclohexanes',
  'Dieldrin',
  'Endrin',
  'Heptachlor',
  'Hexachlorobenzene',
  'Chlordecone',
  'Aldrin',
  'Pentachlorobenzene',
  'PCB',
  'Mirex',
  'Toxaphene',
  'Hexabromobiphenyl',
  'Hexabromocyclododecane',
  'Pentachlorophenol',
  'PFOA',
  'Dicofol',
  'PFHxS'
]

/**
 * Validates if the provided POP name is in the list of valid names
 *
 * @param {string} name - The POP name to validate
 * @returns {boolean} - True if the name is valid, false otherwise
 */
export const isValidPopName = (name) => {
  // Check if the name is in the list of valid names
  return validPopNames.includes(name)
}
