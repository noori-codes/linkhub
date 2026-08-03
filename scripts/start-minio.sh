#!/usr/bin/env bash
# Step 1 — run a free local S3 server (MinIO) on your machine.
# No Docker, no cloud, no credit card.
#
# After this is running:
#   - S3 API:     http://127.0.0.1:9000
#   - Web console: http://127.0.0.1:9001  (login: minioadmin / minioadmin)
#
# Keep this terminal open while you upload avatars.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS="$ROOT/.tools"
DATA="$TOOLS/minio-data"
BIN="$TOOLS/minio"

mkdir -p "$TOOLS" "$DATA"

if [[ ! -x "$BIN" ]]; then
  echo "Downloading MinIO server binary (one-time)…"
  curl -fsSL \
    "https://dl.min.io/server/minio/release/linux-amd64/minio" \
    -o "$BIN"
  chmod +x "$BIN"
  echo "Saved to $BIN"
fi

export MINIO_ROOT_USER="${MINIO_ROOT_USER:-minioadmin}"
export MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-minioadmin}"

echo ""
echo "Starting MinIO…"
echo "  API:     http://127.0.0.1:9000"
echo "  Console: http://127.0.0.1:9001"
echo "  User:    $MINIO_ROOT_USER"
echo "  Pass:    $MINIO_ROOT_PASSWORD"
echo ""
echo "Leave this running. Next step = create a bucket + wire api/.env"
echo ""

exec "$BIN" server "$DATA" --address ":9000" --console-address ":9001"
