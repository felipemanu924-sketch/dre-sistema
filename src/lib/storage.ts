import { DataStore } from '@/types'
import { createInitialDataStore } from './mockData'

const STORAGE_KEY = 'dre_sistema_data'
const AUTH_KEY = 'dre_sistema_auth'

export function loadDataStore(): DataStore {
  if (typeof window === 'undefined') return createInitialDataStore()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as DataStore
      if (data.initialized) return data
    }
  } catch { /* ignore */ }
  const initial = createInitialDataStore()
  saveDataStore(initial)
  return initial
}

export function saveDataStore(data: DataStore): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

export interface AuthSession {
  userId: string
  email: string
  name: string
  role: string
  expiresAt: number
}

export function saveAuthSession(session: AuthSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_KEY, JSON.stringify(session))
}

export function loadAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AuthSession
    if (session.expiresAt < Date.now()) {
      clearAuthSession()
      return null
    }
    return session
  } catch { return null }
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_KEY)
}
