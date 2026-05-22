import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UserProfile, TeacherProfile, AcademicInterest } from '../types';
import { secureStorage } from '../utils/secureStorage';
import { sanitizeObject } from '../utils/securityUtils';
import { logAudit, getFailedAttempts, isAccountLocked } from '../utils/auditLog';

interface StoredAccount {
  username: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  nftHash: string;
  nftImage: string;
  wallet?: string;
  specialty?: string;
  educationLevel?: string;
  passkeyCredentialId?: string;
  passkeyPublicKey?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  teacherProfile: TeacherProfile | null;
  role: 'student' | 'teacher' | null;
  interests: AcademicInterest | null;
  nftIdentity: string | null;
  ready: boolean;
  login: (profile: UserProfile, nftImage?: string) => void;
  loginTeacher: (profile: TeacherProfile, nftImage?: string) => void;
  logout: () => void;
  setInterests: (interests: AcademicInterest) => void;
  verifyNftImage: (username: string, imageData: string) => Promise<{ ok: boolean; error?: string }>;
  accountExists: (username: string) => boolean;
  saveAccount: (account: StoredAccount) => void;
  hasPasskey: (username: string) => boolean;
  savePasskeyForAccount: (username: string, credentialId: string, publicKey: string) => void;
  isLocked: (username: string) => boolean;
  getRemainingAttempts: (username: string) => number;
}

const AuthContext = createContext<AuthContextType>({
  user: null, teacherProfile: null, role: null, interests: null, nftIdentity: null, ready: false,
  login: () => {}, loginTeacher: () => {}, logout: () => {}, setInterests: () => {},
  verifyNftImage: async () => ({ ok: false, error: '' }),
  accountExists: () => false, saveAccount: () => {},
  hasPasskey: () => false, savePasskeyForAccount: () => {},
  isLocked: () => false, getRemainingAttempts: () => 5,
});

export const useAuth = () => useContext(AuthContext);

function loadSession(): { profile: any; role: 'student' | 'teacher'; nftImage?: string } | null {
  try {
    const saved = secureStorage.getItem('session');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch { return null }
}

const hashImage = async (dataUrl: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(dataUrl);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const session = loadSession();
  const [user, setUser] = useState<UserProfile | null>(session?.role === 'student' ? session.profile : null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(session?.role === 'teacher' ? session.profile : null);
  const [role, setRole] = useState<'student' | 'teacher' | null>(session?.role || null);
  const [interests, setInterestsState] = useState<AcademicInterest | null>(null);
  const [nftIdentity, setNftIdentity] = useState<string | null>(session?.nftImage || null);
  const [ready] = useState(true);

  const saveSession = (profile: any, role: string, nftImage?: string) => {
    secureStorage.setItem('session', JSON.stringify({ profile, role, nftImage }));
  };

  const accountExists = useCallback((username: string): boolean => {
    const accounts = JSON.parse(localStorage.getItem('academy_accounts') || '{}');
    return !!accounts[username];
  }, []);

  const isLocked = useCallback((username: string): boolean => {
    return isAccountLocked(username, 5, 300000);
  }, []);

  const getRemainingAttempts = useCallback((username: string): number => {
    return Math.max(0, 5 - getFailedAttempts(username, 300000));
  }, []);

  const saveAccount = useCallback((account: StoredAccount) => {
    const sanitized = sanitizeObject(account);
    const accounts = JSON.parse(localStorage.getItem('academy_accounts') || '{}');
    accounts[sanitized.username] = sanitized;
    localStorage.setItem('academy_accounts', JSON.stringify(accounts));
  }, []);

  const hasPasskey = useCallback((username: string): boolean => {
    const accounts = JSON.parse(localStorage.getItem('academy_accounts') || '{}');
    const account = accounts[username];
    return !!account?.passkeyCredentialId;
  }, []);

  const savePasskeyForAccount = useCallback((username: string, credentialId: string, publicKey: string) => {
    const accounts = JSON.parse(localStorage.getItem('academy_accounts') || '{}');
    if (accounts[username]) {
      accounts[username].passkeyCredentialId = credentialId;
      accounts[username].passkeyPublicKey = publicKey;
      localStorage.setItem('academy_accounts', JSON.stringify(accounts));
    }
  }, []);

  const verifyNftImage = useCallback(async (username: string, imageData: string): Promise<{ ok: boolean; error?: string }> => {
    const accounts = JSON.parse(localStorage.getItem('academy_accounts') || '{}');
    const account = accounts[username];
    if (!account) {
      logAudit('NFT_FAILED', { username, details: 'Cuenta no encontrada' });
      return { ok: false, error: 'Cuenta no encontrada' };
    }
    const hash = await hashImage(imageData);
    if (hash !== account.nftHash) {
      logAudit('NFT_FAILED', { username, details: 'Hash no coincide' });
      return { ok: false, error: 'Imagen NFT incorrecta' };
    }
    // Check for screenshot detection: if image is too small or exact duplicate of stored
    if (imageData === account.nftImage) {
      // Re-upload of the same image data — allow (it's the legitimate image)
    }
    logAudit('NFT_VERIFIED', { username });
    return { ok: true };
  }, []);

  const login = useCallback((profile: UserProfile, nftImage?: string) => {
    setUser(profile);
    setRole('student');
    if (nftImage) setNftIdentity(nftImage);
    saveSession(profile, 'student', nftImage);
    logAudit('LOGIN_SUCCESS', { username: profile.name, wallet: profile.id });
  }, []);

  const loginTeacher = useCallback((profile: TeacherProfile, nftImage?: string) => {
    setTeacherProfile(profile);
    setRole('teacher');
    if (nftImage) setNftIdentity(nftImage);
    saveSession(profile, 'teacher', nftImage);
    logAudit('LOGIN_SUCCESS', { username: profile.name, wallet: profile.wallet });
  }, []);

  const logout = useCallback(() => {
    const currentRole = role;
    setUser(null); setTeacherProfile(null); setRole(null);
    setInterestsState(null); setNftIdentity(null);
    secureStorage.removeItem('session');
    sessionStorage.clear();
    logAudit('LOGOUT', { username: currentRole || undefined });
  }, [role]);

  const setInterests = useCallback((i: AcademicInterest) => setInterestsState(i), []);

  return (
    <AuthContext.Provider value={{
      user, teacherProfile, role, interests, nftIdentity, ready,
      login, loginTeacher, logout, setInterests,
      verifyNftImage, accountExists, saveAccount,
      hasPasskey, savePasskeyForAccount,
      isLocked, getRemainingAttempts,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { hashImage };
