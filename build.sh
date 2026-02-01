#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  echo "Usage: $0 [tag]"
  echo "Example: $0 v1.0.0"
  exit 0
fi

TAG="${1:-latest}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}"

echo "Building backend image cortex-lab-backend:${TAG}..."
docker build -f "${ROOT_DIR}/build/Dockerfile" -t "cortex-lab-backend:${TAG}" "${ROOT_DIR}"

echo "Building frontend image cortex-lab-frontend:${TAG}..."
docker build -f "${ROOT_DIR}/build/frontend.Dockerfile" -t "cortex-lab-frontend:${TAG}" "${ROOT_DIR}"

echo "All images built successfully."
