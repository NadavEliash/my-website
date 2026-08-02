'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Open_Sans } from 'next/font/google'
import type { Question, Quiz, QuizMeta } from '@/app/quest/types'
import { QUESTIONS_PER_GAME, pickQuestions, otherQuizzes } from '@/app/quest/utils'
import OpeningScreen from '@/app/components/quest/opening-screen'
import QuestionScreen from '@/app/components/quest/question-screen'
import EndingScreen from '@/app/components/quest/ending-screen'

const openSans = Open_Sans({ subsets: ['hebrew', 'latin'], weight: ['400', '600', '700', '800'] })

type Screen = 'opening' | 'question' | 'ending'
type Result = 'correct' | 'wrong' | null

export default function QuestPage() {
  const [metas, setMetas] = useState<QuizMeta[]>([]) // lightweight quiz list (no questions)
  const [selectedId, setSelectedId] = useState('')
  const [active, setActive] = useState<Question[]>([]) // the 20 questions sampled for the running game

  const [screen, setScreen] = useState<Screen>('opening')
  const [index, setIndex] = useState(0)
  const [opened, setOpened] = useState<boolean[]>([]) // which questions have had their answer revealed
  const [results, setResults] = useState<Result[]>([])
  const [starting, setStarting] = useState(false)

  // cache a quiz's questions after the first fetch, so replaying a subject is instant
  const questionCache = useRef<Record<string, Question[]>>({})

  // step 1 — on mount, load only the lightweight quiz list (id/subject/icon/count)
  useEffect(() => {
    fetch('/api/quest/quizzes')
      .then(r => r.json())
      .then((data: QuizMeta[]) => {
        if (Array.isArray(data) && data.length) {
          setMetas(data)
          setSelectedId(prev => (data.some(q => q.id === prev) ? prev : data[0].id))
        }
      })
      .catch(e => console.error('[quest] failed to load quiz list', e))
  }, [])

  const selected = metas.find(q => q.id === selectedId)
  const questionsPerGame = selected?.questionCount
    ? Math.min(QUESTIONS_PER_GAME, selected.questionCount)
    : QUESTIONS_PER_GAME
  const total = active.length
  const score = results.filter(r => r === 'correct').length

  // 3 other subjects to offer on the ending screen
  const suggestions = useMemo(() => otherQuizzes(metas, selectedId, 3), [metas, selectedId])

  // step 2 — fetch the chosen quiz's questions (once, then cached), sample 20, and begin
  async function startGame(quizId: string) {
    setSelectedId(quizId)
    setStarting(true)
    try {
      let pool = questionCache.current[quizId]
      if (!pool) {
        const res = await fetch(`/api/quest/quizzes/${quizId}`)
        if (!res.ok) throw new Error(`status ${res.status}`)
        const quiz: Quiz = await res.json()
        pool = quiz.questions ?? []
        questionCache.current[quizId] = pool
      }
      const picked = pickQuestions(pool, QUESTIONS_PER_GAME)
      setActive(picked)
      setResults(Array(picked.length).fill(null))
      setOpened(Array(picked.length).fill(false))
      setIndex(0)
      setScreen('question')
    } catch (e) {
      console.error('[quest] failed to start quiz', e)
    } finally {
      setStarting(false)
    }
  }

  // record right/wrong, let the green/red flash show, then move on
  function judge(correct: boolean) {
    setResults(prev => {
      const next = prev.length === total ? [...prev] : Array(total).fill(null)
      next[index] = correct ? 'correct' : 'wrong'
      return next
    })
    setTimeout(() => {
      if (index >= total - 1) setScreen('ending')
      else setIndex(i => i + 1)
    }, 750)
  }

  function goPrev() {
    if (index > 0) setIndex(i => i - 1)
  }

  function goNext() {
    if (index >= total - 1) setScreen('ending')
    else setIndex(i => i + 1)
  }

  // loading gate until the quiz list arrives
  if (!metas.length) {
    return (
      <div className={`${openSans.className} fixed inset-0 z-40 bg-black text-white flex items-center justify-center`}>
        <span className="text-white/60 text-lg" dir="rtl">טוען…</span>
      </div>
    )
  }

  return (
    <div className={`${openSans.className} fixed inset-0 z-40 bg-black text-white select-none`}>
      {screen === 'opening' && (
        <OpeningScreen
          quizzes={metas}
          selectedId={selectedId}
          questionsPerGame={questionsPerGame}
          starting={starting}
          onSelectQuiz={setSelectedId}
          onStart={() => startGame(selectedId)}
        />
      )}

      {screen === 'question' && total > 0 && (
        <QuestionScreen
          index={index}
          total={total}
          question={active[index]}
          revealed={opened[index] ?? false}
          result={results[index] ?? null}
          onReveal={() => setOpened(prev => prev.map((v, i) => (i === index ? true : v)))}
          onJudge={judge}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

      {screen === 'ending' && (
        <EndingScreen
          score={score}
          total={total}
          suggestions={suggestions}
          starting={starting}
          onPickSubject={startGame}
        />
      )}
    </div>
  )
}
