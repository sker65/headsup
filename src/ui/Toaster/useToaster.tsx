import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Severity = 'success' | 'info' | 'warning' | 'error';

type ToasterState = {
  open: boolean;
  message: string;
  severity: Severity;
};

type ToasterApi = {
  state: ToasterState;
  show: (message: string, severity?: Severity) => void;
  hide: () => void;
};

const ToasterContext = createContext<ToasterApi | null>(null);

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToasterState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const show = useCallback((message: string, severity: Severity = 'info') => {
    setState({ open: true, message, severity });
  }, []);

  const hide = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const value = useMemo<ToasterApi>(() => ({ state, show, hide }), [state, show, hide]);

  return <ToasterContext.Provider value={value}>{children}</ToasterContext.Provider>;
}

export function useToaster() {
  const ctx = useContext(ToasterContext);
  if (!ctx) {
    throw new Error('useToaster must be used within ToasterProvider');
  }
  return ctx;
}
