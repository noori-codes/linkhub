#!/usr/bin/env bash
# Step 2 — create the "linkhub" bucket and allow public image reads.
# Requires MinIO already running (./scripts/start-minio.sh).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS="$ROOT/.tools"
MC="$TOOLS/mc"
ENDPOINT="${S3_ENDPOINT:-http://127.0.0.1:9000}"
USER="${S3_ACCESS_KEY_ID:-minioadmin}"
PASS="${S3_SECRET_ACCESS_KEY:-minioadmin}"
BUCKET="${S3_BUCKET:-linkhub}"

mkdir -p "$TOOLS"

if [[ ! -x "$MC" ]]; then
  echo "Downloading MinIO client (mc)…"
  curl -fsSL "https://dl.min.io/client/mc/release/linux-amd64/mc" -o "$MC"
  chmod +x "$MC"
fi

echo "Waiting for MinIO at $ENDPOINT …"
for i in $(seq 1 30); do
  if curl -sf "$ENDPOINT/minio/health/live" >/dev/null; then
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    echo "MinIO is not running. Start it first:"
    echo "  ./scripts/start-minio.sh"
    exit 1
  fi
  sleep 1
done

"$MC" alias set linkhub-local "$ENDPOINT" "$USER" "$PASS" --api S3v4 >/dev/null

if "$MC" ls "linkhub-local/$BUCKET" >/dev/null 2>&1; then
  echo "Bucket '$BUCKET' already exists."
else
  echo "Creating bucket '$BUCKET'…"
  "$MC" mb "linkhub-local/$BUCKET"
fi

# So <img src="…"> works in the browser without signed URLs
"$MC" anonymous set download "linkhub-local/$BUCKET"

echo ""
echo "Done. Bucket is ready for avatar uploads."
echo "Restart the API if it was already running, then try Upload from computer."
echo ""
