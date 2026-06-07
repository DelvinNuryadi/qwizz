export interface AnswerInput {
  text: string
  isCorrect: boolean
  order: number
}

export interface QuestionInput {
  text: string
  points: number
  answers: AnswerInput[]
}

export interface QuestionWithAnswers {
  id: string
  quizId: string
  text: string
  order: number
  points: number
  createdAt: Date
  updatedAt: Date
  answers: AnswerWithQuestionId[]
}

export interface AnswerWithQuestionId {
  id: string
  questionId: string
  text: string
  isCorrect: boolean
  order: number
}
