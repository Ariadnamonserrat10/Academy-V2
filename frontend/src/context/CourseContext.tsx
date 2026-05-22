import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useSocket } from './SocketContext'
import { useWeb3 } from './Web3Context'
import { payXLM, PaymentResult } from '../utils/payments'

export interface Section {
  subtitle: string
  materialType: 'video' | 'document'
  materialName: string
  materialUrl: string
  examQuestion: string
  examAnswer: string
  examType?: 'text' | 'multiple'
  examOptions?: string[]
  examPoints?: number
}

export interface Course {
  id: string
  title: string
  teacher: string
  teacherName: string
  category: string
  level: string
  price: number
  duration: number
  image: string | null
  sections: Section[]
  students: number
  createdAt: number
}

export type PurchaseStep =
  | null
  | 'building-tx'
  | 'wallet-confirm'
  | 'submitting'
  | 'confirming'
  | 'done'
  | 'error'

export interface TransactionRecord {
  txHash: string
  courseId: string
  courseTitle: string
  buyerWallet: string
  teacherWallet: string
  amount: number
  timestamp: number
  status: 'confirmed'
}

interface CourseContextType {
  courses: Course[]
  purchasedIds: string[]
  loading: boolean
  purchaseStep: PurchaseStep
  purchaseError: string | null
  purchasedCourseId: string | null
  lastTransaction: PaymentResult | null
  transactions: TransactionRecord[]
  clearPurchaseState: () => void
  createCourse: (data: Omit<Course, 'id' | 'students' | 'createdAt'>) => Promise<boolean>
  updateCourse: (courseId: string, data: Partial<Omit<Course, 'id' | 'teacher' | 'students' | 'createdAt'>>) => Promise<boolean>
  purchaseCourse: (course: Course) => Promise<{ ok: boolean; error?: string }>
  deleteCourse: (courseId: string) => Promise<boolean>
  isPurchased: (courseId: string) => boolean
  myCourses: Course[]
}

const PURCHASE_KEY = 'academy_purchased'
const COURSES_CACHE_KEY = 'academy_courses_cache'
const TRANSACTIONS_KEY = 'academy_transactions'

const CourseContext = createContext<CourseContextType>({
  courses: [], purchasedIds: [], loading: false,
  purchaseStep: null, purchaseError: null, purchasedCourseId: null,
  lastTransaction: null, transactions: [],
  clearPurchaseState: () => {},
  createCourse: async () => false,
  updateCourse: async () => false,
  purchaseCourse: async () => ({ ok: false }),
  deleteCourse: async () => false,
  isPurchased: () => false,
  myCourses: [],
})

export const useCourses = () => useContext(CourseContext)

function loadPurchased(): string[] {
  try { return JSON.parse(localStorage.getItem(PURCHASE_KEY) || '[]') } catch { return [] }
}
function savePurchased(ids: string[]) {
  localStorage.setItem(PURCHASE_KEY, JSON.stringify(ids))
}
function loadCachedCourses(): Course[] {
  try { return JSON.parse(localStorage.getItem(COURSES_CACHE_KEY) || '[]') } catch { return [] }
}
function cacheCourses(data: Course[]) {
  try { localStorage.setItem(COURSES_CACHE_KEY, JSON.stringify(data)) } catch { /* ignore */ }
}
function loadTransactions(): TransactionRecord[] {
  try { return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]') } catch { return [] }
}
function saveTransactions(txns: TransactionRecord[]) {
  try { localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns)) } catch { /* ignore */ }
}

