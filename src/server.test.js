import Hapi from '@hapi/hapi'

import { createServer } from './server.js'
import { jwtAuth } from './plugins/jwt-auth.js'
import * as configModule from './config.js'

describe('Server', () => {
  let serverRegisterSpy

  beforeEach(() => {
    // Create a mock server object with register method
    const mockServer = {
      register: jest.fn().mockResolvedValue(undefined)
    }

    // Spy on Hapi.server
    jest.spyOn(Hapi, 'server').mockReturnValue(mockServer)

    // Spy on server.register
    serverRegisterSpy = jest.spyOn(mockServer, 'register')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createServer', () => {
    test('should register JWT auth plugin when not in local environment', async () => {
      // Mock non-local environment
      const configSpy = jest
        .spyOn(configModule.config, 'get')
        .mockImplementation((key) => {
          if (key === 'cdpEnvironment') {
            return 'prod'
          }
          if (key === 'host') {
            return 'localhost'
          }
          if (key === 'port') {
            return 3000
          }
          return undefined
        })

      await createServer()

      // JWT auth should be registered
      expect(serverRegisterSpy).toHaveBeenCalledWith(jwtAuth)

      configSpy.mockRestore()
    })

    test('should not register JWT auth plugin in local environment', async () => {
      // Mock local environment
      const configSpy = jest
        .spyOn(configModule.config, 'get')
        .mockImplementation((key) => {
          if (key === 'cdpEnvironment') {
            return 'local'
          }
          if (key === 'host') {
            return 'localhost'
          }
          if (key === 'port') {
            return 3000
          }
          return undefined
        })

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await createServer()

      // JWT auth should not be registered
      expect(serverRegisterSpy).not.toHaveBeenCalledWith(jwtAuth)
      expect(consoleSpy).toHaveBeenCalledWith(
        'WARNING: Local environment detected. JWT authentication is disabled.'
      )

      consoleSpy.mockRestore()
      configSpy.mockRestore()
    })
  })
})
