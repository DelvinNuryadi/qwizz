export interface SessionQuestion {
  id: string
  text: string
  points: number
  answers: SessionAnswer[]
}

export interface SessionAnswer {
  id: string
  text: string
}

export interface SubmissionResult {
  id: string
  score: number
  totalPoints: number
  submittedAt: Date
  answers: SubmissionAnswerResult[]
}

export interface SubmissionAnswerResult {
  questionId: string
  questionText: string
  selectedAnswerId: string | null
  correctAnswerId: string
  isCorrect: boolean
  points: number
}
