# Running Darb on Replit

The imported React, Vite, and Express project keeps its existing structure.

- Use the **Start application** workflow (`npm run dev`).
- Vite serves the preview on `0.0.0.0:5000` and proxies `/api` to Express on port 3101.
- The workflow explicitly sets the backend's `HOST` and `PORT` so it cannot conflict with the preview port.
- Checks: `npm test`, `npm run typecheck`, and `npm run build`.
- For a production-style run: `npm run build`, then `HOST=0.0.0.0 PORT=5000 npm start`.

## AI configuration

Place browsing and maps do not need AI credentials. The assistant honestly reports that AI is not set up until a provider is configured.

Use Replit Secrets for `AI_BASE_URL`, `AI_API_KEY`, and optionally `AI_MODEL` (default: `gpt-4.1-mini`). The base URL must be an OpenAI-compatible API endpoint, including `/v1` when required by the provider.

Alternatively, the existing helper supports Replit-managed `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` when that integration is available and `AI_BASE_URL` is unset.

Never put credential values in source files. Follow `AGENTS.md` for product, accessibility, and honesty requirements.
