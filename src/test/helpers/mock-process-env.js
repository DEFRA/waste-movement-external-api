import { apiCodes } from '../data/api-codes'

export const mockProcessEnv = (overrides) => {
  const oldEnv = process.env

  beforeEach(() => {
    jest.resetModules()

    process.env = {
      ...oldEnv,
      API_CODES: btoa(apiCodes),
      ...overrides
    }
  })

  afterAll(() => {
    process.env = oldEnv
  })
}
