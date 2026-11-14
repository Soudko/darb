# Rules for every AI tool working on Darb

Darb (درب) is a hackathon web app: an accessibility guide for people with disabilities in Kuwait. Kuwait AI Hackathon, 14 Nov 2026. The plan and design live in a separate repository (`darb-plan`); copies of the design are in `docs/`.

## Never
- Never fake AI. Every AI result comes from a real model call at that moment, on the server, through `server/ai.ts`. No hard-coded, sample or fallback answers shown as AI. If the AI fails, show the honest error.
- Never put a key, token or password in any file. Secrets live only in `.env` (git-ignored) or Replit Secrets.
- Never invent places or facts. Only what is in `data/places.json`, each fact with its source and date; anything unchecked is "unknown".
- Never send the user's location to the server, and never store it.
- Never claim to be official or from the government. Never give medical advice. Never say a way is safe.
- Never change the fixed honesty lines in `client/src/strings/common.ts`.
- Never edit, delete or overwrite another tool's work. Stay in your task's files and report a clash instead of resolving it.

## Always
- Arabic first (right to left), English second. Every on-screen word is in `client/src/strings/`, in both languages.
- The glass UI tokens are in `client/src/styles/tokens.css`. Navy text on teal buttons; never teal `#00A8AB` text on glass.
- Touch targets at least 48px; icon-only buttons have an aria-label; colour is never the only signal.
- Run `npm test` and `npm run typecheck` before saying a task is done.

## Commands
- `npm run dev`: server on localhost:3101 and screens on localhost:5173.
- `npm run build` then `npm start`: the production-style start (one port; HOST and PORT from the environment).
- `npm test`: the tests.

## Setting names (values never in a file)
`HOST`, `PORT`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`. On Replit, when `AI_BASE_URL` is empty: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`.
