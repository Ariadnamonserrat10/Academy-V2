import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCourses } from '../../context/CourseContext'
import { CATEGORIES } from '../../utils/constants'
import { FiArrowLeft, FiBook, FiVideo, FiFileText, FiHelpCircle, FiCheckCircle, FiClock, FiDollarSign, FiUser, FiExternalLink } from 'react-icons/fi'
import { useState } from 'react'

export default function StudentCourseView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { courses, isPurchased } = useCourses()
  const course = courses.find(c => c.id === id)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Curso no encontrado</h2>
        <Link to="/student/explore" className="text-primary-500 hover:text-primary-600">Explorar cursos</Link>
      </div>
    )
  }

  const owned = isPurchased(course.id)

  const handleAnswer = (idx: number, value: string) => {
    setAnswers(prev => ({ ...prev, [idx]: value }))
  }

  const handleReveal = (idx: number) => {
    setRevealed(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const isCorrect = (idx: number): boolean => {
    const section = course.sections?.[idx]
    if (!section) return false
    const studentAnswer = answers[idx]?.trim()
    if (!studentAnswer) return false
    if (section.examType === 'multiple') {
      return studentAnswer === section.examAnswer?.trim()
    }
    return studentAnswer.toLowerCase() === section.examAnswer?.toLowerCase().trim()
  }

  return (
    <motion.div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" /> Volver
      </button>

      {/* Course header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
        {course.image ? (
          <div className="h-56 md:h-64 overflow-hidden">
            <img src={course.image} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-56 md:h-64 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <FiBook className="w-20 h-20 text-white/30" />
          </div>
        )}
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
              {CATEGORIES.find(c => c.id === course.category)?.name || course.category}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
              {course.level}
            </span>
            {owned && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" /> Adquirido
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-bold mb-4">{course.title}</h1>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-500 dark:text-slate-400 mb-4">
            <span className="flex items-center gap-1.5"><FiUser className="w-4 h-4" /> {course.teacherName || `${course.teacher.slice(0, 8)}...`}</span>
            <span className="flex items-center gap-1.5"><FiDollarSign className="w-4 h-4" /> {course.price} XLM</span>
            <span className="flex items-center gap-1.5"><FiClock className="w-4 h-4" /> {course.duration}h</span>
            <span className="flex items-center gap-1.5"><FiBook className="w-4 h-4" /> {course.sections?.length || 0} secciones</span>
          </div>

          {!owned && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <FiHelpCircle className="w-5 h-5 flex-shrink-0" />
              Adquiere este curso para acceder a todo el contenido y materiales
            </div>
          )}
        </div>
      </div>

      {/* Sections */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FiBook className="text-primary-500" /> Contenido del Curso
      </h2>

      <div className="space-y-4 mb-8">
        {course.sections && course.sections.length > 0 ? (
          course.sections.map((section, idx) => (
            <div
              key={idx}
              className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all ${
                owned ? 'card-hover' : 'opacity-70'
              }`}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{section.subtitle}</h3>
                    <p className="text-xs text-slate-400">
                      {section.materialType === 'video' ? 'Video' : 'Documento'} &middot; Examen incluido
                    </p>
                  </div>
                </div>

                {/* Material */}
                {owned && section.materialUrl ? (
                  <a
                    href={section.materialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 mb-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm text-primary-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {section.materialType === 'video' ? <FiVideo className="w-4 h-4" /> : <FiFileText className="w-4 h-4" />}
                    <span className="flex-1">{section.materialName}</span>
                    <FiExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : owned ? (
                  <div className="px-4 py-2.5 mb-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm text-slate-400">
                    Sin material disponible
                  </div>
                ) : (
                  <div className="px-4 py-2.5 mb-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm text-slate-400 flex items-center gap-2">
                    <FiHelpCircle className="w-3.5 h-3.5" />
                    Adquiere el curso para ver el material
                  </div>
                )}

                {/* Exam */}
                <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FiHelpCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">Examen de la sección</span>
                    {section.examPoints && (
                      <span className="text-xs text-slate-400">({section.examPoints}%)</span>
                    )}
                  </div>

                  {owned ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{section.examQuestion}</p>

                      {section.examType === 'multiple' && section.examOptions?.length ? (
                        <div className="space-y-1.5">
                          {section.examOptions.filter(o => o.trim()).map((opt, oi) => (
                            <label key={oi} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                              answers[idx] === opt
                                ? (revealed[idx]
                                  ? (opt === section.examAnswer?.trim()
                                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                    : 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300')
                                  : 'border-primary-400 bg-primary-50 dark:bg-primary-900/20')
                                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                            } ${revealed[idx] && opt === section.examAnswer?.trim() ? 'ring-2 ring-green-300' : ''}`}>
                              <input type="radio" name={`exam-${idx}`} value={opt} checked={answers[idx] === opt} onChange={() => handleAnswer(idx, opt)} className="accent-primary-500" disabled={revealed[idx]} />
                              <span>{opt}</span>
                              {revealed[idx] && opt === section.examAnswer?.trim() && <FiCheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={answers[idx] || ''}
                            onChange={e => handleAnswer(idx, e.target.value)}
                            placeholder="Tu respuesta..."
                            className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReveal(idx)}
                          disabled={!answers[idx]}
                          className="px-4 py-2 text-sm font-medium text-white gradient-primary rounded-lg hover:opacity-90 disabled:opacity-40"
                        >
                          {revealed[idx] ? 'Ocultar' : 'Verificar'}
                        </button>
                        {revealed[idx] && (
                          <span className={`flex items-center gap-1.5 text-sm font-medium ${
                            isCorrect(idx) ? 'text-green-600' : 'text-red-500'
                          }`}>
                            {isCorrect(idx) ? <><FiCheckCircle className="w-4 h-4" /> ¡Correcto!</> : 'Incorrecto'}
                          </span>
                        )}
                      </div>

                      {revealed[idx] && !isCorrect(idx) && section.examType !== 'multiple' && (
                        <div className="p-3 rounded-lg text-sm bg-blue-50 border border-blue-200 text-blue-700">
                          Respuesta correcta: <strong>{section.examAnswer}</strong>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Adquiere el curso para realizar el examen</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <FiBook className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Este curso aún no tiene secciones</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
