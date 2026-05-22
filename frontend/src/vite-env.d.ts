/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<{ isConnected: boolean }>;
      getPublicKey: () => Promise<string>;
      signTransaction: (xdr: string, opts?: { networkPassphrase?: string; network?: string }) => Promise<string>;
    };
  }
}
