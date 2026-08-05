import { MongoClient } from 'mongodb'
import type { Menu, Product } from '@/app/food/types'

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

const LEGACY_MENU_NAME = 'תפריט ראשי'

/**
 * Every product now belongs to a menu. Stores created before that change kept a
 * flat `products` collection — the first read after the upgrade folds it into a
 * single menu so nothing is lost.
 */
export async function loadMenus(): Promise<Menu[]> {
  const db = await getFoodDb()
  const menus = await db.collection('menus').find({}, { projection: { _id: 0 } }).toArray() as unknown as Menu[]
  if (menus.length > 0) return menus

  const legacy = await db.collection('products').find({}, { projection: { _id: 0 } }).toArray() as unknown as Product[]
  if (legacy.length === 0) return []
  const migrated: Menu[] = [{ id: crypto.randomUUID(), name: LEGACY_MENU_NAME, products: legacy }]
  await saveMenus(migrated)
  return migrated
}

export async function saveMenus(menus: Menu[]): Promise<void> {
  const db = await getFoodDb()
  await db.collection('menus').deleteMany({})
  // insert copies — insertMany stamps `_id` onto whatever it's given, and callers
  // hand these same objects back to the client
  if (menus.length > 0) {
    await db.collection('menus').insertMany(menus.map(m => ({ ...m })) as unknown as never[])
  }
}

/** The menu customers see: settings.activeMenuId, falling back to the first menu. */
export async function loadActiveMenu(): Promise<Menu | null> {
  const db = await getFoodDb()
  const [menus, settings] = await Promise.all([
    loadMenus(),
    db.collection('settings').findOne({ _id: 'main' as unknown as never }),
  ])
  if (menus.length === 0) return null
  const activeId = settings?.activeMenuId as string | undefined
  return menus.find(m => m.id === activeId) ?? menus[0]
}
