'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, BookOpen, TrendingUp, TrendingDown,
  BarChart3, Target, Printer, Settings, ChevronLeft, ChevronRight,
  LogOut, Moon, Sun, DollarSign, ChevronDown, Building2, Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

interface NavItem {
  label: string
  href?: string
  icon: React.ReactNode
  badge?: string
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Lançamentos', href: '/lancamentos', icon: <FileText size={18} /> },
  { label: 'Plano de Contas', href: '/plano-contas', icon: <BookOpen size={18} /> },
  {
    label: 'DRE', icon: <BarChart3 size={18} />,
    children: [
      { label: 'DRE Mensal', href: '/dre/mensal' },
      { label: 'DRE Anual', href: '/dre/anual' },
    ],
  },
  { label: 'Fluxo de Caixa', href: '/fluxo-caixa', icon: <Wallet size={18} /> },
  { label: 'Indicadores', href: '/indicadores', icon: <Target size={18} /> },
  { label: 'Relatórios', href: '/relatorios', icon: <Printer size={18} /> },
  { label: 'Configurações', href: '/configuracoes', icon: <Settings size={18} /> },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}

export default function Sidebar({ collapsed, onToggle, darkMode, onToggleDarkMode }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [openGroups, setOpenGroups] = useState<string[]>(['DRE'])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const isGroupActive = (item: NavItem) =>
    item.children?.some(c => isActive(c.href)) ?? false

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label])
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-amber-500',
    financeiro: 'bg-blue-500',
    gestor: 'bg-purple-500',
    visualizacao: 'bg-slate-500',
  }

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    financeiro: 'Financeiro',
    gestor: 'Gestor',
    visualizacao: 'Visualização',
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen flex flex-col bg-slate-900 border-r border-slate-800 z-40 transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 border-b border-slate-800 px-4 flex-shrink-0', collapsed ? 'justify-center' : 'gap-3')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
          <DollarSign size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-tight">FinancePro</p>
            <p className="text-slate-400 text-xs">Gestão Financeira</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map(item => (
          <div key={item.label}>
            {item.children ? (
              <>
                <button
                  onClick={() => !collapsed && toggleGroup(item.label)}
                  className={cn(
                    'nav-item w-full',
                    isGroupActive(item) ? 'text-white' : 'nav-item-inactive',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={cn('flex-shrink-0', isGroupActive(item) && 'text-blue-400')}>{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        size={14}
                        className={cn('transition-transform', openGroups.includes(item.label) ? 'rotate-180' : '')}
                      />
                    </>
                  )}
                </button>
                {!collapsed && openGroups.includes(item.label) && (
                  <div className="ml-4 mt-0.5 space-y-0.5 pl-4 border-l border-slate-700">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center py-2 px-2 rounded-lg text-sm transition-colors',
                          isActive(child.href)
                            ? 'text-blue-400 font-medium'
                            : 'text-slate-400 hover:text-white'
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href!}
                className={cn(
                  'nav-item',
                  isActive(item.href!) ? 'nav-item-active' : 'nav-item-inactive',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">{item.badge}</span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-800 p-2 space-y-1 flex-shrink-0">
        <button
          onClick={onToggleDarkMode}
          className={cn('nav-item nav-item-inactive w-full', collapsed && 'justify-center px-2')}
          title={collapsed ? (darkMode ? 'Modo Claro' : 'Modo Escuro') : undefined}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </button>

        {user && (
          <div className={cn('flex items-center gap-3 px-3 py-2 rounded-lg', collapsed && 'justify-center px-2')}>
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0', roleColors[user.role] || 'bg-blue-600')}>
              {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-slate-400 text-xs">{roleLabels[user.role]}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded">
                <LogOut size={15} />
              </button>
            )}
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn('nav-item nav-item-inactive w-full', collapsed && 'justify-center px-2')}
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Recolher</span></>}
        </button>
      </div>
    </aside>
  )
}
