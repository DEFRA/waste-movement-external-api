export const sourceOfComponentsProvided = {
  PROVIDED_WITH_WASTE: 'PROVIDED_WITH_WASTE',
  GUIDANCE: 'GUIDANCE',
  OWN_TESTING: 'OWN_TESTING'
}

export const sourceOfComponentsNotProvided = {
  NOT_PROVIDED: 'NOT_PROVIDED'
}

export const validSourceOfComponents = {
  ...sourceOfComponentsProvided,
  ...sourceOfComponentsNotProvided
}
