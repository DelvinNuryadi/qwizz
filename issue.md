# Quiz Session with Countdown Timer

## Latar Belakang

Participant sudah bisa join quiz, tapi belum bisa mengerjakan soal. Perlu halaman session dengan countdown timer, tampilan soal, submit jawaban, dan hasil.

## Alur

1. Participant di `/quiz/[id]` klik **Start Quiz**
2. Server buat record `submission` dengan `started_at = now()`
3. Redirect ke `/quiz/[id]/session`
4. Tampilkan semua soal + timer countdown
5. Timer auto-submit ketika habis
6. Klik **Submit** → server hitung score → redirect ke `/quiz/[id]/result`
7. Halaman result tampilkan score + jawaban benar/salah

## Tugas

### 1. Types — `src/types/submission.ts`

```ts
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
```

### 2. Model — `src/models/submission.ts`

| Fungsi | Deskripsi |
|--------|-----------|
| `getSubmissionByParticipant(participantId, quizId)` | Cek submission exist |
| `createSubmission(participantId, quizId)` | Insert submission, return |
| `submitSubmission(id, answers[])` | Insert submission_answers, hitung score, update submitted_at |
| `getSubmissionResult(submissionId)` | Return submission + answers + correct answers untuk result |

### 3. Model — fix `src/models/question.ts`

Fix bug di `getQuestionsByQuizId`: answer query hanya pakai `questions[0].id`, harus pakai `inArray` untuk semua question IDs.

### 4. Server Actions — `src/app/(participant)/quiz/[id]/actions.ts`

| Action | Deskripsi |
|--------|-----------|
| `startQuizAction(quizId)` | Validasi session → buat submission → redirect ke session |
| `submitQuizAction(submissionId, formData)` | Validasi → insert jawaban → hitung score → redirect ke result |

### 5. Halaman Session — `src/app/(participant)/quiz/[id]/session/page.tsx`

Server component: validasi session + submission → render `QuizSessionView` client component.

Data passing ke client:
```ts
{ questions: SessionQuestion[], submissionId: string, startedAt: string, duration: number }
```

### 6. Component — `src/components/participant/QuizSessionView.tsx`

Client component dengan:
- **Countdown timer** — setInterval tiap detik, hitung mundur dari `startedAt + duration`
- **Daftar soal** — radio button per jawaban
- **Progress** — "Question X of Y answered"
- **Submit button** — dengan confirm dialog
- **Auto-submit** — ketika timer = 0, submit otomatis

### 7. Halaman Result — `src/app/(participant)/quiz/[id]/result/page.tsx`

Server component: validasi session + submission → tampilkan score.

Tampilkan:
- Score (X / Y)
- Per question: correct/incorrect, jawaban benar, jawaban user

### 8. Update — `src/app/(participant)/quiz/[id]/page.tsx`

"Start Quiz" button → `<form action={startQuizAction}>`

### 9. Struktur File

```
src/
  types/
    submission.ts                         # NEW
  models/
    submission.ts                         # NEW
    question.ts                           # FIX (bug query answer)
  app/(participant)/quiz/[id]/
    actions.ts                            # NEW
    session/
      page.tsx                            # NEW
    result/
      page.tsx                            # NEW
  components/
    participant/
      QuizSessionView.tsx                 # NEW
```

## Catatan Teknis

- `is_correct` tidak boleh dikirim ke client (cegah cheating)
- Score dihitung server-side: jumlah points dari jawaban benar
- Timer di client menggunakan `startedAt` dari server + `duration` — hitung selisih
- Auto-submit panggil server action yang sama dengan submit manual
- Jika sudah ada submission yang submitted, redirect ke result
- Jika session dibuka lagi sebelum submit, resume (timer lanjut dari sisa waktu)

## Checklist

- [ ] Buat `src/types/submission.ts`
- [ ] Buat `src/models/submission.ts`
- [ ] Fix `src/models/question.ts` — bug inArray answers
- [ ] Buat `src/app/(participant)/quiz/[id]/actions.ts`
- [ ] Buat `src/components/participant/QuizSessionView.tsx`
- [ ] Buat `src/app/(participant)/quiz/[id]/session/page.tsx`
- [ ] Buat `src/app/(participant)/quiz/[id]/result/page.tsx`
- [ ] Update `src/app/(participant)/quiz/[id]/page.tsx`
- [ ] Build & lint
- [ ] Commit: `feat: add quiz session with countdown timer`
