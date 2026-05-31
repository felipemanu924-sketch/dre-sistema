'use client'
import AppLayout from '@/components/layout/AppLayout'
import { useData } from '@/context/DataContext'
import { useState, useMemo } from 'react'
import { formatCurrency, formatCurrencyShort, formatPercent, getFullMonthName, getMonthName, downloadCSV } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { FileText, Download, Printer, BarChart3, PieChart, TrendingUp, Filter, Table2 } from 'lucide-react'
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const REPORT_TYPES = [
  { id: 'dre', label: 'DRE Gerencial', icon: <BarChart3 size={18} />, desc: 'Demonstração do Resultado por período' },
  { id: 'receitas', label: 'Relatório de Receitas', icon: <TrendingUp size={18} />, desc: 'Análise detalhada de receitas por categoria' },
  { id: 'despesas', label: 'Relatório de Despesas', icon: <TrendingUp size={18} />, desc: 'Análise de despesas por categoria e centro de custo' },
  { id: 'categorias', label: 'Por Categorias', icon: <PieChart size={18} />, desc: 'Distribuição por plano de contas' },
  { id: 'centros', label: 'Centros de Custo', icon: <Table2 size={18} />, desc: 'Análise por centro de custo' },
  { id: 'contas', label: 'Contas Bancárias', icon: <FileText size={18} />, desc: 'Posição e movimentação das contas' },
]

const MONTH_REV = [150000, 142000, 168000, 175000, 182000, 195000, 188000, 201000, 215000, 228000, 235000, 248000]

