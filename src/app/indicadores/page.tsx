'use client'
import AppLayout from '@/components/layout/AppLayout'
import { useData } from '@/context/DataContext'
import { useMemo } from 'react'
import { formatCurrency, formatCurrencyShort, formatPercent, getMonthName, calcVariation } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, TrendingUp, Target, Zap, BarChart3, DollarSign, Percent, Activity } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const MONTH_REV = [150000, 142000, 168000, 175000, 182000, 195000, 188000, 201000, 215000, 228000, 235000, 248000]

function buildMonthMetrics(m: number) {
  const rev = MONTH_REV[m - 1]
  const ll = rev * 0.1265
  const lucroBruto = rev * 0.68
  const ebit = rev * 0.36
  const custos = rev * 0.30
  const desp = rev * 0.32
  return { rev, ll, lucroBruto, ebit, custos, desp }
}

export default function IndicadoresPage() {
  const { store } = useData()
  const today = new Date()
  const cm = today.getMonth() + 1
  const pm = cm > 1 ? cm - 1 : 12

  const curr = buildMonthMetrics(cm)
  const prev = buildMonthMetrics(pm)

  const margemLiquida = (curr.ll / curr.rev) * 100
  const margemBruta = (curr.lucroBruto / curr.rev) * 100
  const margemOp = (curr.ebit / curr.rev) * 100
  const pctCustos = (curr.custos / curr.rev) * 100
  const pctDesp = (curr.desp / curr.rev) * 100

  const ebitda = curr.ebit * 1.08
  const pontoEquilibrio = curr.desp / (margemBruta / 100)
  const ticketMedio = curr.rev / 47
  const crescimento = calcVariation(curr.rev, prev.rev)

  type KPI = { label: string; value: number; prev: number; format: 'pct' | 'currency'; icon: React.ReactNode; color: string; desc: string; target?: number; good: (v: number) => boolean }
  const kpis: KPI[] = [
    { label: 'Margem Líquida', value: margemLiquida, prev: (prev.ll / prev.rev) * 100, format: 'pct', icon: <Percent size={18} />, color: 'purple', desc: 'Lucro Líquido / Receita Bruta', target: 15, good: (v) => v >= 10 },
    { label: 'Margem Bruta', value: margemBruta, prev: (prev.lucroBruto / prev.rev) * 100, format: 'pct', icon: <TrendingUp size={18} />, color: 'emerald', desc: 'Lucro Bruto / Receita Líquida', target: 65, good: (v) => v >= 55 },
    { label: 'Margem Operacional', value: margemOp, prev: (prev.ebit / prev.rev) * 100, format: 'pct', icon: <Activity size={18} />, color: 'blue', desc: 'EBIT / Receita Líquida', target: 35, good: (v) => v >= 25 },
    { label: 'EBITDA', value: ebitda, prev: prev.ebit * 1.08, format: 'currency', icon: <Zap size={18} />, color: 'amber', desc: 'Resultado antes juros, impostos, depreciação', good: (v) => v > 0 },
    { label: 'Crescimento da Receita', value: crescimento, prev: 0, format: 'pct', icon: <BarChart3 size={18} />, color: 'teal', desc: 'Variação vs mês anterior', good: (v) => v >= 0 },
    { label: 'Ticket Médio', value: ticketMedio, prev: prev.rev / 44, format: 'currency', icon: <DollarSign size={18} />, color: 'indigo', desc: 'Receita média por cliente ativo', good: (v) => v > 0 },
    { label: '% Custos/Receita', value: pctCustos, prev: (prev.custos / prev.rev) * 100, format: 'pct', icon: <Target size={18} />, color: 'orange', desc: 'Custo como % da receita', good: (v) => v <= 35 },
    { label: 'Ponto de Equilíbrio', value: pontoEquilibrio, prev: prev.desp / ((prev.lucroBruto / prev.rev)), format: 'currency', icon: <Activity size={18} />, color: 'pink', desc: 'Receita mínima para cobrir custos fixos', good: (v) => curr.rev > v },
  ]

  const radarData = [
    { subject: 'Margem\nLíquida', value: Math.min((margemLiquida / 20) * 100, 100) },
    { subject: 'Margem\nBruta', value: Math.min((margemBruta / 80) * 100, 100) },
    { subject: 'Marg.\nOperacional', value: Math.min((margemOp / 45) * 100, 100) },
    { subject: 'Crescimento', value: Math.min(Math.max(crescimento + 50, 0), 100) },
    { subject: 'Eficiência\nCustos', value: Math.min(((40 - pctCustos) / 40) * 100, 100) },
    { subject: 'Eficiência\nDespesas', value: Math.min(((40 - pctDesp) / 40) * 100, 100) },
  ]

  const evolutionData = useMemo(() => {
    const maxM = today.getMonth() + 1
    return Array.from({ length: maxM }, (_, i) => {
      const m = i + 1
      const d = buildMonthMetrics(m)
      return {
        mes: getMonthName(m),
        'Margem Líquida': parseFloat(((d.ll / d.rev) * 100).toFixed(1)),
        'Margem Bruta': parseFloat(((d.lucroBruto / d.rev) * 100).toFixed(1)),
        'Marg. Operacional': parseFloat(((d.ebit / d.rev) * 100).toFixed(1)),
      }
    })
  }, [today])

  const colorMap: Record<string, string> = {
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600',
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
            {getMonthName(cm)}/{today.getFullYear()} vs {getMonthName(pm)}/{today.getFullYear()}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const variation = kpi.format !== 'pct' || kpi.label !== 'Crescimento da Receita'
              ? calcVariation(kpi.value, kpi.prev || 0)
              : kpi.value
            const isGood = kpi.good(kpi.value)
            return (
              <div key={i} className={cn('card card-hover p-5', !isGood && 'border-amber-200 dark:border-amber-800')}>
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', colorMap[kpi.color])}>
                    {kpi.icon}
                  </div>
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
                    isGood ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400')}>
                    {isGood ? '✓ Meta' : '⚠ Atenção'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {kpi.format === 'pct' ? formatPercent(kpi.value) : formatCurrencyShort(kpi.value)}
                </p>
                {kpi.target && (
                  <p className="text-xs text-slate-400 mt-0.5">Meta: {kpi.format === 'pct' ? `${kpi.target}%` : formatCurrencyShort(kpi.target)}</p>
                )}
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{kpi.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar chart */}
          <div className="card p-5">
            <h3 className="section-title text-base mb-1">Radar de Performance</h3>
            <p className="section-subtitle text-xs mb-4">Score relativo à meta ideal (100%)</p>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickCount={4} />
                <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Margin evolution */}
          <div className="card p-5 lg:col-span-2">
            <h3 className="section-title text-base mb-1">Evolução das Margens</h3>
            <p className="section-subtitle text-xs mb-4">Margem líquida, bruta e operacional — {today.getFullYear()}</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={evolutionData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={40} />
                <Tooltip formatter={(v: number) => [`${v}%`]} />
                <Line type="monotone" dataKey="Margem Líquida" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Margem Bruta" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Marg. Operacional" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed indicators table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Painel de Indicadores Detalhado</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="table-header">Indicador</th>
                  <th className="table-header text-right">Valor Atual</th>
                  <th className="table-header text-right hidden md:table-cell">Mês Anterior</th>
                  <th className="table-header text-right hidden md:table-cell">Variação</th>
                  <th className="table-header">Status</th>
                  <th className="table-header hidden lg:table-cell">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((kpi, i) => {
                  const variation = calcVariation(kpi.value, kpi.prev || 0)
                  const isGood = kpi.good(kpi.value)
                  return (
                    <tr key={i} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-7 h-7 rounded flex items-center justify-center text-xs', colorMap[kpi.color])}>
                            {kpi.icon}
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{kpi.label}</span>
                        </div>
                      </td>
                      <td className="table-cell text-right font-bold text-slate-900 dark:text-slate-100">
                        {kpi.format === 'pct' ? formatPercent(kpi.value) : formatCurrencyShort(kpi.value)}
                      </td>
                      <td className="table-cell text-right text-slate-500 hidden md:table-cell">
                        {kpi.prev ? (kpi.format === 'pct' ? formatPercent(kpi.prev) : formatCurrencyShort(kpi.prev)) : '—'}
                      </td>
                      <td className="table-cell text-right hidden md:table-cell">
                        <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', variation >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                          {variation >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {Math.abs(variation).toFixed(1)}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={cn(isGood ? 'badge-green' : 'badge-amber')}>
                          {isGood ? '✓ OK' : '⚠ Atenção'}
                        </span>
                      </td>
                      <td className="table-cell text-xs text-slate-400 hidden lg:table-cell">{kpi.desc}</td>
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
