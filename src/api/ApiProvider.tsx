import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { headscaleApi } from './headscale';

type ApiContextValue = {
  api: typeof headscaleApi;
};

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ApiContextValue>(() => ({ api: headscaleApi }), []);
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return ctx;
}
