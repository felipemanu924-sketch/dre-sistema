'use client'
import AppLayout from '@/components/layout/AppLayout'
import { useData } from '@/context/DataContext'
import { useState, useMemo } from 'react'
import { formatCurrency, formatCurrencyShort, formatDate, downloadCSV, openPrintWindow } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Lancamento } from '@/types'
import { TrendingUp, TrendingDown, Wallet, FileText, ChevronLeft, ChevronRight, Download, Printer } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

type Periodo = 'diario' | 'semanal'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// datas no formato AAAA-MM-DD (mesmo formato de Lancamento.data), sempre no fuso local
const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const startOfWeek = (d: Date) => addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -((d.getDay() + 6) % 7)) // segunda-feira
const ddmm = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`

const statusStyle: Record<string, string> = {
  confirmado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pendente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export default function ReceitasSaidasPage() {
  const { store } = useData()
  const [periodo, setPeriodo] = useState<Periodo>('diario')
  const [refDate, setRefDate] = useState(() => new Date())

  const range = useMemo(() => {
    if (periodo === 'diario') {
      const iso = toISO(refDate)
      const isToday = iso === toISO(new Date())
      return {
        start: iso, end: iso,
        dias: [refDate],
        label: `${isToday ? 'Hoje' : DIAS_SEMANA[refDate.getDay()]}, ${formatDate(iso)}`,
        titulo: `Relatório Diário — ${formatDate(iso)}`,
      }
    }
    const ini = startOfWeek(refDate)
    const dias = Array.from({ length: 7 }, (_, i) => addDays(ini, i))
    const fim = dias[6]
    return {
      start: toISO(ini), end: toISO(fim),
      dias,
      label: `${ddmm(ini)} – ${ddmm(fim)}/${fim.getFullYear()}`,
      titulo: `Relatório Semanal — ${formatDate(toISO(ini))} a ${formatDate(toISO(fim))}`,
    }
  }, [periodo, refDate])

  const lancamentos = useMemo(() =>
    (store.lancamentos || [])
      .filter(l => l.status !== 'cancelado' && l.data >= range.start && l.data <= range.end)
      .sort((a, b) => a.data.localeCompare(b.data) || (a.createdAt || '').localeCompare(b.createdAt || '')),
  [store.lancamentos, range])

  const totais = useMemo(() => {
    const entradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
    const saidas = lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)
    const pendentes = lancamentos.filter(l => l.status === 'pendente').length
    return { entradas, saidas, resultado: entradas - saidas, count: lancamentos.length, pendentes }
  }, [lancamentos])

  const porDia = useMemo(() => range.dias.map(d => {
    const iso = toISO(d)
    const items = lancamentos.filter(l => l.data === iso)
    const entradas = items.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
    const saidas = items.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)
    return { iso, dia: `${DIAS_SEMANA[d.getDay()]} ${ddmm(d)}`, entradas, saidas, saldo: entradas - saidas, count: items.length }
  }), [range, lancamentos])

  const porCategoria = useMemo(() => {
    const group = (tipo: Lancamento['tipo']) => {
      const acc: Record<string, { nome: string; total: number; count: number }> = {}
      for (const l of lancamentos) {
        if (l.tipo !== tipo) continue
        const nome = store.categorias?.find(c => c.id === l.categoriaId)?.nome || 'Sem categoria'
        if (!acc[nome]) acc[nome] = { nome, total: 0, count: 0 }
        acc[nome].total += l.valor
        acc[nome].count++
      }
      return Object.values(acc).sort((a, b) => b.total - a.total)
    }
    return { entradas: group('entrada'), saidas: group('saida') }
  }, [lancamentos, store.categorias])

  const catNome = (id: string) => store.categorias?.find(c => c.id === id)?.nome || '—'
  const contaNome = (id: string) => store.contasBancarias?.find(c => c.id === id)?.nome || '—'

  const navigate = (dir: number) => setRefDate(d => addDays(d, dir * (periodo === 'semanal' ? 7 : 1)))

  const exportCSV = () => {
    const rows = [['Data', 'Descrição', 'Categoria', 'Conta', 'Forma de Pagamento', 'Cliente/Fornecedor', 'Status', 'Tipo', 'Valor'],
      ...lancamentos.map(l => [formatDate(l.data), l.descricao, catNome(l.categoriaId), contaNome(l.contaBancariaId),
        l.formaPagamento || '', l.clienteFornecedor || '', l.status, l.tipo === 'entrada' ? 'Receita' : 'Saída', l.valor.toFixed(2)]),
      [],
      ['', '', '', '', '', '', '', 'Total Receitas', totais.entradas.toFixed(2)],
      ['', '', '', '', '', '', '', 'Total Saídas', totais.saidas.toFixed(2)],
      ['', '', '', '', '', '', '', 'Resultado', totais.resultado.toFixed(2)]]
    downloadCSV(rows, `receitas_saidas_${periodo}_${range.start}${periodo === 'semanal' ? '_a_' + range.end : ''}.csv`)
  }

  const handlePrint = () => {
    const empresa = store.company?.nome || 'Empresa'
    let html = `<h1>${range.titulo}</h1>
    <div class="meta">${empresa} &nbsp;|&nbsp; ${totais.count} lançamento(s)</div>
    <table><tbody>
      <tr><td>Total de Receitas</td><td class="right positive bold">${formatCurrency(totais.entradas)}</td></tr>
      <tr><td>Total de Saídas</td><td class="right negative bold">${formatCurrency(totais.saidas)}</td></tr>
      <tr class="${totais.resultado >= 0 ? 'result-row' : 'result-row-red'}"><td>Resultado do Período</td><td class="right">${formatCurrency(totais.resultado)}</td></tr>
    </tbody></table>`
    if (periodo === 'semanal') {
      html += `<h2>Resumo por Dia</h2><table>
        <thead><tr><th>Dia</th><th class="right">Receitas</th><th class="right">Saídas</th><th class="right">Saldo</th></tr></thead>
        <tbody>${porDia.map(d => `<tr><td>${d.dia}</td><td class="right positive">${formatCurrency(d.entradas)}</td><td class="right negative">${formatCurrency(d.saidas)}</td><td class="right bold ${d.saldo >= 0 ? 'positive' : 'negative'}">${formatCurrency(d.saldo)}</td></tr>`).join('')}
        <tr class="total-row"><td>TOTAL</td><td class="right">${formatCurrency(totais.entradas)}</td><td class="right">${formatCurrency(totais.saidas)}</td><td class="right">${formatCurrency(totais.resultado)}</td></tr>
        </tbody></table>`
    }
    html += `<h2>Lançamentos</h2><table>
      <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th class="right">Receitas</th><th class="right">Saídas</th></tr></thead>
      <tbody>${lancamentos.map(l => `<tr><td>${formatDate(l.data)}</td><td>${l.descricao}${l.status === 'pendente' ? ' (pendente)' : ''}</td><td>${catNome(l.categoriaId)}</td><td>${contaNome(l.contaBancariaId)}</td>
        <td class="right positive">${l.tipo === 'entrada' ? formatCurrency(l.valor) : '—'}</td><td class="right negative">${l.tipo === 'saida' ? formatCurrency(l.valor) : '—'}</td></tr>`).join('') || '<tr><td colspan="6">Nenhum lançamento no período.</td></tr>'}
      </tbody></table>`
    openPrintWindow(range.titulo, html)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold mb-2 text-slate-700 dark:text-slate-300">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }}></div>
            <span className="text-slate-500">{p.name}:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  const CategoriaCard = ({ titulo, items, total, cor }: { titulo: string; items: { nome: string; total: number; count: number }[]; total: number; cor: 'emerald' | 'red' }) => (
    <div className="card overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{titulo}</h3>
        <span className={cn('text-sm font-bold', cor === 'emerald' ? 'text-emerald-600' : 'text-red-600')}>{formatCurrency(total)}</span>
      </div>
      <div className="p-5 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Nenhum lançamento no período.</p>
        ) : items.map(c => (
          <div key={c.nome}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-700 dark:text-slate-300 truncate pr-2">{c.nome} <span className="text-xs text-slate-400">({c.count})</span></span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{formatCurrency(c.total)}</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full', cor === 'emerald' ? 'bg-emerald-500' : 'bg-red-500')} style={{ width: `${total > 0 ? (c.total / total) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Controles */}
        <div className="card p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
              {(['diario', 'semanal'] as Periodo[]).map(p => (
                <button key={p} onClick={() => setPeriodo(p)}
                  className={cn('px-4 py-1.5 text-sm font-medium transition-colors', periodo === p ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700')}>
                  {p === 'diario' ? 'Diário' : 'Semanal'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><ChevronLeft size={16} /></button>
              <span className="font-semibold text-slate-900 dark:text-slate-100 min-w-[170px] text-center">{range.label}</span>
              <button onClick={() => navigate(1)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><ChevronRight size={16} /></button>
              <button onClick={() => setRefDate(new Date())} className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">
                Hoje
              </button>
              {periodo === 'diario' && (
                <input type="date" value={toISO(refDate)}
                  onChange={e => { if (e.target.value) { const [y, m, d] = e.target.value.split('-').map(Number); setRefDate(new Date(y, m - 1, d)) } }}
                  className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300" />
              )}
            </div>

            <div className="flex items-center gap-2 lg:ml-auto">
              <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm"><Download size={15} /> Exportar CSV</button>
              <button onClick={handlePrint} className="btn-primary flex items-center gap-2 text-sm"><Printer size={15} /> Imprimir</button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><TrendingUp size={16} className="text-emerald-600" /></div>
              <p className="text-sm text-slate-500">Receitas {periodo === 'diario' ? 'do Dia' : 'da Semana'}</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totais.entradas)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><TrendingDown size={16} className="text-red-600" /></div>
              <p className="text-sm text-slate-500">Saídas {periodo === 'diario' ? 'do Dia' : 'da Semana'}</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totais.saidas)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', totais.resultado >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20')}>
                <Wallet size={16} className={totais.resultado >= 0 ? 'text-blue-600' : 'text-red-600'} />
              </div>
              <p className="text-sm text-slate-500">Resultado</p>
            </div>
            <p className={cn('text-2xl font-bold', totais.resultado >= 0 ? 'text-blue-600' : 'text-red-600')}>
              {totais.resultado >= 0 ? '+' : ''}{formatCurrency(totais.resultado)}
            </p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><FileText size={16} className="text-slate-600 dark:text-slate-300" /></div>
              <p className="text-sm text-slate-500">Lançamentos</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totais.count}</p>
            {totais.pendentes > 0 && <p className="text-xs text-amber-600 mt-0.5">{totais.pendentes} pendente(s)</p>}
          </div>
        </div>

        {/* Semanal: gráfico e resumo por dia */}
        {periodo === 'semanal' && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
            <div className="card p-5 xl:col-span-3">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Receitas x Saídas por Dia</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={porDia} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyShort(v)} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="#e2e8f0" strokeWidth={1} />
                  <Bar dataKey="entradas" name="Receitas" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card overflow-hidden xl:col-span-2">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Resumo por Dia</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="table-header">Dia</th>
                      <th className="table-header text-right">Receitas</th>
                      <th className="table-header text-right">Saídas</th>
                      <th className="table-header text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {porDia.map(d => (
                      <tr key={d.iso} onClick={() => { const [y, m, dd] = d.iso.split('-').map(Number); setRefDate(new Date(y, m - 1, dd)); setPeriodo('diario') }}
                        className={cn('table-row cursor-pointer', d.iso === toISO(new Date()) && 'bg-blue-50/60 dark:bg-blue-900/10')}
                        title="Ver relatório diário">
                        <td className="table-cell font-medium whitespace-nowrap">{d.dia}</td>
                        <td className="table-cell text-right text-emerald-600 font-semibold">{d.entradas ? formatCurrency(d.entradas) : '—'}</td>
                        <td className="table-cell text-right text-red-600 font-semibold">{d.saidas ? formatCurrency(d.saidas) : '—'}</td>
                        <td className={cn('table-cell text-right font-bold', d.saldo >= 0 ? 'text-blue-600' : 'text-red-600')}>{d.count ? formatCurrency(d.saldo) : '—'}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-800">
                      <td className="table-cell font-bold text-blue-800 dark:text-blue-300">TOTAL</td>
                      <td className="table-cell text-right font-bold text-emerald-600">{formatCurrency(totais.entradas)}</td>
                      <td className="table-cell text-right font-bold text-red-600">{formatCurrency(totais.saidas)}</td>
                      <td className="table-cell text-right font-bold text-blue-700">{formatCurrency(totais.resultado)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Por categoria */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CategoriaCard titulo="Receitas por Categoria" items={porCategoria.entradas} total={totais.entradas} cor="emerald" />
          <CategoriaCard titulo="Saídas por Categoria" items={porCategoria.saidas} total={totais.saidas} cor="red" />
        </div>

        {/* Lançamentos */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Lançamentos — {range.label}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="table-header">Data</th>
                  <th className="table-header">Descrição</th>
                  <th className="table-header">Categoria</th>
                  <th className="table-header">Conta</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Receitas</th>
                  <th className="table-header text-right">Saídas</th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.length === 0 ? (
                  <tr><td colSpan={7} className="table-cell text-center text-slate-400 py-10">Nenhum lançamento {periodo === 'diario' ? 'neste dia' : 'nesta semana'}.</td></tr>
                ) : lancamentos.map(l => (
                  <tr key={l.id} className="table-row">
                    <td className="table-cell text-slate-500 text-xs whitespace-nowrap">{formatDate(l.data)}</td>
                    <td className="table-cell text-sm">
                      {l.descricao}
                      {l.clienteFornecedor && <span className="block text-xs text-slate-400">{l.clienteFornecedor}</span>}
                    </td>
                    <td className="table-cell text-xs text-slate-500">{catNome(l.categoriaId)}</td>
                    <td className="table-cell text-xs text-slate-500 truncate max-w-[120px]">{contaNome(l.contaBancariaId)}</td>
                    <td className="table-cell">
                      <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded capitalize', statusStyle[l.status] || 'bg-slate-100 text-slate-600')}>{l.status}</span>
                    </td>
                    <td className="table-cell text-right font-semibold text-emerald-600">{l.tipo === 'entrada' ? formatCurrency(l.valor) : '—'}</td>
                    <td className="table-cell text-right font-semibold text-red-600">{l.tipo === 'saida' ? formatCurrency(l.valor) : '—'}</td>
                  </tr>
                ))}
                {lancamentos.length > 0 && (
                  <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-800">
                    <td colSpan={5} className="table-cell font-bold text-blue-800 dark:text-blue-300">
                      TOTAL <span className={cn('ml-2 font-bold', totais.resultado >= 0 ? 'text-blue-700' : 'text-red-600')}>(resultado {formatCurrency(totais.resultado)})</span>
                    </td>
                    <td className="table-cell text-right font-bold text-emerald-600">{formatCurrency(totais.entradas)}</td>
                    <td className="table-cell text-right font-bold text-red-600">{formatCurrency(totais.saidas)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
