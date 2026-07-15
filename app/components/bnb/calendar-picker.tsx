'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  startDate?: Date | null
  endDate?: Date | null
  onSelect?: (date: Date) => void
  blockedDates?: string[]     // ISO "YYYY-MM-DD" — shown in red
  clickableBlocked?: boolean  // allow clicking blocked dates (dashboard toggle mode)
}

export default function CalendarPicker({ startDate, endDate, onSelect, blockedDates = [], clickableBlocked = false }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const month2 = month === 11 ? 0 : month + 1
  const year2 = month === 11 ? year + 1 : year

  const effectiveEnd = endDate || (startDate && hoverDate && hoverDate > startDate ? hoverDate : null)

  const renderMonth = (y: number, m: number) => {
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const firstDay = new Date(y, m, 1).getDay()
    const cells: (Date | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d))

    return (
      <div className="flex-1 min-w-[220px]">
        <div className="grid grid-cols-7">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs text-gray-400 py-2 font-medium">{d}</div>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={`e${i}`} />

            const iso = toISO(date)
            const past    = date < today
            const blocked = blockedDates.includes(iso)
            const isStart = !!(startDate && sameDay(date, startDate))
            const isEnd   = !!(endDate && sameDay(date, endDate))
            const inRange = !!(startDate && effectiveEnd && date > startDate && date < effectiveEnd)
            const isHoverEnd = !!(hoverDate && !endDate && startDate && sameDay(date, hoverDate) && hoverDate > startDate)

            const disabled = past || (blocked && !clickableBlocked)

            let cls = 'h-9 w-full text-sm transition-colors relative text-gray-800 '

            if (blocked && clickableBlocked) {
              cls += 'bg-red-100 text-red-600 font-medium rounded-full hover:bg-red-200 '
            } else if (blocked) {
              cls += 'text-red-400 line-through cursor-not-allowed '
            } else if (past) {
              cls += 'text-gray-300 cursor-not-allowed '
            } else if (isStart || isEnd || isHoverEnd) {
              cls += 'bg-gray-900 text-white font-semibold rounded-full z-10 '
              if ((isStart || isHoverEnd) && effectiveEnd) cls += 'rounded-r-none '
              if (isEnd && startDate) cls += 'rounded-l-none '
            } else if (inRange) {
              cls += 'bg-gray-100 text-gray-800 hover:bg-gray-200 '
            } else {
              cls += 'hover:bg-gray-100 rounded-full '
            }

            return (
              <button
                key={`d${i}`}
                disabled={disabled}
                onClick={() => !disabled && onSelect?.(date)}
                onMouseEnter={() => !disabled && setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
                className={cls}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 bg-white rounded-2xl shadow-2xl border border-gray-100 w-max">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-20 text-sm font-semibold text-gray-800">
          <span>{MONTHS[month]} {year}</span>
          <span>{MONTHS[month2]} {year2}</span>
        </div>
        <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-8">
        {renderMonth(year, month)}
        {renderMonth(year2, month2)}
      </div>
    </div>
  )
}
