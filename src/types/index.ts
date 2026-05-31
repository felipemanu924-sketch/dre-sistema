export type UserRole = 'admin' | 'financeiro' | 'gestor' | 'visualizacao'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  active: boolean
  createdAt: string
  lastLogin?: string
}

export interface Company {
  id: string
  nome: string
  cnpj: string
  razaoSocial: string
  inscricaoEstadual?: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  telefone: string
  email: string
  website?: string
  regimeTributario: 'simples' | 'lucro_presumido' | 'lucro_real'
  logo?: string
}

export type TipoLancamento = 'entrada' | 'saida'
export type StatusLancamento = 'confirmado' | 'pendente' | 'cancelado'

export interface Lancamento {
  id: string
  data: string
  competencia: string
  descricao: string
  categoriaId: string
  subcategoriaId?: string
  centroCustoId: string
  contaBancariaId: string
  formaPagamento: string
  clienteFornecedor?: string
  tipo: TipoLancamento
  valor: number
  observacoes?: string
  status: StatusLancamento
  recorrente?: boolean
  comprovante?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface Subcategoria {
  id: string
  nome: string
  codigo: string
  ativo: boolean
}

export type TipoCategoria =
  | 'receita'
  | 'deducao'
  | 'custo'
  | 'despesa_admin'
  | 'despesa_comercial'
  | 'despesa_financeira'
  | 'imposto'

export interface Categoria {
  id: string
  nome: string
  codigo: string
  tipo: TipoCategoria
  subcategorias: Subcategoria[]
  ativo: boolean
  ordem: number
  descricao?: string
}

export interface CentroCusto {
  id: string
  nome: string
  codigo: string
  responsavel?: string
  ativo: boolean
  descricao?: string
}

export type TipoConta = 'corrente' | 'poupanca' | 'investimento' | 'caixa'

export interface ContaBancaria {
  id: string
  nome: string
  banco: string
  agencia?: string
  conta?: string
  tipo: TipoConta
  saldoInicial: number
  ativo: boolean
}

export interface FormaPagamento {
  id: string
  nome: string
  ativo: boolean
}

export interface KPIData {
  label: string
  value: number
  previousValue: number
  format: 'currency' | 'percent' | 'number'
  icon: string
  color: string
}

export interface DRELine {
  id: string
  label: string
  level: 'group' | 'subgroup' | 'item' | 'total' | 'separator'
  value: number
  previousValue?: number
  percentOfRevenue?: number
  isDeduction?: boolean
  categoriaIds?: string[]
  children?: DRELine[]
}

export interface MonthlyData {
  month: string
  label: string
  receitaBruta: number
  deducoes: number
  receitaLiquida: number
  custos: number
  lucroBruto: number
  despesasAdmin: number
  despesasComercial: number
  despesasFinanceiras: number
  impostos: number
  lucroLiquido: number
}

export interface FluxoCaixaItem {
  data: string
  descricao: string
  tipo: TipoLancamento
  valor: number
  saldo: number
  categoriaId: string
  status: StatusLancamento
}

export interface DataStore {
  users: User[]
  company: Company
  lancamentos: Lancamento[]
  categorias: Categoria[]
  centrosCusto: CentroCusto[]
  contasBancarias: ContaBancaria[]
  formasPagamento: FormaPagamento[]
  initialized: boolean
}
