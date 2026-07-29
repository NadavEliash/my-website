import { NextRequest, NextResponse } from 'next/server'
import { getFoodDb } from '@/lib/food-db'
import { staffFromRequest } from '@/lib/food-auth'

export async function GET() {
  try {
    const db = await getFoodDb()
    const products = await db.collection('products').find({}, { projection: { _id: 0 } }).toArray()
    return NextResponse.json(products)
  } catch (e) {
    console.error('[food/products GET]', e)
    return NextResponse.json({ error: 'שגיאה בטעינת מוצרים' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!staffFromRequest(req)) return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
    const { products } = await req.json()
    const db = await getFoodDb()
    await db.collection('products').deleteMany({})
    if (products.length > 0) await db.collection('products').insertMany(products)
    return NextResponse.json(products)
  } catch (e) {
    console.error('[food/products POST]', e)
    return NextResponse.json({ error: 'שגיאה בשמירת מוצרים' }, { status: 500 })
  }
}
