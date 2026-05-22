import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiBook, FiPlusCircle, FiEdit2, FiTrash2, FiDollarSign, FiUsers, FiFileText, FiUpload } from 'react-icons/fi'
import { useCourses } from '../../context/CourseContext'
import { useWeb3 } from '../../context/Web3Context'
import { CATEGORIES } from '../../utils/constants'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function TeacherCourses() {
  const { address } = useWeb3()
  const { courses, deleteCourse } = useCourses()
  const [tab, setTab] = useState<'courses' | 'materials'>('courses')

  const myCourses = courses.filter(c => c.teacher === address)

  const handleDelete = async (courseId: string) => {
    if (!confirm('¿Eliminar este curso?')) return
    await deleteCourse(courseId)
  }

  return (
    <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            {tab === 'courses' ? <FiBook className="w-8 h-8 text-primary-500" /> : <FiFileText className="w-8 h-8 text-amber-500" />}
            {tab === 'courses' ? 'Mis Cursos' : 'Materiales'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {tab === 'courses' ? 'Administra tus cursos y contenidos' : 'Documentos y recursos para tus alumnos'}
          </p>
        </div>
        {tab === 'courses' && (
          <Link to="/teacher/create-course" className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all">
            <FiPlusCircle className="w-4 h-4" /> Nuevo Curso
          </Link>
        )}
      </motion.div>

      <motion.div variants={item} className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1 w-fit mb-6">
        <button onClick={() => setTab('courses')} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === 'courses' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600' : 'text-slate-500'}`}>
          <FiBook className="w-4 h-4" /> Cursos
        </button>
        <button onClick={() => setTab('materials')} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === 'materials' ? 'bg-white dark:bg-slate-600 shadow-sm text-amber-600' : 'text-slate-500'}`}>
          <FiFileText className="w-4 h-4" /> Materiales
        </button>
      </motion.div>

      {tab === 'courses' && (
        <motion.div variants={item} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {myCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Curso</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Categoría</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Precio</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Alumnos</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Secciones</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {myCourses.map((course) => (
                    <tr key={course.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {course.image ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={course.image} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                              <FiBook className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <span className="font-medium truncate max-w-[180px]">{course.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{CATEGORIES.find(c => c.id === course.category)?.name || course.category}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 font-medium"><FiDollarSign className="w-3.5 h-3.5 text-primary-500" /> {course.price} XLM</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1"><FiUsers className="w-3.5 h-3.5 text-slate-400" /> {course.students}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{course.sections?.length || 0}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Link to={`/teacher/courses/edit/${course.id}`} className="flex items-center gap-1 px-2 py-1 text-xs text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                            <FiEdit2 className="w-3 h-3" /> Editar
                          </Link>
                          <button onClick={() => handleDelete(course.id)} className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                            <FiTrash2 className="w-3 h-3" /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiBook className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 mb-4">No tienes cursos creados aún</p>
              <Link to="/teacher/create-course" className="inline-flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-medium rounded-lg">
                <FiPlusCircle className="w-4 h-4" /> Crear primer curso
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {tab === 'materials' && (
        <motion.div variants={item} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="text-center py-12">
            <FiFileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 mb-4">Los materiales aparecerán aquí cuando los subas</p>
            <Link to="/teacher/create-material" className="inline-flex items-center gap-2 text-sm text-amber-500 hover:text-amber-600 font-medium">
              <FiUpload className="w-4 h-4" /> Subir nuevo material
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
