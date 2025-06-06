import { health } from './health.js'

describe('Health Route', () => {
  it('should return a success message', async () => {
    const mockRequest = {}
    const mockH = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    health.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({ message: 'success' })
  })

  it('should have the correct route configuration', () => {
    expect(health.method).toBe('GET')
    expect(health.path).toBe('/health')
    expect(health.options.tags).toContain('health')
  })
})
