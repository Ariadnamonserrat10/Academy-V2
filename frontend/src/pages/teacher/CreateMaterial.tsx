import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiFileText, FiImage, FiDollarSign, FiZap, FiSave, FiCheckCircle, FiAlertCircle, FiBook, FiHelpCircle } from 'react-icons/fi'
import { CATEGORIES, EDUCATION_LEVELS } from '../../utils/constants'
import { useWeb3 } from '../../context/Web3Context'
import { payXLM } from '../../utils/payments'

export default function TeacherCreateMaterial() {
  const { address, balance, fetchBalance, secretKey } = useWeb3()
  const imgRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category: '',
    level: '',
    price: '',
    minWeight: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const minMB = parseInt(form.minWeight) || 0
    const fileMB = file.size / (1024 * 1024)
    if (minMB > 0 && fileMB > minMB) {
      setMsg({ type: 'error', text: `El archivo pesa ${fileMB.toFixed(1)}MB. Supera el límite de ${minMB}MB.` })
      return
    }
    setMsg(null)
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) { setMsg({ type: 'error', text: 'Conecta tu wallet primero' }); return }
    if (!fileName) { setMsg({ type: 'error', text: 'Selecciona un archivo para subir' }); return }
    const price = parseInt(form.price)
    if (isNaN(price) || price < 0) { setMsg({ type: 'error', text: 'Precio inválido' }); return }
    if (parseFloat(balance) < 0.5) { setMsg({ type: 'error', text: `Saldo insuficiente. Tienes ${balance} XLM` }); return }

    setPublishing(true); setMsg(null)
    try {
      await payXLM(address, 0.5, undefined, secretKey || undefined)
      await fetchBalance(address)
      setMsg({ type: 'ok', text: `"${form.name}" publicado en Testnet!` })
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Error al publicar' })
    } finally { setPublishing(false) }
  }

  return (
    <motion.div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <FiFileText className="w-8 h-8 text-amber-500" /> Subir Material / Documento
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Documentos, guías, videos y recursos educativos</p>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${msg.type === 'ok' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.type === 'ok' ? <FiCheckCircle className="w-4 h-4 flex-shrink-0" /> : <FiAlertCircle className="w-4 h-4 flex-shrink-0" />}
          {msg.text}
        </div>
      )}

      <form onSubmit={handlePublish} className="space-y-6">

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><FiFileText className="w-5 h-5 text-amber-500" /> Información del Material</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Nombre del material</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej: Guía de ejercicios de Cálculo" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Imagen representativa</label>
              <div className="flex items-center gap-4">
                <div className="w-28 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-700 cursor-pointer" onClick={() => imgRef.current?.click()}>
                  {image ? <img src={image} className="w-full h-full object-cover" /> : <FiImage className="w-6 h-6 text-slate-400" />}
                </div>
                <input ref={imgRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                <span className="text-xs text-slate-400">Imagen de portada para el material</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1"><FiBook className="w-3.5 h-3.5 text-slate-400" /> Materia</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">Seleccionar materia...</option>
                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1"><FiHelpCircle className="w-3.5 h-3.5 text-slate-400" /> Nivel educativo</label>
              <select name="level" value={form.level} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">Seleccionar nivel...</option>
                {EDUCATION_LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1"><FiDollarSign className="w-3.5 h-3.5 text-slate-400" /> Precio (XLM)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="10" min="0" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1"><FiZap className="w-3.5 h-3.5 text-slate-400" /> Peso máximo (MB)</label>
              <input name="minWeight" type="number" value={form.minWeight} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="50" min="1" />
              <p className="text-xs text-slate-400 mt-1">Los archivos más pesados que este límite serán rechazados</p>
            </div>
          </div>
        </div>

        {/* Selección de archivo */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><FiFileText className="w-5 h-5 text-amber-500" /> Archivo</h2>
          <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-center cursor-pointer" onClick={() => fileRef.current?.click()}>
            {fileName ? (
              <div className="flex items-center justify-center gap-2 text-sm">
                <FiFileText className="w-5 h-5 text-amber-500" />
                <span className="font-medium">{fileName}</span>
                <span className="text-xs text-green-500 flex items-center gap-1"><FiCheckCircle className="w-3 h-3" /> Seleccionado</span>
              </div>
            ) : (
              <>
                <FiFileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500 mb-1">Toca para seleccionar un archivo</p>
                <p className="text-xs text-slate-400">PDF, DOC, MP4, ZIP</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />
        </div>

        {address && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-300 w-fit">
            <FiZap className="w-4 h-4" /> Saldo: {balance} XLM &middot; Publicar cuesta 0.5 XLM
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={publishing} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {publishing ? 'Publicando...' : <><FiZap className="w-5 h-5" /> Publicar Material (0.5 XLM)</>}
          </button>
          <button type="button" className="flex items-center gap-2 px-6 py-3 border border-slate-200 dark:border-slate-600 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <FiSave className="w-4 h-4" /> Guardar Borrador
          </button>
        </div>
      </form>
    </motion.div>
  )
}
