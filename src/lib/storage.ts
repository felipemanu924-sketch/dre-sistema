const AUTH_KEY = 'dre_sistema_auth'

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
