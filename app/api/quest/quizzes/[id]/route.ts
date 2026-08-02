import { NextResponse } from 'next/server'
import { getQuestDb } from '@/lib/quest-db'
import type { Quiz } from '@/app/quest/types'

// returns a single quiz including its full questions array (loaded when a game starts)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const db = await getQuestDb()
    const quiz = await db.collection<Quiz>('questions').findOne({ id }, { projection: { _id: 0 } })
    if (!quiz) return NextResponse.json({ error: 'החידון לא נמצא' }, { status: 404 })
    return NextResponse.json(quiz)
  } catch (e) {
    console.error('[quest/quizzes/[id] GET]', (e as Error).message)
    return NextResponse.json({ error: 'שגיאה בטעינת החידון' }, { status: 500 })
  }
}

// create or update a quiz (used by the management page)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    // sanitise into a clean document — the id always comes from the URL
    const quiz: Quiz = {
      id,
      subject: String(body?.subject ?? '').trim(),
      icon: String(body?.icon ?? '').trim(),
      questions: Array.isArray(body?.questions)
        ? body.questions.map((q: { id?: string; question?: string; answer?: string }) => ({
            id: String(q?.id || crypto.randomUUID()),
            question: String(q?.question ?? '').trim(),
            answer: String(q?.answer ?? '').trim(),
          }))
        : [],
    }
    if (!quiz.subject) return NextResponse.json({ error: 'יש להזין נושא' }, { status: 400 })

    const db = await getQuestDb()
    await db.collection<Quiz>('questions').replaceOne({ id }, quiz, { upsert: true })
    return NextResponse.json(quiz)
  } catch (e) {
    console.error('[quest/quizzes/[id] PUT]', (e as Error).message)
    return NextResponse.json({ error: 'שגיאה בשמירת החידון' }, { status: 500 })
  }
}

// delete a quiz
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const db = await getQuestDb()
    const { deletedCount } = await db.collection<Quiz>('questions').deleteOne({ id })
    if (!deletedCount) return NextResponse.json({ error: 'החידון לא נמצא' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[quest/quizzes/[id] DELETE]', (e as Error).message)
    return NextResponse.json({ error: 'שגיאה במחיקת החידון' }, { status: 500 })
  }
}
