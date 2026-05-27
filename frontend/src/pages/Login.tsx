import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiShield, FiCheckCircle, FiAlertCircle, FiDroplet, FiZap, FiImage, FiLock } from 'react-icons/fi'
import { useWeb3 } from '../context/Web3Context'
import { useAuth } from '../context/AuthContext'
import { fundTestnetAccount } from '../utils/freighter'
import { logAudit, isAccountLocked, getRemainingAttempts } from '../utils/auditLog'
import { useNftBiometricGate } from '../hooks/useNftBiometricGate'

export default function Login() {
  const { address, isConnected, connect, isConnecting, error } = useWeb3()
  const { login, loginTeacher, accountExists, verifyNftImage } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [username, setUsername] = useState('')
  const [nftImage, setNftImage] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [loginError, setLoginError] = useState('')

  const { nftBiometricOk, nftBiometricLoading, nftBiometricError, requireFor } = useNftBiometricGate({ autoRegister: false })

  const requireNftBiometric = async (action: string): Promise<boolean> => {
    const ok = await requireFor(action)
    if (!ok) setLoginError(nftBiometricError || '')
    return ok
  }

  const handleNftUploadClick = async () => {
    const ok = await requireNftBiometric('subir imagen NFT')
    if (ok) fileInputRef.current?.click()
  }

  const handleNftUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setNftImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setLoginError('')

    if (step === 1) {
      if (!username.trim()) { setLoginError('Ingresa tu usuario'); return }
      if (!accountExists(username.trim())) {
        logAudit('LOGIN_FAILED', { username: username.trim(), details: 'usuario no encontrado' })
        setLoginError('Usuario no encontrado. Debes registrarte primero.')
        return
      }
      if (isAccountLocked(username.trim())) {
        logAudit('LOGIN_BLOCKED', { username: username.trim(), details: 'cuenta bloqueada por intentos' })
        setLoginError('Demasiados intentos fallidos. Espera 5 minutos.')
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      if (!nftImage) { setLoginError('Debes subir tu imagen NFT de identidad'); return }

      if (!nftBiometricOk) {
        const bioOk = await requireNftBiometric('verificar imagen NFT')
        if (!bioOk) return
      }

      const result = await verifyNftImage(username.trim(), nftImage)
      if (!result.ok) {
        logAudit('LOGIN_FAILED', { username: username.trim(), details: 'NFT incorrecto' })
        const remaining = getRemainingAttempts(username.trim())
        setLoginError(`Imagen NFT incorrecta. Te quedan ${remaining} intentos.`)
        return
      }

      logAudit('LOGIN_SUCCESS', { username: username.trim(), wallet: address || undefined })

      if (isConnected) {
        await completeLogin(address)
        return
      }
      setStep(3)
    }

    if (step === 3) {
      let walletAddress = address
      if (!walletAddress) walletAddress = await connect()
      if (walletAddress) await completeLogin(walletAddress)
    }
  }

  const completeLogin = async (walletAddress?: string | null) => {
    const addr = walletAddress || address
    if (role === 'student') {
      login({
        id: addr || 'manual', name: username, email: `${username}@academy.com`,
        role: 'student', active: true, registered_at: Date.now(),
      }, nftImage || undefined)
      navigate('/student/dashboard')
    } else {
      loginTeacher({
        id: addr || 'manual', name: username, specialty: 'General',
        education_level: 'Universidad', email: `${username}@academy.com`,
        wallet: addr || 'manual', verified: true,
      }, nftImage || undefined)
      navigate('/teacher/dashboard')
    }
  }

  const handleFundWallet = async () => {
    if (address) await fundTestnetAccount(address)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <FiZap className="text-white w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Iniciar Sesión</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {step === 1 ? 'Ingresa tu usuario' : step === 2 ? 'Verifica tu identidad' : 'Conecta tu wallet'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <div className="flex mb-6 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${role === 'student' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600' : 'text-slate-500'}`} onClick={() => setRole('student')}>
              <FiUser className="w-4 h-4" /> Alumno
            </button>
            <button className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${role === 'teacher' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600' : 'text-slate-500'}`} onClick={() => setRole('teacher')}>
              <FiShield className="w-4 h-4" /> Docente
            </button>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step >= s ? 'gradient-primary text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-400'}`}>{s}</div>
                {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Usuario</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Tu usuario registrado" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-slate-500 mb-4">
                  Sube la <strong>misma imagen NFT</strong> que usaste al registrarte.
                  <br />Es tu identidad única e intransferible.
                </div>
                <div className={`w-36 h-36 rounded-2xl border-2 border-dashed ${nftBiometricLoading ? 'border-blue-300 dark:border-blue-600' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center mx-auto overflow-hidden bg-slate-50 dark:bg-slate-700 cursor-pointer hover:border-primary-400 transition-colors`} onClick={handleNftUploadClick}>
                  {nftImage ? <img src={nftImage} alt="NFT" className="w-full h-full object-cover" /> : (
                    <div className="text-center p-4">
                      {nftBiometricLoading ? (
                        <FiLock className="w-8 h-8 mx-auto text-blue-400 mb-1 animate-pulse" />
                      ) : (
                        <FiImage className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                      )}
                      <span className="text-xs text-slate-400">
                        {nftBiometricLoading ? 'Verificando...' : 'Toca para subir'}
                      </span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleNftUpload} className="hidden" />

                {nftBiometricLoading && (
                  <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                    <FiLock className="w-3 h-3 animate-pulse" /> Windows Hello — verifica tu identidad
                  </div>
                )}
                {nftBiometricOk && !nftBiometricLoading && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <FiCheckCircle className="w-3 h-3" /> Identidad verificada
                  </div>
                )}
                {nftBiometricError && !nftBiometricLoading && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-red-500">
                    <FiAlertCircle className="w-3 h-3" /> {nftBiometricError}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <FiLock className="w-12 h-12 mx-auto text-green-500 mb-2" />
                <p className="text-sm font-medium text-green-600 dark:text-green-400">NFT verificado correctamente</p>
                <p className="text-xs text-slate-500 mt-1">Ahora conecta tu wallet para continuar</p>
              </div>
              {!isConnected ? (
                <div>
                  <button onClick={connect} disabled={isConnecting} className="w-full py-3 gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <FiZap className="w-4 h-4" /> {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
                  </button>
                  <p className="text-xs text-center text-slate-400 mt-2">O puedes continuar sin wallet (modo limitado)</p>
                </div>
              ) : (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <FiCheckCircle className="w-4 h-4" />
                      <span className="font-mono font-medium">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </span>
                    <button type="button" onClick={handleFundWallet} className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium">
                      <FiDroplet className="w-3 h-3" /> Financiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(loginError || error) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{loginError || error}</span>
            </div>
          )}

          <button onClick={handleSubmit} disabled={isConnecting || nftBiometricLoading} className="w-full mt-6 py-3 gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {step === 1 ? 'Siguiente' : step === 2 ? 'Verificar NFT' : isConnecting ? 'Conectando...' : 'Ingresar'}
          </button>

          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="w-full mt-2 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">← Atrás</button>
          )}

          <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">Registrarse</Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
