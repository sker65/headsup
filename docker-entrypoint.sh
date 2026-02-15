#!/usr/bin/env sh
set -eu

: "${BASE_URL:=${VITE_BASE_URL:-}}"
: "${APIKEY:=${VITE_APIKEY:-}}"
: "${BASIC_AUTH_USER:=${HEADSUP_BASIC_AUTH_USER:-}}"
: "${BASIC_AUTH_PASS:=${HEADSUP_BASIC_AUTH_PASS:-}}"

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

if [ -n "${BASIC_AUTH_USER}" ] || [ -n "${BASIC_AUTH_PASS}" ]; then
  if [ -z "${BASIC_AUTH_USER}" ] || [ -z "${BASIC_AUTH_PASS}" ]; then
    echo "ERROR: BASIC_AUTH_USER and BASIC_AUTH_PASS must both be set to enable basic auth" >&2
    exit 1
  fi

  if command -v htpasswd >/dev/null 2>&1; then
    htpasswd -bc /etc/nginx/.htpasswd "${BASIC_AUTH_USER}" "${BASIC_AUTH_PASS}" >/dev/null 2>&1
  else
    echo "ERROR: htpasswd not found in image; cannot enable basic auth" >&2
    exit 1
  fi

  cp /etc/nginx/conf.d/auth.conf /etc/nginx/conf.d/default.conf
fi

exec nginx -g 'daemon off;'
