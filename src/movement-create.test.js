import { createMovement } from './movement-create.js'

describe('createMovement', () => {
  let mockDb
  let mockCollection
  let mockInsertOne

  beforeEach(() => {
    // Setup mock collection and insertOne function
    mockInsertOne = jest.fn()
    mockCollection = {
      insertOne: mockInsertOne
    }
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    }
  })

  it('should create a movement and return it with the inserted ID', async () => {
    // Arrange
    const mockMovement = {
      carrierId: 'CARRIER123',
      carrierMovementId: 'MOVEMENT123',
      wasteType: 'hazardous',
      quantity: 100,
      unit: 'kg'
    }
    const mockInsertedId = '123456789'
    mockInsertOne.mockResolvedValueOnce({ insertedId: mockInsertedId })

    // Act
    const result = await createMovement(mockDb, mockMovement)

    // Assert
    expect(mockDb.collection).toHaveBeenCalledWith('movements')
    expect(mockInsertOne).toHaveBeenCalledWith(mockMovement)
    expect(result).toEqual({
      ...mockMovement,
      _id: mockInsertedId
    })
  })

  it('should handle database errors', async () => {
    // Arrange
    const mockMovement = {
      carrierId: 'CARRIER123',
      carrierMovementId: 'MOVEMENT123'
    }
    const mockError = new Error('Database error')
    mockInsertOne.mockRejectedValueOnce(mockError)

    // Act & Assert
    await expect(createMovement(mockDb, mockMovement)).rejects.toThrow(
      mockError
    )
    expect(mockDb.collection).toHaveBeenCalledWith('movements')
    expect(mockInsertOne).toHaveBeenCalledWith(mockMovement)
  })

  it('should preserve all movement properties in the result', async () => {
    // Arrange
    const mockMovement = {
      carrierId: 'CARRIER123',
      carrierMovementId: 'MOVEMENT123',
      wasteType: 'hazardous',
      quantity: 100,
      unit: 'kg',
      additionalInfo: {
        notes: 'Test notes',
        priority: 'high'
      }
    }
    const mockInsertedId = '123456789'
    mockInsertOne.mockResolvedValueOnce({ insertedId: mockInsertedId })

    // Act
    const result = await createMovement(mockDb, mockMovement)

    // Assert
    expect(result).toEqual({
      ...mockMovement,
      _id: mockInsertedId
    })
    expect(result.additionalInfo).toEqual(mockMovement.additionalInfo)
  })
})
