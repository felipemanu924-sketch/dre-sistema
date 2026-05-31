'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(isAuthenticated ? '/dashboard' : '/login')
    }
  }, [loading, isAuthenticated, router])

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 rounded-xl bg-blue-600 animate-pulse"></div>
    </div>
  )
}
