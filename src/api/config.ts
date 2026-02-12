export function getBaseUrl() {
  const base = import.meta.env.VITE_BASE_URL ?? import.meta.env.BASE_URL;
  if (!base) {
    throw new Error('Missing BASE_URL (or VITE_BASE_URL) env var');
  }
  return base.replace(/\/$/, '');
}

export function getApiKey() {
  const key = import.meta.env.VITE_APIKEY ?? import.meta.env.APIKEY;
  if (!key) {
    throw new Error('Missing APIKEY (or VITE_APIKEY) env var');
  }
  return key;
}
