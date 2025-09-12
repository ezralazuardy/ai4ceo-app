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

## AI Provider Setup

This application supports multiple AI providers. You need to configure at least one provider to use the chat functionality.

### Azure OpenAI (Recommended)

For production deployments, Azure OpenAI is recommended for enterprise-grade reliability and compliance.

**Required Environment Variables:**
```bash
AZURE_RESOURCE_NAME=your-azure-resource-name
AZURE_API_KEY=your-azure-api-key
AZURE_API_VERSION=2024-02-01  # Optional, defaults to 2024-02-01
```

**Setup Steps:**
1. Create an Azure OpenAI resource in Azure Portal
2. Deploy required models (gpt-4.1, gpt-4.1, gpt-35-turbo)
3. Get your resource name and API key
4. Add environment variables to `.env.local`
5. Configure model mappings in the admin panel

📖 **[Complete Azure Setup Guide](./AZURE_SETUP.md)**

### Alternative Providers

**Groq (Fast inference):**
```bash
GROQ_API_KEY=your-groq-api-key
```

**Google Vertex AI:**
```bash
GOOGLE_VERTEX_PROJECT=your-gcp-project-id
GOOGLE_VERTEX_LOCATION=us-central1
GOOGLE_VERTEX_API_KEY=your-api-key  # Optional, uses ADC if not set
```

### Configuration

1. Set environment variables in `.env.local`
2. Access `/admin` as an admin user
3. Go to "Models" section
4. Select your preferred provider
5. Configure model mappings
6. Save configuration

### Sentry

- Add your DSNs: set `SENTRY_DSN` (server) and `NEXT_PUBLIC_SENTRY_DSN` (browser) in `.env.local` (see `.env.example`).
- Set environment and release: `SENTRY_ENVIRONMENT` and `SENTRY_RELEASE` (or their `NEXT_PUBLIC_*` counterparts) if desired.
- Optional source maps upload (CI/production builds): provide `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT`. Sourcemaps upload is wired via `withSentryConfig` in `next.config.ts` and will activate when these are present.
- Runtime config files live at `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`.
