'use client'

import type { QuizMeta } from '@/app/quest/types'

// Opening screen: a black top half with the selected subject + question count, a navy
// bottom half with a "switch subject" button, and a yellow "start" button on the seam.
export default function OpeningScreen({
  quizzes,
  selectedId,
  questionsPerGame,
  starting,
  onSelectQuiz,
  onStart,
}: {
  quizzes: QuizMeta[]
  selectedId: string
  questionsPerGame: number
  starting?: boolean
  onSelectQuiz: (quizId: string) => void
  onStart: () => void
}) {
  const selected = quizzes.find(q => q.id === selectedId)

  // cycle to the next subject in the list
  function switchSubject() {
    if (quizzes.length < 2) return
    const i = quizzes.findIndex(q => q.id === selectedId)
    onSelectQuiz(quizzes[(i + 1) % quizzes.length].id)
  }

  return (
    <div className="relative h-full w-full flex flex-col" dir="rtl">
      {/* top black half — count + current subject */}
      <div className="flex-1 bg-black flex flex-col items-center justify-center gap-1 px-6 pb-16 text-center">
        <span className="text-white text-7xl font-extrabold leading-none">{questionsPerGame}</span>
        <span className="text-white text-3xl font-bold">שאלות</span>
        {selected && (
          <div className="flex flex-col items-center gap-2 mt-4">
            <span className="text-[#f5e14b] text-2xl font-bold">{selected.subject}</span>
          </div>
        )}
      </div>

      {/* bottom navy half — switch subject */}
      <div className="flex-1 bg-[#0d1b34] flex flex-col items-center justify-end pb-12">
        {quizzes.length > 1 && (
          <button
            onClick={switchSubject}
            className="px-6 py-3 rounded-xl border-2 border-white/30 text-white font-bold text-lg hover:bg-white/10 active:scale-95 transition"
          >
            החלף נושא
          </button>
        )}
      </div>

      {/* start button, straddling the divide */}
      <button
        onClick={onStart}
        disabled={starting}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-[#f5e14b] border-[6px] border-white text-[#1a1a1a] text-2xl font-extrabold shadow-xl active:scale-95 transition disabled:opacity-70"
      >
        {starting ? 'טוען…' : 'התחילו!'}
      </button>
    </div>
  )
}
