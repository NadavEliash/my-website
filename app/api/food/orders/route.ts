import { NextRequest, NextResponse } from 'next/server'
import { getFoodDb } from '@/lib/food-db'

async function notifySocket(payload: object) {
  try {
    await fetch('http://localhost:3001/api/food/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // socket server may not be running
  }
}

export async function GET() {
  try {
    const db = await getFoodDb()
    const orders = await db.collection('orders').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(orders)
  } catch (e) {
    console.error('[food/orders GET]', e)
    return NextResponse.json({ error: 'שגיאה בטעינת הזמנות' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = await getFoodDb()

    if (Array.isArray(body.orders)) {
      await db.collection('orders').deleteMany({})
      if (body.orders.length > 0) await db.collection('orders').insertMany(body.orders)
      await notifySocket({ type: 'order-updated' })
      return NextResponse.json(body.orders)
    } else {
      await db.collection('orders').insertOne({ ...body, _id: undefined })
      await notifySocket({ type: 'new-order', order: body })
      return NextResponse.json(body)
    }
  } catch (e) {
    console.error('[food/orders POST]', e)
    return NextResponse.json({ error: 'שגיאה בשמירת ההזמנה' }, { status: 500 })
  }
}
