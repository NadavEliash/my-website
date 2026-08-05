import { NextRequest, NextResponse } from 'next/server'
import { loadMenus, saveMenus } from '@/lib/food-db'
import { staffFromRequest } from '@/lib/food-auth'
import type { Menu } from '@/app/food/types'

// staff-only editing surface for menus; customers read the served menu through
// /api/food/products instead, so unpublished menus never leave the dashboard
export async function GET(req: NextRequest) {
  try {
    if (!staffFromRequest(req)) return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
    return NextResponse.json(await loadMenus())
  } catch (e) {
    console.error('[food/menus GET]', e)
    return NextResponse.json({ error: 'שגיאה בטעינת התפריטים' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!staffFromRequest(req)) return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
    const { menus } = await req.json() as { menus: Menu[] }
    if (!Array.isArray(menus)) return NextResponse.json({ error: 'נתונים שגויים' }, { status: 400 })
    await saveMenus(menus)
    return NextResponse.json(menus)
  } catch (e) {
    console.error('[food/menus POST]', e)
    return NextResponse.json({ error: 'שגיאה בשמירת התפריטים' }, { status: 500 })
  }
}
