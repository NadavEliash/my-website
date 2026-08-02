/**
 * Generates time slot strings from start up to (not including) end.
 * @param start - "HH:MM"
 * @param end   - "HH:MM"
 * @param slotMinutes - interval in minutes (15, 30, or 60)
 * @returns Array of "HH:MM" strings
 */
export function generateSlots(start: string, end: string, slotMinutes: number): string[] {
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)

  const startTotal = startH * 60 + startM
  const endTotal = endH * 60 + endM

  const slots: string[] = []

  for (let t = startTotal; t < endTotal; t += slotMinutes) {
    const h = Math.floor(t / 60)
    const m = t % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }

  return slots
}

// ── order-draft persistence ───────────────────────────────────────────────────
// sessionStorage keys that keep an in-progress order alive across refresh /
// navigation, so the customer can return to any step without re-entering it.
export const ORDER_DRAFT_KEYS = {
  cart: 'food-cart-draft',       // raw MenuSelector cart map
  time: 'food-time-draft',       // { selectedDate, selectedSlot, step } on the menu page
  checkout: 'food-checkout-draft', // { customerName, phone, deliveryId, step } on checkout
} as const

// wipe every order draft (plus the committed cart) — call once an order is placed
export function clearOrderDrafts() {
  try {
    localStorage.removeItem('food-cart')
    Object.values(ORDER_DRAFT_KEYS).forEach(k => sessionStorage.removeItem(k))
  } catch { /* ignore unavailable storage */ }
}
