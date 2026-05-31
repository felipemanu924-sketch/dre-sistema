'use client'
import AppLayout from '@/components/layout/AppLayout'
import { useData } from '@/context/DataContext'
import { useState, useMemo } from 'react'
import { formatCurrency, formatPercent, getFullMonthName, calcVariation } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Printer, Download, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown } from 'lucide-react'

interface DRERow {
  id: string
  label: string
  level: 'titulo' | 'grupo' | 'item' | 'resultado' | 'separator'
  valor: number
  valorAnterior?: number
  isDeduction?: boolean
  indented?: boolean
  highlight?: 'blue' | 'green' | 'red'
}

function buildDRE(lancamentos: any[], categorias: any[]): DRERow[] {
  const sum = (tipos: string[]) => {
    const cats = categorias.filter(c => tipos.includes(c.tipo))
    const catIds = cats.map((c: any) => c.id)
    return lancamentos
      .filter((l: any) => catIds.includes(l.categoriaId) && l.status !== 'cancelado')
      .reduce((s: number, l: any) => s + (l.tipo === 'entrada' ? l.valor : -l.valor), 0)
  }

  const getItemsByTipo = (tipo: string) => {
    const cats = categorias.filter((c: any) => c.tipo === tipo)
    return cats.map((c: any) => {
      const val = lancamentos
        .filter((l: any) => l.categoriaId === c.id && l.status !== 'cancelado')
        .reduce((s: number, l: any) => s + (l.tipo === 'entrada' ? l.valor : l.valor), 0)
      return { id: c.id, nome: c.nome, valor: val }
    }).filter((i: any) => i.valor > 0)
  }

  const receitaBruta = lancamentos
    .filter(l => categorias.find((c: any) => c.id === l.categoriaId && c.tipo === 'receita') && l.status !== 'cancelado')
    .reduce((s, l) => s + l.valor, 0)

  const deducoes = lancamentos
    .filter(l => categorias.find((c: any) => c.id === l.categoriaId && c.tipo === 'deducao') && l.status !== 'cancelado')
    .reduce((s, l) => s + l.valor, 0)

  const receitaLiquida = receitaBruta - deducoes

  const custos = lancamentos
    .filter(l => categorias.find((c: any) => c.id === l.categoriaId && (c.tipo === 'custo')) && l.status !== 'cancelado')
    .reduce((s, l) => s + l.valor, 0)

  const lucroBruto = receitaLiquida - custos

  const despAdmin = lancamentos
    .filter(l => categorias.find((c: any) => c.id === l.categoriaId && c.tipo === 'despesa_admin') && l.status !== 'cancelado')
    .reduce((s, l) => s + l.valor, 0)

  const despComercial = lancamentos
    .filter(l => categorias.find((c: any) => c.id === l.categoriaId && c.tipo === 'despesa_comercial') && l.status !== 'cancelado')
    .reduce((s, l) => s + l.valor, 0)

  const ebit = lucroBruto - despAdmin - despComercial

  const despFinanceira = lancamentos
    .filter(l => categorias.find((c: any) => c.id === l.categoriaId && c.tipo === 'despesa_financeira') && l.status !== 'cancelado')
    .reduce((s, l) => s + l.valor, 0)

  const ebt = ebit - despFinanceira

  const impostos = lancamentos
    .filter(l => categorias.find((c: any) => c.id === l.categoriaId && c.tipo === 'imposto') && l.status !== 'cancelado')
    .reduce((s, l) => s + l.valor, 0)

  const lucroLiquido = ebt - impostos

  const receitaItems = getItemsByTipo('receita')
  const custoItems = getItemsByTipo('custo')
  const adminItems = getItemsByTipo('despesa_admin')
  const comercialItems = getItemsByTipo('despesa_comercial')

  return [
    { id: '1', label: '1. RECEITA BRUTA', level: 'grupo', valor: receitaBruta },
    ...receitaItems.map(i => ({ id: i.id, label: i.nome, level: 'item' as const, valor: i.valor, indented: true })),
    { id: '2', label: '(-) DEDUÇÕES DA RECEITA', level: 'grupo', valor: deducoes, isDeduction: true },
    { id: '3', label: '= RECEITA LÍQUIDA', level: 'resultado', valor: receitaLiquida, highlight: 'blue' as const },
    { id: 'sep1', label: '', level: 'separator', valor: 0 },
    { id: '4', label: '(-) CUSTOS (CMV / CSP)', level: 'grupo', valor: custos, isDeduction: true },
    ...custoItems.map(i => ({ id: i.id, label: i.nome, level: 'item' as const, valor: i.valor, indented: true, isDeduction: true })),
    { id: '5', label: '= LUCRO BRUTO', level: 'resultado', valor: lucroBruto, highlight: (lucroBruto >= 0 ? 'green' : 'red') as 'green' | 'red' },
    { id: 'sep2', label: '', level: 'separator', valor: 0 },
    { id: '6', label: '(-) DESPESAS ADMINISTRATIVAS', level: 'grupo', valor: despAdmin, isDeduction: true },
    ...adminItems.map(i => ({ id: i.id + 'a', label: i.nome, level: 'item' as const, valor: i.valor, indented: true, isDeduction: true })),
    { id: '7', label: '(-) DESPESAS COMERCIAIS', level: 'grupo', valor: despComercial, isDeduction: true },
    ...comercialItems.map(i => ({ id: i.id + 'c', label: i.nome, level: 'item' as const, valor: i.valor, indented: true, isDeduction: true })),
    { id: '8', label: '= RESULTADO OPERACIONAL (EBIT)', level: 'resultado', valor: ebit, highlight: (ebit >= 0 ? 'green' : 'red') as 'green' | 'red' },
    { id: 'sep3', label: '', level: 'separator', valor: 0 },
    { id: '9', label: '(-) RESULTADO FINANCEIRO', level: 'grupo', valor: despFinanceira, isDeduction: true },
    { id: '10', label: '= RESULTADO ANTES DOS IMPOSTOS (EBT)', level: 'resultado', valor: ebt, highlight: 'blue' as const },
    { id: 'sep4', label: '', level: 'separator', valor: 0 },
    { id: '11', label: '(-) IMPOSTOS E TRIBUTOS', level: 'grupo', valor: impostos, isDeduction: true },
    { id: '12', label: '= LUCRO LÍQUIDO DO EXERCÍCIO', level: 'resultado', valor: lucroLiquido, highlight: (lucroLiquido >= 0 ? 'green' : 'red') as 'green' | 'red' },
  ]
}

