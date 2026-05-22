import { FiUsers, FiSearch, FiCheckCircle, FiClock, FiEye, FiAward, FiDollarSign } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function TeacherStudents() {
  const students = [
    { name: 'Alice Garc&iacute;a', email: 'alice@email.com', course: 'Blockchain Avanzado', progress: 75, status: 'Activo', paid: true },
    { name: 'Bob Mart&iacute;nez', email: 'bob@email.com', course: 'Curso de Rust', progress: 45, status: 'Activo', paid: true },
    { name: 'Charlie L&oacute;pez', email: 'charlie@email.com', course: 'Programaci&oacute;n Web', progress: 100, status: 'Completado', paid: true },
    { name: 'Diana Torres', email: 'diana@email.com', course: 'Blockchain Avanzado', progress: 30, status: 'Activo', paid: false },
    { name: 'Elena Ruiz', email: 'elena@email.com', course: 'Matem&aacute;ticas Discretas', progress: 88, status: 'Activo', paid: true },
  ]

  return (
    <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <FiUsers className="w-8 h-8 text-primary-500" /> Gesti&oacute;n de Alumnos
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Visualiza el progreso y gestiona tus alumnos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Alumnos', value: '156', color: 'from-blue-500 to-blue-600', icon: FiUsers },
          { label: 'Activos', value: '134', color: 'from-green-500 to-green-600', icon: FiCheckCircle },
          { label: 'Certificados Emitidos', value: '42', color: 'from-accent-500 to-accent-600', icon: FiAward },
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

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar alumnos..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Alumno</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Curso</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Progreso</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Pago</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Acci&oacute;n</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.email} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{student.course}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${
                          student.progress === 100 ? 'bg-green-500' : student.progress > 50 ? 'bg-blue-500' : 'bg-orange-500'
                        }`} style={{ width: `${student.progress}%` }} />
                      </div>
                      <span className="text-xs">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit font-medium ${
                      student.status === 'Completado' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {student.status === 'Completado' ? <FiCheckCircle className="w-3 h-3" /> : <FiClock className="w-3 h-3" />}
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit font-medium ${
                      student.paid ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      <FiDollarSign className="w-3 h-3" />
                      {student.paid ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {student.progress < 100 && (
                        <button className="flex items-center gap-1 px-2 py-1 text-xs text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors">
                          <FiAward className="w-3 h-3" /> Emitir Certificado
                        </button>
                      )}
                      <button className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                        <FiEye className="w-3 h-3" /> Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
