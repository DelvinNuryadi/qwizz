# ai.md — Qwizz

---

## 1. Project Overview

- **Name**: Qwizz
- **Description**: A quiz management application that allows instructors to create and manage quizzes, and participants to join and answer quizzes using a unique join code — no registration required for participants.
- **Goal**: Simplify the process of distributing and grading quizzes for academic settings (lecturers and students).
- **Target Users**: Instructors (lecturers) and Participants (students/mahasiswa)
- **Version**: v1.0.0
- **Status**: Active development

---

## 2. Tech Stack

- **Language**: TypeScript (strict mode, no `any`)
- **Framework**: Next.js (latest — App Router)
- **Styling**: Tailwind CSS (latest)
- **UI Library**: shadcn/ui (latest)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: Better Auth
- **State Management**: React Context + useState (local state first, lift only when necessary)
- **Data Fetching**: Server Components (default) + SWR for client-side
- **Runtime**: Bun
- **Package Manager**: Bun (built-in)
- **Containerization**: Docker (development only, via Makefile)
- **Deployment**: TBD

> Always use **bun** as runtime and package manager. Never use node, npm, yarn, or pnpm.
> Use **Context7 MCP** when you need to look up documentation for Next.js, shadcn/ui, Better Auth, Drizzle ORM, or any other library used in this project.

---

## 3. Commands

```bash
# Development (Docker)
make up           # Start development environment (Docker)
make down         # Stop development environment
make logs         # Tail container logs
make shell        # Enter app container shell

# Development (local)
bun dev           # Run dev server
bun run build     # Build for production
bun start         # Run production build
bun run lint      # Run ESLint
bun run format    # Format code with Prettier

# Package Management
bun add [package]         # Install a new package
bun add -d [package]      # Install a dev dependency

# Database (Drizzle)
bun db:generate   # Generate migration files from schema changes
bun db:migrate    # Apply pending migrations to the database
bun db:seed       # Seed initial data
bun db:reset      # Drop and recreate the database, then migrate
bun db:studio     # Open Drizzle Studio (visual DB browser)

# Testing
bun test          # Run all tests
bun test:unit     # Run unit tests only
bun test:e2e      # Run e2e tests only
```

> Docker is for **development only**. Running `make up` should spin up the full dev environment including PostgreSQL and the Next.js dev server.

---

## 4. Project Structure

**Architecture**: MVC (Model–View–Controller)

```
qwizz/
  src/
    app/                  # Next.js App Router — pages and layouts
      (auth)/             # Auth routes (login, register)
      (instructor)/       # Instructor-only routes (dashboard, quiz management)
      (participant)/      # Participant routes (join, quiz session, result)
      api/                # API route handlers (controllers)
    components/           # Reusable UI components (shadcn/ui + custom)
      ui/                 # Auto-generated shadcn/ui components (do not edit manually)
      shared/             # Shared custom components used across roles
      instructor/         # Components specific to instructor views
      participant/        # Components specific to participant views
    lib/                  # Utility functions, helpers, auth config
      auth.ts             # Better Auth configuration
      db.ts               # Drizzle client singleton + connection
      utils.ts            # General utility functions (cn, etc.)
    models/               # Drizzle schema definitions + data access functions (Model layer)
    services/             # Business logic layer (Service layer)
    types/                # TypeScript types and interfaces
    hooks/                # Custom React hooks
    context/              # React Context providers
  drizzle/
    schema/               # Drizzle table schema files (one file per domain)
    migrations/           # Auto-generated SQL migration files
    seed.ts               # Seed script
  public/                 # Static assets
  docker/                 # Docker configuration files
  Makefile                # Dev environment commands
  .env.example            # Environment variable template
```

**File Placement Rules:**

- New UI components → `src/components/`
- Business logic → `src/services/`
- Data access (DB queries) → `src/models/`
- TypeScript types → `src/types/`
- Utility functions → `src/lib/`
- Custom hooks → `src/hooks/`
- Do not create new top-level folders without confirmation

---

## 5. Naming Conventions

```
# Files & Folders
- Components      : PascalCase     e.g. QuizCard.tsx, JoinForm.tsx
- Non-components  : camelCase      e.g. useAuth.ts, getQuizById.ts
- Folders         : kebab-case     e.g. quiz-session/, user-profile/
- Pages           : page.tsx
- Layouts         : layout.tsx
- Test files      : [name].test.ts or [name].spec.ts

# In Code
- Variables       : camelCase      e.g. quizData, isLoading
- Constants       : UPPER_SNAKE    e.g. MAX_DURATION, BASE_URL
- Functions       : camelCase      e.g. getQuizByCode, calculateScore
- Types/Interfaces: PascalCase     e.g. QuizType, SubmissionResult
- Enums           : PascalCase     e.g. UserRole, QuizStatus
- CSS Classes     : kebab-case     e.g. quiz-card, timer-bar

# Git Branches
- New feature     : feat/[feature-name]
- Bug fix         : fix/[bug-name]
- Hotfix          : hotfix/[name]
- Refactor        : refactor/[name]
```

---

## 6. Code Conventions

