#!/usr/bin/env bash
# Run the demo spec (tests/e2e-demo) against the demo image: the only way to see
# the seeded data, the gate and the banner together as a visitor does.
#
#     make test-e2e-demo            # builds the image from the working tree
#     IMAGE=... make test-e2e-demo  # or runs one that already exists
set -euo pipefail

cd "$(dirname "$0")/.."

CONTAINER="schellingboard-demo-e2e-$$"

if [ -n "${IMAGE:-}" ]; then
  echo "==> Using existing image $IMAGE"
else
  APP_VERSION="${APP_VERSION:-$(bun scripts/app-version.js)}"
  IMAGE="schellingboard-demo-e2e:$APP_VERSION"
  echo "==> Building $IMAGE"
  docker build --target demo --build-arg "APP_VERSION=$APP_VERSION" -t "$IMAGE" . >&2
fi

PORT="$(bun -e 'const s=require("net").createServer();s.listen(0,()=>{process.stdout.write(String(s.address().port));s.close();})')"
BASE_URL="http://localhost:$PORT"

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    docker logs --tail 50 "$CONTAINER" >&2 2>&1 || true
  fi
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run -d --name "$CONTAINER" --memory 512m -p "127.0.0.1:$PORT:3000" \
  -e "AUTH_SECRET=$(bun -e 'process.stdout.write(crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", ""))')" \
  -e "SITE_URL=$BASE_URL" \
  "$IMAGE" >/dev/null

echo "==> Waiting for the demo to seed and start"
for _ in $(seq 1 120); do
  if curl -fsS "$BASE_URL/api/health" >/dev/null 2>&1; then
    ready=1
    break
  fi
  if [ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER")" != "true" ]; then
    echo "Container exited before becoming healthy" >&2
    exit 1
  fi
  sleep 1
done
if [ -z "${ready:-}" ]; then
  echo "Demo did not answer $BASE_URL/api/health within 120s" >&2
  exit 1
fi

E2E_PORT="$PORT" bun x playwright test -c playwright.demo.config.ts "$@"
