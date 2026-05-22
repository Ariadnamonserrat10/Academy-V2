import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3001'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  serverAvailable: boolean
  ensureConnected: () => Promise<Socket | null>
}

const SocketContext = createContext<SocketContextType>({
  socket: null, isConnected: false, serverAvailable: false,
  ensureConnected: async () => null,
})

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [serverAvailable, setServerAvailable] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const ensureConnected = useCallback(async (): Promise<Socket | null> => {
    if (socketRef.current?.connected) return socketRef.current
    if (sessionStorage.getItem('academy_probe_failed') === '1') return null

    return new Promise((resolve) => {
      const s = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 1,
        reconnectionDelay: 2000,
        timeout: 4000,
      })
      const timeout = setTimeout(() => {
        s.close()
        sessionStorage.setItem('academy_probe_failed', '1')
        setServerAvailable(false)
        resolve(null)
      }, 4000)
      s.on('connect', () => {
        clearTimeout(timeout)
        sessionStorage.removeItem('academy_probe_failed')
        socketRef.current = s
        setSocket(s)
        setIsConnected(true)
        setServerAvailable(true)
        resolve(s)
      })
      s.on('disconnect', () => setIsConnected(false))
      s.on('connect_error', () => {
        /* swallow — timeout handles error state */
      })
    })
  }, [])

  useEffect(() => {
    socketRef.current = socket
  }, [socket])

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.close()
      }
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected, serverAvailable, ensureConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
