# Darb (درب)

Your smart guide to easy access for people with disabilities in Kuwait.
Kuwait AI Hackathon, 14 Nov 2026. The plan pack lives in a separate repository (`darb-plan`). Rules for every AI tool: `AGENTS.md`.

## What works now (Milestone 3)
- Glass UI shell in Arabic (right to left) and English: splash, onboarding, needs, home, accessibility settings, about.
- Places from `data/places.json`: map (Leaflet + OpenStreetMap), filters with a live count, place details with each fact's source and date.
- **Feature 1, the adaptive AI assistant:** suggests up to three places that suit your needs, says why, and shows the checked facts with their sources. Unknown place → "Darb has no information about this place yet." Medical question → "This is not medical advice."

## Commands
- `npm install`, then `npm run dev` (server on localhost:3101, screens on localhost:5173)
- `npm run build`, then `npm start` (one server; HOST and PORT from the environment; on Replit it listens on 0.0.0.0)
- `npm test`, `npm run typecheck`

## AI settings (names only; values in `.env` or Replit Secrets, never in a file)
First match wins:
1. `AI_BASE_URL` set to another server (for example LM Studio): that server, with `AI_API_KEY` if it needs one. The OpenAI key is never sent there.
2. `OPENAI_API_KEY` (or a real `AI_API_KEY`): OpenAI, model `gpt-6-luna` unless `AI_MODEL` names another.
3. Replit AI Integrations: `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`.

A placeholder key such as `PASTE_KEY_HERE` counts as not set. Without a real key the app says honestly that the AI is not switched on. A wrong key, no credit or a wrong model name each show their own message.

## Adding places
See `data/README.md`. Only checked facts, each with its source and date. Anything unchecked is "unknown".
