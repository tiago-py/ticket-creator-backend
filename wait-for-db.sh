#!/bin/sh
set -e

export PGHOST="${PGHOST:-postgres-db.railway.internal}"
export PGPORT="${PGPORT:-5432}"
export PGUSER="${PGUSER:-appuser}"
# PGPASSWORD is expected to be provided by the environment.

TIMEOUT=60
INTERVAL=2
elapsed=0

echo "Waiting for PostgreSQL at ${PGHOST}:${PGPORT} (timeout: ${TIMEOUT}s)..."

until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" >/dev/null 2>&1; do
  if [ "$elapsed" -ge "$TIMEOUT" ]; then
    echo "Error: PostgreSQL at ${PGHOST}:${PGPORT} not ready after ${TIMEOUT}s" >&2
    exit 1
  fi
  echo "PostgreSQL not ready yet, retrying in ${INTERVAL}s (${elapsed}s elapsed)..."
  sleep "$INTERVAL"
  elapsed=$((elapsed + INTERVAL))
done

echo "PostgreSQL is ready."

npm run prisma:deploy && npm start
