export interface JoinQuizInput {
  joinCode: string
  nim: string
  name: string
}

export interface ParticipantData {
  id: string
  quizId: string
  nim: string
  name: string
}
