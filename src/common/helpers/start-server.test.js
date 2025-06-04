import hapi from '@hapi/hapi'

const mockLoggerInfo = jest.fn()
const mockLoggerError = jest.fn()

const mockHapiLoggerInfo = jest.fn()
const mockHapiLoggerError = jest.fn()

// Mock Hapi server
const mockServer = {
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  logger: {
    info: mockHapiLoggerInfo,
    error: mockHapiLoggerError
  },
  register: jest.fn().mockImplementation(async (plugins) => {
    // Simulate plugin registration order
    if (Array.isArray(plugins)) {
      for (const plugin of plugins) {
        if (plugin.plugin?.name === 'secure-context') {
          mockHapiLoggerInfo('Custom secure context is disabled')
        } else if (plugin.plugin?.name === 'mongodb') {
          mockHapiLoggerInfo('Setting up MongoDb')
          mockHapiLoggerInfo('MongoDb connected to waste-movement-backend')
        }
      }
    }
  })
}

jest.mock('@hapi/hapi', () => ({
  server: jest.fn().mockImplementation((options) => {
    // Verify server configuration
    expect(options.host).toBeDefined()
    expect(options.port).toBeDefined()
    expect(options.routes).toBeDefined()
    expect(options.routes.cors).toBeDefined()
    expect(options.routes.cors.origin).toEqual(['*'])
    expect(options.routes.cors.credentials).toBe(true)
    return mockServer
  })
}))

jest.mock('hapi-pino', () => ({
  register: (server) => {
    server.decorate('server', 'logger', {
      info: mockHapiLoggerInfo,
      error: mockHapiLoggerError
    })
  },
  name: 'mock-hapi-pino'
}))

jest.mock('./logging/logger.js', () => ({
  createLogger: () => ({
    info: (...args) => mockLoggerInfo(...args),
    error: (...args) => mockLoggerError(...args)
  })
}))

// Mock secure context plugin
jest.mock('./secure-context/secure-context.js', () => ({
  secureContext: {
    plugin: {
      name: 'secure-context',
      register(server) {
        server.logger.info('Custom secure context is disabled')
      }
    }
  }
}))

describe('#startServer', () => {
  const PROCESS_ENV = process.env
  let createServerSpy
  let hapiServerSpy
  let startServerImport
  let createServerImport

  beforeAll(async () => {
    process.env = { ...PROCESS_ENV }
    process.env.PORT = '3098' // Set to obscure port to avoid conflicts
    process.env.NODE_ENV = 'test' // Ensure we're in test mode

    createServerImport = await import('../../server.js')
    startServerImport = await import('./start-server.js')

    createServerSpy = jest.spyOn(createServerImport, 'createServer')
    hapiServerSpy = jest.spyOn(hapi, 'server')
  })

  afterAll(() => {
    process.env = PROCESS_ENV
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('When server starts', () => {
    test('Should start up server as expected', async () => {
      await startServerImport.startServer()

      expect(createServerSpy).toHaveBeenCalled()
      expect(hapiServerSpy).toHaveBeenCalled()
      expect(mockServer.start).toHaveBeenCalled()
      expect(mockServer.register).toHaveBeenCalled()

      // Verify all log messages were called in the correct order
      const logCalls = mockHapiLoggerInfo.mock.calls.map((call) => call[0])
      expect(logCalls).toEqual([
        'Custom secure context is disabled',
        'Server started successfully',
        'Access your backend on http://localhost:3098'
      ])
    })
  })

  describe('When server start fails', () => {
    beforeAll(() => {
      mockServer.start.mockRejectedValueOnce(
        new Error('Server failed to start')
      )
    })

    test('Should log failed startup message', async () => {
      await startServerImport.startServer()

      expect(mockLoggerInfo).toHaveBeenCalledWith('Server failed to start :(')
      expect(mockLoggerError).toHaveBeenCalledWith(
        Error('Server failed to start')
      )
    })
  })
})
