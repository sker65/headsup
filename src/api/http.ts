import { getApiKey, getBaseUrl } from './config';

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await readJsonSafe(res);
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as Record<string, unknown>).message)
        : `Request failed: ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  const data = (await readJsonSafe(res)) as T;
  return data;
}
