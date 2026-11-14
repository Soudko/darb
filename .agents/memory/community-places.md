---
name: Community places feature
description: Decisions for the user-submitted places feature (storage, moderation, honesty rules)
---
Community places live in PostgreSQL (photos as bytea); tables created in dev only, Publish applies them to production. No DDL in app code.
Always unverified; never status 'full'. Moderation endpoints need an ADMIN_TOKEN secret the user has NOT set yet (503 until then).
**Why:** no admin accounts; App Storage not set up; Autoscale disk is ephemeral.
**How to apply:** the run-and-publish-only scope was lifted by the user for this feature only. tests/server/places.test.ts reads the live DB, so leftover test submissions make it fail; delete test rows after manual testing. health test fails whenever AI env is set (known, unchanged).
