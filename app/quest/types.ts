export type Question = {
  id: string
  question: string  // the question text shown first
  answer: string    // the answer revealed after the "תשובה" button
}

export type Quiz = {
  id: string          // unique
  subject: string     // shown on the start screen and as the switch option
  icon: string        // image url (or an emoji, used by the demo data)
  questions: Question[] // the full pool — a game samples 20 at random from here
}

// lightweight quiz descriptor (no questions) — loaded up front to list/switch subjects
export type QuizMeta = {
  id: string
  subject: string
  icon: string
  questionCount?: number
}
