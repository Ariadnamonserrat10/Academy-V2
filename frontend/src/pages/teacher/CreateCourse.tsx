import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiBook, FiPlusCircle, FiTrash2, FiZap, FiFileText, FiVideo, FiImage, FiClock, FiDollarSign, FiCheckCircle, FiAlertCircle, FiHelpCircle } from 'react-icons/fi'
import { CATEGORIES, EDUCATION_LEVELS } from '../../utils/constants'
import { motion } from 'framer-motion'
import { useWeb3 } from '../../context/Web3Context'
import { useAuth } from '../../context/AuthContext'
import { useCourses, Section } from '../../context/CourseContext'
export default function TeacherCreateCourse() {
  const { courseId } = useParams()
  const isEdit = !!courseId
  const { address, balance } = useWeb3()
  const { teacherProfile } = useAuth()
  const { courses, createCourse, updateCourse } = useCourses()
  const navigate = useNavigate()
  const imgRef = useRef<HTMLInputElement>(null)
  const [courseImage, setCourseImage] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [course, setCourse] = useState({
    title: '',
    category: '',
    level: '',
    price: '',
    duration: '',
  })

  const [sections, setSections] = useState<Section[]>([{
    subtitle: '', materialType: 'video' as const, materialName: '', materialUrl: '',
    examQuestion: '', examAnswer: '', examType: 'text', examOptions: ['', ''], examPoints: 100,
  }])

  // Load existing course data when editing
  useEffect(() => {
    if (!isEdit || !courseId) return
    const existing = courses.find(c => c.id === courseId)
    if (!existing) { navigate('/teacher/courses'); return }
    setCourse({
      title: existing.title,
      category: existing.category,
      level: existing.level,
      price: existing.price.toString(),
      duration: existing.duration.toString(),
    })
    setCourseImage(existing.image)
    if (existing.sections?.length) setSections(existing.sections)
  }, [isEdit, courseId, courses, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCourse(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCourseImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const addSection = () => {
    setSections(prev => [...prev, { subtitle: '', materialType: 'video', materialName: '', materialUrl: '', examQuestion: '', examAnswer: '', examType: 'text', examOptions: ['', ''], examPoints: 100 }])
  }

  const updateSection = (idx: number, field: string, value: string | string[] | number) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const removeSection = (idx: number) => {
    setSections(prev => prev.filter((_, i) => i !== idx))
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) { setMsg({ type: 'error', text: 'Conecta tu wallet primero' }); return }
    const price = parseInt(course.price)
    if (isNaN(price) || price <= 0) { setMsg({ type: 'error', text: 'Precio inválido' }); return }
    if (parseFloat(balance) < 0.5) { setMsg({ type: 'error', text: `Saldo insuficiente para publicar. Tienes ${balance} XLM` }); return }

    const invalidSection = sections.some(s => {
      if (!s.subtitle || !s.materialName || !s.examQuestion) return true
      if (s.examType === 'multiple') return !s.examAnswer || !s.examOptions || (s.examOptions as string[]).filter((o: string) => o.trim()).length < 2
      return !s.examAnswer
    })
    if (invalidSection) { setMsg({ type: 'error', text: 'Completa todas las secciones: subtítulo, material, y examen' }); return }

    setPublishing(true); setMsg(null)
    try {
      if (isEdit && courseId) {
        const ok = await updateCourse(courseId, {
          title: course.title,
          category: course.category,
          level: course.level,
          price,
          duration: parseInt(course.duration) || 0,
          image: courseImage,
          sections,
        })
        if (ok) {
          setMsg({ type: 'ok', text: `"${course.title}" actualizado! Redirigiendo...` })
          setTimeout(() => navigate('/teacher/courses'), 1500)
        } else {
          setMsg({ type: 'error', text: 'Error de conexión con el servidor' })
        }
      } else {
        const ok = await createCourse({
          title: course.title,
          teacher: address,
          teacherName: teacherProfile?.name || address.slice(0, 8),
          category: course.category,
          level: course.level,
          price,
          duration: parseInt(course.duration) || 0,
          image: courseImage,
          sections,
        })
        if (ok) {
          setMsg({ type: 'ok', text: `"${course.title}" publicado! Redirigiendo...` })
          setTimeout(() => navigate('/teacher/courses'), 1500)
        } else {
          setMsg({ type: 'error', text: 'Error de conexión con el servidor' })
        }
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Error al publicar' })
    } finally { setPublishing(false) }
  }

  return (
    <motion.div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <FiBook className="w-8 h-8 text-primary-500" /> {isEdit ? 'Editar Curso' : 'Crear Nuevo Curso'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {isEdit ? 'Modifica el contenido, secciones y exámenes del curso' : 'Título, imagen, precio, duración y secciones con examen obligatorio'}
        </p>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${msg.type === 'ok' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.type === 'ok' ? <FiCheckCircle className="w-4 h-4 flex-shrink-0" /> : <FiAlertCircle className="w-4 h-4 flex-shrink-0" />}
          {msg.text}
        </div>
      )}

      <form onSubmit={handlePublish} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><FiZap className="w-5 h-5 text-primary-500" /> Información del Curso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Título del curso</label>
              <input name="title" value={course.title} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej: Introducción a Blockchain" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Imagen del curso</label>
              <div className="flex items-center gap-4">
                <div className="w-28 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-700 cursor-pointer" onClick={() => imgRef.current?.click()}>
                  {courseImage ? <img src={courseImage} className="w-full h-full object-cover" /> : <FiImage className="w-6 h-6 text-slate-400" />}
                </div>
                <input ref={imgRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                <span className="text-xs text-slate-400">Toca para subir una imagen representativa del curso</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1"><FiBook className="w-3.5 h-3.5 text-slate-400" /> Materia</label>
              <select name="category" value={course.category} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">Seleccionar materia...</option>
                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1"><FiHelpCircle className="w-3.5 h-3.5 text-slate-400" /> Nivel</label>
              <select name="level" value={course.level} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">Seleccionar nivel...</option>
                {EDUCATION_LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1"><FiDollarSign className="w-3.5 h-3.5 text-slate-400" /> Precio (XLM)</label>
              <input name="price" type="number" value={course.price} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="50" min="0" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1"><FiClock className="w-3.5 h-3.5 text-slate-400" /> Duración (horas)</label>
              <input name="duration" type="number" value={course.duration} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="40" min="1" required />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2"><FiFileText className="w-5 h-5 text-primary-500" /> Secciones del Curso</h2>
            <button type="button" onClick={addSection} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
              <FiPlusCircle className="w-4 h-4" /> Agregar Sección
            </button>
          </div>

          {sections.map((section, idx) => (
            <div key={idx} className="p-4 mb-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold flex items-center gap-2"><FiBook className="w-4 h-4 text-primary-400" /> Sección {idx + 1}</span>
                {sections.length > 1 && (
                  <button type="button" onClick={() => removeSection(idx)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
                    <FiTrash2 className="w-3 h-3" /> Eliminar
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Subtítulo de la sección</label>
                  <input value={section.subtitle} onChange={e => updateSection(idx, 'subtitle', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ej: Fundamentos de Blockchain" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Tipo de material</label>
                    <select value={section.materialType} onChange={e => updateSection(idx, 'materialType', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="video">Video</option>
                      <option value="document">Documento / Material</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nombre del material</label>
                    <input value={section.materialName} onChange={e => updateSection(idx, 'materialName', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ej: Video 1 - Introducción" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">URL del video o material</label>
                  <div className="flex items-center gap-2">
                    <input value={section.materialUrl} onChange={e => updateSection(idx, 'materialUrl', e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="https://..." />
                    <span className="text-xs text-slate-400 flex items-center gap-1">{section.materialType === 'video' ? <FiVideo className="w-3.5 h-3.5" /> : <FiFileText className="w-3.5 h-3.5" />}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex items-center gap-2 mb-2">
                    <FiHelpCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Examen obligatorio</span>
                    <span className="text-xs text-slate-400">(debe aprobarse para avanzar a la siguiente sección)</span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input type="radio" name={`examType-${idx}`} checked={section.examType !== 'multiple'} onChange={() => updateSection(idx, 'examType', 'text')} className="accent-primary-500" />
                      Respuesta escrita
                    </label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input type="radio" name={`examType-${idx}`} checked={section.examType === 'multiple'} onChange={() => updateSection(idx, 'examType', 'multiple')} className="accent-primary-500" />
                      Opción múltiple
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Pregunta</label>
                      <input value={section.examQuestion} onChange={e => updateSection(idx, 'examQuestion', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ej: ¿Qué es un bloque en blockchain?" required />
                    </div>

                    {section.examType === 'multiple' ? (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Opciones</label>
                          {section.examOptions?.map((opt: string, oi: number) => (
                            <div key={oi} className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-mono text-slate-400 w-5">{String.fromCharCode(65 + oi)}.</span>
                              <input value={opt} onChange={e => {
                                const newOpts = [...(section.examOptions || ['', ''])]
                                newOpts[oi] = e.target.value
                                updateSection(idx, 'examOptions', newOpts)
                              }} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder={`Opción ${String.fromCharCode(65 + oi)}`} />
                              {oi === (section.examOptions?.length || 2) - 1 && (
                                <button type="button" onClick={() => updateSection(idx, 'examOptions', [...(section.examOptions || ['', '']), ''])} className="text-xs text-primary-500 hover:text-primary-600 px-1">+</button>
                              )}
                              {(section.examOptions?.length || 0) > 2 && oi > 1 && (
                                <button type="button" onClick={() => {
                                  const newOpts = (section.examOptions || ['', '']).filter((_: string, i: number) => i !== oi)
                                  updateSection(idx, 'examOptions', newOpts)
                                }} className="text-xs text-red-400 hover:text-red-500 px-1">✕</button>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Respuesta correcta</label>
                            <select value={section.examAnswer} onChange={e => updateSection(idx, 'examAnswer', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                              <option value="">Seleccionar...</option>
                              {section.examOptions?.filter((o: string) => o.trim()).map((opt: string, oi: number) => (
                                <option key={oi} value={opt}>{String.fromCharCode(65 + oi)}. {opt}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Puntaje (%)</label>
                            <input type="number" value={section.examPoints || 100} onChange={e => updateSection(idx, 'examPoints', parseInt(e.target.value) || 0)} min="0" max="100" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Respuesta correcta</label>
                        <input value={section.examAnswer} onChange={e => updateSection(idx, 'examAnswer', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ej: Un conjunto de transacciones" required />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {address && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-300 w-fit">
            <FiZap className="w-4 h-4" /> Saldo: {balance} XLM
          </div>
        )}

        <button type="submit" disabled={publishing} className="w-full py-3 gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {publishing ? 'Publicando...' : <><FiZap className="w-5 h-5" /> {isEdit ? 'Guardar Cambios' : 'Publicar Curso'}</>}
        </button>
      </form>
    </motion.div>
  )
}
