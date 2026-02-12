#!/usr/bin/env sh
set -eu

: "${BASE_URL:=${VITE_BASE_URL:-}}"
: "${APIKEY:=${VITE_APIKEY:-}}"

if [ -z "${BASE_URL}" ]; then
  echo "ERROR: BASE_URL is required" >&2
  exit 1
fi

if [ -z "${APIKEY}" ]; then
  echo "ERROR: APIKEY is required" >&2
  exit 1
fi

cat >/usr/share/nginx/html/config.js <<EOF
window.__HEADSUP_CONFIG__ = {
  BASE_URL: "${BASE_URL}",
  APIKEY: "${APIKEY}",
};
EOF

exec nginx -g 'daemon off;'
