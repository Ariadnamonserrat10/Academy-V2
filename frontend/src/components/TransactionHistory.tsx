import { useCourses, TransactionRecord } from '../context/CourseContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiExternalLink, FiCopy, FiClock, FiArrowRight } from 'react-icons/fi'

interface Props {
  open: boolean
  onClose: () => void
}

export default function TransactionHistory({ open, onClose }: Props) {
  const { transactions } = useCourses()

  const copy = (text: string) => navigator.clipboard.writeText(text)

  const txs = [...transactions].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-bold text-lg">Historial de pagos</h2>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {txs.length === 0 ? (
                <div className="text-center py-12">
                  <FiClock className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-400">Aún no hay pagos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {txs.map((tx) => (
                    <TransactionCard key={tx.txHash} tx={tx} onCopy={copy} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-400 text-center">
                {txs.length} transacción{txs.length !== 1 ? 'es' : ''} registrada{txs.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function TransactionCard({ tx, onCopy }: { tx: TransactionRecord; onCopy: (t: string) => void }) {
  const date = new Date(tx.timestamp).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{date}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium">
          Confirmado
        </span>
      </div>
      <p className="font-semibold text-sm mb-2">{tx.courseTitle}</p>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-mono">
        <span className="truncate max-w-[80px]">{tx.buyerWallet.slice(0, 8)}...</span>
        <FiArrowRight className="w-3 h-3 shrink-0" />
        <span className="truncate max-w-[80px]">{tx.teacherWallet.slice(0, 8)}...</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-primary-500">{tx.amount} XLM</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCopy(tx.txHash)}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <FiCopy className="w-3 h-3" /> Hash
          </button>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            <FiExternalLink className="w-3 h-3" /> Ver
          </a>
        </div>
      </div>
    </div>
  )
}
