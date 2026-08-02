'use client'

import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Question } from '@/app/quest/types'

type Result = 'correct' | 'wrong' | null

// Question screen: shows the question and a "תשובה" button. Pressing it slides a
// coloured panel up from the bottom with the answer and a "were you right?" choice.
// The panel is blue until the user judges — then green (right) or red (wrong).
export default function QuestionScreen({
  index,
  total,
  question,
  revealed,
  result,
  onReveal,
  onJudge,
  onPrev,
  onNext,
}: {
  index: number
  total: number
  question: Question
  revealed: boolean
  result: Result
  onReveal: () => void
  onJudge: (correct: boolean) => void
  onPrev: () => void
  onNext: () => void
}) {
  const panelColor = result === 'correct' ? '#4d8b3c' : result === 'wrong' ? '#c0392b' : '#2f6fed'

  return (
    <div className="relative h-full w-full bg-black overflow-hidden" dir="rtl">
      {/* progress + question */}
      <div className="px-6 pt-8">
        <div className="flex justify-end mb-6">
          <span dir="ltr" className="text-[#2f6fed] font-bold text-lg">{index + 1}/{total}</span>
        </div>
        <h2 className="text-white text-2xl font-bold leading-relaxed text-right">{question.question}</h2>
        {!revealed && (
          <div className="flex justify-start mt-8">
            <button
              onClick={onReveal}
              className="px-6 py-2 rounded-md bg-[#2f6fed] text-white text-lg font-bold active:scale-95 transition"
            >
              תשובה
            </button>
          </div>
        )}
      </div>

      {/* answer panel — slides up on reveal, colour reflects the judgement */}
      <div
        className="absolute inset-x-0 bottom-0 transition-transform duration-500 ease-out"
        style={{ transform: revealed ? 'translateY(0)' : 'translateY(100%)', backgroundColor: panelColor }}
      >
        <div className="px-6 pt-8 pb-32 min-h-[42vh]">
          <p className="text-white text-2xl font-bold leading-relaxed text-right mb-8">{question.answer}</p>
          <p className="text-white/90 text-lg text-right mb-3">האם צדקת?</p>
          <div className="flex justify-start gap-4">
            <button
              onClick={() => onJudge(false)}
              aria-label="טעיתי"
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1a1a1a] shadow-md active:scale-90 transition"
            >
              <X size={20} strokeWidth={3} />
            </button>
            <button
              onClick={() => onJudge(true)}
              aria-label="צדקתי"
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1a1a1a] shadow-md active:scale-90 transition"
            >
              <Check size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* navigation arrows — big yellow circles peeking from the bottom corners */}
      <button
        onClick={onPrev}
        disabled={index === 0}
        aria-label="שאלה קודמת"
        className="absolute bottom-[-72px] right-[-72px] w-36 h-36 rounded-full bg-[#f5e14b] flex items-start justify-center pt-6 pr-12 text-[#1a1a1a] z-20 disabled:opacity-40 active:scale-95 transition"
      >
        <ChevronRight size={32} strokeWidth={3} />
      </button>
      <button
        onClick={onNext}
        aria-label="שאלה הבאה"
        className="absolute bottom-[-72px] left-[-72px] w-36 h-36 rounded-full bg-[#f5e14b] flex items-start justify-center pt-6 pl-12 text-[#1a1a1a] z-20 active:scale-95 transition"
      >
        <ChevronLeft size={32} strokeWidth={3} />
      </button>
    </div>
  )
}