export function CourseProvider({ children }: { children: ReactNode }) {
  const { socket, ensureConnected } = useSocket()
  const { address, balance, fetchBalance, secretKey } = useWeb3()
  const [courses, setCourses] = useState<Course[]>(loadCachedCourses)
  const [purchasedIds, setPurchasedIds] = useState<string[]>(loadPurchased)
  const [transactions, setTransactions] = useState<TransactionRecord[]>(loadTransactions)
  const [loading, setLoading] = useState(false)
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [purchasedCourseId, setPurchasedCourseId] = useState<string | null>(null)
  const [lastTransaction, setLastTransaction] = useState<PaymentResult | null>(null)

  useEffect(() => {
    if (!socket) return
    socket.on('courses:sync', (data: Course[]) => {
      setCourses(data)
      cacheCourses(data)
    })
    return () => { socket.off('courses:sync') }
  }, [socket])

  const createCourse = useCallback(async (data: Omit<Course, 'id' | 'students' | 'createdAt'>): Promise<boolean> => {
    const s = await ensureConnected()

    const course: Course = {
      ...data,
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      students: 0, createdAt: Date.now(),
    }

    if (s?.connected) {
      return new Promise((resolve) => {
        s.emit('course:create', data, (res: { ok: boolean }) => resolve(res.ok))
      })
    }
    const updated = [...courses, course]
    setCourses(updated)
    cacheCourses(updated)
    return true
  }, [ensureConnected, courses])

  const updateCourse = useCallback(async (
    courseId: string,
    data: Partial<Omit<Course, 'id' | 'teacher' | 'students' | 'createdAt'>>
  ): Promise<boolean> => {
    if (!address) return false
    const s = await ensureConnected()
    if (s?.connected) {
      return new Promise((resolve) => {
        s.emit('course:update', { courseId, teacher: address, data }, (res: { ok: boolean }) => resolve(res.ok))
      })
    }
    const updated = courses.map(c => c.id === courseId ? { ...c, ...data } : c)
    setCourses(updated)
    cacheCourses(updated)
    return true
  }, [ensureConnected, address, courses])

  const clearPurchaseState = useCallback(() => {
    setPurchaseStep(null)
    setPurchaseError(null)
    setPurchasedCourseId(null)
    setLastTransaction(null)
  }, [])

  const purchaseCourse = useCallback(async (course: Course): Promise<{ ok: boolean; error?: string }> => {
    // ── Pre-flight checks ──
    if (!address) return { ok: false, error: 'Conecta tu wallet primero' }
    if (purchasedIds.includes(course.id)) return { ok: false, error: 'Ya tienes este curso' }
    if (parseFloat(balance) < course.price) {
      return { ok: false, error: `Saldo insuficiente: tienes ${balance} XLM, necesitas ${course.price} XLM` }
    }

    setPurchaseStep('building-tx')
    setPurchaseError(null)
    setLastTransaction(null)

    try {
      // Server-side check: verify destination teacher wallet is valid
      if (!course.teacher || !course.teacher.startsWith('G')) {
        throw new Error('La wallet del instructor no es válida. Contacta al administrador.')
      }

      // Execute payment
      const result = await payXLM(address, course.price, course.teacher, secretKey || undefined)

      setPurchaseStep('confirming')

      // Update balances for both buyer and teacher
      await Promise.all([
        pollForBalance(address, fetchBalance),
        fetchBalance(course.teacher).catch(() => {}), // try fetch teacher balance too
      ])

      // Record the transaction
      const record: TransactionRecord = {
        txHash: result.hash,
        courseId: course.id,
        courseTitle: course.title,
        buyerWallet: address,
        teacherWallet: course.teacher,
        amount: course.price,
        timestamp: Date.now(),
        status: 'confirmed',
      }
      const updatedTxs = [...transactions, record]
      setTransactions(updatedTxs)
      saveTransactions(updatedTxs)

      // Enroll the student
      const updatedPurchased = [...purchasedIds, course.id]
      setPurchasedIds(updatedPurchased)
      savePurchased(updatedPurchased)

      // Notify server
      const s = socket
      if (s?.connected) {
        s.emit('course:purchase', {
          courseId: course.id,
          wallet: address,
          amount: course.price,
          courseTitle: course.title,
          teacher: course.teacher,
          txHash: result.hash,
        })
      }

      setLastTransaction(result)
      setPurchaseStep('done')
      setPurchasedCourseId(course.id)
      return { ok: true }
    } catch (err: any) {
      const msg = err?.message || 'Error al procesar el pago'
      setPurchaseStep('error')
      setPurchaseError(msg)
      return { ok: false, error: msg }
    }
  }, [address, balance, purchasedIds, transactions, socket, fetchBalance])

  const deleteCourse = useCallback(async (courseId: string): Promise<boolean> => {
    if (!socket?.connected || !address) return false
    return new Promise((resolve) => {
      socket.emit('course:delete', { courseId, teacher: address }, (res: { ok: boolean }) => {
        if (res.ok) {
          const updated = courses.filter(c => c.id !== courseId)
          setCourses(updated)
          cacheCourses(updated)
        }
        resolve(res.ok)
      })
    })
  }, [socket, address, courses])

  const isPurchased = useCallback((courseId: string) => purchasedIds.includes(courseId), [purchasedIds])
  const myCourses = courses.filter(c => purchasedIds.includes(c.id))

  return (
    <CourseContext.Provider value={{
      courses, purchasedIds, loading,
      purchaseStep, purchaseError, purchasedCourseId,
      lastTransaction, transactions,
      clearPurchaseState,
      createCourse, updateCourse, purchaseCourse, deleteCourse, isPurchased, myCourses,
    }}>
      {children}
    </CourseContext.Provider>
  )
}

async function pollForBalance(address: string, fetchBalance: (addr: string) => Promise<void>, retries = 8, delay = 1500) {
  for (let i = 0; i < retries; i++) {
    await fetchBalance(address)
    await new Promise(r => setTimeout(r, delay))
  }
}
