const AUDIT_KEY = 'a_audit'
const MAX_LOGS = 200

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGIN_BLOCKED'
  | 'LOGOUT'
  | 'REGISTER'
  | 'PASSKEY_REGISTER'
  | 'PASSKEY_AUTH'
  | 'PASSKEY_FAILED'
  | 'PASSKEY_SKIPPED'
  | 'WALLET_CONNECT'
  | 'WALLET_DISCONNECT'
  | 'WALLET_CHANGE'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'NFT_VERIFIED'
  | 'NFT_FAILED'
  | 'NFT_REASSIGN'
  | 'BIOMETRIC_SUCCESS'
  | 'BIOMETRIC_FAILED'
  | 'SESSION_EXPIRED'
  | 'RATE_LIMIT_HIT'
  | 'SUSPICIOUS_ACTIVITY'
  | 'COURSE_CREATED'
  | 'COURSE_UPDATED'
  | 'COURSE_DELETED'
  | 'ACCOUNT_LOCKOUT'

interface AuditEntry {
  action: AuditAction
  username?: string
  wallet?: string
  ip?: string
  device?: string
  timestamp: number
  details?: string
}

function getDeviceInfo(): string {
  const nav = navigator
  return [
    nav.userAgent?.slice(0, 80) || 'unknown',
    nav.language || 'unknown',
    screen.width + 'x' + screen.height,
  ].join(' | ')
}

function loadAuditLog(): AuditEntry[] {
  try {
    const data = localStorage.getItem(AUDIT_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function saveAuditLog(log: AuditEntry[]): void {
  try {
    const trimmed = log.slice(-MAX_LOGS)
    localStorage.setItem(AUDIT_KEY, JSON.stringify(trimmed))
  } catch { /* storage full — ignore */ }
}

export function logAudit(action: AuditAction, options?: {
  username?: string
  wallet?: string
  details?: string
}): void {
  const entry: AuditEntry = {
    action,
    username: options?.username,
    wallet: options?.wallet,
    device: getDeviceInfo(),
    timestamp: Date.now(),
    details: options?.details,
  }
  const log = loadAuditLog()
  log.push(entry)
  saveAuditLog(log)
}

export function getAuditLog(filter?: {
  action?: AuditAction
  username?: string
  since?: number
}): AuditEntry[] {
  let log = loadAuditLog()
  if (filter?.action) log = log.filter(e => e.action === filter.action)
  if (filter?.username) log = log.filter(e => e.username === filter.username)
  if (filter?.since) log = log.filter(e => e.timestamp >= filter.since!)
  return log.reverse()
}

export function getFailedAttempts(username: string, sinceMs = 300000): number {
  const log = loadAuditLog()
  return log.filter(e =>
    (e.action === 'LOGIN_FAILED' || e.action === 'BIOMETRIC_FAILED') &&
    e.username === username &&
    e.timestamp > Date.now() - sinceMs
  ).length
}

export function isAccountLocked(username: string, maxAttempts = 5, windowMs = 300000): boolean {
  return getFailedAttempts(username, windowMs) >= maxAttempts
}

export function getRemainingAttempts(username: string, maxAttempts = 5, windowMs = 300000): number {
  return Math.max(0, maxAttempts - getFailedAttempts(username, windowMs))
}

export function clearAuditLog(): void {
  try { localStorage.removeItem(AUDIT_KEY) } catch { /* ignore */ }
}
