'use client'
import AppLayout from '@/components/layout/AppLayout'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { useState, useMemo, useCallback } from 'react'
import { Lancamento, TipoLancamento, StatusLancamento } from '@/types'
import { formatCurrency, formatDate, generateId, downloadCSV } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Plus, Search, Filter, Download, Upload, Edit2, Trash2, X,
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown, CheckCircle2,
  Clock, AlertCircle, Save, ChevronDown
} from 'lucide-react'

const ITEMS_PER_PAGE = 15

export default function LancamentosPage() {
  const { store, addLancamento, updateLancamento, deleteLancamento } = useData()
  const { user, hasPermission } = useAuth()
  const canEdit = hasPermission(['admin', 'financeiro'])

  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState<'' | TipoLancamento>('')
  const [filterStatus, setFilterStatus] = useState<'' | StatusLancamento>('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [filterCompetencia, setFilterCompetencia] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const [form, setForm] = useState<Partial<Lancamento>>({
    data: new Date().toISOString().split('T')[0],
    competencia: new Date().toISOString().slice(0, 7),
    tipo: 'saida',
    status: 'confirmado',
    valor: 0,
    descricao: '',
    categoriaId: '',
    centroCustoId: store.centrosCusto?.[0]?.id || '',
    contaBancariaId: store.contasBancarias?.[0]?.id || '',
    formaPagamento: 'fp-pix',
  })

  const filtered = useMemo(() => {
    let result = store.lancamentos || []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.descricao.toLowerCase().includes(q) ||
        l.clienteFornecedor?.toLowerCase().includes(q)
      )
    }
    if (filterTipo) result = result.filter(l => l.tipo === filterTipo)
    if (filterStatus) result = result.filter(l => l.status === filterStatus)
    if (filterCategoria) result = result.filter(l => l.categoriaId === filterCategoria)
    if (filterCompetencia) result = result.filter(l => l.competencia === filterCompetencia)
    return [...result].sort((a, b) => b.data.localeCompare(a.data))
  }, [store.lancamentos, search, filterTipo, filterStatus, filterCategoria, filterCompetencia])

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  const totals = useMemo(() => {
    const entradas = filtered.filter(l => l.tipo === 'entrada' && l.status !== 'cancelado').reduce((s, l) => s + l.valor, 0)
    const saidas = filtered.filter(l => l.tipo === 'saida' && l.status !== 'cancelado').reduce((s, l) => s + l.valor, 0)
    return { entradas, saidas, saldo: entradas - saidas }
  }, [filtered])

  const openNew = () => {
    setForm({
      data: new Date().toISOString().split('T')[0],
      competencia: new Date().toISOString().slice(0, 7),
      tipo: 'saida', status: 'confirmado', valor: 0, descricao: '',
      categoriaId: store.categorias?.[0]?.id || '',
      centroCustoId: store.centrosCusto?.[0]?.id || '',
      contaBancariaId: store.contasBancarias?.[0]?.id || '',
      formaPagamento: 'fp-pix',
    })
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (l: Lancamento) => {
    setForm({ ...l })
    setEditingId(l.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.descricao || !form.valor || !form.categoriaId) return
    if (editingId) {
      updateLancamento(editingId, form as Partial<Lancamento>)
    } else {
      addLancamento({
        ...form as Omit<Lancamento, 'id' | 'createdAt' | 'updatedAt'>,
        userId: user?.id || '',
      })
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    deleteLancamento(id)
    setDeleteConfirm(null)
  }

  const exportCSV = () => {
    const headers = ['Data', 'Competência', 'Descrição', 'Tipo', 'Valor', 'Status', 'Categoria']
    const rows = filtered.map(l => [
      l.data, l.competencia, l.descricao, l.tipo,
      l.valor.toFixed(2), l.status,
      store.categorias?.find(c => c.id === l.categoriaId)?.nome || '',
    ])
    downloadCSV([headers, ...rows], `lancamentos_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const statusIcon = (s: string) => {
    if (s === 'confirmado') return <CheckCircle2 size={14} className="text-emerald-500" />
    if (s === 'pendente') return <Clock size={14} className="text-amber-500" />
    return <AlertCircle size={14} className="text-red-500" />
  }

  const subcategorias = useMemo(() => {
    const cat = store.categorias?.find(c => c.id === form.categoriaId)
    return cat?.subcategorias || []
  }, [store.categorias, form.categoriaId])

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total de Entradas</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(totals.entradas)}</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 flex-shrink-0">
              <TrendingDown size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total de Saídas</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totals.saidas)}</p>
            </div>
          </div>
          <div className={cn('card p-4 flex items-center gap-4')}>
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', totals.saldo >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600')}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Saldo</p>
              <p className={cn('text-xl font-bold', totals.saldo >= 0 ? 'text-blue-600' : 'text-red-600')}>{formatCurrency(totals.saldo)}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input-field pl-9"
                placeholder="Buscar por descrição, cliente/fornecedor..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setShowFilters(!showFilters)} className={cn('btn-secondary', showFilters && 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400')}>
                <Filter size={14} /> Filtros
                {(filterTipo || filterStatus || filterCategoria || filterCompetencia) && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full ml-0.5"></span>
                )}
              </button>
              <button onClick={exportCSV} className="btn-secondary">
                <Download size={14} /> Exportar
              </button>
              {canEdit && (
                <button onClick={openNew} className="btn-primary">
                  <Plus size={14} /> Novo Lançamento
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="label">Tipo</label>
                <select className="input-field" value={filterTipo} onChange={e => { setFilterTipo(e.target.value as any); setPage(1) }}>
                  <option value="">Todos</option>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input-field" value={filterStatus} onChange={e => { setFilterStatus(e.target.value as any); setPage(1) }}>
                  <option value="">Todos</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="pendente">Pendente</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="label">Categoria</label>
                <select className="input-field" value={filterCategoria} onChange={e => { setFilterCategoria(e.target.value); setPage(1) }}>
                  <option value="">Todas</option>
                  {store.categorias?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Competência</label>
                <input type="month" className="input-field" value={filterCompetencia} onChange={e => { setFilterCompetencia(e.target.value); setPage(1) }} />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{filtered.length}</span> lançamentos encontrados
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="table-header">Data</th>
                  <th className="table-header">Descrição</th>
                  <th className="table-header hidden lg:table-cell">Categoria</th>
                  <th className="table-header hidden md:table-cell">C. Custo</th>
                  <th className="table-header hidden md:table-cell">Forma Pag.</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header text-right">Valor</th>
                  <th className="table-header">Status</th>
                  {canEdit && <th className="table-header text-center">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {paginated.map(l => {
                  const cat = store.categorias?.find(c => c.id === l.categoriaId)
                  const cc = store.centrosCusto?.find(c => c.id === l.centroCustoId)
                  const fp = store.formasPagamento?.find(f => f.id === l.formaPagamento)
                  return (
                    <tr key={l.id} className="table-row">
                      <td className="table-cell text-slate-500 text-xs whitespace-nowrap">{l.data.split('-').reverse().join('/')}</td>
                      <td className="table-cell max-w-[180px]">
                        <div className="truncate font-medium text-slate-800 dark:text-slate-200">{l.descricao}</div>
                        {l.clienteFornecedor && <div className="text-xs text-slate-400 truncate">{l.clienteFornecedor}</div>}
                      </td>
                      <td className="table-cell hidden lg:table-cell text-xs text-slate-500">{cat?.nome}</td>
                      <td className="table-cell hidden md:table-cell text-xs text-slate-500">{cc?.nome}</td>
                      <td className="table-cell hidden md:table-cell text-xs text-slate-500">{fp?.nome}</td>
                      <td className="table-cell">
                        <span className={cn('text-xs font-semibold inline-flex items-center gap-1', l.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-500')}>
                          {l.tipo === 'entrada' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {l.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className={cn('table-cell text-right font-semibold', l.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-500')}>
                        {formatCurrency(l.valor)}
                      </td>
                      <td className="table-cell">
                        <span className={cn(l.status === 'confirmado' ? 'badge-green' : l.status === 'pendente' ? 'badge-amber' : 'badge-red', 'inline-flex items-center gap-1')}>
                          {statusIcon(l.status)}
                          {l.status === 'confirmado' ? 'Conf.' : l.status === 'pendente' ? 'Pend.' : 'Canc.'}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="table-cell text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openEdit(l)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => setDeleteConfirm(l.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      <Search size={32} className="mx-auto mb-2 opacity-30" />
                      <p>Nenhum lançamento encontrado</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500">
                Exibindo {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-400">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page + i - 2
                  if (p < 1 || p > totalPages) return null
                  return (
                    <button key={p} onClick={() => setPage(p)} className={cn('w-7 h-7 rounded text-xs font-medium', p === page ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400')}>
                      {p}
                    </button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-400">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Tipo toggle */}
              <div>
                <label className="label">Tipo de Lançamento</label>
                <div className="flex gap-3">
                  {(['entrada', 'saida'] as TipoLancamento[]).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, tipo: t }))}
                      className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all', form.tipo === t ? (t === 'entrada' ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-red-50 border-red-400 text-red-700') : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300')}>
                      {t === 'entrada' ? '▲ Entrada / Receita' : '▼ Saída / Despesa'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Data</label>
                  <input type="date" className="input-field" value={form.data || ''} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Competência</label>
                  <input type="month" className="input-field" value={form.competencia || ''} onChange={e => setForm(f => ({ ...f, competencia: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="label">Descrição *</label>
                <input className="input-field" placeholder="Descreva o lançamento..." value={form.descricao || ''} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Categoria *</label>
                  <select className="input-field" value={form.categoriaId || ''} onChange={e => setForm(f => ({ ...f, categoriaId: e.target.value, subcategoriaId: '' }))}>
                    <option value="">Selecione...</option>
                    {store.categorias?.filter(c => c.ativo).map(c => <option key={c.id} value={c.id}>{c.codigo} — {c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Subcategoria</label>
                  <select className="input-field" value={form.subcategoriaId || ''} onChange={e => setForm(f => ({ ...f, subcategoriaId: e.target.value }))} disabled={!subcategorias.length}>
                    <option value="">Selecione...</option>
                    {subcategorias.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Valor *</label>
                  <input type="number" className="input-field" placeholder="0,00" min="0" step="0.01" value={form.valor || ''} onChange={e => setForm(f => ({ ...f, valor: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={form.status || 'confirmado'} onChange={e => setForm(f => ({ ...f, status: e.target.value as StatusLancamento }))}>
                    <option value="confirmado">Confirmado</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Centro de Custo</label>
                  <select className="input-field" value={form.centroCustoId || ''} onChange={e => setForm(f => ({ ...f, centroCustoId: e.target.value }))}>
                    <option value="">Selecione...</option>
                    {store.centrosCusto?.filter(c => c.ativo).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Conta Bancária</label>
                  <select className="input-field" value={form.contaBancariaId || ''} onChange={e => setForm(f => ({ ...f, contaBancariaId: e.target.value }))}>
                    <option value="">Selecione...</option>
                    {store.contasBancarias?.filter(c => c.ativo).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Forma de Pagamento</label>
                  <select className="input-field" value={form.formaPagamento || ''} onChange={e => setForm(f => ({ ...f, formaPagamento: e.target.value }))}>
                    <option value="">Selecione...</option>
                    {store.formasPagamento?.filter(f => f.ativo).map(fp => <option key={fp.id} value={fp.id}>{fp.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Cliente / Fornecedor</label>
                  <input className="input-field" placeholder="Nome..." value={form.clienteFornecedor || ''} onChange={e => setForm(f => ({ ...f, clienteFornecedor: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="label">Observações</label>
                <textarea className="input-field resize-none" rows={2} placeholder="Informações adicionais..." value={form.observacoes || ''} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
              <button onClick={handleSave} className="btn-primary">
                <Save size={14} /> {editingId ? 'Salvar Alterações' : 'Criar Lançamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Excluir Lançamento</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Esta ação não pode ser desfeita. Deseja continuar?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1 justify-center">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
