import { generateNonce } from './securityUtils'

export interface PasskeyRegistration {
  credentialId: string
  publicKey: string
  smartWalletAddress: string
}

export interface PasskeyChallenge {
  challenge: string
  walletAddress: string
  timestamp: number
}

export class PasskeyError extends Error {
  constructor(msg: string) { super(msg); this.name = 'PasskeyError' }
}

export class PasskeyCancelled extends Error {
  constructor() { super('USER_CANCELLED'); this.name = 'PasskeyCancelled' }
}

export class PasskeyNotSupported extends Error {
  constructor() { super('NOT_SUPPORTED'); this.name = 'PasskeyNotSupported' }
}

function base64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function parseBase64url(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}

function getRpId(): string {
  return window.location.hostname || 'localhost'
}

function getRpName(): string {
  return 'Academy Platform'
}

function isWebAuthnAvailable(): boolean {
  return typeof navigator !== 'undefined' &&
    typeof navigator.credentials !== 'undefined' &&
    typeof navigator.credentials.create === 'function' &&
    typeof navigator.credentials.get === 'function' &&
    typeof PublicKeyCredential !== 'undefined'
}

function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnAvailable()) return Promise.resolve(false)
  if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
    return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  }
  return Promise.resolve(false)
}

function isConditionalMediationAvailable(): Promise<boolean> {
  if (typeof PublicKeyCredential.isConditionalMediationAvailable === 'function') {
    return PublicKeyCredential.isConditionalMediationAvailable()
  }
  return Promise.resolve(false)
}

export async function isWindowsHelloAvailable(): Promise<boolean> {
  try {
    return await isPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

export async function isPasskeyAvailable(): Promise<{
  webAuthn: boolean
  platform: boolean
  conditional: boolean
  windowsHello: boolean
}> {
  const webAuthn = isWebAuthnAvailable()
  const platform = webAuthn ? await isPlatformAuthenticatorAvailable() : false
  const conditional = webAuthn ? await isConditionalMediationAvailable() : false
  return { webAuthn, platform, conditional, windowsHello: platform }
}

export async function registerPasskey(
  walletAddress: string
): Promise<PasskeyRegistration> {
  if (!isWebAuthnAvailable()) throw new PasskeyNotSupported()

  const rpId = getRpId()

  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userId = new TextEncoder().encode(walletAddress)

  let credential: PublicKeyCredential | null
  try {
    credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: getRpName(), id: rpId },
        user: {
          id: userId,
          name: walletAddress,
          displayName: `User ${walletAddress.slice(0, 8)}`,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'required',
        },
        timeout: 30000,
        attestation: 'none',
      },
    }) as PublicKeyCredential | null
  } catch (e: any) {
    if (e?.name === 'NotAllowedError' || e?.name === 'AbortError') throw new PasskeyCancelled()
    throw new PasskeyError('Error al crear passkey: ' + (e?.message || 'desconocido'))
  }

  if (!credential) throw new PasskeyCancelled()

  const response = credential.response as AuthenticatorAttestationResponse
  const credId = base64url(credential.rawId)
  const pubKey = response.getPublicKey()
    ? base64url(response.getPublicKey()!)
    : ''

  return { credentialId: credId, publicKey: pubKey, smartWalletAddress: walletAddress }
}

export async function authenticateWithPasskey(
  challenge?: PasskeyChallenge
): Promise<{ credentialId: string; signature: string; authenticatorData: string }> {
  if (!isWebAuthnAvailable()) throw new PasskeyNotSupported()

  const challengeBytes = challenge
    ? parseBase64url(challenge.challenge).buffer as ArrayBuffer
    : crypto.getRandomValues(new Uint8Array(32)).buffer

  let credential: PublicKeyCredential | null
  try {
    credential = await navigator.credentials.get({
      publicKey: {
        challenge: challengeBytes,
        rpId: getRpId(),
        allowCredentials: [],
        userVerification: 'required',
        timeout: 30000,
      },
    }) as PublicKeyCredential | null
  } catch (e: any) {
    if (e?.name === 'NotAllowedError' || e?.name === 'AbortError') throw new PasskeyCancelled()
    throw new PasskeyError('Error de autenticación: ' + (e?.message || 'desconocido'))
  }

  if (!credential) throw new PasskeyCancelled()

  const response = credential.response as AuthenticatorAssertionResponse
  const credId = base64url(credential.rawId)
  const signature = base64url(response.signature)
  const authenticatorData = base64url(response.authenticatorData)

  return { credentialId: credId, signature, authenticatorData }
}

export async function requireBiometric(
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isWebAuthnAvailable()) return { ok: false, error: 'WebAuthn no disponible' }
  try {
    const challengeBytes = crypto.getRandomValues(new Uint8Array(32))
    await authenticateWithPasskey({
      challenge: base64url(challengeBytes.buffer),
      walletAddress: 'biometric-check',
      timestamp: Date.now(),
    })
    return { ok: true }
  } catch (e: any) {
    if (e instanceof PasskeyCancelled) return { ok: false, error: 'Verificación cancelada' }
    return { ok: false, error: e.message || 'Error biométrico' }
  }
}

export async function generateAuthChallenge(walletAddress: string): Promise<PasskeyChallenge> {
  const challengeBytes = crypto.getRandomValues(new Uint8Array(32))
  return {
    challenge: base64url(challengeBytes.buffer),
    walletAddress,
    timestamp: Date.now(),
  }
}

export { isWebAuthnAvailable }
