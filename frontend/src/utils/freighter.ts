// ── Error types ────────────────────────────────────────────────

export class FreighterNotInstalled extends Error {
  constructor() { super('NO_WALLET'); this.name = 'FreighterNotInstalled' }
}

export class FreighterNotAuthorized extends Error {
  constructor() { super('NO_AUTH'); this.name = 'FreighterNotAuthorized' }
}

export class FreighterUserRejected extends Error {
  constructor() { super('USER_REJECTED'); this.name = 'FreighterUserRejected' }
}

// ── Known Freighter injection locations ────────────────────────
//
// Freighter content script injects the API into the window under
// these known keys (ordered by recency):
//   1. window.freighter       (v4+ — current)
//   2. window.stellar          (v2-3 — legacy)
//   3. window.__STELLAR__      (internal, rarely exposed)

const INJECTION_KEYS = ['freighter', 'stellar', '__STELLAR__']

function searchWindowDeep(): { key: string; value: any } | null {
  const w = window as any
  for (const key of INJECTION_KEYS) {
    const val = w[key]
    if (val && typeof val === 'object') {
      // Found something — check if it has wallet-like methods
      if (typeof val.signTransaction === 'function' || typeof val.getPublicKey === 'function' || typeof val.isConnected === 'function') {
        return { key, value: val }
      }
    }
  }
  // Also check via Object.getOwnPropertyNames (catches non-enumerable props)
  const ownNames = Object.getOwnPropertyNames(w) as string[]
  for (const name of ownNames) {
    if (INJECTION_KEYS.includes(name)) {
      const val = w[name]
      if (val && typeof val === 'object') {
        if (typeof val.signTransaction === 'function' || typeof val.getPublicKey === 'function' || typeof val.isConnected === 'function') {
          return { key: name, value: val }
        }
      }
    }
  }
  return null
}

function getFreighterAPI(): any {
  const found = searchWindowDeep()
  if (found) {
    return found.value
  }
  return null
}

function getFreighterExists(): boolean {
  const found = searchWindowDeep()
  return found !== null
}

// ── Async detection (Freighter may inject after page load) ─────

async function waitForFreighter(timeout = 8000): Promise<any> {
  const poll = async (elapsed: number): Promise<any> => {
    const api = getFreighterAPI()
    if (api) return api
    if (elapsed >= timeout) return null
    await new Promise(r => setTimeout(r, 200))
    return poll(elapsed + 200)
  }
  return poll(0)
}

// ── Connection ─────────────────────────────────────────────────

export async function isFreighterConnected(): Promise<boolean> {
  const api = getFreighterAPI()
  if (!api) return false
  try {
    const result = await api.isConnected()
    return result?.isConnected === true
  } catch { return false }
}

export async function connectFreighter(): Promise<{ publicKey: string }> {
  let api = getFreighterAPI()
  if (!api) {
    api = await waitForFreighter(5000)
    if (!api) throw new FreighterNotInstalled()
  }

  try {
    const conn = await api.isConnected()
    if (!conn?.isConnected) throw new FreighterNotAuthorized()
  } catch (e: any) {
    if (e instanceof FreighterNotAuthorized) throw e
  }

  try {
    const pk = await api.getPublicKey()
    if (pk && typeof pk === 'string' && pk.startsWith('G')) {
      return { publicKey: pk }
    }
    throw new Error('Clave pública inválida')
  } catch (e: any) {
    if (e?.message?.includes('User rejected') || e?.message?.includes('cancel')) throw new FreighterUserRejected()
    if (e?.message?.includes('not allowed') || e?.message?.includes('not authorized') || e?.code === 401) throw new FreighterNotAuthorized()
    throw e
  }
}

export async function getSigner(timeout = 5000): Promise<(xdr: string, opts?: { networkPassphrase?: string }) => Promise<string>> {
  let api = getFreighterAPI()
  if (!api) {
    api = await waitForFreighter(timeout)
    if (!api) throw new FreighterNotInstalled()
  }
  const signTx = api.signTransaction
  if (typeof signTx !== 'function') throw new Error('signTransaction no disponible')
  return (xdr: string, opts?: { networkPassphrase?: string }) => signTx.call(api, xdr, opts)
}

// ── Wallet ownership validation ────────────────────────────────

export async function verifyWalletOwnership(): Promise<string> {
  const api = getFreighterAPI()
  if (!api) throw new FreighterNotInstalled()
  try {
    const pk = await api.getPublicKey()
    if (pk && typeof pk === 'string' && pk.startsWith('G')) return pk
    throw new Error('Clave pública inválida desde Freighter')
  } catch (e: any) {
    if (e instanceof FreighterNotInstalled) throw e
    if (e?.message?.includes('User rejected') || e?.message?.includes('cancel')) throw new FreighterUserRejected()
    throw new Error('No se pudo verificar la propiedad de la wallet: ' + (e?.message || 'error desconocido'))
  }
}

// ── Legacy helper ──────────────────────────────────────────────

export const isFreighterInstalled = getFreighterExists

export const fundTestnetAccount = async (publicKey: string): Promise<boolean> => {
  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`)
    const data = await res.json()
    return !data.detail
  } catch {
    return false
  }
}
