import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiAlertCircle, FiLoader, FiExternalLink, FiCopy, FiArrowRight } from 'react-icons/fi'
import { useCourses } from '../context/CourseContext'

export default function PaymentModal() {
  const {
    purchaseStep, purchaseError, purchasedCourseId,
    lastTransaction, clearPurchaseState,
  } = useCourses()
  useEffect(() => {
    if (purchaseStep === 'done' && purchasedCourseId) {
      const timer = setTimeout(() => {
        clearPurchaseState()
        window.location.href = `/student/course/${purchasedCourseId}`
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [purchaseStep, purchasedCourseId, clearPurchaseState])

  const handleDismiss = () => {
    if (purchaseStep === 'error') clearPurchaseState()
  }

  const copyHash = () => {
    if (lastTransaction?.hash) {
      navigator.clipboard.writeText(lastTransaction.hash)
    }
  }

  const show = purchaseStep !== null

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
          >
            <div className="p-8 text-center">

              {/* ── processing steps ── */}
              {purchaseStep !== 'done' && purchaseStep !== 'error' && (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                    <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">
                    {purchaseStep === 'building-tx' && 'Preparando transacción'}
                    {purchaseStep === 'wallet-confirm' && 'Confirma en Freighter'}
                    {purchaseStep === 'submitting' && 'Enviando transacción'}
                    {purchaseStep === 'confirming' && 'Verificando pago'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {purchaseStep === 'building-tx' && 'Conectando con la red Stellar Testnet...'}
                    {purchaseStep === 'wallet-confirm' && 'Freighter se abrirá para que firmes la transacción'}
                    {purchaseStep === 'submitting' && 'Enviando a la red Stellar...'}
                    {purchaseStep === 'confirming' && 'Esperando confirmación en Horizon...'}
                  </p>
                  {purchaseStep === 'wallet-confirm' && (
                    <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400">
                      <FiExternalLink className="w-3 h-3" />
                      <span>Freighter debe abrirse automáticamente</span>
                    </div>
                  )}
                  <div className="flex justify-center gap-1.5 mt-5">
                    {['building-tx', 'wallet-confirm', 'submitting', 'confirming'].map((step) => {
                      const steps = ['building-tx', 'wallet-confirm', 'submitting', 'confirming']
                      const idx = steps.indexOf(step)
                      const currentIdx = steps.indexOf(purchaseStep!)
                      return (
                        <div key={step} className={`w-2 h-2 rounded-full transition-all ${
                          idx <= currentIdx ? 'bg-blue-500 scale-110' : 'bg-slate-200 dark:bg-slate-600'
                        }`} />
                      )
                    })}
                  </div>
                </>
              )}

              {/* ── done ── */}
              {purchaseStep === 'done' && (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
                    <FiCheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Pago exitoso</h3>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                    {lastTransaction?.amount} XLM transferidos al instructor
                  </p>

                  {lastTransaction?.hash && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 mb-4 text-left">
                      <p className="text-xs text-slate-400 mb-1">Hash de transacción</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate flex-1">
                          {lastTransaction.hash}
                        </code>
                        <button onClick={copyHash} className="shrink-0 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors">
                          <FiCopy className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${lastTransaction.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 mt-1.5 text-xs text-blue-500 hover:text-blue-600"
                      >
                        <FiExternalLink className="w-3 h-3" /> Ver en Stellar Expert
                      </a>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mb-4">Curso adquirido. Redirigiendo...</p>
                  <div className="flex justify-center">
                    <FiLoader className="w-4 h-4 text-green-500 animate-spin" />
                  </div>
                </>
              )}

              {/* ── error ── */}
              {purchaseStep === 'error' && (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-5">
                    <FiAlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Error en el pago</h3>
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4 text-left">
                    <p className="text-sm text-red-600 dark:text-red-400">{purchaseError || 'Ocurrió un error'}</p>
                  </div>
                  <button onClick={handleDismiss} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Cerrar
                  </button>
                </>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
