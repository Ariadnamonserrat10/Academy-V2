// ── XSS Sanitization ────────────────────────────────────────────

const ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

export function sanitize(str: string): string {
  return str.replace(/[&<>"'/]/g, ch => ENTITY_MAP[ch] || ch)
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result: any = {}
  for (const [key, val] of Object.entries(obj)) {
    result[key] = typeof val === 'string' ? sanitize(val) : val
  }
  return result
}

// ── CSRF Token ──────────────────────────────────────────────────

const CSRF_KEY = 'a_csrf'

export function generateCsrfToken(): string {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  sessionStorage.setItem(CSRF_KEY, token)
  return token
}

export function getCsrfToken(): string | null {
  return sessionStorage.getItem(CSRF_KEY)
}

export function validateCsrfToken(token: string): boolean {
  const stored = sessionStorage.getItem(CSRF_KEY)
  if (!stored || stored !== token) return false
  return true
}

// ── Nonce generation ────────────────────────────────────────────

export function generateNonce(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Timestamp validation ────────────────────────────────────────

export function validateTimestamp(timestamp: number, maxAgeMs = 60000): boolean {
  return Date.now() - timestamp < maxAgeMs
}

// ── Session fingerprint ─────────────────────────────────────────

export function getDeviceFingerprint(): string {
  const nav = navigator
  const components = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    !!nav.hardwareConcurrency,
  ]
  const raw = components.join('|')
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash.toString(36)
}

// ── Rate limiting (client-side basic) ───────────────────────────

const attemptStore: Record<string, number[]> = {}

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now()
  if (!attemptStore[key]) attemptStore[key] = []
  attemptStore[key] = attemptStore[key].filter(t => now - t < windowMs)
  if (attemptStore[key].length >= maxAttempts) return false
  attemptStore[key].push(now)
  return true
}

export function resetRateLimit(key: string): void {
  delete attemptStore[key]
}

// ── CSP nonce for inline scripts ────────────────────────────────

export function getCspNonce(): string {
  const stored = sessionStorage.getItem('a_csp_nonce')
  if (stored) return stored
  const nonce = generateNonce()
  sessionStorage.setItem('a_csp_nonce', nonce)
  return nonce
}

// ── Secure random ID ────────────────────────────────────────────

export function secureId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Suppress console in production ──────────────────────────────

export function suppressConsole(): void {
  if (import.meta.env.PROD) {
    const noop = () => {}
    console.log = noop
    console.info = noop
    console.warn = noop
    console.debug = noop
    console.error = noop
  }
}
