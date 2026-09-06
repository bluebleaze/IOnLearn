# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students at any level (SMA/SMP through college) whose school uses Google Classroom. They sit down with their homework pile and need the scattered assignments turned into an ordered, actionable study session. All UI copy is casual Bahasa Indonesia.

## Product Purpose

IOnLearn syncs a student's Google Classroom assignments into one to-do list and turns each open task into a curated study plan — AI-generated summary, key concepts, checklists, YouTube recommendations, sources, and strategy — plus a chatbot that can explain any task or material. Success means a student knows what to do next and actually studies from resources that fit the assignment.

## Positioning

The task list is the student's real Classroom data, not a manual planner: assignments, due dates, points, and attached materials come from their own Google Classroom, and the AI layer works on top of that real data — one assignment at a time, personalized to the user's stated learning style. A generic AI tutor sells generic study guidance; this connects AI to the actual coursework the student was assigned.

## Operating Context

- Google Classroom is the source of truth; the student signs in with Google (OAuth read scope) and syncs within a configurable date window (default 2 months).
- After sync, the app fires an AI analysis per task generating the study plan; results persist with the task.
- Attachments come through as Drive files, YouTube videos, links, and forms from Classroom course work.
- The chatbot carries task context (title, materials, analysis) so follow-ups stay grounded.
- Demo mode seeds a realistic task set so the flow can be evaluated without a Classroom account.
- The app is used in long study sessions, frequently at night — reading comfort matters (see Brand Commitments).

## Capabilities and Constraints

- Google Classroom sync (courses, course work, materials, submission state, due dates, points) via Google OAuth; read-only.
- Manual task creation as a complement to synced tasks.
- AI study plans: summary, estimated minutes, difficulty, key concepts, step checklist, sources, YouTube picks, study tips, recommended strategy.
- AI analysis and chat run through server-side API routes; provider configurable (Gemini with library key or custom key/model, or OpenAI-compatible with custom base URL/model). Default model `gemini-3.1-flash-lite`.
- User preferences: learning style, explanation detail, AI tone, sync date-range, toast position.
- Persistence: Firebase Auth (Google) + Firestore per-user; user cache route for synced data; tasks stored per user identity.
- Dark/light theme with circular reveal transition; persists per user.
- Two app surfaces: a marketing/landing page (pre-login) and the dashboard app (post-login).
- Content and demos are in Indonesian; the Classroom integration itself is locale-neutral.

## Brand Commitments

- App name is env-configurable via `NEXT_PUBLIC_APP_NAME`; shipped fallback is "Ubur Ubur", whose brand lockup stylizes the second word in the accent color. A name ending in "AI" gets the same accent treatment on the suffix.
- Tagline: "Produktivitas Akademik & Asisten Belajar". Description: "Platform produktivitas akademik terhubung Google Classroom dengan kurasi materi dan tutor AI".
- Voice: casual, encouraging Indonesian for a student audience; UI copy already committed and in place.
- User-confirmed visual constraint (dark mode): page background is a soft, near-black neutral (`#0c0c0c`) — explicitly NO pure black and NO blue- or navy-tinted black, which the user reports is hard on the eyes. Dark surfaces ruled by neutral grays (`#141414`/`#161616`/`#1f1f1f`/`#2b2b2b`), text is cool off-white (`#f5f5f5`/`#a3a3a3`/`#737373`), and accents are vivid saturated tones (indigo `#818cf8`, emerald `#34d399`, amber `#fbbf24`, rose `#f87171`, sky `#7dd3fc`) — explicitly NOT pastel.

## Evidence on Hand

- README.md: setup, architecture, Firestore security rules.
- Demo seed tasks via `ClassroomService.getInitialSeedTasks()` for the simulated-user flow.
- The full UI copy set in `src/` (Indonesian) is present and committed.
- No testimonial, case-study, or marketing assets exist; future work must not fabricate social proof.

## Product Principles

1. **The student's real assignments lead.** The list, deadlines, and materials come from Google Classroom; any feature that invents or detaches from source data is suspect.
2. **AI exists to make studying start, not to decorate the page.** Every AI output should reduce friction toward an actual study action (do the checklist, watch the video, read the source).
3. **One surface at a time.** Keep the pre-login landing page and the post-login dashboard as distinct jobs with distinct layout logic.
4. **Long-session comfort is a feature.** Reading environments are chosen to stay easy on the eyes over hours of evening study, not to look striking for a minute.
5. **Preferences and providers stay open.** Learning-style tone, sync window, and even the AI model/provider are user choices, not platform dictates.