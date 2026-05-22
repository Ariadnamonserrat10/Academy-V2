const STORAGE_PREFIX = 'a_'
const ENCRYPTION_KEY = 'academy_secure_v1'

function xorEncode(data: string, key: string): string {
  const keyLen = key.length
  const result: string[] = []
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % keyLen)
    result.push(String.fromCharCode(charCode))
  }
  return btoa(result.join(''))
}

function xorDecode(encoded: string, key: string): string {
  const data = atob(encoded)
  const keyLen = key.length
  const result: string[] = []
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % keyLen)
    result.push(String.fromCharCode(charCode))
  }
  return result.join('')
}

export const secureStorage = {
  setItem(key: string, value: string): void {
    try {
      const encoded = xorEncode(value, ENCRYPTION_KEY)
      sessionStorage.setItem(STORAGE_PREFIX + key, encoded)
    } catch { /* storage unavailable */ }
  },

  getItem(key: string): string | null {
    try {
      const encoded = sessionStorage.getItem(STORAGE_PREFIX + key)
      if (!encoded) return null
      return xorDecode(encoded, ENCRYPTION_KEY)
    } catch { return null }
  },

  removeItem(key: string): void {
    try { sessionStorage.removeItem(STORAGE_PREFIX + key) } catch { /* ignore */ }
  },

  clear(): void {
    try {
      const keys = Object.keys(sessionStorage).filter(k => k.startsWith(STORAGE_PREFIX))
      keys.forEach(k => sessionStorage.removeItem(k))
    } catch { /* ignore */ }
  },

  setLocal(key: string, value: string): void {
    try {
      const encoded = xorEncode(value, ENCRYPTION_KEY)
      localStorage.setItem(STORAGE_PREFIX + key, encoded)
    } catch { /* storage unavailable */ }
  },

  getLocal(key: string): string | null {
    try {
      const encoded = localStorage.getItem(STORAGE_PREFIX + key)
      if (!encoded) return null
      return xorDecode(encoded, ENCRYPTION_KEY)
    } catch { return null }
  },

  removeLocal(key: string): void {
    try { localStorage.removeItem(STORAGE_PREFIX + key) } catch { /* ignore */ }
  },
}
