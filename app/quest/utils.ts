import type { Question } from './types'

export function getCompliment(score: number, total: number): string {
  if (total === 0) return 'לא טוב'
  if (score === total) return 'מושלם, גאונות צרופה!'
  const pct = score / total
  if (pct >= 0.8) return 'מרשים ביותר!'
  if (pct >= 0.6) return 'כל הכבוד!'
  if (pct >= 0.4) return 'יפה! יש עוד מה להשתפר'
  return 'לא משהו.. אולי כדאי פחות זמן מסך'
}

// how many questions a single game runs
export const QUESTIONS_PER_GAME = 20

// returns up to `count` questions chosen at random (Fisher–Yates shuffle, no mutation of the source)
export function pickQuestions(pool: Question[], count = QUESTIONS_PER_GAME): Question[] {
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, count)
}

// returns up to `count` quizzes other than `excludeId`, chosen at random
export function otherQuizzes<T extends { id: string }>(quizzes: T[], excludeId: string, count = 3): T[] {
  const others = quizzes.filter(q => q.id !== excludeId)
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[others[i], others[j]] = [others[j], others[i]]
  }
  return others.slice(0, count)
}
