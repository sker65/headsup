export function getBaseUrl() {
  const w = window as Window & {
    __HEADSUP_CONFIG__?: { BASE_URL?: string; APIKEY?: string };
  };
  const runtimeBase = typeof window !== 'undefined' ? w.__HEADSUP_CONFIG__?.BASE_URL : undefined;
  const base = runtimeBase || import.meta.env.VITE_BASE_URL || import.meta.env.BASE_URL;
  if (!base) {
    throw new Error('Missing BASE_URL (or VITE_BASE_URL) env var');
  }
  return base.replace(/\/$/, '');
}

export function getApiKey() {
  const w = window as Window & {
    __HEADSUP_CONFIG__?: { BASE_URL?: string; APIKEY?: string };
  };
  const runtimeKey = typeof window !== 'undefined' ? w.__HEADSUP_CONFIG__?.APIKEY : undefined;
  const key = runtimeKey || import.meta.env.VITE_APIKEY || import.meta.env.APIKEY;
  if (!key) {
    throw new Error('Missing APIKEY (or VITE_APIKEY) env var');
  }
  return key;
}
