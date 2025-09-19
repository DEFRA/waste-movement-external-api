export const POP_COMPONENT_SOURCES = {
  NOT_PROVIDED: 'NOT_PROVIDED',
  CARRIER_PROVIDED: 'CARRIER_PROVIDED',
  GUIDANCE: 'GUIDANCE',
  OWN_TESTING: 'OWN_TESTING'
}

export const validPopComponentSources = Object.values(POP_COMPONENT_SOURCES)

export const isValidPopComponentSource = (value) =>
  validPopComponentSources.includes(value)
