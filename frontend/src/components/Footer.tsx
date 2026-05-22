import { FiZap, FiBook, FiAward, FiHelpCircle, FiFileText, FiChevronRight, FiGlobe } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <FiZap className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-bold">Academy</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Plataforma educativa descentralizada construida sobre Stellar blockchain.
              Certificados verificados y aprendizaje Web3.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-400">Plataforma</h3>
            <ul className="space-y-3">
              {['Cursos', 'Categorías', 'Docentes', 'Certificaciones'].map(item => (
                <li key={item}>
                  <a href="#" className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors">
                    <FiChevronRight className="w-3 h-3" /> {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-400">Recursos</h3>
            <ul className="space-y-3">
              {[
                { label: 'Blog', icon: FiFileText },
                { label: 'Ayuda', icon: FiHelpCircle },
                { label: 'Tutoriales', icon: FiBook },
                { label: 'Documentación', icon: FiFileText },
              ].map(({ label, icon: Icon }) => (
                <li key={label}>
                  <a href="#" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-400">Blockchain</h3>
            <ul className="space-y-3">
              {[
                { label: 'Stellar', icon: FiZap },
                { label: 'Soroban', icon: FiZap },
                { label: 'Freighter Wallet', icon: FiAward },
                { label: 'Testnet', icon: FiGlobe },
              ].map(({ label, icon: Icon }) => (
                <li key={label}>
                  <a href="#" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>&copy; 2026 Academy. Todos los derechos reservados. Construido sobre Stellar blockchain.</p>
        </div>
      </div>
    </footer>
  )
}