export default function RelatoriosPage() {
  const { store } = useData()
  const today = new Date()
  const [selectedReport, setSelectedReport] = useState('dre')
  const [startDate, setStartDate] = useState(`${today.getFullYear()}-01`)
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 7))

  const maxMonth = today.getMonth() + 1

  const dreData = useMemo(() => {
    return Array.from({ length: maxMonth }, (_, i) => {
      const m = i + 1
      const rev = MONTH_REV[m - 1]
      return {
        mes: getMonthName(m),
        receitaBruta: rev,
        lucroLiquido: rev * 0.1265,
        custosDespesas: rev * 0.32 + rev * 0.30,
        margem: parseFloat(((rev * 0.1265 / rev) * 100).toFixed(1)),
      }
    })
  }, [maxMonth])

  const catData = useMemo(() => {
    const counts: Record<string, { nome: string; total: number; tipo: string }> = {}
    for (const l of store.lancamentos || []) {
      if (l.status === 'cancelado') continue
      const cat = store.categorias?.find(c => c.id === l.categoriaId)
      if (!cat) continue
      if (!counts[cat.id]) counts[cat.id] = { nome: cat.nome, total: 0, tipo: cat.tipo }
      counts[cat.id].total += l.valor
    }
    return Object.values(counts).sort((a, b) => b.total - a.total)
  }, [store])

  const ccData = useMemo(() => {
    const counts: Record<string, { nome: string; entradas: number; saidas: number }> = {}
    for (const cc of store.centrosCusto || []) {
      counts[cc.id] = { nome: cc.nome, entradas: 0, saidas: 0 }
    }
    for (const l of store.lancamentos || []) {
      if (l.status === 'cancelado' || !l.centroCustoId) continue
      if (!counts[l.centroCustoId]) counts[l.centroCustoId] = { nome: l.centroCustoId, entradas: 0, saidas: 0 }
      if (l.tipo === 'entrada') counts[l.centroCustoId].entradas += l.valor
      else counts[l.centroCustoId].saidas += l.valor
    }
    return Object.values(counts).filter(c => c.entradas + c.saidas > 0)
  }, [store])

  const contasData = useMemo(() => {
    return (store.contasBancarias || []).filter(c => c.ativo).map(c => {
      const lanc = (store.lancamentos || []).filter(l => l.contaBancariaId === c.id && l.status !== 'cancelado')
      const entradas = lanc.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
      const saidas = lanc.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)
      return { ...c, entradas, saidas, saldoAtual: c.saldoInicial + entradas - saidas }
    })
  }, [store])

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

  const exportReport = () => {
    if (selectedReport === 'dre') {
      const rows = [['Mês', 'Receita Bruta', 'Lucro Líquido', 'Custos+Despesas', 'Margem %'],
        ...dreData.map(d => [d.mes, d.receitaBruta.toFixed(2), d.lucroLiquido.toFixed(2), d.custosDespesas.toFixed(2), d.margem.toString()])]
      downloadCSV(rows, `dre_${today.getFullYear()}.csv`)
    } else if (selectedReport === 'categorias') {
      const rows = [['Categoria', 'Tipo', 'Total'],
        ...catData.map(c => [c.nome, c.tipo, c.total.toFixed(2)])]
      downloadCSV(rows, `categorias_${today.getFullYear()}.csv`)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Report selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TYPES.map(rt => (
            <button
              key={rt.id}
              onClick={() => setSelectedReport(rt.id)}
              className={cn(
                'text-left p-4 rounded-xl border-2 transition-all',
                selectedReport === rt.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-700'
              )}
            >
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2',
                selectedReport === rt.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500')}>
                {rt.icon}
              </div>
              <p className={cn('text-sm font-semibold', selectedReport === rt.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300')}>{rt.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{rt.desc}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div>
              <label className="label">Período Inicial</label>
              <input type="month" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Período Final</label>
              <input type="month" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="flex gap-2 ml-auto">
              <button onClick={exportReport} className="btn-secondary">
                <Download size={14} /> Exportar CSV
              </button>
              <button onClick={() => window.print()} className="btn-secondary">
                <Printer size={14} /> Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Report content */}
        {selectedReport === 'dre' && (
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">DRE Gerencial — Evolução Mensal {today.getFullYear()}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dreData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyShort(v)} width={70} />
                  <Tooltip formatter={(v: number, n: string) => n === 'Margem %' ? [`${v}%`, n] : [formatCurrency(v), n]} />
                  <Legend />
                  <Bar dataKey="receitaBruta" name="Receita Bruta" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="lucroLiquido" name="Lucro Líquido" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="custosDespesas" name="Custos+Despesas" fill="#f97316" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Dados Mensais</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="table-header">Mês</th>
                    <th className="table-header text-right">Receita Bruta</th>
                    <th className="table-header text-right">Custos+Desp.</th>
                    <th className="table-header text-right">Lucro Líquido</th>
                    <th className="table-header text-right">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {dreData.map((d, i) => (
                    <tr key={i} className="table-row">
                      <td className="table-cell font-medium">{d.mes}/{today.getFullYear()}</td>
                      <td className="table-cell text-right text-blue-600 font-semibold">{formatCurrency(d.receitaBruta)}</td>
                      <td className="table-cell text-right text-red-600">{formatCurrency(d.custosDespesas)}</td>
                      <td className={cn('table-cell text-right font-bold', d.lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600')}>{formatCurrency(d.lucroLiquido)}</td>
                      <td className="table-cell text-right text-purple-600 font-semibold">{d.margem}%</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200">
                    <td className="table-cell font-bold text-blue-800 dark:text-blue-300">TOTAL</td>
                    <td className="table-cell text-right font-bold text-blue-700">{formatCurrency(dreData.reduce((s, d) => s + d.receitaBruta, 0))}</td>
                    <td className="table-cell text-right font-bold text-red-600">{formatCurrency(dreData.reduce((s, d) => s + d.custosDespesas, 0))}</td>
                    <td className="table-cell text-right font-bold text-emerald-600">{formatCurrency(dreData.reduce((s, d) => s + d.lucroLiquido, 0))}</td>
                    <td className="table-cell text-right font-bold text-purple-600">
                      {formatPercent(dreData.reduce((s, d) => s + d.lucroLiquido, 0) / dreData.reduce((s, d) => s + d.receitaBruta, 0) * 100)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'categorias' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Distribuição por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie data={catData.slice(0, 8)} cx="50%" cy="50%" outerRadius={110} dataKey="total" label={({ nome, percent }) => `${nome?.slice(0, 12)}... ${(percent * 100).toFixed(0)}%`}>
                    {catData.slice(0, 8).map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Total']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="card overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Totais por Categoria</h3>
              </div>
              <div className="overflow-y-auto max-h-[350px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white dark:bg-slate-800">
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="table-header">Categoria</th>
                      <th className="table-header text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catData.map((c, i) => (
                      <tr key={i} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }}></div>
                            <span className="text-sm truncate max-w-[160px]">{c.nome}</span>
                          </div>
                        </td>
                        <td className="table-cell text-right font-semibold">{formatCurrencyShort(c.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'centros' && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Relatório por Centro de Custo</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="table-header">Centro de Custo</th>
                  <th className="table-header text-right">Entradas</th>
                  <th className="table-header text-right">Saídas</th>
                  <th className="table-header text-right">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {ccData.map((cc, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell font-medium">{cc.nome}</td>
                    <td className="table-cell text-right text-emerald-600 font-semibold">{formatCurrency(cc.entradas)}</td>
                    <td className="table-cell text-right text-red-600 font-semibold">{formatCurrency(cc.saidas)}</td>
                    <td className={cn('table-cell text-right font-bold', cc.entradas - cc.saidas >= 0 ? 'text-blue-600' : 'text-red-600')}>
                      {formatCurrency(cc.entradas - cc.saidas)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'contas' && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Posição das Contas Bancárias</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="table-header">Conta</th>
                  <th className="table-header">Banco</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header text-right">Saldo Inicial</th>
                  <th className="table-header text-right">Entradas</th>
                  <th className="table-header text-right">Saídas</th>
                  <th className="table-header text-right">Saldo Atual</th>
                </tr>
              </thead>
              <tbody>
                {contasData.map((c, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell font-medium">{c.nome}</td>
                    <td className="table-cell text-slate-500">{c.banco}</td>
                    <td className="table-cell"><span className="badge-blue">{c.tipo}</span></td>
                    <td className="table-cell text-right">{formatCurrency(c.saldoInicial)}</td>
                    <td className="table-cell text-right text-emerald-600">{formatCurrency(c.entradas)}</td>
                    <td className="table-cell text-right text-red-600">{formatCurrency(c.saidas)}</td>
                    <td className={cn('table-cell text-right font-bold', c.saldoAtual >= 0 ? 'text-blue-600' : 'text-red-600')}>{formatCurrency(c.saldoAtual)}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200">
                  <td className="table-cell font-bold text-blue-800 dark:text-blue-300" colSpan={3}>CONSOLIDADO</td>
                  <td className="table-cell text-right font-bold">{formatCurrency(contasData.reduce((s, c) => s + c.saldoInicial, 0))}</td>
                  <td className="table-cell text-right font-bold text-emerald-600">{formatCurrency(contasData.reduce((s, c) => s + c.entradas, 0))}</td>
                  <td className="table-cell text-right font-bold text-red-600">{formatCurrency(contasData.reduce((s, c) => s + c.saidas, 0))}</td>
                  <td className="table-cell text-right font-bold text-blue-700">{formatCurrency(contasData.reduce((s, c) => s + c.saldoAtual, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {(selectedReport === 'receitas' || selectedReport === 'despesas') && (
          <div className="space-y-5">
            {(() => {
              const filteredCats = catData.filter(c => selectedReport === 'receitas' ? c.tipo === 'receita' : ['custo', 'despesa_admin', 'despesa_comercial', 'despesa_financeira', 'imposto'].includes(c.tipo))
              const total = filteredCats.reduce((s, c) => s + c.total, 0)
              return (
                <>
                  <div className="card p-5">
                    <h3 className="font-semibold mb-4">{selectedReport === 'receitas' ? 'Receitas por Categoria' : 'Despesas por Categoria'}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={filteredCats} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => formatCurrencyShort(v)} />
                        <YAxis type="category" dataKey="nome" tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} />
                        <Tooltip formatter={(v: number) => [formatCurrency(v), 'Total']} />
                        <Bar dataKey="total" fill={selectedReport === 'receitas' ? '#10b981' : '#ef4444'} radius={[0, 3, 3, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="card overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                          <th className="table-header">Categoria</th>
                          <th className="table-header text-right">Total</th>
                          <th className="table-header text-right">% do Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCats.map((c, i) => (
                          <tr key={i} className="table-row">
                            <td className="table-cell font-medium">{c.nome}</td>
                            <td className="table-cell text-right font-semibold">{formatCurrency(c.total)}</td>
                            <td className="table-cell text-right text-slate-500">{formatPercent((c.total / total) * 100)}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200">
                          <td className="table-cell font-bold">TOTAL</td>
                          <td className="table-cell text-right font-bold">{formatCurrency(total)}</td>
                          <td className="table-cell text-right font-bold">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
