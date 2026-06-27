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
