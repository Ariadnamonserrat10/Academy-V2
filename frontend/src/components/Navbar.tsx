import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiZap, FiUser, FiLogOut, FiBook, FiCompass, FiBarChart2, FiAward, FiHome, FiPlusCircle, FiUsers, FiFileText, FiArrowRight, FiLogIn, FiChevronDown, FiExternalLink, FiHelpCircle, FiCheckCircle, FiCopy, FiCheck } from 'react-icons/fi'
import { useWeb3 } from '../context/Web3Context'
import { useAuth } from '../context/AuthContext'
import { generateTestnetWallet, GeneratedWallet } from '../utils/walletGenerator'

export default function Navbar() {
  const { address, isConnected, connect, disconnect, connectManual, isConnecting, error, clearError, balance } = useWeb3()
  const { role, logout, nftIdentity, ready } = useAuth()
  const navigate = useNavigate()
  const [showWalletMenu, setShowWalletMenu] = useState(false)
  const [manualPk, setManualPk] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const initialRender = useRef(true)

  useEffect(() => {
    if (initialRender.current) { initialRender.current = false; return }
    if (isConnected && !role && ready) navigate('/login')
  }, [isConnected, role, ready])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowWalletMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleConnect = async () => {
    clearError()
    const pk = await connect()
    if (pk) setShowWalletMenu(false)
  }

  const handleManualConnect = () => {
    if (!manualPk.startsWith('G')) return
    connectManual(manualPk)
    setManualPk('')
    setShowWalletMenu(false)
  }

  const handleLogout = () => {
    disconnect()
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <FiZap className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-bold">Academy</span>
            </Link>
            {role && (
              <div className="hidden md:flex items-center gap-5">
                {role === 'student' && (
                  <>
                    <Link to="/student/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><FiHome className="w-3.5 h-3.5" /> Inicio</Link>
                    <Link to="/student/explore" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><FiCompass className="w-3.5 h-3.5" /> Explorar</Link>
                    <Link to="/student/progress" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><FiBarChart2 className="w-3.5 h-3.5" /> Progreso</Link>
                    <Link to="/student/certificates" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><FiAward className="w-3.5 h-3.5" /> Certificados</Link>
                  </>
                )}
                {role === 'teacher' && (
                  <>
                    <Link to="/teacher/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><FiBarChart2 className="w-3.5 h-3.5" /> Dashboard</Link>
                    <Link to="/teacher/courses" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><FiBook className="w-3.5 h-3.5" /> Cursos</Link>
                    <Link to="/teacher/create-course" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><FiPlusCircle className="w-3.5 h-3.5" /> Crear</Link>
                    <Link to="/teacher/create-material" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><FiFileText className="w-3.5 h-3.5" /> Material</Link>
                    <Link to="/teacher/students" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><FiUsers className="w-3.5 h-3.5" /> Alumnos</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {role ? (
              <>
                {nftIdentity && (
                  <div className="w-7 h-7 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 hidden sm:block">
                    <img src={nftIdentity} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{address?.slice(0, 4)}...{address?.slice(-4)}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <FiZap className="w-3 h-3" /> {balance} XLM
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <FiLogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            ) : (
              <>
                {/* Wallet dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
                  >
                    <FiZap className="w-3.5 h-3.5" />
                    {isConnected ? 'Wallet' : 'Conectar'}
                    <FiChevronDown className="w-3 h-3" />
                  </button>

                  {showWalletMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                        {!isConnected ? (
                          <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                          >
                            <FiZap className="w-4 h-4" />
                            {isConnecting ? 'Conectando...' : 'Conectar con Freighter'}
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-2 py-1.5">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="font-mono text-xs text-green-700 dark:text-green-400">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                              </div>
                              <span className="text-xs font-medium text-amber-600">{balance} XLM</span>
                            </div>
                            <button
                              onClick={() => { disconnect(); setShowWalletMenu(false) }}
                              className="w-full text-xs text-red-500 hover:text-red-600 font-medium text-center py-1"
                            >
                              Desvincular wallet
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-3 space-y-3">
                        <div className="relative flex items-center gap-2">
                          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Alternativas</span>
                          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
                        </div>

                        <MiniWalletGenerator onConnected={(pk, sk) => { connectManual(pk, sk); setShowWalletMenu(false) }} />

                        <div className="relative flex items-center gap-2">
                          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">o clave manual</span>
                          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={manualPk}
                            onChange={e => setManualPk(e.target.value)}
                            placeholder="Clave pública G..."
                            className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                          <button
                            onClick={handleManualConnect}
                            disabled={!manualPk.startsWith('G')}
                            className="px-3 py-2 text-xs font-medium text-white bg-slate-500 rounded-lg hover:bg-slate-600 disabled:opacity-50"
                          >
                            Ingresar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    to="/login"
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Iniciar <span className="hidden sm:inline">Sesión</span>
                  </Link>
                  <span className="text-slate-300 dark:text-slate-600 text-sm">|</span>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Crear cuenta
                  </Link>
                </div>

                {error && (
                  <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg text-sm max-w-xs z-50">
                    <p className="font-medium">Error</p>
                    <p className="text-xs mt-1">{error}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

// ── Mini wallet generator for Navbar dropdown ──────────────────

function MiniWalletGenerator({ onConnected }: { onConnected: (pk: string, sk: string) => void }) {
  const [generating, setGenerating] = useState(false)
  const [wallet, setWallet] = useState<GeneratedWallet | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setWallet(null)
    try {
      const result = await generateTestnetWallet()
      setWallet(result)
    } catch (e: any) {
      setError(e.message || 'Error')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!wallet) return
    navigator.clipboard.writeText(wallet.secretKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="space-y-2">
      {!wallet && !generating && !error && (
        <button
          onClick={handleGenerate}
          className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-500 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-medium hover:border-blue-300 hover:text-blue-500 transition-all"
        >
          <FiZap className="w-3.5 h-3.5 inline mr-1" /> Generar Wallet Testnet
        </button>
      )}

      {generating && (
        <div className="text-center py-2">
          <FiZap className="w-4 h-4 mx-auto text-blue-500 animate-pulse mb-1" />
          <p className="text-xs font-medium">Generando wallet...</p>
        </div>
      )}

      {error && (
        <div className="text-center">
          <p className="text-xs text-red-400 mb-1">{error}</p>
          <button onClick={handleGenerate} className="text-[10px] text-blue-500 hover:text-blue-600 underline">Reintentar</button>
        </div>
      )}

      {wallet && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Wallet generada</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 space-y-1.5 text-left">
            <div>
              <p className="text-[10px] text-slate-400">Pública</p>
              <code className="text-[10px] font-mono text-slate-600 dark:text-slate-300 break-all">{wallet.publicKey}</code>
            </div>
            <div>
              <p className="text-[10px] text-amber-500">Secreta (guárdala)</p>
              <div className="flex items-center gap-1">
                <code className="text-[10px] font-mono text-amber-600 dark:text-amber-400 break-all flex-1 select-all">{wallet.secretKey}</code>
                <button onClick={handleCopy} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors">
                  {copied ? <FiCheck className="w-3 h-3 text-green-500" /> : <FiCopy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => onConnected(wallet.publicKey, wallet.secretKey)}
              className="flex-1 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Usar esta wallet
            </button>
            <button
              onClick={handleCopy}
              className="px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-600 text-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