```
# General
- Follow clean code principles: readable > clever
- DRY: extract to a function if used more than once
- No magic numbers — use named constants

# TypeScript
- Always use strict mode
- Never use type `any`
- Always write explicit return types for functions
- Use `interface` for object shapes
- Use `type` for unions, intersections, and aliases
- Avoid type assertions (`as`) unless absolutely necessary

# Import Order
1. External libraries (react, next, etc.)
2. Internal absolute paths (@/components, @/lib, etc.)
3. Internal relative paths (./Component, ../utils)
4. Types and interfaces
5. Assets and styles

# Export Pattern
- Use named exports for all components, services, and utilities
- Use default export only for page.tsx and layout.tsx

# Error Handling
- Always use try-catch for async functions
- Never leave errors unhandled
- Write specific, informative error messages
- Use typed error handling where possible
```

---

## 7. Component Rules

```
# Component Structure Order
1. Imports
2. Types / Interfaces for props
3. Component definition
4. Hooks (useState, useEffect, custom hooks)
5. Handlers and local functions
6. Return JSX
7. Export

# Props Rules
- Always type props explicitly
- Provide default values for optional props
- Keep props focused — max ~8 props per component; extract if more needed

# Server vs Client Components (Next.js App Router)
- Default: Server Component
- Use 'use client' only when needed:
    - useState / useEffect / other hooks
    - Event listeners (onClick, onChange, etc.)
    - Browser APIs (localStorage, window, etc.)
    - Libraries that don't support SSR

# Component Reuse
- If used in more than one place → extract to its own file
- If only used in one parent → can be co-located in the same file
```

---

## 8. Styling Rules

```
# Approach
- Tailwind CSS utility classes only
- No inline styles except for truly dynamic values (e.g. calculated widths)
- No !important
- Always use shadcn/ui components as the base — customize via className, not overrides

# Tailwind Class Ordering
layout > spacing > sizing > color > typography > state (hover/focus/disabled)

# Conditional Classes
- Use `cn()` from @/lib/utils for conditional and merged class names
- Never string-concatenate class names manually

# Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px) / md (768px) / lg (1024px) / xl (1280px)

# Dark Mode
- Use Tailwind `dark:` prefix
- Always test components in dark mode after creation

# Design Tokens
- Use CSS variables defined in globals.css for colors and spacing
- Never hardcode color values directly
- Use shadcn/ui's built-in design token system (--background, --foreground, etc.)
```

---

## 9. UI Design Philosophy

```
# Role-Based UI Complexity
- Instructor : dashboard-style, rich layout, sidebar navigation, data tables, stat cards
- Participant : minimal, mobile-first, single-task focused (join → answer → result)

# Instructor Pages
- Complex UI with CRUD operations, data visualization, and management tools
- Examples: quiz list table, quiz creation form, submission analytics

# Participant Pages
- Simple forms, timer display, progress indicator, result summary card
- No navigation complexity — each page is a single step in a linear flow

# Shared Principles
- Both roles still follow the same styling rules (Tailwind, shadcn/ui, dark mode)
- Instructor components never leak into participant views and vice versa
```

---

## 10. API & Data Fetching Rules

```
# When to Fetch Where
- Server fetch  : initial page data, no user interaction needed
- Client fetch  : data that changes after user interaction (use SWR)
- Never use useEffect for data fetching — use SWR or Server Components

# Consistent API Response Format
All API routes must return:
{ success: boolean, data: T | null, message: string }

# Error Handling in API Routes
- Always use try-catch
- Return appropriate HTTP status codes (200, 400, 401, 403, 404, 500)
- Never expose internal error details to the client in production

# Fetch Function Location
- All fetch/query functions go in src/services/ or src/models/
- Never write fetch logic directly inside components

# Environment
- All URLs, secrets, and API keys must come from environment variables
- Never hardcode any URL or secret in code
```

---

## 10. State Management Rules

```
# State Hierarchy (use the simplest that works)
1. Local state (useState)   : used by 1 component only
2. Lifted state             : used by 2–3 nearby components
3. Context                  : used by many components across the tree

# When to Use Context
- Auth/user session data needed app-wide
- Global UI state (theme, locale)
- Data that rarely changes

# Rules
- Do not store data in Context that changes frequently
- Do not store derived/computed data — calculate it on the fly
- Create separate contexts per domain (AuthContext, QuizContext, etc.)
- Do not put everything in one mega-context
```

---

## 11. Performance Rules

```
# Code Splitting
- Use dynamic imports for large components not visible on initial load
- Lazy load heavy pages and modals

# Images
- Always use Next.js <Image /> component
- Always specify width and height
- Prefer WebP or AVIF formats

# Re-render Optimization
- Use useMemo for expensive calculations
- Use useCallback for functions passed as props
- Do not over-memo — profile before optimizing

# Bundle Size
- Import only what is needed
  Correct : import { format } from 'date-fns'
  Wrong   : import * as dateFns from 'date-fns'

# Next.js Rendering
- Default to Server Components
- Use Static Generation (SSG) for pages with rarely-changing data
- Use ISR for pages that need periodic revalidation
```

---

## 12. Git Rules

