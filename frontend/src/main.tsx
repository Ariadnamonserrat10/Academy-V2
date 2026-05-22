import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Web3Provider } from './context/Web3Context'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { CourseProvider } from './context/CourseContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Web3Provider>
        <AuthProvider>
          <SocketProvider>
            <CourseProvider>
              <App />
            </CourseProvider>
          </SocketProvider>
        </AuthProvider>
      </Web3Provider>
    </BrowserRouter>
  </React.StrictMode>,
)
