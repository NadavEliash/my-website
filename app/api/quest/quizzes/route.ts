import { NextResponse } from 'next/server'
import { getQuestDb } from '@/lib/quest-db'
import type { Quiz, QuizMeta } from '@/app/quest/types'

// lightweight list — no questions payload; the questions load per-quiz on demand
export async function GET() {
  try {
    const db = await getQuestDb()
    const metas = await db.collection<Quiz>('questions').aggregate<QuizMeta>([
      { $project: { _id: 0, id: 1, subject: 1, icon: 1, questionCount: { $size: { $ifNull: ['$questions', []] } } } },
    ]).toArray()
    return NextResponse.json(metas)
  } catch (e) {
    console.error('[quest/quizzes GET]', (e as Error).message)
    return NextResponse.json({ error: 'שגיאה בטעינת החידונים' }, { status: 500 })
  }
}
