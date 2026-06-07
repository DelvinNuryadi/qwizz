export interface CreateQuizInput {
  title: string
  description?: string
  duration: number
  randomOrder?: boolean
}

export interface UpdateQuizInput {
  title?: string
  description?: string
  duration?: number
  randomOrder?: boolean
}

export interface QuizWithCounts {
  id: string
  title: string
  description: string | null
  joinCode: string
  duration: number
  randomOrder: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
  questionCount: number
  participantCount: number
}
