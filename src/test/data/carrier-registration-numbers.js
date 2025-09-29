export const validEnglandCarrierRegistrationNumbers = [
  'CBDL999',
  'CBDL9999',
  'CBDL99999',
  'CBDL999999',
  'CBDL99999999999999999999',
  'CBDU999',
  'CBDU9999',
  'CBDU99999',
  'CBDU99999999999999999999'
]

export const validSepaCarrierRegistrationNumbers = [
  'WCR/R/9999999',
  'SCO/999999',
  'SEA/999999',
  'SNO/999999',
  'SWE/999999',
  'WCR/999999'
]

export const validNrwCarrierRegistrationNumbers =
  validEnglandCarrierRegistrationNumbers

export const validNiCarrierRegistrationNumbers = [
  'ROC UT 9',
  'ROC UT 99',
  'ROC UT 999',
  'ROC UT 9999',
  'ROC UT 99999',
  'ROC LT 9',
  'ROC LT 99',
  'ROC LT 999',
  'ROC LT 9999',
  'ROC LT 99999'
]

export const validCarrierRegistrationNumbers = [
  ...new Set([
    ...validEnglandCarrierRegistrationNumbers,
    ...validSepaCarrierRegistrationNumbers,
    ...validNrwCarrierRegistrationNumbers,
    ...validNiCarrierRegistrationNumbers
  ])
]

export const invalidCarrierRegistrationNumbers = [
  'CBD999',
  'CBDT999',
  'CBDL99',
  'CBDU99',
  'WCR/R/999999',
  'WCR/R/99999999',
  'SCO/99999',
  'SCO/9999999',
  'SC/999999',
  'SCD/999999',
  'ROC U 9',
  'ROC L 9',
  'ROC DT 9',
  'ROC UT 999999',
  'ROC LT 999999',
  '',
  '   ',
  ' CBDL999 '
]
