import { useState } from 'react'
import { FiAward, FiCheckCircle, FiDownload, FiExternalLink, FiX, FiStar, FiCalendar, FiUser, FiShield } from 'react-icons/fi'
import { motion } from 'framer-motion'

interface CertItem {
  id: string
  courseName: string
  teacher: string
  grade: number
  issuedAt: string
  blockchainHash: string
  valid: boolean
}

export default function StudentCertificates() {
  const [selectedCert, setSelectedCert] = useState<CertItem | null>(null)

  const certificates: CertItem[] = [
    {
      id: 'CERT-001',
      courseName: 'Introducción a la Programación Web',
      teacher: '0xTeacher1...aBcD',
      grade: 95,
      issuedAt: '2026-04-15',
      blockchainHash: '0x7a3f...c9d2e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d',
      valid: true,
    },
    {
      id: 'CERT-002',
      courseName: 'Fundamentos de Blockchain',
      teacher: '0xTeacher2...EfGh',
      grade: 88,
      issuedAt: '2026-04-10',
      blockchainHash: '0x9b8c...d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e',
      valid: true,
    },
  ]

  return (
    <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <FiAward className="w-8 h-8 text-amber-500" /> Mis Certificados NFT
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Certificados acad&eacute;micos verificables en blockchain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden card-hover cursor-pointer"
            onClick={() => setSelectedCert(cert)}
          >
            <div className="gradient-warm p-6 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBhMTAgMTAgMCAwIDAgMTAgMTAgMTAgMTAgMCAwIDAtMTAtMTAgMTAgMTAgMCAwIDAtMTAgMTAgMTAgMTAgMCAwIDAgMTAgMTB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] opacity-20" />
              <div className="relative">
                <FiAward className="w-12 h-12 mx-auto mb-2" />
                <h3 className="text-xl font-bold mb-1">Certificado NFT</h3>
                <p className="text-sm opacity-80">{cert.courseName}</p>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5"><FiUser className="w-3.5 h-3.5" /> Docente:</span>
                  <span className="font-medium">{cert.teacher}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5"><FiStar className="w-3.5 h-3.5" /> Calificaci&oacute;n:</span>
                  <span className="font-bold text-primary-500">{cert.grade}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5"><FiCalendar className="w-3.5 h-3.5" /> Fecha:</span>
                  <span>{cert.issuedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5"><FiShield className="w-3.5 h-3.5" /> Estado:</span>
                  <span className="text-green-500 font-medium flex items-center gap-1"><FiCheckCircle className="w-3.5 h-3.5" /> V&aacute;lido en blockchain</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedCert(cert) }}
                className="w-full mt-4 py-2 border border-primary-500 text-primary-500 text-sm font-medium rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all flex items-center justify-center gap-2"
              >
                <FiExternalLink className="w-4 h-4" /> Ver detalle blockchain
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCert(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-8 relative animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedCert(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <FiX className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <FiAward className="w-16 h-16 mx-auto text-amber-500 mb-2" />
              <h3 className="text-xl font-bold">Certificado NFT</h3>
              <p className="text-slate-500 text-sm">{selectedCert.courseName}</p>
            </div>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <span className="text-slate-500">ID del Certificado</span>
                <span className="font-mono font-medium">{selectedCert.id}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <span className="text-slate-500">Estudiante</span>
                <span className="font-medium">Conectado</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <span className="text-slate-500">Docente</span>
                <span className="font-medium">{selectedCert.teacher}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <span className="text-slate-500">Calificaci&oacute;n</span>
                <span className="font-bold text-primary-500">{selectedCert.grade}/100</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <span className="text-slate-500">Fecha de emisi&oacute;n</span>
                <span>{selectedCert.issuedAt}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <span className="text-slate-500">Estado</span>
                <span className="text-green-500 font-medium flex items-center gap-1"><FiCheckCircle className="w-4 h-4" /> V&aacute;lido</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl mb-6">
              <p className="text-xs text-slate-500 mb-1">Hash de transacci&oacute;n blockchain:</p>
              <p className="text-xs font-mono text-primary-500 break-all">{selectedCert.blockchainHash}</p>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-2.5 gradient-primary text-white rounded-xl font-medium text-sm hover:opacity-90 flex items-center justify-center gap-2">
                <FiExternalLink className="w-4 h-4" /> Ver en Stellar Expert
              </button>
              <button className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                <FiDownload className="w-4 h-4" /> Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
