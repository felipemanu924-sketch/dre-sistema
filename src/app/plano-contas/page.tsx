'use client'
import AppLayout from '@/components/layout/AppLayout'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { useState, useMemo } from 'react'
import { Categoria, Subcategoria, TipoCategoria } from '@/types'
import { cn } from '@/lib/utils'
import { generateId } from '@/lib/utils'
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, X, Save, ToggleLeft, ToggleRight } from 'lucide-react'

const TIPO_LABELS: Record<TipoCategoria, string> = {
  receita: 'Receita',
  deducao: 'Dedução',
  custo: 'Custo',
  despesa_admin: 'Desp. Administrativa',
  despesa_comercial: 'Desp. Comercial',
  despesa_financeira: 'Desp. Financeira',
  imposto: 'Imposto',
}

const TIPO_COLORS: Record<TipoCategoria, string> = {
  receita: 'badge-green',
  deducao: 'badge-red',
  custo: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
  despesa_admin: 'badge-blue',
  despesa_comercial: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
  despesa_financeira: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
  imposto: 'badge-amber',
}

const GRUPOS: { tipo: TipoCategoria; label: string; desc: string }[] = [
  { tipo: 'receita', label: '1. RECEITAS', desc: 'Receitas operacionais e não operacionais' },
  { tipo: 'deducao', label: '2. DEDUÇÕES DA RECEITA', desc: 'Devoluções, descontos e abatimentos' },
  { tipo: 'custo', label: '3. CUSTOS', desc: 'Custos das mercadorias e serviços vendidos' },
  { tipo: 'despesa_admin', label: '4. DESPESAS ADMINISTRATIVAS', desc: 'Despesas gerais e administrativas' },
  { tipo: 'despesa_comercial', label: '5. DESPESAS COMERCIAIS', desc: 'Despesas com vendas e marketing' },
  { tipo: 'despesa_financeira', label: '6. RESULTADO FINANCEIRO', desc: 'Receitas e despesas financeiras' },
  { tipo: 'imposto', label: '7. IMPOSTOS', desc: 'Impostos sobre o resultado' },
]

