import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  connectFreighter,
  isFreighterInstalled,
  verifyWalletOwnership,
  FreighterNotInstalled,
  FreighterNotAuthorized,
  FreighterUserRejected,
} from '../utils/freighter';

const STORAGE_KEY = 'academy_wallet';
const SK_STORAGE_KEY = 'academy_wallet_sk';
const HORIZON_TESTNET = 'https://horizon-testnet.stellar.org';

interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isInstalled: boolean;
  error: string | null;
  balance: string;
  secretKey: string | null;
  fetchBalance: (addr: string) => Promise<void>;
  connect: () => Promise<string | null>;
  connectManual: (pk: string, sk?: string) => void;
  disconnect: () => void;
  clearError: () => void;
  verifyOwnership: () => Promise<{ ok: boolean; error?: string }>;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  isInstalled: false,
  error: null,
  balance: '0',
  secretKey: null,
  fetchBalance: async () => {},
  connect: async () => null,
  connectManual: () => {},
  disconnect: () => {},
  clearError: () => {},
  verifyOwnership: async () => ({ ok: false }),
});

export const useWeb3 = () => useContext(Web3Context);

function userFacingError(e: unknown): string {
  if (e instanceof FreighterNotInstalled) return 'Freighter no está disponible. Abre Freighter, ve a Settings > Allow list y agrega localhost:3000. Si no lo tienes, descárgalo desde https://freighter.app.';
  if (e instanceof FreighterNotAuthorized) return 'Freighter no está autorizado. Abre Freighter, ve a "Settings" > "Allow list" y agrega este sitio.';
  if (e instanceof FreighterUserRejected) return 'Conexión cancelada. Abre Freighter y autoriza este sitio para continuar.';
  if (e instanceof Error) return e.message;
  return 'Error desconocido al conectar con Freighter';
}

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(() => {
    return sessionStorage.getItem(STORAGE_KEY);
  });
  const [secretKey, setSecretKey] = useState<string | null>(() => {
    return sessionStorage.getItem(SK_STORAGE_KEY);
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');

  const fetchBalance = useCallback(async (addr: string) => {
    try {
      const res = await fetch(`${HORIZON_TESTNET}/accounts/${addr}`);
      if (!res.ok) { setBalance('0'); return; }
      const data = await res.json();
      const xlm = data.balances?.find((b: any) => b.asset_type === 'native');
      setBalance(xlm ? parseFloat(xlm.balance).toFixed(2) : '0');
    } catch {
      setBalance('0');
    }
  }, []);

  useEffect(() => {
    setIsInstalled(isFreighterInstalled());
  }, []);

  useEffect(() => {
    if (address) {
      sessionStorage.setItem(STORAGE_KEY, address);
      fetchBalance(address);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SK_STORAGE_KEY);
      setBalance('0');
    }
  }, [address, fetchBalance]);

  const verifyOwnership = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!address) return { ok: false, error: 'No hay wallet conectada' }
    if (secretKey) return { ok: true } // generated wallet — always matches
    try {
      const pk = await verifyWalletOwnership()
      if (pk === address) return { ok: true }
      return { ok: false, error: 'La wallet conectada en Freighter no coincide con la cuenta activa. Reconecta.' }
    } catch (e) {
      return { ok: false, error: userFacingError(e) }
    }
  }, [address, secretKey])

  const connect = useCallback(async (): Promise<string | null> => {
    setError(null);
    setIsConnecting(true);
    try {
      const { publicKey } = await connectFreighter();
      setAddress(publicKey);
      setSecretKey(null);
      sessionStorage.removeItem(SK_STORAGE_KEY);
      return publicKey;
    } catch (e) {
      setError(userFacingError(e));
      console.warn('[Web3] connect falló:', e instanceof Error ? e.message : e);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectManual = useCallback((pk: string, sk?: string) => {
    if (pk && pk.startsWith('G')) {
      setAddress(pk);
      if (sk) {
        setSecretKey(sk);
        sessionStorage.setItem(SK_STORAGE_KEY, sk);
      }
      setError(null);
    } else {
      setError('La clave pública debe empezar con G');
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSecretKey(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
      <Web3Context.Provider
        value={{
          address,
          isConnected: !!address,
          isConnecting,
          isInstalled,
          error,
          balance,
          secretKey,
          fetchBalance,
          connect,
          connectManual,
          disconnect,
          clearError,
          verifyOwnership,
        }}
      >
      {children}
    </Web3Context.Provider>
  );
};
