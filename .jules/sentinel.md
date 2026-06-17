# Security Log

## 2024-xx-xx: Prevent Sensitive Data Exposure in API Routes

**Vulnerability:** Raw `console.error` calls in catch blocks can inadvertently expose sensitive data (e.g., database stack traces, internal paths) to logging systems, which might have broader access than intended.

**Fix:** Created an environment-aware logger (`src/lib/logger.ts`) that suppresses the `error` object in non-development environments, only logging the descriptive message. Replaced raw `console.error` calls with this new `logger.error` abstraction.
