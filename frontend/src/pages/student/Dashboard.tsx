import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useWeb3 } from '../../context/Web3Context'
import { useCourses } from '../../context/CourseContext'
import { CATEGORIES } from '../../utils/constants'
import { FiBook, FiBarChart2, FiAward, FiClock, FiTrendingUp, FiFileText, FiDownload, FiSearch, FiZap, FiCheckCircle, FiAlertCircle, FiStar } from 'react-icons/fi'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user, interests, nftIdentity } = useAuth()
  const { address, balance } = useWeb3()
  const { courses, myCourses, purchaseCourse, loading } = useCourses()
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const handleBuy = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (!course) return
    setBuyingId(courseId); setMsg(null)
    const result = await purchaseCourse(course)
    if (result.ok) {
      navigate(`/student/course/${course.id}`)
      return
    }
    setBuyingId(null)
  }

  const recommended = courses.filter(c => !myCourses.some(m => m.id === c.id))

  return (
    <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {nftIdentity ? (
              <div className="w-16 h-16 rounded-xl border-2 border-white/30 overflow-hidden flex-shrink-0">
                <img src={nftIdentity} alt="NFT Identity" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <FiBook className="w-7 h-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                Bienvenido, {user?.name}!
              </h1>
              <p className="text-blue-100 text-sm">
                {interests
                  ? `Sigue aprendiendo sobre ${interests.subject || 'tus materias favoritas'}`
                  : 'Explora nuevos cursos y alcanza tus metas académicas'}
              </p>
              <p className="text-xs text-blue-200 font-mono mt-1">
                {address?.slice(0, 8)}...{address?.slice(-6)} &middot; {balance} XLM
              </p>
            </div>
          </div>
          <div className="hidden md:block text-5xl opacity-30">
            <FiTrendingUp className="w-16 h-16" />
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Cursos activos', value: myCourses.length.toString(), color: 'from-blue-500 to-blue-600', icon: FiBook },
          { label: 'Cursos disponibles', value: courses.length.toString(), color: 'from-green-500 to-green-600', icon: FiBarChart2 },
          { label: 'Certificados', value: '0', color: 'from-primary-500 to-primary-600', icon: FiAward },
          { label: 'Saldo XLM', value: `${balance}`, color: 'from-orange-500 to-orange-600', icon: FiClock },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {msg && (
        <motion.div variants={item} className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
          msg.type === 'ok' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {msg.type === 'ok' ? <FiCheckCircle className="w-4 h-4 flex-shrink-0" /> : <FiAlertCircle className="w-4 h-4 flex-shrink-0" />}
          {msg.text}
        </motion.div>
      )}

      <motion.div variants={item} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><FiBook className="text-primary-500" /> Mis Cursos</h2>
          <Link to="/student/explore" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
            Explorar más <FiTrendingUp className="w-3 h-3" />
          </Link>
        </div>
        {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myCourses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden card-hover">
                {course.image ? (
                  <div className="h-32 overflow-hidden">
                    <img src={course.image} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <FiBook className="w-10 h-10 text-white/50" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2">{course.title}</h3>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-800 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{course.sections?.length || 0} secciones</span>
                    <Link to={`/student/course/${course.id}`} className="text-primary-500 hover:text-primary-600">Comenzar &rarr;</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <FiBook className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 mb-4">Aún no tienes cursos. ¡Explora y compra tu primer curso!</p>
            <Link to="/student/explore" className="inline-flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-medium rounded-lg">
              <FiSearch className="w-4 h-4" /> Explorar cursos
            </Link>
          </div>
        )}
      </motion.div>

      {myCourses.length > 0 && (
        <motion.div variants={item} className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FiFileText className="text-primary-500" /> Mis Documentos</h2>
          <div className="space-y-3">
            {myCourses.filter(c => c.sections?.length > 0).map((course) => (
              <div key={course.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 card-hover flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <FiFileText className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{course.title} - Materiales</p>
                    <p className="text-xs text-slate-400">{course.sections?.length || 0} recursos disponibles</p>
                  </div>
                </div>
                <button className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600">
                  <FiDownload className="w-3 h-3" /> Acceder
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={item}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FiSearch className="text-primary-500" /> Recomendado para ti</h2>
        {loading ? (
          <p className="text-slate-400 text-center py-8">Cargando cursos...</p>
        ) : recommended.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommended.slice(0, 6).map((course) => (
              <div key={course.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden card-hover">
                {course.image ? (
                  <div className="h-36 overflow-hidden">
                    <img src={course.image} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-36 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <FiBook className="w-12 h-12 text-white/40" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                      {CATEGORIES.find(c => c.id === course.category)?.name || course.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{course.title}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary-500">{course.price} XLM</span>
                    <span className="text-xs text-slate-400">{course.students} alumnos</span>
                  </div>
                  <button
                    onClick={() => handleBuy(course.id)}
                    disabled={buyingId === course.id}
                    className="w-full py-2 text-sm gradient-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {buyingId === course.id ? 'Procesando...' : `Comprar por ${course.price} XLM`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">No hay cursos disponibles aún. ¡Vuelve pronto!</p>
        )}
      </motion.div>
    </motion.div>
  )
}
