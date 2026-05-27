import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiShield, FiBook, FiCheckCircle, FiImage, FiZap, FiAlertCircle, FiCopy, FiCheck, FiExternalLink, FiLock, FiSmartphone } from 'react-icons/fi'
import { useWeb3 } from '../context/Web3Context'
import { useAuth } from '../context/AuthContext'
import { hashImage } from '../context/AuthContext'
import { CATEGORIES, EDUCATION_LEVELS } from '../utils/constants'
import { generateTestnetWallet, AccountGenerationError, GeneratedWallet } from '../utils/walletGenerator'
import { registerPasskey, isPasskeyAvailable, PasskeyRegistration } from '../utils/passkeyAuth'
import { useNftBiometricGate } from '../hooks/useNftBiometricGate'

export default function Register() {
  const { address, isConnected, connect, connectManual, error: web3Error } = useWeb3()
  const { login, loginTeacher, setInterests, saveAccount, savePasskeyForAccount } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef(address)
  addressRef.current = address

  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [step, setStep] = useState(1)
  const [nftImage, setNftImage] = useState<string | null>(null)
  const [passkeyStatus, setPasskeyStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [passkeyError, setPasskeyError] = useState<string | null>(null)
  const [passkeySupport, setPasskeySupport] = useState<{ webAuthn: boolean; platform: boolean; windowsHello: boolean } | null>(null)
  const [form, setForm] = useState({
    name: '', email: '', username: '', specialty: '', educationLevel: '',
    favoriteSubjects: [] as string[], interest: '', goal: '',
  })

  const totalSteps = role === 'teacher' ? 2 : 3

  const { nftBiometricOk, nftBiometricLoading, nftBiometricError, requireFor, pendingPasskeyRef } = useNftBiometricGate({
    autoRegister: true,
    walletAddress: address,
  })

  // Keep hook's pendingPasskeyRef in sync with passkeyStatus
  useEffect(() => {
    if (pendingPasskeyRef.current) setPasskeyStatus('done')
  }, [pendingPasskeyRef.current])

  useEffect(() => {
    isPasskeyAvailable().then(s => setPasskeySupport(s)).catch(() => {})
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleSubject = (subjectId: string) => {
    setForm(prev => ({
      ...prev,
      favoriteSubjects: prev.favoriteSubjects.includes(subjectId)
        ? prev.favoriteSubjects.filter(s => s !== subjectId)
        : [...prev.favoriteSubjects, subjectId],
    }))
  }

  const handleUploadClick = async () => {
    const ok = await requireFor('subir imagen NFT')
    if (ok) fileInputRef.current?.click()
  }

  const handleNftUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setNftImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const generateNftAvatar = async () => {
    const ok = await requireFor('generar avatar NFT')
    if (!ok) return
    const canvas = document.createElement('canvas')
    canvas.width = 200; canvas.height = 200
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const colors = ['#22C55E', '#16A34A', '#3B82F6', '#F59E0B', '#EF4444', '#06B6D4']
    const bgColor = colors[Math.floor(Math.random() * colors.length)]
    ctx.fillStyle = bgColor; ctx.fillRect(0, 0, 200, 200)
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.2})`
      ctx.beginPath(); ctx.arc(Math.random() * 200, Math.random() * 200, 10 + Math.random() * 30, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = 'white'; ctx.font = 'bold 60px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(form.name.charAt(0).toUpperCase() || '?', 100, 100)
    setNftImage(canvas.toDataURL())
  }

  const handleNext = () => {
    if (step === 1 && role === 'teacher') { setStep(2); return }
    setStep(step + 1)
  }

  const handleRegisterPasskey = async () => {
    setPasskeyStatus('loading')
    setPasskeyError(null)
    try {
      const reg = await registerPasskey(addressRef.current || 'manual')
      pendingPasskeyRef.current = reg
      setPasskeyStatus('done')
    } catch (e: any) {
      if (e?.name === 'PasskeyCancelled' || e?.message === 'USER_CANCELLED') {
        setPasskeyStatus('idle')
      } else {
        setPasskeyStatus('error')
        setPasskeyError(e?.message || 'Error al registrar passkey')
      }
    }
  }

  const handleRegister = async () => {
    if (!nftImage) { alert('Debes subir o generar una imagen NFT de identidad'); return }
    const nftHash = await hashImage(nftImage)
    let walletAddress = addressRef.current
    if (!walletAddress) walletAddress = await connect()

    if (role === 'student') {
      setInterests({ subject: form.favoriteSubjects.join(', '), level: form.educationLevel, area: form.specialty, goal: form.goal })
    }

    saveAccount({
      username: form.username, name: form.name, email: form.email, role: role,
      nftHash: nftHash, nftImage: nftImage, wallet: walletAddress || undefined,
      specialty: form.specialty, educationLevel: form.educationLevel,
    })

    if (pendingPasskeyRef.current) {
      try {
        savePasskeyForAccount(form.username, pendingPasskeyRef.current.credentialId, pendingPasskeyRef.current.publicKey)
      } catch { /* best-effort */ }
    }

    if (role === 'student') {
      login({ id: walletAddress || 'manual', name: form.name, email: form.email, role: 'student', active: true, registered_at: Date.now() }, nftImage)
      navigate('/student/dashboard')
    } else {
      loginTeacher({ id: walletAddress || 'manual', name: form.name, specialty: form.specialty || 'General', education_level: form.educationLevel || 'Universidad', email: form.email, wallet: walletAddress || 'manual', verified: true }, nftImage)
      navigate('/teacher/dashboard')
    }
  }

  const subtitle = step === 1 ? 'Elige tu rol y completa tus datos' : role === 'teacher' ? 'Tu NFT de identidad visual' : 'Cuéntanos sobre tus intereses académicos'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Crear Cuenta</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'gradient-primary text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-400'}`}>{s}</div>
                {s < totalSteps && <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex mb-6 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <button className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${role === 'student' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600' : 'text-slate-500'}`} onClick={() => setRole('student')}>
                  <FiUser className="w-4 h-4" /> Alumno
                </button>
                <button className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${role === 'teacher' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600' : 'text-slate-500'}`} onClick={() => setRole('teacher')}>
                  <FiShield className="w-4 h-4" /> Docente
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre completo</label>
                  <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Correo electrónico</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="correo@ejemplo.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Usuario</label>
                  <input name="username" value={form.username} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="usuario123" />
                </div>
              </div>

              {role === 'teacher' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Especialidad</label>
                    <input name="specialty" value={form.specialty} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej: Matemáticas" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nivel educativo</label>
                    <select name="educationLevel" value={form.educationLevel} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">Seleccionar...</option>
                      {EDUCATION_LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {!isConnected && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                  <FiAlertCircle className="w-4 h-4 inline" /> Necesitarás conectar Freighter Wallet al finalizar
                </div>
              )}
            </div>
          )}

          {step === 2 && role === 'student' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">¿Qué materias te interesan?</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.slice(0, 15).map(cat => (
                    <button key={cat.id} onClick={() => toggleSubject(cat.id)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${form.favoriteSubjects.includes(cat.id) ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/20 dark:border-primary-600 dark:text-primary-300' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary-300'}`}>
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nivel educativo deseado</label>
                <select name="educationLevel" value={form.educationLevel} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Seleccionar nivel...</option>
                  {EDUCATION_LEVELS.map(l => <option key={l.id} value={l.id}>{l.name} - {l.description}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">¿Qué área te gusta más?</label>
                <input name="specialty" value={form.specialty} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej: Tecnología, Ciencias, Arte..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">¿Qué deseas aprender?</label>
                <input name="goal" value={form.goal} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej: Programación web, Blockchain, Diseño..." />
              </div>
            </div>
          )}

          {(step === totalSteps) && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 flex items-center justify-center gap-2"><FiImage className="w-5 h-5 text-primary-500" /> Tu NFT de Identidad</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sube una imagen NFT única que te identificará para siempre en la plataforma.</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-700">
                  {nftImage ? <img src={nftImage} alt="NFT Identity" className="w-full h-full object-cover" /> : <FiImage className="w-10 h-10 text-slate-300" />}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={handleUploadClick} disabled={nftBiometricLoading} className="px-4 py-2 text-sm gradient-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5">
                    {nftBiometricLoading ? <FiLock className="w-3.5 h-3.5 animate-pulse" /> : null}
                    {nftBiometricLoading ? 'Verificando...' : 'Subir Imagen'}
                  </button>
                  <button type="button" onClick={generateNftAvatar} disabled={nftBiometricLoading} className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1.5">
                    {nftBiometricLoading ? <FiLock className="w-3.5 h-3.5 animate-pulse" /> : null}
                    {nftBiometricLoading ? 'Verificando...' : 'Generar Avatar NFT'}
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleNftUpload} className="hidden" />

                {nftBiometricLoading && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                    <FiLock className="w-3 h-3 animate-pulse" /> Windows Hello — verifica tu identidad
                  </div>
                )}
                {nftBiometricOk && !nftBiometricLoading && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <FiCheckCircle className="w-3 h-3" /> Identidad verificada con Windows Hello
                  </div>
                )}
                {nftBiometricError && !nftBiometricLoading && (
                  <div className="flex items-center gap-1.5 text-xs text-red-500">
                    <FiAlertCircle className="w-3 h-3" /> {nftBiometricError}
                  </div>
                )}
              </div>

              {isConnected ? (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700 dark:text-green-300"><FiCheckCircle className="w-4 h-4 inline" /> Wallet conectada: {address?.slice(0, 8)}...{address?.slice(-6)}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button onClick={connect} className="w-full py-3 gradient-primary text-white font-semibold rounded-xl">Conectar Freighter Wallet</button>
                  {web3Error && <p className="text-xs text-red-500 mt-2 text-center">{web3Error}</p>}

                  <div className="relative flex items-center gap-2 my-2">
                    <div className="flex-1 h-px bg-slate-200 dark:border-slate-600" />
                    <span className="text-xs text-slate-400">o</span>
                    <div className="flex-1 h-px bg-slate-200 dark:border-slate-600" />
                  </div>

                  <GenerateWalletSection
                    onConnected={(pk, sk) => connectManual(pk, sk)}
                  />
                </div>
              )}

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-left">
                <p className="text-sm font-medium mb-2">Resumen de tu perfil:</p>
                <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                  <li className="flex items-center gap-2"><FiUser className="w-3.5 h-3.5 text-slate-400" /> {form.name}</li>
                  <li className="flex items-center gap-2"><FiZap className="w-3.5 h-3.5 text-slate-400" /> {form.email}</li>
                  <li className="flex items-center gap-2"><FiShield className="w-3.5 h-3.5 text-slate-400" /> Rol: {role === 'student' ? 'Alumno' : 'Docente'}</li>
                  {role === 'student' && form.favoriteSubjects.length > 0 && <li className="flex items-center gap-2"><FiBook className="w-3.5 h-3.5 text-slate-400" /> Intereses: {form.favoriteSubjects.length} materias</li>}
                  {role === 'teacher' && <li className="flex items-center gap-2"><FiBook className="w-3.5 h-3.5 text-slate-400" /> {form.specialty || 'Sin especialidad'}</li>}
                  <li className="flex items-center gap-2"><FiImage className="w-3.5 h-3.5 text-slate-400" /> NFT: {nftImage ? 'Asignada' : 'Pendiente'}</li>
                </ul>
              </div>

              {/* ── Visible passkey section ── */}
              <div className="border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <FiLock className="text-primary-500" /> Seguridad biométrica
                </h4>

                {passkeySupport === null ? (
                  <p className="text-xs text-slate-400">Verificando compatibilidad...</p>
                ) : !passkeySupport.webAuthn ? (
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs text-slate-500">
                    <FiAlertCircle className="w-3 h-3 inline mr-1" /> WebAuthn no está disponible en este navegador (requiere HTTPS o localhost)
                  </div>
                ) : passkeyStatus === 'done' ? (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4" /> Passkey registrado correctamente
                  </div>
                ) : passkeyStatus === 'error' ? (
                  <div className="space-y-2">
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                      {passkeyError || 'Error al registrar passkey'}
                    </div>
                    <button onClick={handleRegisterPasskey} className="text-xs text-primary-500 hover:text-primary-600 underline">Reintentar</button>
                  </div>
                ) : passkeyStatus === 'loading' ? (
                  <p className="text-xs text-slate-400 text-center py-2">Registrando...</p>
                ) : (
                  <div>
                    <p className="text-xs text-slate-500 mb-3">
                      {passkeySupport.windowsHello
                        ? 'Windows Hello está disponible. Registra un passkey para iniciar sesión con huella, rostro o PIN.'
                        : passkeySupport.platform
                        ? 'Tu dispositivo soporta autenticación biométrica. Regístrala para mayor seguridad.'
                        : 'Registra un passkey para autenticación sin contraseña.'}
                    </p>
                    <button
                      onClick={handleRegisterPasskey}
                      className="w-full py-2 border-2 border-dashed border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2"
                    >
                      <FiSmartphone className="w-4 h-4" /> Registrar {passkeySupport.windowsHello ? 'Windows Hello' : 'Passkey'}
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1.5 text-center">Opcional — puedes saltar este paso</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 py-3 border border-slate-200 dark:border-slate-600 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Atrás</button>
            )}
            {step < totalSteps ? (
              <button onClick={handleNext} className="flex-1 py-3 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-all">Siguiente</button>
            ) : (
              <button onClick={handleRegister} className="flex-1 py-3 gradient-accent text-white rounded-xl font-medium hover:opacity-90 transition-all">{isConnected ? 'Crear Cuenta' : 'Conectar y Crear Cuenta'}</button>
            )}
          </div>

          <p className="text-center mt-6 text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">Iniciar Sesión</Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Generate Testnet Wallet section ────────────────────────────

function GenerateWalletSection({ onConnected }: { onConnected: (pk: string, sk: string) => void }) {
  const [generating, setGenerating] = useState(false)
  const [wallet, setWallet] = useState<GeneratedWallet | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [used, setUsed] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true); setError(null); setWallet(null)
    try {
      const result = await generateTestnetWallet()
      setWallet(result)
    } catch (e: any) {
      setError(e.message || 'Error al generar wallet')
    } finally { setGenerating(false) }
  }

  const handleCopy = () => {
    if (!wallet) return
    navigator.clipboard.writeText(wallet.secretKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const handleUse = () => {
    if (!wallet) return
    onConnected(wallet.publicKey, wallet.secretKey)
    setUsed(true)
  }

  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-xl p-4">
      {!wallet && !generating && (
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-3">Genera una wallet Testnet automática con 10,000 XLM de prueba</p>
          <button onClick={handleGenerate} className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-500 text-slate-500 dark:text-slate-400 rounded-xl text-sm font-medium hover:border-primary-300 hover:text-primary-500 transition-all">
            <FiZap className="w-4 h-4 inline mr-1.5" /> Generar Wallet Testnet
          </button>
        </div>
      )}

      {generating && (
        <div className="text-center py-4">
          <div className="w-8 h-8 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
            <FiZap className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
          <p className="text-sm font-medium">Generando wallet...</p>
          <p className="text-xs text-slate-400 mt-1">Creando keypair y fondeando via Friendbot</p>
        </div>
      )}

      {error && (
        <div className="text-center">
          <p className="text-xs text-red-500 mb-2">{error}</p>
          <button onClick={handleGenerate} className="text-xs text-primary-500 hover:text-primary-600 underline">Reintentar</button>
        </div>
      )}

      {wallet && !used && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <FiCheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Wallet generada con éxito</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-2 text-left">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Clave pública</p>
              <code className="text-xs font-mono text-slate-600 dark:text-slate-300 break-all">{wallet.publicKey}</code>
            </div>
            <div>
              <p className="text-xs text-amber-500 mb-0.5">Clave secreta (guárdala segura)</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-amber-600 dark:text-amber-400 break-all select-all">{wallet.secretKey}</code>
                <button onClick={handleCopy} className="shrink-0 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors">
                  {copied ? <FiCheck className="w-3.5 h-3.5 text-green-500" /> : <FiCopy className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400">Saldo: <span className="font-medium">{wallet.balance} XLM</span></p>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Importa esta wallet en Freighter: haz clic en el ícono de Freighter → Add Account → Import Secret Key → pega la clave secreta
          </p>

          <div className="flex gap-2">
            <button onClick={handleUse} className="flex-1 py-2 gradient-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all">Usar esta wallet</button>
            <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar clave'}
            </button>
          </div>
        </div>
      )}

      {used && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl text-center">
          <p className="text-sm text-green-700 dark:text-green-300">
            <FiCheckCircle className="w-4 h-4 inline mr-1" /> Wallet conectada como: {wallet?.publicKey.slice(0, 8)}...{wallet?.publicKey.slice(-6)}
          </p>
        </div>
      )}
    </div>
  )
}
