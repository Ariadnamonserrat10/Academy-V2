import { useState, useRef, useCallback } from 'react'
import { isPasskeyAvailable, registerPasskey, requireBiometric, PasskeyRegistration } from '../utils/passkeyAuth'

interface UseNftBiometricGateOptions {
  autoRegister: boolean
  walletAddress?: string | null
}

export function useNftBiometricGate(opts: UseNftBiometricGateOptions) {
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingRef = useRef<PasskeyRegistration | null>(null)
  const cancellingRef = useRef(false)

  const requireFor = useCallback(async (action: string): Promise<boolean> => {
    if (ok) return true
    if (cancellingRef.current) { cancellingRef.current = false; return false }

    const wa = await isPasskeyAvailable().catch(() => null)
    if (!wa?.webAuthn) {
      setError('WebAuthn no está disponible. Usa Chrome o Edge con HTTPS o localhost.')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const biometricPromise = opts.autoRegister && !pendingRef.current
        ? registerPasskey(opts.walletAddress || 'manual').then(reg => {
            pendingRef.current = reg
            return true
          })
        : requireBiometric(`Verificar identidad para ${action}`).then(r => r.ok)

      const timeout = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 25000)
      )

      const okResult = await Promise.race([biometricPromise, timeout])

      if (!okResult) {
        setError('Verificación cancelada')
        return false
      }

      setOk(true)
      return true
    } catch (e: any) {
      if (e?.message === 'timeout') {
        setError('Windows Hello no respondió. Verifica que esté configurado e intenta de nuevo.')
      } else if (e?.name === 'PasskeyCancelled' || e?.message === 'USER_CANCELLED') {
        setError('Verificación cancelada')
      } else {
        setError(e?.message || 'Error de verificación')
      }
      return false
    } finally {
      setLoading(false)
    }
  }, [ok, opts.autoRegister, opts.walletAddress])

  const cancel = useCallback(() => {
    cancellingRef.current = true
    setError('Verificación cancelada')
  }, [])

  return { nftBiometricOk: ok, nftBiometricLoading: loading, nftBiometricError: error, requireFor, pendingPasskeyRef: pendingRef, cancel }
}
