import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiBook, FiStar, FiCheckCircle, FiAlertCircle, FiZap } from 'react-icons/fi'
import { CATEGORIES, EDUCATION_LEVELS } from '../../utils/constants'
import { motion } from 'framer-motion'
import { useWeb3 } from '../../context/Web3Context'
import { useCourses } from '../../context/CourseContext'

export default function StudentExplore() {
  const navigate = useNavigate()
  const { address, balance } = useWeb3()
  const { courses, purchaseCourse, isPurchased, loading } = useCourses()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const handleBuy = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (!course) return
    setBuyingId(courseId)
    setMessage(null)
    const result = await purchaseCourse(course)
    if (result.ok) {
      navigate(`/student/course/${course.id}`)
      return
    }
    setBuyingId(null)
  }

  const filteredCourses = courses.filter((course) => {
    const matchSearch = course.title.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchLevel = selectedLevel === 'all' || course.level === selectedLevel
    return matchSearch && matchCategory && matchLevel
  })

  return (
    <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Explorar Cursos</h1>
            <p className="text-slate-500 dark:text-slate-400">Descubre cursos en todas las categorías académicas</p>
          </div>
          {address && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-300">
              <FiZap className="w-4 h-4" /> Saldo: {balance} XLM
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[280px] relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cursos, materias, docentes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="all">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="all">Todos los niveles</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level.id} value={level.id}>{level.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedCategory === 'all'
              ? 'gradient-primary text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <FiBook className="w-3.5 h-3.5" /> Todos
        </button>
        {CATEGORIES.slice(0, 10).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'gradient-primary text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
          message.type === 'ok' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'ok' ? <FiCheckCircle className="w-4 h-4 flex-shrink-0" /> : <FiAlertCircle className="w-4 h-4 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <p className="text-slate-400">Cargando cursos...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
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
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                    {CATEGORIES.find(c => c.id === course.category)?.name}
                  </span>
                  <span className="text-xs text-slate-400">{course.level}</span>
                </div>
                <h3 className="font-semibold mb-2">{course.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-mono">
                  {course.teacherName || `${course.teacher?.slice(0, 8)}...${course.teacher?.slice(-4)}`}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-primary-500">{course.price} XLM</span>
                  <span className="text-xs text-slate-400">{course.students} alumnos</span>
                </div>
                {isPurchased(course.id) ? (
                  <div className="w-full py-2.5 text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg text-center flex items-center justify-center gap-2">
                    <FiCheckCircle className="w-4 h-4" /> Adquirido
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(course.id)}
                    disabled={buyingId === course.id}
                    className="w-full py-2.5 gradient-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {buyingId === course.id ? (
                      <>Procesando...</>
                    ) : (
                      <><FiZap className="w-4 h-4" /> Comprar por {course.price} XLM</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FiSearch className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron cursos</h3>
          <p className="text-slate-500">Intenta con otros filtros o términos de búsqueda</p>
        </div>
      )}
    </motion.div>
  )
}
