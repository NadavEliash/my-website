import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_BNB_URI!

declare global {
  // eslint-disable-next-line no-var
  var _foodClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._foodClientPromise) {
      global._foodClientPromise = new MongoClient(uri, { maxPoolSize: 1 }).connect()
    }
    return global._foodClientPromise
  }
  return new MongoClient(uri, { maxPoolSize: 1 }).connect()
}

export async function getFoodDb() {
  const client = await getClientPromise()
  return client.db('food-store')
}
