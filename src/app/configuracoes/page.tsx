'use client'
import AppLayout from '@/components/layout/AppLayout'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { User, ContaBancaria, CentroCusto, TipoConta } from '@/types'
import { formatCurrency, roleLabel, generateId } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Building2, Users, CreditCard, MapPin, Plus, Edit2, Trash2, X, Save, ToggleRight, ToggleLeft, Wallet } from 'lucide-react'

const TABS = [
  { id: 'empresa', label: 'Empresa', icon: <Building2 size={16} /> },
  { id: 'usuarios', label: 'Usuários', icon: <Users size={16} /> },
  { id: 'contas', label: 'Contas Bancárias', icon: <Wallet size={16} /> },
  { id: 'centros', label: 'Centros de Custo', icon: <MapPin size={16} /> },
  { id: 'formas', label: 'Formas de Pagamento', icon: <CreditCard size={16} /> },
]

export default function ConfiguracoesPage() {
  const { store, updateCompany, addContaBancaria, updateContaBancaria, deleteContaBancaria, addCentroCusto, updateCentroCusto, deleteCentroCusto } = useData()
  const { user, hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState('empresa')
  const canEdit = hasPermission(['admin'])

  const [companyForm, setCompanyForm] = useState({ ...store.company })
  const [showContaModal, setShowContaModal] = useState(false)
  const [editingContaId, setEditingContaId] = useState<string | null>(null)
  const [contaForm, setContaForm] = useState<Partial<ContaBancaria>>({ tipo: 'corrente', saldoInicial: 0, ativo: true })
  const [showCCModal, setShowCCModal] = useState(false)
  const [editingCCId, setEditingCCId] = useState<string | null>(null)
  const [ccForm, setCCForm] = useState<Partial<CentroCusto>>({ ativo: true })

  const saveCompany = () => updateCompany(companyForm)

  const openNewConta = () => {
    setContaForm({ tipo: 'corrente', saldoInicial: 0, ativo: true, nome: '', banco: '' })
    setEditingContaId(null)
    setShowContaModal(true)
  }

  const openEditConta = (c: ContaBancaria) => {
    setContaForm({ ...c })
    setEditingContaId(c.id)
    setShowContaModal(true)
  }

  const saveConta = () => {
    if (!contaForm.nome || !contaForm.banco) return
    if (editingContaId) updateContaBancaria(editingContaId, contaForm as ContaBancaria)
    else addContaBancaria(contaForm as Omit<ContaBancaria, 'id'>)
    setShowContaModal(false)
  }

  const openNewCC = () => {
    setCCForm({ ativo: true, nome: '', codigo: '' })
    setEditingCCId(null)
    setShowCCModal(true)
  }

  const openEditCC = (c: CentroCusto) => {
    setCCForm({ ...c })
    setEditingCCId(c.id)
    setShowCCModal(true)
  }

  const saveCC = () => {
    if (!ccForm.nome || !ccForm.codigo) return
    if (editingCCId) updateCentroCusto(editingCCId, ccForm as CentroCusto)
    else addCentroCusto(ccForm as Omit<CentroCusto, 'id'>)
    setShowCCModal(false)
  }

  const roleColors: Record<string, string> = {
    admin: 'badge-amber',
    financeiro: 'badge-blue',
    gestor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
    visualizacao: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Tabs */}
        <div className="card p-1 flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Empresa */}
        {activeTab === 'empresa' && (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {store.company?.nome?.[0] || 'E'}
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100">{store.company?.nome}</h2>
                <p className="text-sm text-slate-500">{store.company?.cnpj}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Nome Fantasia', key: 'nome' },
                { label: 'Razão Social', key: 'razaoSocial' },
                { label: 'CNPJ', key: 'cnpj' },
                { label: 'Inscrição Estadual', key: 'inscricaoEstadual' },
                { label: 'Telefone', key: 'telefone' },
                { label: 'E-mail', key: 'email' },
                { label: 'Website', key: 'website' },
                { label: 'Endereço', key: 'endereco' },
                { label: 'Cidade', key: 'cidade' },
                { label: 'Estado', key: 'estado' },
                { label: 'CEP', key: 'cep' },
              ].map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input
                    className="input-field"
                    value={(companyForm as any)[f.key] || ''}
                    onChange={e => setCompanyForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                    disabled={!canEdit}
                  />
                </div>
              ))}
              <div>
                <label className="label">Regime Tributário</label>
                <select className="input-field" value={companyForm.regimeTributario || ''} onChange={e => setCompanyForm((p: any) => ({ ...p, regimeTributario: e.target.value }))} disabled={!canEdit}>
                  <option value="simples">Simples Nacional</option>
                  <option value="lucro_presumido">Lucro Presumido</option>
                  <option value="lucro_real">Lucro Real</option>
                </select>
              </div>
            </div>
            {canEdit && (
              <div className="flex justify-end mt-6">
                <button onClick={saveCompany} className="btn-primary"><Save size={14} /> Salvar Alterações</button>
              </div>
            )}
          </div>
        )}

        {/* Usuarios */}
        {activeTab === 'usuarios' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Usuários do Sistema</h3>
              {canEdit && <button className="btn-primary text-sm"><Plus size={14} /> Novo Usuário</button>}
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="table-header">Usuário</th>
                  <th className="table-header hidden md:table-cell">E-mail</th>
                  <th className="table-header">Perfil</th>
                  <th className="table-header">Status</th>
                  <th className="table-header hidden lg:table-cell">Último Acesso</th>
                </tr>
              </thead>
              <tbody>
                {store.users?.map(u => (
                  <tr key={u.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
                          u.role === 'admin' ? 'bg-amber-500' : u.role === 'financeiro' ? 'bg-blue-500' : u.role === 'gestor' ? 'bg-purple-500' : 'bg-slate-400')}>
                          {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{u.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-slate-500 hidden md:table-cell">{u.email}</td>
                    <td className="table-cell">
                      <span className={cn(roleColors[u.role])}>{roleLabel(u.role)}</span>
                    </td>
                    <td className="table-cell">
                      <span className={u.active ? 'badge-green' : 'badge-red'}>{u.active ? 'Ativo' : 'Inativo'}</span>
                    </td>
                    <td className="table-cell text-slate-400 text-xs hidden lg:table-cell">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Contas Bancarias */}
        {activeTab === 'contas' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Contas Bancárias</h3>
              {canEdit && <button onClick={openNewConta} className="btn-primary text-sm"><Plus size={14} /> Nova Conta</button>}
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="table-header">Conta</th>
                  <th className="table-header hidden md:table-cell">Banco</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header text-right">Saldo Inicial</th>
                  <th className="table-header">Status</th>
                  {canEdit && <th className="table-header text-center">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {store.contasBancarias?.map(c => (
                  <tr key={c.id} className="table-row">
                    <td className="table-cell font-medium">{c.nome}</td>
                    <td className="table-cell text-slate-500 hidden md:table-cell">{c.banco}{c.agencia && ` | Ag: ${c.agencia}`}</td>
                    <td className="table-cell"><span className="badge-blue">{c.tipo}</span></td>
                    <td className="table-cell text-right font-semibold">{formatCurrency(c.saldoInicial)}</td>
                    <td className="table-cell">
                      <span className={c.ativo ? 'badge-green' : 'badge-red'}>{c.ativo ? 'Ativa' : 'Inativa'}</span>
                    </td>
                    {canEdit && (
                      <td className="table-cell text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEditConta(c)} className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={13} /></button>
                          <button onClick={() => deleteContaBancaria(c.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Centros de Custo */}
        {activeTab === 'centros' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Centros de Custo</h3>
              {canEdit && <button onClick={openNewCC} className="btn-primary text-sm"><Plus size={14} /> Novo Centro</button>}
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="table-header">Código</th>
                  <th className="table-header">Nome</th>
                  <th className="table-header hidden md:table-cell">Responsável</th>
                  <th className="table-header">Status</th>
                  {canEdit && <th className="table-header text-center">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {store.centrosCusto?.map(c => (
                  <tr key={c.id} className="table-row">
                    <td className="table-cell font-mono text-slate-500">{c.codigo}</td>
                    <td className="table-cell font-medium">{c.nome}</td>
                    <td className="table-cell text-slate-500 hidden md:table-cell">{c.responsavel || '—'}</td>
                    <td className="table-cell">
                      <span className={c.ativo ? 'badge-green' : 'badge-red'}>{c.ativo ? 'Ativo' : 'Inativo'}</span>
                    </td>
                    {canEdit && (
                      <td className="table-cell text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEditCC(c)} className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={13} /></button>
                          <button onClick={() => deleteCentroCusto(c.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Formas de Pagamento */}
        {activeTab === 'formas' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Formas de Pagamento</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
              {store.formasPagamento?.map(fp => (
                <div key={fp.id} className={cn('flex items-center justify-between p-4 rounded-xl border-2 transition-all', fp.ativo ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 opacity-50')}>
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} className={fp.ativo ? 'text-emerald-600' : 'text-slate-400'} />
                    <span className={cn('font-medium text-sm', fp.ativo ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500')}>{fp.nome}</span>
                  </div>
                  <span className={fp.ativo ? 'badge-green' : 'badge-red'}>{fp.ativo ? 'Ativo' : 'Inativo'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conta Modal */}
      {showContaModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">{editingContaId ? 'Editar Conta' : 'Nova Conta Bancária'}</h2>
              <button onClick={() => setShowContaModal(false)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Nome da Conta *</label>
                <input className="input-field" value={contaForm.nome || ''} onChange={e => setContaForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Banco *</label>
                  <input className="input-field" value={contaForm.banco || ''} onChange={e => setContaForm(f => ({ ...f, banco: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Tipo</label>
                  <select className="input-field" value={contaForm.tipo || 'corrente'} onChange={e => setContaForm(f => ({ ...f, tipo: e.target.value as TipoConta }))}>
                    <option value="corrente">Corrente</option>
                    <option value="poupanca">Poupança</option>
                    <option value="investimento">Investimento</option>
                    <option value="caixa">Caixa</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Agência</label>
                  <input className="input-field" value={contaForm.agencia || ''} onChange={e => setContaForm(f => ({ ...f, agencia: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Número da Conta</label>
                  <input className="input-field" value={contaForm.conta || ''} onChange={e => setContaForm(f => ({ ...f, conta: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Saldo Inicial (R$)</label>
                <input type="number" className="input-field" value={contaForm.saldoInicial || 0} onChange={e => setContaForm(f => ({ ...f, saldoInicial: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setShowContaModal(false)} className="btn-secondary">Cancelar</button>
              <button onClick={saveConta} className="btn-primary"><Save size={14} /> Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* CC Modal */}
      {showCCModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">{editingCCId ? 'Editar Centro' : 'Novo Centro de Custo'}</h2>
              <button onClick={() => setShowCCModal(false)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Código *</label>
                <input className="input-field font-mono" placeholder="Ex: CC007" value={ccForm.codigo || ''} onChange={e => setCCForm(f => ({ ...f, codigo: e.target.value }))} />
              </div>
              <div>
                <label className="label">Nome *</label>
                <input className="input-field" value={ccForm.nome || ''} onChange={e => setCCForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div>
                <label className="label">Responsável</label>
                <input className="input-field" value={ccForm.responsavel || ''} onChange={e => setCCForm(f => ({ ...f, responsavel: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setShowCCModal(false)} className="btn-secondary">Cancelar</button>
              <button onClick={saveCC} className="btn-primary"><Save size={14} /> Salvar</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
