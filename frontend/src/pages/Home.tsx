import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiZap, FiBook, FiAward, FiGlobe, FiArrowRight, FiStar, FiTrendingUp } from 'react-icons/fi'
import { CATEGORIES } from '../utils/constants'
import { useCourses } from '../context/CourseContext'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }

export default function Home() {
  const { courses } = useCourses()
  const featured = courses.slice(0, 3)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0zNiAxNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-6">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                Blockchain Testnet Activo
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
                La Educaci&oacute;n{' '}
                <span className="bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent">
                  Descentralizada
                </span>{' '}
                del Futuro
              </h1>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                Aprende con cursos certificados en blockchain. Conecta tu wallet,
                compra cursos y obt&eacute;n certificados verificados.
              </p>
              <div className="flex items-center gap-6 mt-8 text-sm text-blue-200">
                <span className="flex items-center gap-1.5"><FiGlobe className="w-4 h-4" /> Stellar Soroban</span>
                <span className="flex items-center gap-1.5"><FiAward className="w-4 h-4" /> Certificados On-Chain</span>
                <span className="flex items-center gap-1.5"><FiTrendingUp className="w-4 h-4" /> Web3</span>
              </div>
            </motion.div>
            <motion.div className="hidden md:block relative" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
              <div className="w-96 h-96 mx-auto rounded-2xl bg-blue-500/10 backdrop-blur-xl border border-white/10 p-8">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        i === 1 ? 'bg-emerald-500/30 text-emerald-300' : 
                        i === 2 ? 'bg-amber-500/30 text-amber-300' : 
                        'bg-blue-500/30 text-blue-300'
                      }`}>
                        {i === 1 ? <FiBook className="w-5 h-5" /> : i === 2 ? <FiAward className="w-5 h-5" /> : <FiStar className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{['Curso de Blockchain', 'Certificado Verificado #001', 'Logro Desbloqueado'][i - 1]}</p>
                        <p className="text-xs text-blue-200">{['En progreso', 'Verificado en Testnet', 'Gamificaci&oacute;n'][i - 1]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.section className="py-16 bg-slate-50 dark:bg-slate-800/50" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Explora por Categor&iacute;as</h2>
            <p className="text-slate-500 dark:text-slate-400">M&aacute;s de 25 categor&iacute;as acad&eacute;micas disponibles</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CATEGORIES.slice(0, 12).map((cat) => (
              <div
                key={cat.id}
                className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 card-hover cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                  <FiBook className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="py-16" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Cursos Destacados</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Los m&aacute;s populares en Academy</p>
            </div>
            <Link to="/student/explore" className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium text-sm">
              Ver todos <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.length > 0 ? featured.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden card-hover"
              >
                {course.image ? (
                  <div className="h-40 overflow-hidden">
                    <img src={course.image} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-40 gradient-accent flex items-center justify-center">
                    <FiBook className="w-12 h-12 text-white/50" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                      {CATEGORIES.find(c => c.id === course.category)?.name}
                    </span>
                    <span className="text-xs text-slate-400">{course.level}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-500 font-bold">{course.price} XLM</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <FiStar className="w-3 h-3 text-amber-400" /> {course.students} alumnos
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-slate-400 col-span-3 text-center py-8">No hay cursos disponibles aún</p>
            )}
          </div>
        </div>
      </motion.section>

      <motion.section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">&iquest;Listo para empezar?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Conecta tu wallet Freighter, elige tus cursos y obt&eacute;n certificados verificados en la blockchain de Stellar.
          </p>
          <div className="flex justify-center gap-12 text-center">
            <div>
              <div className="text-3xl font-bold">25+</div>
              <div className="flex items-center justify-center gap-1.5 text-sm text-blue-200 mt-1">
                <FiBook className="w-4 h-4" /> Categor&iacute;as
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">100+</div>
              <div className="flex items-center justify-center gap-1.5 text-sm text-blue-200 mt-1">
                <FiTrendingUp className="w-4 h-4" /> Cursos
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">✓</div>
              <div className="flex items-center justify-center gap-1.5 text-sm text-blue-200 mt-1">
                <FiAward className="w-4 h-4" /> Verificados
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
