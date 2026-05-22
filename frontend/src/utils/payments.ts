/// <reference path="../vite-env.d.ts" />

import {
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  Keypair,
} from '@stellar/stellar-sdk';
import { getSigner, verifyWalletOwnership, FreighterNotInstalled } from './freighter';

const HORIZON = 'https://horizon-testnet.stellar.org';
const NETWORK = Networks.TESTNET;
const FRIENDBOT = 'https://friendbot.stellar.org';

const server = new Horizon.Server(HORIZON);
const PLATFORM_WALLET = 'GBV7RSQ37L5YSCSFL5BISBGKHXGENQBQUJTVVPX2FXKMEKITLOCGW5X6';

export interface PaymentResult {
  hash: string;
  from: string;
  to: string;
  amount: number;
  network: string;
  confirmed: boolean;
}

async function ensureAccountExists(address: string): Promise<void> {
  try { await server.loadAccount(address) } catch {
    const res = await fetch(`${FRIENDBOT}?addr=${address}`);
    if (!res.ok) throw new Error('No se pudo crear la cuenta destino en Testnet');
    await new Promise(r => setTimeout(r, 2000));
  }
}

async function pollTransaction(hash: string, maxRetries = 10, interval = 1500): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try { await server.transactions().transaction(hash).call(); return } catch {
      if (i === maxRetries - 1) throw new Error('La transacción no se confirmó en la red');
      await new Promise(r => setTimeout(r, interval));
    }
  }
}

export async function payXLM(
  from: string,
  amount: number,
  destination: string = PLATFORM_WALLET,
  secretKey?: string,
  verify: boolean = true
): Promise<PaymentResult> {
  // Determine signing method: direct (secretKey) or Freighter
  const signDirect = !!secretKey

  if (!signDirect && verify) {
    // 1a. Verify wallet ownership — real Freighter key must match `from`
    const actualKey = await verifyWalletOwnership()
    if (actualKey !== from) {
      throw new Error('La wallet conectada no coincide con la cuenta actual. Reconecta Freighter e intenta de nuevo.')
    }
  }

  // 2. Get signing function (or keypair for direct sign)
  let signTransaction: ((xdr: string, opts?: { networkPassphrase?: string }) => Promise<string>) | null = null
  let keypair: any = null

  if (signDirect) {
    keypair = Keypair.fromSecret(secretKey!)
  } else {
    try {
      signTransaction = await getSigner()
    } catch (e) {
      if (e instanceof FreighterNotInstalled) throw e
      throw new FreighterNotInstalled()
    }
  }

  // 3. Ensure destination account exists on testnet
  await ensureAccountExists(destination)

  // 4. Load source account from Horizon
  let sourceAccount
  try {
    sourceAccount = await server.loadAccount(from)
  } catch {
    throw new Error('La cuenta origen no existe en Testnet. Fondea tu wallet con Friendbot.')
  }

  // 5. Balance check via Horizon (redundant safety)
  const sourceBalances = sourceAccount.balances
  const nativeBalance = sourceBalances.find((b: any) => b.asset_type === 'native')
  const available = nativeBalance ? parseFloat(nativeBalance.balance) : 0
  if (available < amount) {
    throw new Error(`Saldo insuficiente: tienes ${available.toFixed(2)} XLM, necesitas ${amount} XLM`)
  }

  // 6. Build transaction
  const fee = await server.fetchBaseFee()
  const tx = new TransactionBuilder(sourceAccount, {
    fee: fee.toString(),
    networkPassphrase: NETWORK,
  })
    .addOperation(Operation.payment({ destination, asset: Asset.native(), amount: amount.toString() }))
    .setTimeout(30)
    .build()

  // 7. Sign
  let signedXdr: string
  if (signDirect) {
    tx.sign(keypair)
    signedXdr = tx.toXDR()
  } else {
    signedXdr = await signTransaction!(tx.toXDR(), { networkPassphrase: NETWORK })
  }

  // 8. Submit to Horizon
  const result = await server.submitTransaction(TransactionBuilder.fromXDR(signedXdr, NETWORK))
  const hash = result.hash

  // 9. Wait for confirmation
  await pollTransaction(hash)

  return {
    hash,
    from,
    to: destination,
    amount,
    network: NETWORK,
    confirmed: true,
  }
}
