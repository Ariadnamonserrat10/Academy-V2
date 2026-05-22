import { FiBook, FiCheckCircle, FiClock, FiStar, FiAward, FiTrendingUp, FiZap } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useCourses } from '../../context/CourseContext'

export default function StudentProgress() {
  const { myCourses } = useCourses()
  const courses = myCourses.slice(0, 4)

  return (
    <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mi Progreso</h1>
        <p className="text-slate-500 dark:text-slate-400">Sigue tu avance académico en todos tus cursos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Cursos completados', value: '0', color: 'from-green-500 to-emerald-600', icon: FiCheckCircle },
          { label: 'En progreso', value: myCourses.length.toString(), color: 'from-primary-500 to-primary-700', icon: FiBook },
          { label: 'Actividades hechas', value: '0', color: 'from-primary-500 to-primary-700', icon: FiZap },
          { label: 'Tiempo total', value: '0h', color: 'from-orange-500 to-red-600', icon: FiClock },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><FiTrendingUp className="w-5 h-5 text-primary-500" /> Progreso Detallado</h2>
          <div className="space-y-6">
            {courses.map((course) => {
              const total = course.sections?.length || 1
              const completed = 0
              const progress = total > 0 ? Math.round((completed / total) * 100) : 0
              return (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <FiBook className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{course.title}</h3>
                        <p className="text-xs text-slate-500">{completed}/{total} módulos</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-800 transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8 text-center">
          <p className="text-slate-400">Compra tu primer curso para ver tu progreso</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 card-hover">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><FiAward className="w-5 h-5 text-amber-500" /> Logros Obtenidos</h3>
          <div className="space-y-3">
            {[
              { name: 'Primer Curso', desc: 'Completaste tu primer curso', icon: FiCheckCircle, unlocked: false },
              { name: 'Estrella Blockchain', desc: 'Compraste un curso con XLM', icon: FiStar, unlocked: myCourses.length > 0 },
              { name: 'Dedicación', desc: '10 horas de estudio', icon: FiZap, unlocked: false },
              { name: 'Maestro del Saber', desc: 'Completa 5 cursos', icon: FiAward, unlocked: false },
              { name: 'Coleccionista', desc: 'Obtén 3 certificados verificados', icon: FiAward, unlocked: false },
            ].map((achievement) => (
              <div key={achievement.name} className={`flex items-center gap-3 p-2 rounded-lg ${achievement.unlocked ? 'bg-green-50 dark:bg-green-900/20' : 'opacity-50'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${achievement.unlocked ? 'text-green-500' : 'text-slate-400'}`}>
                  <achievement.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{achievement.name}</p>
                  <p className="text-xs text-slate-500">{achievement.desc}</p>
                </div>
                {achievement.unlocked && <FiCheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Progreso general</span>
              <span className="font-bold text-primary-500">0/5</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
              <div className="w-0 h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-800" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 card-hover">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><FiTrendingUp className="w-5 h-5 text-primary-500" /> Estadísticas de Aprendizaje</h3>
          <div className="space-y-4">
            {[
              { label: 'Esta semana', value: '0h', change: '—' },
              { label: 'Cursos activos', value: myCourses.length.toString(), change: myCourses.length > 0 ? '+1' : '—' },
              { label: 'Promedio diario', value: '0h', change: '—' },
              { label: 'Días activo', value: '0 días', change: '0%' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                <span className="text-sm text-slate-500">{stat.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stat.value}</span>
                  <span className="text-xs text-green-500">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {myCourses.length === 0 && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white text-center">
          <p className="text-lg font-bold mb-1 flex items-center justify-center gap-2"><FiZap className="w-5 h-5" /> Comienza tu viaje</p>
          <p className="text-blue-100 text-sm">Explora los cursos disponibles y compra tu primer curso con XLM</p>
        </div>
      )}
    </motion.div>
  )
}
