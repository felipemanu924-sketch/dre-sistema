'use client'
import AppLayout from '@/components/layout/AppLayout'
import { useData } from '@/context/DataContext'
import { useState, useMemo } from 'react'
import { formatCurrencyShort, formatCurrency, getMonthName, formatPercent, calcVariation, openPrintWindow, downloadCSV } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Printer, Download, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

const DRE_STRUCTURE = [
  { id: 'receitaBruta', label: 'Receita Bruta', level: 'grupo', tipo: 'receita' },
  { id: 'deducoes', label: '(-) Deduções', level: 'grupo', isDeduction: true, tipo: 'deducao' },
  { id: 'receitaLiquida', label: '= Receita Líquida', level: 'resultado', highlight: 'blue' },
  { id: 'custos', label: '(-) Custos (CMV/CSP)', level: 'grupo', isDeduction: true, tipo: 'custo' },
  { id: 'lucroBruto', label: '= Lucro Bruto', level: 'resultado', highlight: 'green' },
  { id: 'despAdmin', label: '(-) Despesas Administrativas', level: 'grupo', isDeduction: true, tipo: 'despesa_admin' },
  { id: 'despComercial', label: '(-) Despesas Comerciais', level: 'grupo', isDeduction: true, tipo: 'despesa_comercial' },
  { id: 'ebit', label: '= Resultado Operacional (EBIT)', level: 'resultado', highlight: 'green' },
  { id: 'despFinanceira', label: '(-) Resultado Financeiro', level: 'grupo', isDeduction: true, tipo: 'despesa_financeira' },
  { id: 'ebt', label: '= Resultado Antes dos Impostos', level: 'resultado', highlight: 'blue' },
  { id: 'impostos', label: '(-) Impostos e Tributos', level: 'grupo', isDeduction: true, tipo: 'imposto' },
  { id: 'lucroLiquido', label: '= LUCRO LÍQUIDO', level: 'resultado', highlight: 'bold' },
]

function calcMonthValues(lancamentos: any[], categorias: any[], m: number, year: number) {
  const comp = `${year}-${String(m).padStart(2, '0')}`
  const monthLanc = lancamentos.filter((l: any) => l.competencia === comp && l.status !== 'cancelado')

  const sumByTipo = (tipo: string) => monthLanc
    .filter((l: any) => categorias.find((c: any) => c.id === l.categoriaId && c.tipo === tipo))
    .reduce((s: number, l: any) => s + l.valor, 0)

  const receitaBruta = sumByTipo('receita')
  const deducoes = sumByTipo('deducao')
  const receitaLiquida = receitaBruta - deducoes
  const custos = sumByTipo('custo')
  const lucroBruto = receitaLiquida - custos
  const despAdmin = sumByTipo('despesa_admin')
  const despComercial = sumByTipo('despesa_comercial')
  const ebit = lucroBruto - despAdmin - despComercial
  const despFinanceira = sumByTipo('despesa_financeira')
  const ebt = ebit - despFinanceira
  const impostos = sumByTipo('imposto')
  const lucroLiquido = ebt - impostos

  return { receitaBruta, deducoes, receitaLiquida, custos, lucroBruto, despAdmin, despComercial, ebit, despFinanceira, ebt, impostos, lucroLiquido }
}

