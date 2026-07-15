import { NextRequest, NextResponse } from 'next/server'
import { getFoodDb } from '@/lib/food-db'

const DEFAULTS = {
  open: false,
  bitPhone: '',
  payboxPhone: '',
  scheduleDays: [],
}

export async function GET() {
  try {
    const db = await getFoodDb()
    const doc = await db.collection('settings').findOne({ _id: 'main' as unknown as never })
    return NextResponse.json(doc ? { ...DEFAULTS, ...doc, _id: undefined } : DEFAULTS)
  } catch (e) {
    console.error('[food/settings GET]', e)
    return NextResponse.json({ error: 'שגיאה בטעינת הגדרות' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const db = await getFoodDb()
    await db.collection('settings').updateOne(
      { _id: 'main' as unknown as never },
      { $set: body },
      { upsert: true }
    )
    return NextResponse.json(body)
  } catch (e) {
    console.error('[food/settings PUT]', e)
    return NextResponse.json({ error: 'שגיאה בשמירת הגדרות' }, { status: 500 })
  }
}
