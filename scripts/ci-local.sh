#!/usr/bin/env bash
set -euo pipefail

echo "==> CI local runner (Bun)"

command -v bun >/dev/null 2>&1 || { echo "Error: bun is not installed."; echo "Install: https://bun.sh/docs/installation"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Error: docker is required to run Postgres locally."; exit 1; }

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "==> Starting Postgres (docker-compose.ci.yml)"
docker compose -f docker-compose.ci.yml up -d --wait

export POSTGRES_URL=${POSTGRES_URL:-"postgres://postgres:postgres@localhost:5432/postgres"}
echo "POSTGRES_URL=$POSTGRES_URL"

echo "==> bun install --frozen-lockfile"
bun install --frozen-lockfile

echo "==> bun run lint"
bun run lint

echo "==> Type check"
bunx tsc -p tsconfig.json --noEmit

echo "==> Build"
bun run build

echo "==> CI local run completed successfully"

