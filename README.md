# Qwizz

A quiz management application for academic settings. Instructors can create and manage quizzes, while participants can join and answer using a unique join code — no registration required.

## Tech Stack

- **Language:** TypeScript (strict)
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Auth:** Better Auth
- **Runtime & Package Manager:** Bun
- **Containerization:** Docker (development only)

## Prerequisites

- [Bun](https://bun.sh) installed
- PostgreSQL running (local or Docker)
- Docker (optional, for containerized dev)

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd qwizz
bun install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable              | Description                        |
| --------------------- | ---------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string       |
| `BETTER_AUTH_SECRET`  | Secret for session/JWT signing     |
| `BETTER_AUTH_URL`     | Base URL of the app                |
| `NEXT_PUBLIC_APP_URL` | Public base URL (client-safe)      |

### 3. Database Setup

```bash
bun db:generate    # Generate migrations
bun db:migrate     # Apply migrations
bun db:seed        # Seed initial data (optional)
```

### 4. Run

#### Option A — Local

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

#### Option B — Docker

```bash
make up
```

## Available Commands

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `make up`           | Start Docker dev environment      |
| `make down`         | Stop Docker dev environment       |
| `bun dev`           | Run dev server                    |
| `bun run build`     | Build for production              |
| `bun run lint`      | Run ESLint                        |
| `bun run format`    | Format code with Prettier         |
| `bun db:generate`   | Generate Drizzle migrations       |
| `bun db:migrate`    | Apply migrations                  |
| `bun db:seed`       | Seed database                     |
| `bun db:reset`      | Drop + recreate + migrate         |
| `bun db:studio`     | Open Drizzle Studio               |
| `bun test`          | Run tests                         |

## Features

- Instructor registration & login (Better Auth)
- Quiz creation with title, description, duration, optional random order
- Question & answer management per quiz
- Unique join code generation per quiz
- Participant join flow — join code + NIM + name (no registration)
- Quiz session with live countdown timer
- Auto-score calculation on submission
- Instructor dashboard — view submissions, scores, and per-answer details
- Duplicate NIM prevention per quiz

## License

MIT
