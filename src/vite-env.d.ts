/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_BASE_URL?: string;
  readonly VITE_APIKEY?: string;
  readonly BASE_URL?: string;
  readonly APIKEY?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    __HEADSUP_CONFIG__?: {
      BASE_URL?: string;
      APIKEY?: string;
    };
  }
}

export {};
