import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_BNB_URI

declare global {
  var _questClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) throw new Error('MONGODB_BNB_URI is not set')
  if (process.env.NODE_ENV === 'development') {
    if (!global._questClientPromise) {
      global._questClientPromise = new MongoClient(uri, { maxPoolSize: 1 }).connect()
    }
    return global._questClientPromise
  }
  return new MongoClient(uri, { maxPoolSize: 1 }).connect()
}

// quiz data lives in the `quiz` database, `questions` collection
export async function getQuestDb() {
  const client = await getClientPromise()
  return client.db('quiz')
}
