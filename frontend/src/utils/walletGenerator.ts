import { Keypair } from '@stellar/stellar-sdk'

const HORIZON_TESTNET = 'https://horizon-testnet.stellar.org'
const FRIENDBOT = 'https://friendbot.stellar.org'

export interface GeneratedWallet {
  publicKey: string
  secretKey: string
  balance: string
  funded: boolean
}

export class AccountGenerationError extends Error {
  constructor(message: string) { super(message); this.name = 'AccountGenerationError' }
}

async function checkBalance(address: string): Promise<string> {
  try {
    const res = await fetch(`${HORIZON_TESTNET}/accounts/${address}`)
    if (!res.ok) return '0'
    const data = await res.json()
    const xlm = data.balances?.find((b: any) => b.asset_type === 'native')
    return xlm ? parseFloat(xlm.balance).toFixed(2) : '0'
  } catch { return '0' }
}

export async function generateTestnetWallet(): Promise<GeneratedWallet> {
  const keypair = Keypair.random()
  const publicKey = keypair.publicKey()
  const secretKey = keypair.secret()

  if (!publicKey.startsWith('G')) {
    throw new AccountGenerationError('Keypair generado inválido')
  }

  let funded = false
  try {
    const res = await fetch(`${FRIENDBOT}?addr=${publicKey}`)
    const data = await res.json()
    funded = !data.detail
    if (!funded) {
      throw new AccountGenerationError('Friendbot no pudo fondear la cuenta: ' + (data.detail || 'error desconocido'))
    }
  } catch (e: any) {
    if (e instanceof AccountGenerationError) throw e
    await new Promise(r => setTimeout(r, 2000))
    try {
      const res = await fetch(`${FRIENDBOT}?addr=${publicKey}`)
      const data = await res.json()
      funded = !data.detail
      if (!funded) throw new AccountGenerationError('Friendbot no disponible. Intenta más tarde.')
    } catch {
      throw new AccountGenerationError('No se pudo conectar con Friendbot. Verifica tu conexión a internet.')
    }
  }

  await new Promise(r => setTimeout(r, 3000))
  const balance = await checkBalance(publicKey)

  return { publicKey, secretKey, balance, funded: true }
}

export async function fundExistingAccount(address: string): Promise<boolean> {
  try {
    const res = await fetch(`${FRIENDBOT}?addr=${address}`)
    const data = await res.json()
    if (data.detail) return false
    await new Promise(r => setTimeout(r, 2000))
    return true
  } catch {
    return false
  }
}
