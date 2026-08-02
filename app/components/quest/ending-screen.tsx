'use client'

import type { QuizMeta } from '@/app/quest/types'
import { getCompliment } from '@/app/quest/utils'
import QuizIcon from './quiz-icon'

// Ending screen: a compliment, the score inside a yellow circle, and three other
// subjects (round icons in a row) to jump straight into a new game.
export default function EndingScreen({
  score,
  total,
  suggestions,
  starting,
  onPickSubject,
}: {
  score: number
  total: number
  suggestions: QuizMeta[]
  starting?: boolean
  onPickSubject: (quizId: string) => void
}) {
  const compliment = getCompliment(score, total)

  return (
    <div className="h-full w-full bg-black flex flex-col" dir="rtl">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-white text-4xl font-extrabold mb-4">{compliment}</h1>
        <p className="text-white/80 text-xl font-semibold mb-8">ענית נכון על</p>
        <div className="w-48 h-48 rounded-full bg-[#f5e14b] flex flex-col items-center justify-center">
          <span className="text-[#1a1a1a] text-7xl font-extrabold leading-none">{score}</span>
          <span className="text-[#1a1a1a] text-xl font-bold mt-2">מתוך {total}</span>
        </div>
      </div>

      <div className="bg-[#0d1b34] py-8 px-6 flex flex-col items-center gap-5">
        <p className="text-white font-bold text-lg">רוצים להמשיך לשחק?</p>
        <div className="flex flex-row justify-center gap-8">
          {suggestions.map(q => (
            <button key={q.id} onClick={() => onPickSubject(q.id)} disabled={starting} className="flex flex-col items-center gap-2 w-24 disabled:opacity-60">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-white/20 flex items-center justify-center overflow-hidden active:scale-95 transition p-3">
                <QuizIcon icon={q.icon} />
              </div>
              <span className="text-xs text-center text-white/80">{q.subject}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
