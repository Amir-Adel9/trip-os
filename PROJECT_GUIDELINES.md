# Trip OS – Project Engineering Guidelines

## 1. Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Bun as the package manager
- Convex for backend/state
- Botpress for AI orchestration
- ElevenLabs for TTS
- lucide-react for icons

## 2. Architectural Principles
- Everything revolves around a single `tripState` object.
- UI does not generate business logic; AI (Botpress) generates tripState updates.
- Convex stores/updates the authoritative tripState document.
- Frontend is read-only except for sending commands to Botpress or mutating Convex via approved hooks.
- No hidden global state; use typed hooks and explicit providers.

## 3. UI/UX Philosophy
- "AI Operating System" aesthetic:
  - Dark mode only
  - Large, intentional spacing
  - Calm OS-style panels, not dashboard widgets
  - System-log feel, no chat bubbles
- Two primary UI states:
  1) Hero input state  
  2) OS dashboard (3-column layout)

## 4. Code Style Rules
- TypeScript strict mode required.
- Use React server components unless client state is required.
- Keep components pure; no side effects in render.
- Always isolate AI/Convex mutations in functions (e.g., `useAdjustTrip()`, `useCreateTrip()`).
- Avoid huge components; extract reusable UI pieces.
- Absolute imports using `@/` paths.

## 5. File/Folder Structure
- `app/` — Routes and layout
- `components/` — UI components
- `lib/` — Helpers, schema, types
- `convex/` — Convex schema, functions, client
- `services/` — Botpress, ElevenLabs integrations
- `hooks/` — Trip-specific client logic
- `types/` — Shared TypeScript types

## 6. AI Interaction Rules
- Frontend sends only natural language commands + current tripState.
- Botpress returns structured TripState JSON.
- All modifications replace or patch Convex tripState.
- Avoid conversational back-and-forth; Trip OS is command-driven.

## 7. Clean Code Commit Rules
- Keep changes small and focused.
- Write descriptive commit messages.
- Never commit dead code or unused components.
- If a feature is experimental, prefix folder with `_experimental/`.

## 8. Performance Guidelines
- Prefer streaming AI responses when possible.
- Avoid unnecessary re-renders; memoize when useful.
- Use Tailwind classes, avoid inline styles.
