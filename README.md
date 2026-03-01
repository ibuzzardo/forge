# forge

Forge is a full-stack Next.js 14 client portal for Dark Factory project intake and real-time build tracking.

## Features

- Project Brief Submission page with guided multi-step form
- Build Tracker Dashboard with 6-stage pipeline timeline
- Live SSE event stream with reconnect-safe `id` replay
- Real-time stats and log feed
- In-memory storage for briefs, stages, logs, and stats
- Zod request validation and structured API error responses

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- shadcn-style UI primitives
- Zod validation
- Vitest + Playwright tests

## Setup

1. Install dependencies:
   `npm install`
2. Create env file:
   `cp .env.example .env.local`
3. Run dev server:
   `npm run dev`

## Environment Variables

Defined in `.env.example`:

- `NEXT_PUBLIC_APP_NAME`
- `PIPELINE_STAGE_MIN_MS`
- `PIPELINE_STAGE_MAX_MS`
- `PIPELINE_TICK_MS`
- `PROJECT_TTL_MS`

## Routes

### Pages

- `/` Project Brief Submission
- `/tracker/[projectId]` Build Tracker Dashboard

### API

- `POST /api/projects` create project brief
- `GET /api/projects/[projectId]` fetch project
- `GET /api/projects/[projectId]/stats` fetch stats
- `POST /api/projects/[projectId]/pipeline/start` start simulation pipeline
- `GET /api/projects/[projectId]/events` SSE stream (heartbeat + replay + disconnect cleanup)

## Architecture

- `src/lib/store/in-memory-store.ts`: in-memory project state
- `src/lib/store/event-bus.ts`: project-scoped pub/sub and event replay buffers
- `src/lib/pipeline/simulation-engine.ts`: orchestrates 6-stage execution and emits stage/log/stats events
- `src/app/api/projects/*`: HTTP + SSE handlers with validation and typed envelopes
- `src/components/project-brief/*`: form flow UI
- `src/components/build-tracker/*`: dashboard visualization and live updates

## Testing

- Unit tests: `npm run test:unit`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`

## Persistence Notes

Data is in-memory only and resets on process restart. For local reset, restart the dev server.
