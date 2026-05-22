import { useState, useCallback } from 'react'
import { requireBiometric } from '../utils/passkeyAuth'

type SecureActionState = {
  authorized: boolean
  loading: boolean
  error: string | null
}

export function useSecureAction() {
  const [state, setState] = useState<SecureActionState>({
    authorized: false,
    loading: false,
    error: null,
  })

  const authorize = useCallback(async (reason: string): Promise<boolean> => {
    setState({ authorized: false, loading: true, error: null })
    const result = await requireBiometric(reason)
    if (result.ok) {
      setState({ authorized: true, loading: false, error: null })
      return true
    }
    setState({ authorized: false, loading: false, error: result.error || null })
    return false
  }, [])

  const reset = useCallback(() => {
    setState({ authorized: false, loading: false, error: null })
  }, [])

  return {
    ...state,
    authorize,
    reset,
  }
}
