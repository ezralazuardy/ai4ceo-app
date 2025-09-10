import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // Read DSN strictly from public env; do not fallback to server DSN in the client bundle
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
    process.env.SENTRY_ENVIRONMENT ||
    'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.SENTRY_RELEASE,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  replaysSessionSampleRate: Number(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? 0.0),
  replaysOnErrorSampleRate: Number(process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? 1.0),
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
})