export default function DREMensalPage() {
  const { getLancamentosByPeriod, store } = useData()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [showComparison, setShowComparison] = useState(true)

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year

  const lancamentos = getLancamentosByPeriod(year, month)
  const lancamentosAnterior = getLancamentosByPeriod(prevYear, prevMonth)

  const dreRows = useMemo(() => buildDRE(lancamentos, store.categorias || []), [lancamentos, store.categorias])
  const dreRowsAnterior = useMemo(() => buildDRE(lancamentosAnterior, store.categorias || []), [lancamentosAnterior, store.categorias])

  const receitaBruta = dreRows.find(r => r.id === '1')?.valor || 1

  const prevMonth2 = (m: number) => {
    if (m === 1) return 12; return m - 1
  }

  const navigatePrev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const navigateNext = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const highlightClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-l-4 border-l-blue-500',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-l-4 border-l-emerald-500',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-l-4 border-l-red-500',
  }

  const lucroLiquidoRow = dreRows.find(r => r.id === '12')
  const lucroLiquidoAnterior = dreRowsAnterior.find(r => r.id === '12')
  const variacao = calcVariation(lucroLiquidoRow?.valor || 0, lucroLiquidoAnterior?.valor || 0)

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Controls */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button onClick={navigatePrev} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
                <ChevronLeft size={18} />
              </button>
              <div className="text-center min-w-[160px]">
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                  {getFullMonthName(month)} {year}
                </p>
                <p className="text-xs text-slate-500">{lancamentos.length} lançamentos no período</p>
              </div>
              <button onClick={navigateNext} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 ml-auto flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showComparison} onChange={e => setShowComparison(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Comparar com período anterior</span>
              </label>
              <button onClick={() => window.print()} className="btn-secondary text-sm no-print">
                <Printer size={14} /> Imprimir
              </button>
              <button className="btn-secondary text-sm no-print">
                <Download size={14} /> Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Receita Bruta', rowId: '1', icon: <TrendingUp size={16} />, color: 'blue' },
            { label: 'Lucro Bruto', rowId: '5', icon: <TrendingUp size={16} />, color: 'emerald' },
            { label: 'Resultado Operacional', rowId: '8', icon: <TrendingUp size={16} />, color: 'purple' },
            { label: 'Lucro Líquido', rowId: '12', icon: <TrendingUp size={16} />, color: 'green' },
          ].map(kpi => {
            const row = dreRows.find(r => r.id === kpi.rowId)
            const rowPrev = dreRowsAnterior.find(r => r.id === kpi.rowId)
            const v = row?.valor || 0
            const vPrev = rowPrev?.valor || 0
            const var_ = calcVariation(v, vPrev)
            const isPos = var_ >= 0
            return (
              <div key={kpi.rowId} className="card p-4">
                <p className="text-xs text-slate-500 mb-2">{kpi.label}</p>
                <p className={cn('text-xl font-bold', v >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-red-600')}>
                  {formatCurrency(v)}
                </p>
                <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium', isPos ? 'text-emerald-600' : 'text-red-600')}>
                  {isPos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(var_).toFixed(1)}% vs anterior
                </div>
                {receitaBruta > 0 && (
                  <p className="text-xs text-slate-400 mt-0.5">{formatPercent((v / receitaBruta) * 100)} da receita</p>
                )}
              </div>
            )
          })}
        </div>

        {/* DRE Table */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100">DRE — Demonstração do Resultado do Exercício</h2>
              <p className="text-sm text-slate-500">Competência: {getFullMonthName(month)}/{year} | Base: Regime de Competência</p>
            </div>
            <div className="text-xs text-slate-400">
              {store.company?.nome} | CNPJ: {store.company?.cnpj}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="table-header w-[55%]">Descrição</th>
                  <th className="table-header text-right">
                    {getFullMonthName(month)}/{year}
                  </th>
                  <th className="table-header text-right hidden sm:table-cell">% Receita</th>
                  {showComparison && (
                    <>
                      <th className="table-header text-right hidden lg:table-cell">
                        {getFullMonthName(prevMonth)}/{prevYear}
                      </th>
                      <th className="table-header text-right hidden lg:table-cell">Variação</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {dreRows.map(row => {
                  if (row.level === 'separator') {
                    return <tr key={row.id}><td colSpan={5} className="py-1"></td></tr>
                  }

                  const prevRow = dreRowsAnterior.find(r => r.id === row.id)
                  const pctReceita = receitaBruta > 0 ? (Math.abs(row.valor) / receitaBruta) * 100 : 0
                  const variation = prevRow ? calcVariation(row.valor, prevRow.valor) : 0
                  const isPositiveVariation = row.isDeduction ? variation <= 0 : variation >= 0

                  const rowClass = row.level === 'resultado' && row.highlight
                    ? highlightClasses[row.highlight]
                    : row.level === 'grupo'
                    ? 'bg-slate-50 dark:bg-slate-800/30'
                    : ''

                  return (
                    <tr key={row.id} className={cn('border-b border-slate-100 dark:border-slate-700/50', rowClass)}>
                      <td className={cn('px-4 py-3 text-sm', row.level === 'resultado' ? 'font-bold' : row.level === 'grupo' ? 'font-semibold' : 'text-slate-600 dark:text-slate-400', row.indented && 'pl-10')}>
                        {row.level === 'resultado' && (
                          <span className="mr-2 text-xs">▶</span>
                        )}
                        {row.label}
                      </td>
                      <td className={cn('px-4 py-3 text-sm text-right font-mono', row.level === 'resultado' ? 'font-bold' : row.level === 'grupo' ? 'font-semibold' : '',
                        row.isDeduction && row.valor > 0 ? 'text-red-600' : row.valor < 0 ? 'text-red-600' : 'text-slate-800 dark:text-slate-200')}>
                        {row.isDeduction && row.valor > 0 ? `(${formatCurrency(row.valor)})` : formatCurrency(Math.abs(row.valor))}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-500 hidden sm:table-cell font-mono">
                        {row.level !== 'titulo' && row.valor !== 0 ? `${formatPercent(pctReceita)}` : ''}
                      </td>
                      {showComparison && (
                        <>
                          <td className={cn('px-4 py-3 text-sm text-right font-mono text-slate-500 hidden lg:table-cell')}>
                            {prevRow ? (prevRow.isDeduction && prevRow.valor > 0 ? `(${formatCurrency(prevRow.valor)})` : formatCurrency(Math.abs(prevRow.valor))) : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right hidden lg:table-cell">
                            {prevRow && prevRow.valor !== 0 ? (
                              <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
                                isPositiveVariation ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400')}>
                                {isPositiveVariation ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {Math.abs(variation).toFixed(1)}%
                              </span>
                            ) : '—'}
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
            <p className="text-xs text-slate-400">
              * Valores em Reais (R$) | Regime de Competência | Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
