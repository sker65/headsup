export type RpcStatus = {
  code?: number;
  message?: string;
  details?: unknown[];
};

export type V1User = {
  id?: string;
  name?: string;
  createdAt?: string;
  displayName?: string;
  email?: string;
  providerId?: string;
  provider?: string;
  profilePicUrl?: string;
};

export type V1Node = {
  id?: string;
  machineKey?: string;
  nodeKey?: string;
  discoKey?: string;
  ipAddresses?: string[];
  name?: string;
  user?: V1User;
  lastSeen?: string;
  expiry?: string;
  preAuthKey?: V1PreAuthKey;
  createdAt?: string;
  registerMethod?: string;
  givenName?: string;
  online?: boolean;
  approvedRoutes?: string[];
  availableRoutes?: string[];
  subnetRoutes?: string[];
  tags?: string[];
};

export type V1PreAuthKey = {
  user?: V1User;
  id?: string;
  key?: string;
  reusable?: boolean;
  ephemeral?: boolean;
  used?: boolean;
  expiration?: string;
  createdAt?: string;
  aclTags?: string[];
};

export type ListUsersResponse = { users?: V1User[] };
export type CreateUserRequest = { name?: string; displayName?: string; email?: string; pictureUrl?: string };
export type CreateUserResponse = { user?: V1User };

export type ListNodesResponse = { nodes?: V1Node[] };
export type GetNodeResponse = { node?: V1Node };

export type ListPreAuthKeysResponse = { preAuthKeys?: V1PreAuthKey[] };
export type CreatePreAuthKeyRequest = {
  user?: string;
  reusable?: boolean;
  ephemeral?: boolean;
  expiration?: string;
  aclTags?: string[];
};
export type CreatePreAuthKeyResponse = { preAuthKey?: V1PreAuthKey };

export type ListApiKeysResponse = { apiKeys?: { id?: string; prefix?: string; expiration?: string; createdAt?: string; lastSeen?: string }[] };
export type CreateApiKeyRequest = { expiration?: string };
export type CreateApiKeyResponse = { apiKey?: string };

export type HealthResponse = { databaseConnectivity?: boolean };
export type GetPolicyResponse = { policy?: string; updatedAt?: string };
export type SetPolicyRequest = { policy?: string };
export type SetPolicyResponse = { policy?: string; updatedAt?: string };