export default function PlanoContasPage() {
  const { store, addCategoria, updateCategoria, deleteCategoria } = useData()
  const { hasPermission } = useAuth()
  const canEdit = hasPermission(['admin', 'financeiro'])

  const [expandedGroups, setExpandedGroups] = useState<TipoCategoria[]>(['receita', 'despesa_admin'])
  const [expandedCats, setExpandedCats] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showSubModal, setShowSubModal] = useState<string | null>(null)
  const [subForm, setSubForm] = useState<Partial<Subcategoria>>({})
  const [form, setForm] = useState<Partial<Categoria>>({
    tipo: 'despesa_admin',
    ativo: true,
    subcategorias: [],
    ordem: 0,
  })

  const toggleGroup = (tipo: TipoCategoria) => {
    setExpandedGroups(prev => prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo])
  }

  const toggleCat = (id: string) => {
    setExpandedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const catsByTipo = useMemo(() => {
    const grouped: Record<TipoCategoria, Categoria[]> = {} as any
    for (const g of GRUPOS) grouped[g.tipo] = []
    for (const c of store.categorias || []) {
      if (!grouped[c.tipo]) grouped[c.tipo] = []
      grouped[c.tipo].push(c)
    }
    for (const k of Object.keys(grouped) as TipoCategoria[]) {
      grouped[k] = grouped[k].sort((a, b) => a.ordem - b.ordem)
    }
    return grouped
  }, [store.categorias])

  const openNew = (tipo: TipoCategoria) => {
    setForm({ tipo, ativo: true, subcategorias: [], ordem: (catsByTipo[tipo]?.length + 1) * 10, nome: '', codigo: '' })
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (c: Categoria) => {
    setForm({ ...c })
    setEditingId(c.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.nome || !form.codigo) return
    if (editingId) {
      updateCategoria(editingId, form as Partial<Categoria>)
    } else {
      addCategoria({ ...form as Omit<Categoria, 'id'> })
    }
    setShowModal(false)
  }

  const handleToggleActive = (c: Categoria) => {
    updateCategoria(c.id, { ativo: !c.ativo })
  }

  const handleAddSub = (catId: string) => {
    if (!subForm.nome || !subForm.codigo) return
    const cat = store.categorias?.find(c => c.id === catId)
    if (!cat) return
    const newSub: Subcategoria = { id: generateId(), nome: subForm.nome, codigo: subForm.codigo, ativo: true }
    updateCategoria(catId, { subcategorias: [...(cat.subcategorias || []), newSub] })
    setSubForm({})
    setShowSubModal(null)
  }

  const handleDeleteSub = (catId: string, subId: string) => {
    const cat = store.categorias?.find(c => c.id === catId)
    if (!cat) return
    updateCategoria(catId, { subcategorias: cat.subcategorias.filter(s => s.id !== subId) })
  }

  return (
    <AppLayout>
      <div className="space-y-3">
        {GRUPOS.map(grupo => {
          const cats = catsByTipo[grupo.tipo] || []
          const isExpanded = expandedGroups.includes(grupo.tipo)
          return (
            <div key={grupo.tipo} className="card overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                onClick={() => toggleGroup(grupo.tipo)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{grupo.label}</p>
                    <p className="text-xs text-slate-500">{grupo.desc} — <span className="font-medium">{cats.length} categorias</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <span className={TIPO_COLORS[grupo.tipo]}>{TIPO_LABELS[grupo.tipo]}</span>
                  {canEdit && (
                    <button onClick={() => openNew(grupo.tipo)} className="btn-secondary text-xs py-1.5">
                      <Plus size={12} /> Adicionar
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-700">
                  {cats.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      Nenhuma categoria neste grupo
                    </div>
                  ) : (
                    cats.map(cat => {
                      const isCatExpanded = expandedCats.includes(cat.id)
                      return (
                        <div key={cat.id} className={cn('border-b border-slate-100 dark:border-slate-700 last:border-0', !cat.ativo && 'opacity-50')}>
                          <div
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/20 cursor-pointer"
                            onClick={() => toggleCat(cat.id)}
                          >
                            <button className="text-slate-400 hover:text-slate-600 ml-4">
                              {cat.subcategorias?.length > 0 ? (isCatExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <div className="w-3.5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-mono">{cat.codigo}</span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat.nome}</span>
                                {!cat.ativo && <span className="badge-red text-xs">Inativo</span>}
                              </div>
                              {cat.subcategorias?.length > 0 && (
                                <p className="text-xs text-slate-400 mt-0.5">{cat.subcategorias.length} subcategorias</p>
                              )}
                            </div>
                            {canEdit && (
                              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setShowSubModal(cat.id)} className="btn-ghost text-xs py-1 px-2">
                                  <Plus size={12} /> Sub
                                </button>
                                <button onClick={() => handleToggleActive(cat)} className={cn('p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors', cat.ativo ? 'text-emerald-500' : 'text-slate-400')}>
                                  {cat.ativo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                </button>
                                <button onClick={() => openEdit(cat)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-colors">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => deleteCategoria(cat.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>

                          {isCatExpanded && cat.subcategorias?.length > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-700/50">
                              {cat.subcategorias.map(sub => (
                                <div key={sub.id} className="flex items-center gap-3 px-4 py-2.5 pl-16 border-b border-slate-100 dark:border-slate-700/30 last:border-0">
                                  <span className="text-xs text-slate-400 font-mono w-12">{sub.codigo}</span>
                                  <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">{sub.nome}</span>
                                  {!sub.ativo && <span className="badge-red text-xs">Inativo</span>}
                                  {canEdit && (
                                    <button onClick={() => handleDeleteSub(cat.id, sub.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Código *</label>
                  <input className="input-field font-mono" placeholder="Ex: 4.4" value={form.codigo || ''} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Tipo</label>
                  <select className="input-field" value={form.tipo || ''} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoCategoria }))}>
                    {GRUPOS.map(g => <option key={g.tipo} value={g.tipo}>{TIPO_LABELS[g.tipo]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Nome *</label>
                <input className="input-field" placeholder="Nome da categoria..." value={form.nome || ''} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div>
                <label className="label">Descrição</label>
                <input className="input-field" placeholder="Descrição opcional..." value={form.descricao || ''} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="ativo" checked={form.ativo ?? true} onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                <label htmlFor="ativo" className="text-sm text-slate-700 dark:text-slate-300">Categoria ativa</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
              <button onClick={handleSave} className="btn-primary"><Save size={14} /> Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Nova Subcategoria</h2>
              <button onClick={() => setShowSubModal(null)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Código *</label>
                <input className="input-field font-mono" placeholder="Ex: 4.4.1" value={subForm.codigo || ''} onChange={e => setSubForm(f => ({ ...f, codigo: e.target.value }))} />
              </div>
              <div>
                <label className="label">Nome *</label>
                <input className="input-field" placeholder="Nome da subcategoria..." value={subForm.nome || ''} onChange={e => setSubForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setShowSubModal(null)} className="btn-secondary">Cancelar</button>
              <button onClick={() => handleAddSub(showSubModal)} className="btn-primary"><Plus size={14} /> Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
