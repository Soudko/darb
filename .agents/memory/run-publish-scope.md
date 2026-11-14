---
name: Run and publish scope
description: The user's limits for running and publishing the finished Darb app.
---

Darb is an existing, finished app. Only run and publish it. Do not change, rewrite, reformat, or improve code, screens, wording, or AI prompts. Do not add packages, a database, accounts, or features. If something does not work, tell the user and stop; do not fix it.

**Why:** The user explicitly instructed this scope.

**How to apply:** Use `npm install`, `npm run build && npm start` for the workspace run, and deployment build `npm install && npm run build` with run `npm start`. Configure only the requested run, publishing, and environment settings. Use Replit AI Integrations for OpenAI and leave `AI_BASE_URL` and `AI_API_KEY` unset. Never print, show, or write a key.
