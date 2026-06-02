'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, Eye, EyeOff, Loader2, TrendingUp, Shield, BarChart3 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace('/dashboard')
  }, [loading, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Preencha todos os campos.'); return }
    setSubmitting(true)
    setError('')
    const result = await login(email, password)
    if (result.success) {
      router.replace('/dashboard')
    } else {
      setError(result.error || 'Erro ao fazer login.')
      setSubmitting(false)
    }
  }

  const features = [
    { icon: <BarChart3 size={18} />, text: 'DRE automática e atualizada em tempo real' },
    { icon: <TrendingUp size={18} />, text: 'Indicadores financeiros e dashboards executivos' },
    { icon: <Shield size={18} />, text: 'Controle de acesso por perfil e permissões' },
    { icon: <DollarSign size={18} />, text: 'Fluxo de caixa com projeções financeiras' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[520px] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-12 text-white relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-80 h-80 rounded-full border-2 border-white"></div>
          <div className="absolute bottom-40 right-10 w-60 h-60 rounded-full border-2 border-white"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">FinancePro</p>
              <p className="text-blue-300 text-xs">Sistema de Gestão Financeira</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Controle financeiro<br />
            <span className="text-blue-400">empresarial completo</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-12">
            DRE, Fluxo de Caixa, Indicadores e muito mais — tudo integrado em uma plataforma profissional.
          </p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <div className="text-blue-400 flex-shrink-0">{f.icon}</div>
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-xs">
          © 2025 FinancePro — Gestão Financeira Empresarial
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <DollarSign size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">FinancePro</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Bem-vindo de volta</h1>
            <p className="text-slate-500">Faça login para acessar o sistema financeiro</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">E-mail corporativo</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="seu@empresa.com.br"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Entrando...</> : 'Entrar no Sistema'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
