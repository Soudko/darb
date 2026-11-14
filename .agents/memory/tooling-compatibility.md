---
name: Imported tooling compatibility
description: Why the imported app's tooling was updated without changing its Node runtime.
---

Keep the existing Node 20 runtime unless a later feature needs a newer runtime.

**Why:** The import's older test runner was blocked by the package firewall for a critical vulnerability. Updating tooling was necessary to install dependencies, but moving to the newest test-runner major also required a runtime upgrade. A supported Node-20-compatible release allowed setup without expanding into a runtime migration.

**How to apply:** When upgrading build or test tools, check their engine requirements together. Do not assume that the newest release still supports the runtime kept for this import.