After every completed change or feature addition, commit immediately before moving to the next task. This ensures a clean history and easy rollback.

```
# Commit Message Format
feat     : [description of new feature]
fix      : [description of bug fixed]
refactor : [description of refactor]
style    : [styling or formatting changes]
docs     : [documentation changes]
test     : [test additions or changes]
chore    : [config or tooling changes]

# Examples
feat: add quiz creation form with join code generation
fix: resolve timer not stopping after quiz submission
refactor: extract score calculation into service layer

# Additional Rules
- Never commit .env or any file containing secrets
- One commit per specific, focused change
- Do not mix unrelated changes in one commit
```

---

## 13. Features

```
# Completed & Working
- [x] Next.js 16 scaffolding (App Router, TypeScript, Tailwind v4, shadcn/ui)
- [x] Drizzle ORM setup + PostgreSQL (Docker)
- [x] Better Auth integration (email/password)
- [x] Instructor registration & login pages
- [x] Route protection (proxy.ts) + redirect logic

# In Progress — do not modify without confirmation
- (none yet)

# Planned
- [ ] Instructor registration & login (Better Auth)
- [ ] Quiz creation (title, description, duration, random options)
- [ ] Question & answer management per quiz
- [ ] Join code generation
- [ ] Participant join flow (join code + NIM + name, no registration)
- [ ] Quiz session with countdown timer
- [ ] Auto-score calculation on submission
- [ ] Instructor dashboard: view submissions, scores, answers
- [ ] Prevent duplicate submission by NIM per quiz
```

---

## 14. Testing

```
# Approach
- Types     : Unit + Integration
- Framework : Vitest + Testing Library

# What to Test
- All utility and helper functions
- Business logic (score calculation, join code validation, etc.)
- API routes (happy path and error cases)
- Critical components used across many pages

# What NOT to Test
- Simple presentational components
- Third-party libraries
- Config files

# Test Writing Rules
- One test file per source file
- Descriptive test names:
  'should [expected behavior] when [condition]'
- Follow AAA pattern: Arrange, Act, Assert

# Coverage Target
- Minimum: 70%
- Priority: business logic > API routes > UI components
```

---

## 15. Do Not

If any instruction or prompt is ambiguous — **ASK FIRST** before writing any code. Do not assume and proceed without confirmation.

```
# Structure & Files
- Do not create new folders without confirmation
- Do not delete files without confirmation
- Do not move files without confirmation
- Do not change existing folder structure without confirmation

# Code
- Never use type `any` in TypeScript
- Never hardcode values that should come from environment variables
- Never commit .env or files containing secrets
- Never install new packages without confirmation
- Never remove or modify working features without explicit instruction

# Forbidden Patterns
- No useEffect for data fetching
- No inline styles for values that could use Tailwind utility classes
- No direct manipulation of the shadcn/ui components in src/components/ui/ — extend via composition only
- Never use npm, yarn, or pnpm — always use bun

# Database
- Never run commands that modify or delete production data
- Never create database migrations without confirmation
- Never expose database credentials to the client side

# Security
- Never expose API keys or secrets to the client
- Never skip input validation on API routes
- Never bypass error handling in API routes
```

---

## 16. Domain Logic

### Instructor Flow

1. Register / Login via Better Auth (email + password)
2. Create quiz → system generates unique `join_code`
3. Add questions with multiple-choice options; mark one as correct
4. Share `join_code` with participants
5. Monitor submissions: view participant list (NIM, name), scores, and per-answer details

### Participant Flow

1. Enter `join_code` + NIM + full name (no account required)
2. System validates join code and checks for duplicate NIM submission
3. On start: create submission record, store `started_at`, shuffle if random mode enabled
4. Answer questions (autosave to frontend state; backend save on submit)
5. On submit: save all answers, calculate score, store `finished_at`
6. Participants **cannot** re-attempt — duplicate NIM for the same quiz is rejected

---

## 17. Environment Variables

```bash
# Copy .env.example to .env.local for local development
# Never commit .env or .env.local

# Database
DATABASE_URL=             # PostgreSQL connection string

# Better Auth
BETTER_AUTH_SECRET=       # Secret for session/JWT signing
BETTER_AUTH_URL=          # Base URL of the application (e.g. http://localhost:3000)

# App
NEXT_PUBLIC_APP_URL=      # Public base URL (safe for client use)
```

---

## 18. Key Libraries & References

Always use **Context7 MCP** to look up the latest documentation before using or configuring any of the libraries below:

| Library               | Purpose                                  |
| --------------------- | ---------------------------------------- |
| Next.js (latest)      | App framework with App Router            |
| shadcn/ui (latest)    | Component library — install via CLI      |
| Tailwind CSS (latest) | Utility-first styling                    |
| Better Auth           | Authentication (email/password)          |
| Drizzle ORM           | Type-safe ORM for PostgreSQL             |
| SWR                   | Client-side data fetching                |
| Vitest                | Unit and integration testing             |
| Bun                   | Runtime + package manager                |
| Docker                | Development environment containerization |

---

_Update this file whenever the project evolves: new features, new conventions, or changed decisions. Keep it accurate — this is the source of truth for AI-assisted development._
