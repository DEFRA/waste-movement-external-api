const RECOVERY_CODES = [
  {
    code: 'R1'
  },
  {
    code: 'R2'
  },
  {
    code: 'R3'
  },
  {
    code: 'R4'
  },
  {
    code: 'R5'
  },
  {
    code: 'R6'
  },
  {
    code: 'R7'
  },
  {
    code: 'R8'
  },
  {
    code: 'R9'
  },
  {
    code: 'R10'
  },
  {
    code: 'R11'
  },
  {
    code: 'R12'
  },
  {
    code: 'R13'
  }
]

const DISPOSAL_CODES = [
  {
    code: 'D1'
  },
  {
    code: 'D2'
  },
  {
    code: 'D3'
  },
  {
    code: 'D4'
  },
  {
    code: 'D5'
  },
  {
    code: 'D6'
  },
  {
    code: 'D7'
  },
  {
    code: 'D8'
  },
  {
    code: 'D9'
  },
  {
    code: 'D10'
  },
  {
    code: 'D11'
  },
  {
    code: 'D12'
  },
  {
    code: 'D13'
  },
  {
    code: 'D14'
  },
  {
    code: 'D15'
  }
]

export const DISPOSAL_OR_RECOVERY_CODES = [
  ...RECOVERY_CODES.map(({ code }) => code),
  ...DISPOSAL_CODES.map(({ code }) => code)
]
