import { apiFetch } from './http';
import type {
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  CreatePreAuthKeyRequest,
  CreatePreAuthKeyResponse,
  CreateUserRequest,
  CreateUserResponse,
  GetPolicyResponse,
  HealthResponse,
  ListApiKeysResponse,
  ListNodesResponse,
  ListPreAuthKeysResponse,
  ListUsersResponse,
  SetPolicyRequest,
  SetPolicyResponse,
} from './types';

export const headscaleApi = {
  health: () => apiFetch<HealthResponse>('/api/v1/health'),

  listUsers: (params?: { id?: string; name?: string; email?: string }) => {
    const sp = new URLSearchParams();
    if (params?.id) sp.set('id', params.id);
    if (params?.name) sp.set('name', params.name);
    if (params?.email) sp.set('email', params.email);
    const qs = sp.toString();
    return apiFetch<ListUsersResponse>(`/api/v1/user${qs ? `?${qs}` : ''}`);
  },
  createUser: (body: CreateUserRequest) =>
    apiFetch<CreateUserResponse>('/api/v1/user', { method: 'POST', body: JSON.stringify(body) }),
  deleteUser: (id: string) =>
    apiFetch<Record<string, never>>(`/api/v1/user/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  renameUser: (oldId: string, newName: string) =>
    apiFetch<Record<string, never>>(
      `/api/v1/user/${encodeURIComponent(oldId)}/rename/${encodeURIComponent(newName)}`,
      { method: 'POST' },
    ),

  listNodes: (params?: { user?: string }) => {
    const sp = new URLSearchParams();
    if (params?.user) sp.set('user', params.user);
    const qs = sp.toString();
    return apiFetch<ListNodesResponse>(`/api/v1/node${qs ? `?${qs}` : ''}`);
  },
  deleteNode: (nodeId: string) =>
    apiFetch<Record<string, never>>(`/api/v1/node/${encodeURIComponent(nodeId)}`, { method: 'DELETE' }),
  expireNode: (nodeId: string, expiry?: string) => {
    const sp = new URLSearchParams();
    if (expiry) sp.set('expiry', expiry);
    const qs = sp.toString();
    return apiFetch<Record<string, never>>(
      `/api/v1/node/${encodeURIComponent(nodeId)}/expire${qs ? `?${qs}` : ''}`,
      { method: 'POST' },
    );
  },
  renameNode: (nodeId: string, newName: string) =>
    apiFetch<Record<string, never>>(
      `/api/v1/node/${encodeURIComponent(nodeId)}/rename/${encodeURIComponent(newName)}`,
      { method: 'POST' },
    ),

  listPreAuthKeys: () => apiFetch<ListPreAuthKeysResponse>('/api/v1/preauthkey'),
  createPreAuthKey: (body: CreatePreAuthKeyRequest) =>
    apiFetch<CreatePreAuthKeyResponse>('/api/v1/preauthkey', { method: 'POST', body: JSON.stringify(body) }),
  deletePreAuthKey: (id: string) =>
    apiFetch<Record<string, never>>(`/api/v1/preauthkey?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
  expirePreAuthKey: (id: string) =>
    apiFetch<Record<string, never>>('/api/v1/preauthkey/expire', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),

  listApiKeys: () => apiFetch<ListApiKeysResponse>('/api/v1/apikey'),
  createApiKey: (body: CreateApiKeyRequest) =>
    apiFetch<CreateApiKeyResponse>('/api/v1/apikey', { method: 'POST', body: JSON.stringify(body) }),
  expireApiKey: (prefix: string, id?: string) =>
    apiFetch<Record<string, never>>('/api/v1/apikey/expire', {
      method: 'POST',
      body: JSON.stringify({ prefix, id }),
    }),
  deleteApiKey: (prefix: string, id?: string) => {
    const sp = new URLSearchParams();
    if (id) sp.set('id', id);
    const qs = sp.toString();
    return apiFetch<Record<string, never>>(
      `/api/v1/apikey/${encodeURIComponent(prefix)}${qs ? `?${qs}` : ''}`,
      { method: 'DELETE' },
    );
  },

  getPolicy: () => apiFetch<GetPolicyResponse>('/api/v1/policy'),
  setPolicy: (body: SetPolicyRequest) =>
    apiFetch<SetPolicyResponse>('/api/v1/policy', { method: 'PUT', body: JSON.stringify(body) }),
};
