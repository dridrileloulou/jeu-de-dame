import mongoose from 'mongoose'

let connectionPromise: Promise<typeof mongoose> | null = null

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error('MONGODB_URI manquant')

    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
    }).catch((e) => {
      connectionPromise = null
      throw e
    })
  }

  return connectionPromise
}
