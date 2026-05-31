'use client'
import AppLayout from '@/components/layout/AppLayout'
import { useData } from '@/context/DataContext'
import { formatCurrency, formatCurrencyShort, formatPercent, calcVariation, getMonthName } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  TrendingUp, TrendingDown, DollarSign, BarChart2, ArrowUpRight,
  ArrowDownRight, Minus, RefreshCw, Filter, ShoppingCart, Wallet,
  CreditCard, Percent, Activity, PiggyBank, FileText
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts'
import { useState, useMemo } from 'react'
import Link from 'next/link'

const MONTH_REVENUE = [150000, 142000, 168000, 175000, 182000, 195000, 188000, 201000, 215000, 228000, 235000, 248000]

function buildMonthData(month: number) {
  const rev = MONTH_REVENUE[month - 1]
  return {
    receitaBruta: rev,
    deducoes: rev * 0.02,
    receitaLiquida: rev * 0.98,
    custos: rev * 0.30,
    lucroBruto: rev * 0.68,
    despesasAdmin: rev * 0.19,
    despesasComercial: rev * 0.13,
    despesasFinanceiras: rev * 0.015,
    impostos: rev * 0.06,
    lucroLiquido: rev * 0.1265,
  }
}

export default function DashboardPage() {
  const { store } = useData()
  const [selectedYear] = useState(2025)
  const today = new Date()
  const currentMonth = today.getMonth() + 1

  const currentData = buildMonthData(currentMonth)
  const previousData = buildMonthData(currentMonth > 1 ? currentMonth - 1 : 12)

  const kpis = [
    {
      label: 'Receita Bruta', value: currentData.receitaBruta, prev: previousData.receitaBruta,
      icon: <DollarSign size={20} />, color: 'blue', format: 'currency' as const,
    },
    {
      label: 'Receita Líquida', value: currentData.receitaLiquida, prev: previousData.receitaLiquida,
      icon: <ShoppingCart size={20} />, color: 'indigo', format: 'currency' as const,
    },
    {
      label: 'Lucro Bruto', value: currentData.lucroBruto, prev: previousData.lucroBruto,
      icon: <TrendingUp size={20} />, color: 'emerald', format: 'currency' as const,
    },
    {
      label: 'Lucro Líquido', value: currentData.lucroLiquido, prev: previousData.lucroLiquido,
      icon: <PiggyBank size={20} />, color: 'green', format: 'currency' as const,
    },
    {
      label: 'Custos Totais', value: currentData.custos, prev: previousData.custos,
      icon: <CreditCard size={20} />, color: 'orange', format: 'currency' as const, isExpense: true,
    },
    {
      label: 'Despesas Totais', value: currentData.despesasAdmin + currentData.despesasComercial, prev: previousData.despesasAdmin + previousData.despesasComercial,
      icon: <BarChart2 size={20} />, color: 'amber', format: 'currency' as const, isExpense: true,
    },
    {
      label: 'Margem Líquida', value: (currentData.lucroLiquido / currentData.receitaBruta) * 100,
      prev: (previousData.lucroLiquido / previousData.receitaBruta) * 100,
      icon: <Percent size={20} />, color: 'purple', format: 'percent' as const,
    },
    {
      label: 'Resultado Operacional', value: currentData.lucroBruto - currentData.despesasAdmin - currentData.despesasComercial,
      prev: previousData.lucroBruto - previousData.despesasAdmin - previousData.despesasComercial,
      icon: <Activity size={20} />, color: 'teal', format: 'currency' as const,
    },
    {
      label: 'Fluxo de Caixa', value: currentData.lucroLiquido * 1.1,
      prev: previousData.lucroLiquido * 1.1,
      icon: <Wallet size={20} />, color: 'cyan', format: 'currency' as const,
    },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  }

  const monthlyChartData = useMemo(() =>
    Array.from({ length: currentMonth }, (_, i) => {
      const m = i + 1
      const d = buildMonthData(m)
      return {
        month: getMonthName(m),
        receita: d.receitaBruta,
        custosDespesas: d.custos + d.despesasAdmin + d.despesasComercial,
        lucro: d.lucroLiquido,
        margem: parseFloat(((d.lucroLiquido / d.receitaBruta) * 100).toFixed(1)),
      }
    }), [currentMonth])

  const expensePieData = [
    { name: 'Custos', value: currentData.custos, color: '#f97316' },
    { name: 'Desp. Admin', value: currentData.despesasAdmin, color: '#3b82f6' },
    { name: 'Desp. Comercial', value: currentData.despesasComercial, color: '#8b5cf6' },
    { name: 'Desp. Financeiras', value: currentData.despesasFinanceiras, color: '#ec4899' },
    { name: 'Impostos', value: currentData.impostos, color: '#f59e0b' },
  ]

  const recentLancamentos = useMemo(() => {
    return [...(store.lancamentos || [])]
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 8)
  }, [store.lancamentos])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }}></div>
            <span className="text-slate-500">{p.name}:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {p.name === 'Margem (%)' ? `${p.value}%` : formatCurrencyShort(p.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Period badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
              Período atual: {getMonthName(currentMonth)}/{selectedYear}
            </div>
            <span className="text-xs text-slate-500">Comparado com {getMonthName(currentMonth > 1 ? currentMonth - 1 : 12)}/{selectedYear}</span>
          </div>
          <button className="btn-ghost text-xs">
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => {
            const variation = calcVariation(kpi.value, kpi.prev)
            const isPositive = kpi.isExpense ? variation <= 0 : variation >= 0
            const isNeutral = Math.abs(variation) < 0.1
            return (
              <div key={i} className="card card-hover p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', colorMap[kpi.color])}>
                    {kpi.icon}
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
                    isNeutral ? 'bg-slate-100 text-slate-500' :
                    isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                    'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  )}>
                    {isNeutral ? <Minus size={12} /> : isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(variation).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {kpi.format === 'percent' ? formatPercent(kpi.value) : formatCurrencyShort(kpi.value)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Anterior: {kpi.format === 'percent' ? formatPercent(kpi.prev) : formatCurrencyShort(kpi.prev)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Expenses Area Chart */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="section-title text-base">Faturamento vs Despesas</h3>
                <p className="section-subtitle text-xs">Evolução mensal {selectedYear}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyShort(v)} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                <Area type="monotone" dataKey="receita" name="Receita Bruta" stroke="#3b82f6" fill="url(#gradReceita)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="custosDespesas" name="Custos + Despesas" stroke="#f97316" fill="url(#gradDespesas)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="lucro" name="Lucro Líquido" stroke="#10b981" fill="url(#gradLucro)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Breakdown Pie */}
          <div className="card p-5">
            <div className="mb-5">
              <h3 className="section-title text-base">Composição das Despesas</h3>
              <p className="section-subtitle text-xs">Distribuição — {getMonthName(currentMonth)}/{selectedYear}</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {expensePieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [formatCurrencyShort(v), '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {expensePieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }}></div>
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrencyShort(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Profit Bar */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="section-title text-base">Lucro Mensal</h3>
                <p className="section-subtitle text-xs">Resultado líquido por mês</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyShort(v)} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="lucro" name="Lucro Líquido" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Margin evolution */}
          <div className="card p-5">
            <div className="mb-5">
              <h3 className="section-title text-base">Margem Líquida</h3>
              <p className="section-subtitle text-xs">Evolução percentual</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={40} domain={[0, 20]} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Margem']} />
                <Line type="monotone" dataKey="margem" name="Margem (%)" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Média Anual</p>
                <p className="text-lg font-bold text-purple-600">12,6%</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Mês Atual</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatPercent((currentData.lucroLiquido / currentData.receitaBruta) * 100)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="section-title text-base">Lançamentos Recentes</h3>
              <p className="section-subtitle text-xs">Últimas movimentações financeiras</p>
            </div>
            <Link href="/lancamentos" className="btn-secondary text-xs">
              <FileText size={14} /> Ver todos
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="table-header">Data</th>
                  <th className="table-header">Descrição</th>
                  <th className="table-header hidden md:table-cell">Categoria</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header text-right">Valor</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLancamentos.map(l => {
                  const cat = store.categorias?.find(c => c.id === l.categoriaId)
                  return (
                    <tr key={l.id} className="table-row">
                      <td className="table-cell text-slate-500 text-xs whitespace-nowrap">
                        {l.data.split('-').reverse().join('/')}
                      </td>
                      <td className="table-cell font-medium max-w-[200px] truncate">{l.descricao}</td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="text-xs text-slate-500">{cat?.nome}</span>
                      </td>
                      <td className="table-cell">
                        <span className={cn('text-xs font-semibold', l.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-600')}>
                          {l.tipo === 'entrada' ? '▲ Entrada' : '▼ Saída'}
                        </span>
                      </td>
                      <td className={cn('table-cell text-right font-semibold', l.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-600')}>
                        {l.tipo === 'entrada' ? '+' : '-'}{formatCurrency(l.valor)}
                      </td>
                      <td className="table-cell">
                        <span className={cn(
                          l.status === 'confirmado' ? 'badge-green' :
                          l.status === 'pendente' ? 'badge-amber' : 'badge-red'
                        )}>
                          {l.status === 'confirmado' ? 'Confirmado' : l.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
