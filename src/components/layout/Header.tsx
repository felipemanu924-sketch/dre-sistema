'use client'
import { usePathname } from 'next/navigation'
import { Bell, Search, Calendar, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const routeLabels: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard':      { title: 'Dashboard Executivo', subtitle: 'Visão geral financeira' },
  '/lancamentos':    { title: 'Lançamentos Financeiros', subtitle: 'Receitas e despesas' },
  '/plano-contas':   { title: 'Plano de Contas', subtitle: 'Estrutura contábil hierárquica' },
  '/dre/mensal':     { title: 'DRE Mensal', subtitle: 'Demonstração do Resultado do Exercício' },
  '/dre/anual':      { title: 'DRE Anual', subtitle: 'Consolidação anual dos resultados' },
  '/fluxo-caixa':    { title: 'Fluxo de Caixa', subtitle: 'Projeção e controle de caixa' },
  '/receitas-saidas': { title: 'Receitas e Saídas', subtitle: 'Relatório diário e semanal' },
  '/indicadores':    { title: 'Indicadores Financeiros', subtitle: 'KPIs e métricas empresariais' },
  '/relatorios':     { title: 'Relatórios', subtitle: 'Relatórios gerenciais e operacionais' },
  '/configuracoes':  { title: 'Configurações', subtitle: 'Parâmetros do sistema' },
}

export default function Header() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { store } = useData()
  const route = routeLabels[pathname] || { title: 'FinancePro' }
  const today = new Date().toISOString().split('T')[0]

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">{route.title}</h1>
        {route.subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{route.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-600">
          <Calendar size={12} />
          <span>{formatDate(today)}</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-600 ml-2">
          <span className="font-medium text-slate-700 dark:text-slate-300">{store.company?.nome}</span>
        </div>

        <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ml-1">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        {user && (
          <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 dark:border-slate-600">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight">{user.name.split(' ')[0]}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
