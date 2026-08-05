import { NextResponse } from 'next/server'
import { loadActiveMenu } from '@/lib/food-db'

// public read of the currently served menu's products (customer + waitress menus).
// Editing happens per-menu through /api/food/menus.
export async function GET() {
  try {
    const menu = await loadActiveMenu()
    return NextResponse.json(menu?.products ?? [])
  } catch (e) {
    console.error('[food/products GET]', e)
    return NextResponse.json({ error: 'שגיאה בטעינת מוצרים' }, { status: 500 })
  }
}
