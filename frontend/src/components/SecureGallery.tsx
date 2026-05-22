import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLock, FiImage, FiCheckCircle, FiAlertCircle, FiZap } from 'react-icons/fi'
import { requireBiometric } from '../utils/passkeyAuth'

interface StoredNft {
  username: string
  name: string
  nftImage: string
  nftHash: string
  wallet?: string
}

interface SecureGalleryProps {
  onSelect: (nft: StoredNft, imageData: string) => void
  onClose: () => void
  filterUsername?: string
}

export default function SecureGallery({ onSelect, onClose, filterUsername }: SecureGalleryProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [biometricError, setBiometricError] = useState<string | null>(null)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [nftList, setNftList] = useState<StoredNft[]>([])
  const [selectedNft, setSelectedNft] = useState<StoredNft | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const accounts = JSON.parse(localStorage.getItem('academy_accounts') || '{}')
    const list: StoredNft[] = Object.values(accounts).map((a: any) => ({
      username: a.username,
      name: a.name,
      nftImage: a.nftImage,
      nftHash: a.nftHash,
      wallet: a.wallet,
    }))
    setNftList(list)
  }, [])

  const handleBiometricUnlock = async () => {
    setBiometricLoading(true)
    setBiometricError(null)
    const result = await requireBiometric('Desbloquear galería NFT')
    if (result.ok) {
      setUnlocked(true)
    } else {
      setBiometricError(result.error || 'Error de verificación')
    }
    setBiometricLoading(false)
  }

  const handleNftSelect = (nft: StoredNft) => {
    setSelectedNft(nft)
    setSelectedImage(null)
    setError(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setSelectedImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleVerify = () => {
    if (!selectedNft || !selectedImage) {
      setError('Selecciona un NFT y sube la imagen')
      return
    }
    if (filterUsername && selectedNft.username !== filterUsername) {
      setError('Este NFT no pertenece a tu cuenta')
      return
    }
    onSelect(selectedNft, selectedImage)
  }

  const filtered = filterUsername
    ? nftList.filter(n => n.username === filterUsername)
    : nftList

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FiImage className="text-primary-500" /> Galería Segura
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
          </div>

          {!unlocked ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <FiLock className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Verifica tu identidad con Windows Hello para acceder a la galería
              </p>
              <button
                onClick={handleBiometricUnlock}
                disabled={biometricLoading}
                className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {biometricLoading ? 'Verificando...' : <><FiLock className="w-4 h-4" /> Desbloquear con biometría</>}
              </button>
              {biometricError && (
                <p className="text-xs text-red-500 mt-3">{biometricError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  No hay NFTs registrados
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filtered.map((nft, i) => (
                    <button
                      key={i}
                      onClick={() => handleNftSelect(nft)}
                      className={`p-2 rounded-xl border-2 transition-all text-left ${
                        selectedNft?.username === nft.username
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-primary-300'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                        <img src={nft.nftImage} alt={nft.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-medium truncate">{nft.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{nft.username}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedNft && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm">
                    <p className="font-medium">{selectedNft.name}</p>
                    <p className="text-xs text-slate-400">@{selectedNft.username}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Sube la imagen NFT para verificar</p>
                    <div
                      className="w-full h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-700 cursor-pointer hover:border-primary-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {selectedImage ? (
                        <img src={selectedImage} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <FiImage className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                          <span className="text-xs text-slate-400">Toca para subir imagen</span>
                        </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>

                  {error && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> {error}
                    </div>
                  )}

                  <button
                    onClick={handleVerify}
                    className="w-full py-2.5 gradient-accent text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <FiZap className="w-4 h-4" /> Verificar NFT
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
