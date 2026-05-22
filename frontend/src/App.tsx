import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { suppressConsole, generateCsrfToken } from './utils/securityUtils'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PaymentModal from './components/PaymentModal'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/student/Dashboard'
import StudentExplore from './pages/student/Explore'
import StudentProgress from './pages/student/Progress'
import StudentCertificates from './pages/student/Certificates'
import StudentCourseView from './pages/student/CourseView'
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherCourses from './pages/teacher/Courses'
import TeacherCreateCourse from './pages/teacher/CreateCourse'
import TeacherCreateMaterial from './pages/teacher/CreateMaterial'
import TeacherStudents from './pages/teacher/Students'

function AppInit() {
  useEffect(() => {
    suppressConsole()
    generateCsrfToken()
  }, [])
  return null
}

function ProtectedRoute({ children, role }: { children: JSX.Element; role?: 'student' | 'teacher' }) {
  const { role: userRole } = useAuth()
  if (!userRole) return <Navigate to="/login" />
  if (role && userRole !== role) return <Navigate to="/" />
  return children
}

export default function App() {
  const { role } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <AppInit />
      <Navbar />
      <PaymentModal />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/explore" element={<ProtectedRoute role="student"><StudentExplore /></ProtectedRoute>} />
          <Route path="/student/progress" element={<ProtectedRoute role="student"><StudentProgress /></ProtectedRoute>} />
          <Route path="/student/certificates" element={<ProtectedRoute role="student"><StudentCertificates /></ProtectedRoute>} />
          <Route path="/student/course/:id" element={<ProtectedRoute role="student"><StudentCourseView /></ProtectedRoute>} />
          <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/courses" element={<ProtectedRoute role="teacher"><TeacherCourses /></ProtectedRoute>} />
          <Route path="/teacher/courses/edit/:courseId" element={<ProtectedRoute role="teacher"><TeacherCreateCourse /></ProtectedRoute>} />
          <Route path="/teacher/create-course" element={<ProtectedRoute role="teacher"><TeacherCreateCourse /></ProtectedRoute>} />
          <Route path="/teacher/create-material" element={<ProtectedRoute role="teacher"><TeacherCreateMaterial /></ProtectedRoute>} />
          <Route path="/teacher/students" element={<ProtectedRoute role="teacher"><TeacherStudents /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
