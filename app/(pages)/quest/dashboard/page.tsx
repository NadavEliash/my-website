'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { openSans } from '@/app/quest/fonts'
import type { Question, Quiz, QuizMeta } from '@/app/quest/types'

export default function QuestDashboard() {
  const [metas, setMetas] = useState<QuizMeta[]>([])
  const [draft, setDraft] = useState<Quiz | null>(null) // the quiz currently being edited
  const [loadingList, setLoadingList] = useState(true)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  async function loadList() {
    setLoadingList(true)
    try {
      const res = await fetch('/api/quest/quizzes')
      const data = await res.json()
      setMetas(Array.isArray(data) ? data : [])
    } catch {
      setMetas([])
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => { loadList() }, [])

  // auto-dismiss the status message after 5 seconds
  useEffect(() => {
    if (!status) return
    const t = setTimeout(() => setStatus(null), 3000)
    return () => clearTimeout(t)
  }, [status])

  async function selectQuiz(id: string) {
    setStatus(null)
    setLoadingQuiz(true)
    try {
      const res = await fetch(`/api/quest/quizzes/${id}`)
      if (!res.ok) throw new Error()
      setDraft(await res.json())
    } catch {
      setStatus({ kind: 'err', text: 'שגיאה בטעינת החידון' })
    } finally {
      setLoadingQuiz(false)
    }
  }

  function newQuiz() {
    setStatus(null)
    setDraft({ id: crypto.randomUUID(), subject: '', icon: '', questions: [] })
  }

  function patchDraft(patch: Partial<Quiz>) {
    setDraft(d => (d ? { ...d, ...patch } : d))
  }

  function patchQuestion(i: number, patch: Partial<Question>) {
    setDraft(d => (d ? { ...d, questions: d.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) } : d))
  }

  function addQuestion() {
    setDraft(d => (d ? { ...d, questions: [...d.questions, { id: crypto.randomUUID(), question: '', answer: '' }] } : d))
  }

  function removeQuestion(i: number) {
    setDraft(d => (d ? { ...d, questions: d.questions.filter((_, idx) => idx !== i) } : d))
  }

  async function save() {
    if (!draft) return
    if (!draft.subject.trim()) { setStatus({ kind: 'err', text: 'יש להזין נושא' }); return }
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch(`/api/quest/quizzes/${draft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error()
      setStatus({ kind: 'ok', text: 'נשמר בהצלחה' })
      await loadList()
    } catch {
      setStatus({ kind: 'err', text: 'שגיאה בשמירה' })
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!draft) return
    if (!window.confirm(`למחוק את החידון "${draft.subject || 'ללא שם'}"?`)) return
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch(`/api/quest/quizzes/${draft.id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 404) throw new Error()
      setDraft(null)
      await loadList()
    } catch {
      setStatus({ kind: 'err', text: 'שגיאה במחיקה' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`${openSans.className} min-h-screen bg-gray-50 text-gray-900`} dir="rtl">
      <header className="bg-gray-900 text-white px-6 py-5">
        <h1 className="text-2xl font-extrabold">ניהול חידונים</h1>
        <p className="text-gray-400 text-sm mt-1">הוספה, עריכה ומחיקה של חידונים ושאלות</p>
      </header>

      <div className="flex flex-col md:flex-row max-w-5xl mx-auto p-4 gap-4">
        {/* quiz list */}
        <aside className="md:w-64 shrink-0 bg-white rounded-xl border border-gray-100 p-3 h-fit">
          <button
            onClick={newQuiz}
            className="w-full flex items-center justify-center gap-1.5 bg-gray-900 text-white font-bold rounded-lg py-2.5 text-sm hover:bg-gray-800 transition"
          >
            <Plus size={16} /> חידון חדש
          </button>

          <div className="mt-3 space-y-1">
            {loadingList ? (
              <p className="text-gray-400 text-sm text-center py-6">טוען…</p>
            ) : metas.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">אין חידונים עדיין</p>
            ) : (
              metas.map(m => (
                <button
                  key={m.id}
                  onClick={() => selectQuiz(m.id)}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-right transition ${
                    draft?.id === m.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <span className="flex-1 text-sm font-medium truncate">{m.subject}</span>
                  <span className={`text-xs ${draft?.id === m.id ? 'text-gray-300' : 'text-gray-400'}`}>{m.questionCount ?? 0}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* editor */}
        <main className="flex-1 min-w-0">
          {!draft ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
              {loadingQuiz ? 'טוען…' : 'בחרו חידון מהרשימה או צרו חידון חדש'}
            </div>
          ) : (
            <div className="space-y-4">
              {/* quiz meta */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-medium text-gray-500 mb-1.5">אייקון</label>
                  <div className="w-full flex gap-2 items-center">
                    <div className="w-9 h-9 shrink-0 border-2 border-gray-300 rounded-full flex items-center justify-center overflow-hidden text-lg">
                      {/^(https?:|\/)/.test(draft.icon) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={draft.icon} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{draft.icon || '🧠'}</span>
                      )}
                    </div>
                    <input
                      value={draft.icon}
                      onChange={e => patchDraft({ icon: e.target.value })}
                      placeholder="🧠"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-left text-xs focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">נושא</label>
                    <input
                      value={draft.subject}
                      onChange={e => patchDraft({ subject: e.target.value })}
                      placeholder="למשל: טריוויה כללית"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* questions */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-700">שאלות ({draft.questions.length})</h2>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    <Plus size={15} /> הוסף שאלה
                  </button>
                </div>

                {draft.questions.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">{'אין שאלות. לחצו על "הוסף שאלה".'}</p>
                ) : (
                  <div className="space-y-3">
                    {draft.questions.map((q, i) => (
                      <div key={q.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-400">שאלה {i + 1}</span>
                          <button
                            onClick={() => removeQuestion(i)}
                            className="text-red-400 hover:text-red-600 transition"
                            aria-label="מחק שאלה"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <textarea
                          value={q.question}
                          onChange={e => patchQuestion(i, { question: e.target.value })}
                          placeholder="נוסח השאלה"
                          rows={2}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 resize-y focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <textarea
                          value={q.answer}
                          onChange={e => patchQuestion(i, { answer: e.target.value })}
                          placeholder="התשובה"
                          rows={2}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* actions */}
              {status && (
                  <span className={`fixed bottom-16 right-[50%] translate-x-1/2 block text-sm font-medium ${status.kind === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                    {status.text}
                  </span>
                )}
              <div className="flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gray-900 text-white font-bold rounded-lg px-5 py-2.5 text-sm hover:bg-gray-800 disabled:opacity-60 transition"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  שמירה
                </button>
                <button
                  onClick={remove}
                  disabled={saving}
                  className="flex items-center gap-2 border border-red-200 text-red-600 font-bold rounded-lg px-5 py-2.5 text-sm hover:bg-red-50 disabled:opacity-60 transition"
                >
                  <Trash2 size={16} /> מחיקה
                </button>
                <button
                    onClick={addQuestion}
                    className="flex items-center gap-1 text-sm border border-gray-200 px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:text-gray-900"
                  >
                    <Plus size={15} /> הוספה
                  </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
