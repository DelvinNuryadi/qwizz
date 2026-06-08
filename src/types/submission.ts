export interface SessionQuestion {
  id: string
  text: string
  imageUrl: string | null
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
  selectedAnswerText: string | null
  correctAnswerId: string
  correctAnswerText: string
  isCorrect: boolean
  points: number
}
