export const sourceOfComponentsProvided = {
  CARRIER_PROVIDED: 'CARRIER_PROVIDED',
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
