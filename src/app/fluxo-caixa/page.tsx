'use client'
import AppLayout from '@/components/layout/AppLayout'
import { useData } from '@/context/DataContext'
import { useState, useMemo } from 'react'
import { formatCurrency, formatCurrencyShort, getFullMonthName, getMonthName } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, AlertCircle, ChevronLeft, ChevronRight, Wallet } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

export default function FluxoCaixaPage() {
  const { store } = useData()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [view, setView] = useState<'mensal' | 'anual'>('mensal')

  const monthlyFlow = useMemo(() => {
    const maxMonth = year === today.getFullYear() ? today.getMonth() + 1 : 12
    let saldoAcumulado = store.contasBancarias?.reduce((s, c) => s + (c.tipo !== 'investimento' ? c.saldoInicial * 0.1 : 0), 0) || 50000

    return Array.from({ length: maxMonth }, (_, i) => {
      const m = i + 1
      const comp = `${year}-${String(m).padStart(2, '0')}`
      const lancamentos = (store.lancamentos || []).filter(l => l.competencia === comp && l.status !== 'cancelado')

      const entradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
      const saidas = lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)
      const saldoMes = entradas - saidas
      saldoAcumulado += saldoMes

      return {
        mes: getMonthName(m),
        mesLabel: `${getFullMonthName(m).slice(0, 3)} ${year}`,
        entradas,
        saidas,
        saldoMes,
        saldoAcumulado,
        lancamentosCount: lancamentos.length,
      }
    })
  }, [store, year, today])

  const currentMonthFlow = useMemo(() => {
    return monthlyFlow.find((_, i) => i + 1 === month) || monthlyFlow[monthlyFlow.length - 1]
  }, [monthlyFlow, month])

  const dailyFlow = useMemo(() => {
    const comp = `${year}-${String(month).padStart(2, '0')}`
    const lancamentos = (store.lancamentos || [])
      .filter(l => l.competencia === comp && l.status !== 'cancelado')
      .sort((a, b) => a.data.localeCompare(b.data))

    const daysInMonth = new Date(year, month, 0).getDate()
    let saldoAcum = 0

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayLanc = lancamentos.filter(l => l.data === dateStr)
      const entradas = dayLanc.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
      const saidas = dayLanc.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)
      saldoAcum += entradas - saidas

      return {
        dia: day,
        entradas,
        saidas,
        saldoAcumulado: saldoAcum,
        hasMovement: dayLanc.length > 0,
      }
    })
  }, [store.lancamentos, year, month])

  const contasInfo = useMemo(() => {
    return store.contasBancarias?.filter(c => c.ativo).map(c => ({
      ...c,
      saldoAtual: c.saldoInicial + (store.lancamentos || [])
        .filter(l => l.contaBancariaId === c.id && l.status === 'confirmado')
        .reduce((s, l) => s + (l.tipo === 'entrada' ? l.valor : -l.valor), 0),
    })) || []
  }, [store])

  const totalSaldo = contasInfo.reduce((s, c) => s + c.saldoAtual, 0)

  const navigatePrev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const navigateNext = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold mb-2 text-slate-700 dark:text-slate-300">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }}></div>
            <span className="text-slate-500">{p.name}:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrencyShort(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Bank accounts strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contasInfo.slice(0, 4).map(conta => (
            <div key={conta.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Wallet size={16} className="text-blue-600" />
                </div>
                <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded',
                  conta.tipo === 'corrente' ? 'bg-blue-100 text-blue-700' :
                  conta.tipo === 'investimento' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600')}>
                  {conta.tipo === 'corrente' ? 'Corrente' : conta.tipo === 'investimento' ? 'Invest.' : conta.tipo === 'caixa' ? 'Caixa' : 'Poupança'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-1 truncate">{conta.nome}</p>
              <p className={cn('text-lg font-bold', conta.saldoAtual >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-red-600')}>
                {formatCurrencyShort(conta.saldoAtual)}
              </p>
              <p className="text-xs text-slate-400">{conta.banco}</p>
            </div>
          ))}
        </div>

        {/* Total saldo */}
        <div className={cn('card p-4 flex items-center justify-between', totalSaldo < 0 ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' : '')}>
          <div className="flex items-center gap-3">
            {totalSaldo < 0 && <AlertCircle size={20} className="text-red-500" />}
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Saldo Total Consolidado (todas as contas)</p>
              <p className={cn('text-2xl font-bold', totalSaldo >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-red-600')}>{formatCurrency(totalSaldo)}</p>
            </div>
          </div>
          {totalSaldo < 0 && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold px-3 py-2 rounded-lg">
              ⚠ Saldo Negativo
            </div>
          )}
        </div>

        {/* View toggle */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
              <button onClick={() => setView('mensal')} className={cn('px-4 py-1.5 text-sm font-medium transition-colors', view === 'mensal' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700')}>
                Mensal
              </button>
              <button onClick={() => setView('anual')} className={cn('px-4 py-1.5 text-sm font-medium transition-colors', view === 'anual' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700')}>
                Anual
              </button>
            </div>

            {view === 'mensal' && (
              <div className="flex items-center gap-3">
                <button onClick={navigatePrev} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><ChevronLeft size={16} /></button>
                <span className="font-semibold text-slate-900 dark:text-slate-100 min-w-[160px] text-center">
                  {getFullMonthName(month)} {year}
                </span>
                <button onClick={navigateNext} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>

        {view === 'anual' ? (
          <>
            {/* Annual flow summary */}
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Fluxo de Caixa Anual — {year}</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyFlow} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyShort(v)} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="#e2e8f0" strokeWidth={1} />
                  <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Saldo Acumulado — {year}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyFlow} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyShort(v)} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="saldoAcumulado" name="Saldo Acumulado" stroke="#3b82f6" fill="url(#gradSaldo)" strokeWidth={2.5} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Resumo Mensal — {year}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="table-header">Mês</th>
                      <th className="table-header text-right">Entradas</th>
                      <th className="table-header text-right">Saídas</th>
                      <th className="table-header text-right">Saldo do Mês</th>
                      <th className="table-header text-right">Saldo Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyFlow.map((m, i) => (
                      <tr key={i} className="table-row">
                        <td className="table-cell font-medium">{m.mesLabel}</td>
                        <td className="table-cell text-right text-emerald-600 font-semibold">{formatCurrency(m.entradas)}</td>
                        <td className="table-cell text-right text-red-600 font-semibold">{formatCurrency(m.saidas)}</td>
                        <td className={cn('table-cell text-right font-bold', m.saldoMes >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                          {m.saldoMes >= 0 ? '+' : ''}{formatCurrency(m.saldoMes)}
                        </td>
                        <td className={cn('table-cell text-right font-bold', m.saldoAcumulado >= 0 ? 'text-blue-600' : 'text-red-600')}>
                          {formatCurrency(m.saldoAcumulado)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-800">
                      <td className="table-cell font-bold text-blue-800 dark:text-blue-300">TOTAL {year}</td>
                      <td className="table-cell text-right font-bold text-emerald-600">{formatCurrency(monthlyFlow.reduce((s, m) => s + m.entradas, 0))}</td>
                      <td className="table-cell text-right font-bold text-red-600">{formatCurrency(monthlyFlow.reduce((s, m) => s + m.saidas, 0))}</td>
                      <td className="table-cell text-right font-bold text-blue-700">{formatCurrency(monthlyFlow.reduce((s, m) => s + m.saldoMes, 0))}</td>
                      <td className="table-cell text-right font-bold text-blue-700">{formatCurrency(monthlyFlow[monthlyFlow.length - 1]?.saldoAcumulado || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Monthly KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <TrendingUp size={16} className="text-emerald-600" />
                  </div>
                  <p className="text-sm text-slate-500">Entradas no Mês</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(currentMonthFlow?.entradas || 0)}</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <TrendingDown size={16} className="text-red-600" />
                  </div>
                  <p className="text-sm text-slate-500">Saídas no Mês</p>
                </div>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(currentMonthFlow?.saidas || 0)}</p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                    (currentMonthFlow?.saldoMes || 0) >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20')}>
                    <Wallet size={16} className={(currentMonthFlow?.saldoMes || 0) >= 0 ? 'text-blue-600' : 'text-red-600'} />
                  </div>
                  <p className="text-sm text-slate-500">Resultado do Mês</p>
                </div>
                <p className={cn('text-2xl font-bold', (currentMonthFlow?.saldoMes || 0) >= 0 ? 'text-blue-600' : 'text-red-600')}>
                  {(currentMonthFlow?.saldoMes || 0) >= 0 ? '+' : ''}{formatCurrency(currentMonthFlow?.saldoMes || 0)}
                </p>
              </div>
            </div>

            {/* Daily flow chart */}
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Saldo Acumulado Diário — {getFullMonthName(month)} {year}
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyFlow.filter(d => d.hasMovement || d.dia <= today.getDate())} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradDiario" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyShort(v)} width={60} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Saldo']} labelFormatter={v => `Dia ${v}`} />
                  <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />
                  <Area type="monotone" dataKey="saldoAcumulado" name="Saldo Acumulado" stroke="#3b82f6" fill="url(#gradDiario)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Transactions list */}
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Lançamentos — {getFullMonthName(month)} {year}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="table-header">Data</th>
                      <th className="table-header">Descrição</th>
                      <th className="table-header">Conta</th>
                      <th className="table-header text-right">Entradas</th>
                      <th className="table-header text-right">Saídas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const comp = `${year}-${String(month).padStart(2, '0')}`
                      const items = (store.lancamentos || [])
                        .filter(l => l.competencia === comp && l.status !== 'cancelado')
                        .sort((a, b) => a.data.localeCompare(b.data))
                      return items.map(l => {
                        const conta = store.contasBancarias?.find(c => c.id === l.contaBancariaId)
                        return (
                          <tr key={l.id} className="table-row">
                            <td className="table-cell text-slate-500 text-xs whitespace-nowrap">{l.data.split('-').reverse().join('/')}</td>
                            <td className="table-cell text-sm">{l.descricao}</td>
                            <td className="table-cell text-xs text-slate-500 truncate max-w-[120px]">{conta?.nome}</td>
                            <td className="table-cell text-right font-semibold text-emerald-600">
                              {l.tipo === 'entrada' ? formatCurrency(l.valor) : '—'}
                            </td>
                            <td className="table-cell text-right font-semibold text-red-600">
                              {l.tipo === 'saida' ? formatCurrency(l.valor) : '—'}
                            </td>
                          </tr>
                        )
                      })
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