export default function DREAnualPage() {
  const { getLancamentosByYear, store } = useData()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [view, setView] = useState<'table' | 'chart'>('table')

  const lancamentos = getLancamentosByYear(year)
  const maxMonth = year === today.getFullYear() ? today.getMonth() + 1 : 12

  const monthlyData = useMemo(() => {
    return Array.from({ length: maxMonth }, (_, i) => ({
      month: i + 1,
      ...calcMonthValues(lancamentos, store.categorias || [], i + 1, year),
    }))
  }, [lancamentos, store.categorias, maxMonth, year])

  const totals = useMemo(() => {
    const keys = Object.keys(monthlyData[0] || {}).filter(k => k !== 'month')
    const result: Record<string, number> = {}
    for (const k of keys) {
      result[k] = monthlyData.reduce((s, m) => s + ((m as any)[k] || 0), 0)
    }
    return result
  }, [monthlyData])

  const getRowValue = (row: typeof DRE_STRUCTURE[0], data: Record<string, number>) => {
    return (data as any)[row.id] || 0
  }

  const chartData = useMemo(() =>
    monthlyData.map(m => ({
      mes: getMonthName(m.month),
      'Receita': m.receitaBruta,
      'Lucro Bruto': m.lucroBruto,
      'Lucro Líquido': m.lucroLiquido,
      'Margem (%)': parseFloat(m.receitaBruta > 0 ? ((m.lucroLiquido / m.receitaBruta) * 100).toFixed(1) : '0'),
    })), [monthlyData])

  const highlightClass = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 font-bold text-blue-800 dark:text-blue-300',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 font-bold text-emerald-800 dark:text-emerald-300',
    bold: 'bg-gradient-to-r from-blue-900 to-blue-800 text-white font-bold',
  }

  const handlePrint = () => {
    const empresa = store.company?.nome || 'Empresa'
    const monthHeaders = monthlyData.map(m => `<th class="right">${getMonthName(m.month)}</th>`).join('') + '<th class="right bold">Total</th>'
    const bodyRows = DRE_STRUCTURE.map(row => {
      if (!row.tipo && !row.id.startsWith('receita') && !row.id.startsWith('lucro') && !row.id.startsWith('ebit') && !row.id.startsWith('ebt') && !row.id.startsWith('deducoes') && !row.id.startsWith('custos') && !row.id.startsWith('desp') && !row.id.startsWith('impostos')) {
        const isResult = row.level === 'resultado'
        const rowClass = isResult ? (getRowValue(row, totals) >= 0 ? 'result-row' : 'result-row-red') : row.isDeduction ? 'group-row' : ''
        const cells = monthlyData.map(m => {
          const v = getRowValue(row, m as any)
          return `<td class="right ${row.isDeduction && v > 0 ? 'deduction' : ''}">${row.isDeduction && v > 0 ? '(' + formatCurrency(v) + ')' : formatCurrency(v)}</td>`
        }).join('')
        const total = getRowValue(row, totals)
        const totalCell = `<td class="right bold ${row.isDeduction && total > 0 ? 'deduction' : ''}">${row.isDeduction && total > 0 ? '(' + formatCurrency(total) + ')' : formatCurrency(total)}</td>`
        return `<tr class="${rowClass}"><td>${row.label}</td>${cells}${totalCell}</tr>`
      }
      const isResult = row.level === 'resultado'
      const rowClass = isResult ? (getRowValue(row, totals) >= 0 ? 'result-row' : 'result-row-red') : row.isDeduction ? 'group-row' : ''
      const cells = monthlyData.map(m => {
        const v = getRowValue(row, m as any)
        return `<td class="right ${row.isDeduction && v > 0 ? 'deduction' : ''}">${row.isDeduction && v > 0 ? '(' + formatCurrency(v) + ')' : formatCurrency(v)}</td>`
      }).join('')
      const total = getRowValue(row, totals)
      const totalCell = `<td class="right bold ${row.isDeduction && total > 0 ? 'deduction' : ''}">${row.isDeduction && total > 0 ? '(' + formatCurrency(total) + ')' : formatCurrency(total)}</td>`
      return `<tr class="${rowClass}"><td>${row.label}</td>${cells}${totalCell}</tr>`
    }).join('')
    const html = `
      <h1>DRE Anual — Demonstração do Resultado do Exercício</h1>
      <div class="meta">${empresa} &nbsp;|&nbsp; Exercício: ${year}</div>
      <table>
        <thead><tr><th>Descrição</th>${monthHeaders}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>`
    openPrintWindow(`DRE Anual ${year} — ${empresa}`, html)
  }

  const handleExportCSV = () => {
    const monthNames = monthlyData.map(m => getMonthName(m.month))
    const header = ['Descrição', ...monthNames, 'Total']
    const rows: string[][] = [header]
    DRE_STRUCTURE.forEach(row => {
      const cells = monthlyData.map(m => getRowValue(row, m as any).toFixed(2))
      rows.push([row.label, ...cells, getRowValue(row, totals).toFixed(2)])
    })
    downloadCSV(rows, `dre_anual_${year}.csv`)
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Controls */}
        <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 text-sm font-semibold">
              ‹ {year - 1}
            </button>
            <div className="text-center">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-2xl">{year}</p>
              <p className="text-xs text-slate-500">{maxMonth} meses de dados</p>
            </div>
            <button onClick={() => setYear(y => y + 1)} disabled={year >= today.getFullYear()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 text-sm font-semibold disabled:opacity-30">
              {year + 1} ›
            </button>
          </div>

          <div className="flex gap-2 ml-auto flex-wrap">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
              <button onClick={() => setView('table')} className={cn('px-3 py-1.5 text-sm font-medium transition-colors', view === 'table' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700')}>
                Tabela
              </button>
              <button onClick={() => setView('chart')} className={cn('px-3 py-1.5 text-sm font-medium transition-colors', view === 'chart' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700')}>
                <BarChart3 size={14} className="inline mr-1" />Gráficos
              </button>
            </div>
            <button onClick={handlePrint} className="btn-secondary text-sm no-print"><Printer size={14} /> Imprimir</button>
            <button onClick={handleExportCSV} className="btn-secondary text-sm no-print"><Download size={14} /> Exportar CSV</button>
          </div>
        </div>

        {/* Annual KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Receita Bruta Total', key: 'receitaBruta', color: 'text-blue-600' },
            { label: 'Lucro Bruto Total', key: 'lucroBruto', color: 'text-emerald-600' },
            { label: 'Resultado Operacional', key: 'ebit', color: 'text-purple-600' },
            { label: 'Lucro Líquido Total', key: 'lucroLiquido', color: 'text-green-600' },
          ].map(kpi => {
            const val = (totals as any)[kpi.key] || 0
            const margem = totals.receitaBruta > 0 ? (val / totals.receitaBruta) * 100 : 0
            return (
              <div key={kpi.key} className="card p-4">
                <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                <p className={cn('text-xl font-bold', kpi.color)}>{formatCurrencyShort(val)}</p>
                <p className="text-xs text-slate-400 mt-1">{formatPercent(margem)} da receita</p>
              </div>
            )
          })}
        </div>

        {view === 'chart' ? (
          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Evolução Anual — Receita, Lucro Bruto e Lucro Líquido</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyShort(v)} width={70} />
                  <Tooltip formatter={(v: number, n: string) => n === 'Margem (%)' ? [`${v}%`, n] : [formatCurrency(v), n]} />
                  <Legend />
                  <Bar dataKey="Receita" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Lucro Bruto" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Lucro Líquido" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Margem Líquida — Evolução Mensal (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 25]} width={40} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Margem']} />
                  <Line type="monotone" dataKey="Margem (%)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">DRE Anual — {year}</h2>
              <p className="text-sm text-slate-500">{store.company?.nome} | Valores em R$</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[200px] sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">Descrição</th>
                    {monthlyData.map(m => (
                      <th key={m.month} className="text-right px-3 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[90px]">
                        {getMonthName(m.month)}
                      </th>
                    ))}
                    <th className="text-right px-4 py-3 text-xs font-semibold text-blue-700 dark:text-blue-400 min-w-[100px] bg-blue-50 dark:bg-blue-900/20">TOTAL</th>
                    <th className="text-right px-3 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[70px]">% Rec.</th>
                  </tr>
                </thead>
                <tbody>
                  {DRE_STRUCTURE.map(row => {
                    const totalVal = getRowValue(row, totals)
                    const pct = totals.receitaBruta > 0 ? (Math.abs(totalVal) / totals.receitaBruta) * 100 : 0
                    const isHighlight = !!row.highlight

                    return (
                      <tr key={row.id} className={cn(
                        'border-b border-slate-100 dark:border-slate-700/50',
                        row.highlight === 'bold' ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white' :
                        row.highlight ? highlightClass[row.highlight as 'blue' | 'green'] :
                        row.level === 'grupo' ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''
                      )}>
                        <td className={cn(
                          'px-4 py-2.5 sticky left-0 z-10 text-sm',
                          row.highlight === 'bold' ? 'bg-slate-800 font-bold text-white' :
                          row.highlight ? (row.highlight === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 font-bold' : 'bg-emerald-50 dark:bg-emerald-900/20 font-bold') :
                          row.level === 'grupo' ? 'bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300' : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 pl-7'
                        )}>
                          {row.label}
                        </td>
                        {monthlyData.map(m => {
                          const val = getRowValue(row, m as any)
                          return (
                            <td key={m.month} className={cn(
                              'px-3 py-2.5 text-right font-mono text-xs',
                              row.highlight === 'bold' ? 'text-white font-bold' :
                              val < 0 ? 'text-red-500' :
                              row.isDeduction && val > 0 ? 'text-red-600' :
                              'text-slate-700 dark:text-slate-300'
                            )}>
                              {row.isDeduction && val > 0 ? `(${formatCurrencyShort(val)})` : formatCurrencyShort(Math.abs(val))}
                            </td>
                          )
                        })}
                        <td className={cn(
                          'px-4 py-2.5 text-right font-mono text-xs font-bold bg-blue-50 dark:bg-blue-900/20',
                          row.highlight === 'bold' ? 'text-blue-700 dark:text-blue-300' :
                          totalVal < 0 ? 'text-red-600' :
                          row.isDeduction ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'
                        )}>
                          {row.isDeduction && totalVal > 0 ? `(${formatCurrencyShort(totalVal)})` : formatCurrencyShort(Math.abs(totalVal))}
                        </td>
                        <td className="px-3 py-2.5 text-right text-xs text-slate-400 font-mono">
                          {pct > 0 ? `${pct.toFixed(1)}%` : ''}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
