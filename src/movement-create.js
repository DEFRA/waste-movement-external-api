export async function createMovement(db, movement) {
  const collection = db.collection('movements')
  const result = await collection.insertOne(movement)
  return { ...movement, _id: result.insertedId }
}
