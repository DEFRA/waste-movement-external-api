export async function createWasteInput(db, wasteInput) {
  wasteInput._id = wasteInput.wasteTrackingId
  const collection = db.collection('waste-inputs')
  const result = await collection.insertOne(wasteInput)
  return { ...wasteInput, _id: result.insertedId }
}
