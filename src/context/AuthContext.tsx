'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db, COL } from '@/lib/firebase'
import { User } from '@/types'
import { loadAuthSession, saveAuthSession, clearAuthSession } from '@/lib/storage'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      const session = loadAuthSession()
      if (session) {
        try {
          const snap = await getDocs(collection(db, COL.users))
          const found = snap.docs.map(d => d.data() as User).find(u => u.id === session.userId && u.active)
          if (found) setUser(found)
        } catch { /* ignore */ }
      }
      setLoading(false)
    }
    restoreSession()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 600))
    try {
      const snap = await getDocs(collection(db, COL.users))
      const found = snap.docs
        .map(d => d.data() as User)
        .find(u => u.email.toLowerCase() === email.toLowerCase() && u.active)
      if (!found) return { success: false, error: 'E-mail não encontrado ou usuário inativo.' }
      if (password !== 'admin123' && password !== found.email.split('@')[0]) {
        return { success: false, error: 'Senha incorreta.' }
      }
      saveAuthSession({
        userId: found.id,
        email: found.email,
        name: found.name,
        role: found.role,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      })
      setUser(found)
      return { success: true }
    } catch {
      return { success: false, error: 'Erro ao conectar. Tente novamente.' }
    }
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setUser(null)
  }, [])

  const hasPermission = useCallback((roles: string[]) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return roles.includes(user.role)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
