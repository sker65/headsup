import { createContext, useContext } from 'react';

type MobileNavContextValue = {
  open: () => void;
};

export const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) {
    throw new Error('useMobileNav must be used within MobileNavContext');
  }
  return ctx;
}
