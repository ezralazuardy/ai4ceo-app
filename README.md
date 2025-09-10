<div>
  <img alt="CodeQL Analysis" src="https://github.com/lazuardytech/landing/actions/workflows/github-code-scanning/codeql/badge.svg" />
  <img alt="Vercel" src="https://deploy-badge.vercel.app?url=https://lazuardy.tech&logo=vercel&name=vercel" />
</div>

## AI4CEO App

This is a repository for the AI4CEO chatbot app. Built using [Next](https://nextjs.org/).

> This project is **NOT** licensed and all rights are reserved. <br/>
> You are not allowed to use this project for commercial purposes.

> © AI4CEO 2025. All rights reserved. <br/>
> PT Lazuardy Innovation Group. <br/> [Terms of Service](https://www.lazuardy.group/terms) | [Privacy Policy](https://www.lazuardy.group/privacy)

### Sentry

- Add your DSNs: set `SENTRY_DSN` (server) and `NEXT_PUBLIC_SENTRY_DSN` (browser) in `.env.local` (see `.env.example`).
- Set environment and release: `SENTRY_ENVIRONMENT` and `SENTRY_RELEASE` (or their `NEXT_PUBLIC_*` counterparts) if desired.
- Optional source maps upload (CI/production builds): provide `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT`. Sourcemaps upload is wired via `withSentryConfig` in `next.config.ts` and will activate when these are present.
- Runtime config files live at `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`.
