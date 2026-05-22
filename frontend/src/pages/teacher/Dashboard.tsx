import { useAuth } from '../../context/AuthContext'
import { useWeb3 } from '../../context/Web3Context'
import { useCourses } from '../../context/CourseContext'
import { Link } from 'react-router-dom'
import { FiUsers, FiDollarSign, FiBook, FiAward, FiPlusCircle, FiTrendingUp } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function TeacherDashboard() {
  const { teacherProfile, nftIdentity } = useAuth()
  const { address } = useWeb3()
  const { courses } = useCourses()

  const myCourses = courses.filter(c => c.teacher === address)
  const totalStudents = myCourses.reduce((sum, c) => sum + c.students, 0)
  const totalRevenue = myCourses.reduce((sum, c) => sum + c.price * c.students, 0)

  return (
    <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-r from-accent-500 to-accent-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {nftIdentity ? (
              <div className="w-16 h-16 rounded-xl border-2 border-white/30 overflow-hidden flex-shrink-0">
                <img src={nftIdentity} alt="NFT" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                Bienvenido, {teacherProfile?.name}
              </h1>
              <p className="text-accent-100 text-sm">
                Panel docente &bull; {teacherProfile?.specialty} &bull; {teacherProfile?.education_level}
              </p>
              <p className="text-xs text-accent-200 font-mono mt-1">
                {address?.slice(0, 8)}...{address?.slice(-6)}
              </p>
            </div>
          </div>
          <FiTrendingUp className="w-16 h-16 text-white/20 hidden md:block" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Alumnos Totales', value: totalStudents.toString(), color: 'from-blue-500 to-blue-600', icon: FiUsers },
          { label: 'Ingresos Totales', value: `${totalRevenue} XLM`, color: 'from-green-500 to-green-600', icon: FiDollarSign },
          { label: 'Cursos Activos', value: myCourses.length.toString(), color: 'from-accent-500 to-accent-600', icon: FiBook },
          { label: 'Certificados', value: '—', color: 'from-orange-500 to-orange-600', icon: FiAward },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 card-hover">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><FiTrendingUp className="w-5 h-5 text-primary-500" /> Tus Cursos</h3>
          {myCourses.length > 0 ? (
            <div className="space-y-3">
              {myCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-xs font-bold">
                    {course.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{course.title}</p>
                    <p className="text-xs text-slate-500">{course.students} alumnos &middot; {course.price} XLM</p>
                  </div>
                  <Link to={`/teacher/courses`} className="text-xs text-accent-500 hover:text-accent-600 shrink-0">Ver</Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">Aún no has creado cursos</p>
          )}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Link to="/teacher/create-course" className="block w-full py-2.5 text-center gradient-primary text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2">
              <FiPlusCircle className="w-4 h-4" /> Crear Nuevo Curso
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 card-hover">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><FiBook className="w-5 h-5 text-primary-500" /> Vista Rápida</h3>
          <div className="space-y-4">
            {[
              { label: 'Cursos publicados', value: myCourses.length, total: Math.max(myCourses.length, 1) },
              { label: 'Total alumnos', value: totalStudents, total: Math.max(totalStudents, 1) },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">{stat.label}</span>
                  <span className="font-medium">{stat.value}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-accent-500" style={{ width: `${Math.min((stat.value / stat.total) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <Link to="/teacher/courses" className="block w-full py-2 text-center text-accent-500 border border-accent-500 rounded-lg text-sm font-medium hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors">
              Gestionar cursos
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
