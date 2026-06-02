import { Categoria, CentroCusto, ContaBancaria, User, Company } from '@/types'

// ──────────────────────────────────────────────
// Dados de referência iniciais (sem transações demo)
// Esses dados são usados apenas para popular o Firestore
// na PRIMEIRA vez que o sistema for acessado.
// ──────────────────────────────────────────────

export const INITIAL_COMPANY: Company = {
  id: 'main',
  nome: 'Minha Empresa',
  cnpj: '',
  razaoSocial: '',
  inscricaoEstadual: '',
  endereco: '',
  cidade: '',
  estado: '',
  cep: '',
  telefone: '',
  email: '',
  website: '',
  regimeTributario: 'simples',
}

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Administrador',
    email: 'admin@empresa.com.br',
    role: 'admin',
    active: true,
    createdAt: new Date().toISOString(),
  },
]

export const INITIAL_CATEGORIAS: Categoria[] = [
  // ── RECEITAS ──────────────────────────────
  {
    id: 'cat-receita-vendas',
    nome: 'Vendas de Produtos',
    codigo: '1.1',
    tipo: 'receita',
    ativo: true,
    ordem: 1,
    subcategorias: [
      { id: 'sub-venda-softw',  nome: 'Venda de Software',  codigo: '1.1.1', ativo: true },
      { id: 'sub-venda-lic',    nome: 'Licenciamento',       codigo: '1.1.2', ativo: true },
      { id: 'sub-venda-sub',    nome: 'Assinaturas SaaS',    codigo: '1.1.3', ativo: true },
    ],
  },
  {
    id: 'cat-receita-servicos',
    nome: 'Prestação de Serviços',
    codigo: '1.2',
    tipo: 'receita',
    ativo: true,
    ordem: 2,
    subcategorias: [
      { id: 'sub-serv-consul',  nome: 'Consultoria',         codigo: '1.2.1', ativo: true },
      { id: 'sub-serv-impl',    nome: 'Implementação',       codigo: '1.2.2', ativo: true },
      { id: 'sub-serv-suporte', nome: 'Suporte Técnico',     codigo: '1.2.3', ativo: true },
    ],
  },
  {
    id: 'cat-receita-outras',
    nome: 'Outras Receitas',
    codigo: '1.3',
    tipo: 'receita',
    ativo: true,
    ordem: 3,
    subcategorias: [
      { id: 'sub-out-financ',   nome: 'Receitas Financeiras', codigo: '1.3.1', ativo: true },
      { id: 'sub-out-eventuais',nome: 'Receitas Eventuais',   codigo: '1.3.2', ativo: true },
    ],
  },

  // ── DEDUÇÕES ──────────────────────────────
  {
    id: 'cat-deducao',
    nome: 'Deduções da Receita',
    codigo: '2.1',
    tipo: 'deducao',
    ativo: true,
    ordem: 4,
    subcategorias: [
      { id: 'sub-ded-devolucao', nome: 'Devoluções',            codigo: '2.1.1', ativo: true },
      { id: 'sub-ded-desconto',  nome: 'Descontos Concedidos',  codigo: '2.1.2', ativo: true },
    ],
  },

  // ── CUSTOS ────────────────────────────────
  {
    id: 'cat-custo-mercadoria',
    nome: 'Custo de Mercadorias',
    codigo: '3.1',
    tipo: 'custo',
    ativo: true,
    ordem: 5,
    subcategorias: [
      { id: 'sub-cmv',   nome: 'CMV — Custo das Mercadorias', codigo: '3.1.1', ativo: true },
      { id: 'sub-infra', nome: 'Infraestrutura de Produção',   codigo: '3.1.2', ativo: true },
    ],
  },
  {
    id: 'cat-custo-servicos',
    nome: 'Custo dos Serviços',
    codigo: '3.2',
    tipo: 'custo',
    ativo: true,
    ordem: 6,
    subcategorias: [
      { id: 'sub-csp',        nome: 'CSP — Custo dos Serviços', codigo: '3.2.1', ativo: true },
      { id: 'sub-terceiros',  nome: 'Serviços de Terceiros',     codigo: '3.2.2', ativo: true },
    ],
  },

  // ── DESPESAS ADMINISTRATIVAS ──────────────
  {
    id: 'cat-desp-rh',
    nome: 'Recursos Humanos',
    codigo: '4.1',
    tipo: 'despesa_admin',
    ativo: true,
    ordem: 7,
    subcategorias: [
      { id: 'sub-salario',   nome: 'Salários e Ordenados',         codigo: '4.1.1', ativo: true },
      { id: 'sub-encargos',  nome: 'Encargos Sociais (FGTS/INSS)', codigo: '4.1.2', ativo: true },
      { id: 'sub-beneficios',nome: 'Benefícios (VT/VR/Plano)',     codigo: '4.1.3', ativo: true },
      { id: 'sub-ferias',    nome: 'Férias e 13º Salário',         codigo: '4.1.4', ativo: true },
    ],
  },
  {
    id: 'cat-desp-estrutura',
    nome: 'Estrutura e Ocupação',
    codigo: '4.2',
    tipo: 'despesa_admin',
    ativo: true,
    ordem: 8,
    subcategorias: [
      { id: 'sub-aluguel', nome: 'Aluguel',                 codigo: '4.2.1', ativo: true },
      { id: 'sub-energia', nome: 'Energia Elétrica',         codigo: '4.2.2', ativo: true },
      { id: 'sub-internet',nome: 'Internet e Telefonia',     codigo: '4.2.3', ativo: true },
      { id: 'sub-limpeza', nome: 'Limpeza e Conservação',    codigo: '4.2.4', ativo: true },
    ],
  },
  {
    id: 'cat-desp-ti',
    nome: 'Tecnologia e Sistemas',
    codigo: '4.3',
    tipo: 'despesa_admin',
    ativo: true,
    ordem: 9,
    subcategorias: [
      { id: 'sub-software', nome: 'Licenças de Software',     codigo: '4.3.1', ativo: true },
      { id: 'sub-cloud',    nome: 'Hospedagem / Cloud',       codigo: '4.3.2', ativo: true },
      { id: 'sub-hardware', nome: 'Hardware e Equipamentos',  codigo: '4.3.3', ativo: true },
    ],
  },

  // ── DESPESAS COMERCIAIS ───────────────────
  {
    id: 'cat-desp-marketing',
    nome: 'Marketing e Publicidade',
    codigo: '5.1',
    tipo: 'despesa_comercial',
    ativo: true,
    ordem: 10,
    subcategorias: [
      { id: 'sub-trafego',  nome: 'Tráfego Pago (Google/Meta)', codigo: '5.1.1', ativo: true },
      { id: 'sub-conteudo', nome: 'Produção de Conteúdo',       codigo: '5.1.2', ativo: true },
      { id: 'sub-design',   nome: 'Design e Criação',           codigo: '5.1.3', ativo: true },
    ],
  },
  {
    id: 'cat-desp-comercial',
    nome: 'Equipe Comercial',
    codigo: '5.2',
    tipo: 'despesa_comercial',
    ativo: true,
    ordem: 11,
    subcategorias: [
      { id: 'sub-comissao', nome: 'Comissões de Vendas',       codigo: '5.2.1', ativo: true },
      { id: 'sub-viagens',  nome: 'Viagens e Representação',   codigo: '5.2.2', ativo: true },
    ],
  },

  // ── DESPESAS FINANCEIRAS ──────────────────
  {
    id: 'cat-desp-financeira',
    nome: 'Despesas Financeiras',
    codigo: '6.1',
    tipo: 'despesa_financeira',
    ativo: true,
    ordem: 12,
    subcategorias: [
      { id: 'sub-juros',      nome: 'Juros e Encargos',          codigo: '6.1.1', ativo: true },
      { id: 'sub-tarifas',    nome: 'Tarifas Bancárias',         codigo: '6.1.2', ativo: true },
      { id: 'sub-emprestimo', nome: 'Parcelas de Empréstimos',   codigo: '6.1.3', ativo: true },
    ],
  },

  // ── IMPOSTOS ──────────────────────────────
  {
    id: 'cat-impostos',
    nome: 'Impostos e Tributos',
    codigo: '7.1',
    tipo: 'imposto',
    ativo: true,
    ordem: 13,
    subcategorias: [
      { id: 'sub-simples',    nome: 'Simples Nacional / DAS', codigo: '7.1.1', ativo: true },
      { id: 'sub-iss',        nome: 'ISS',                    codigo: '7.1.2', ativo: true },
      { id: 'sub-outros-imp', nome: 'Outros Tributos',        codigo: '7.1.3', ativo: true },
    ],
  },
]

export const INITIAL_CENTROS_CUSTO: CentroCusto[] = [
  { id: 'cc-admin',     nome: 'Administrativo',            codigo: 'CC001', ativo: true },
  { id: 'cc-comercial', nome: 'Comercial e Vendas',        codigo: 'CC002', ativo: true },
  { id: 'cc-marketing', nome: 'Marketing',                 codigo: 'CC003', ativo: true },
  { id: 'cc-operacoes', nome: 'Operações / Produção',      codigo: 'CC004', ativo: true },
  { id: 'cc-ti',        nome: 'Tecnologia da Informação',  codigo: 'CC005', ativo: true },
]

export const INITIAL_CONTAS_BANCARIAS: ContaBancaria[] = [
  {
    id: 'conta-principal',
    nome: 'Conta Principal',
    banco: '',
    agencia: '',
    conta: '',
    tipo: 'corrente',
    saldoInicial: 0,
    ativo: true,
  },
]

export const INITIAL_FORMAS_PAGAMENTO = [
  { id: 'fp-pix',        nome: 'PIX',                 ativo: true },
  { id: 'fp-ted',        nome: 'TED / Transferência', ativo: true },
  { id: 'fp-boleto',     nome: 'Boleto Bancário',     ativo: true },
  { id: 'fp-cartao-cred',nome: 'Cartão de Crédito',  ativo: true },
  { id: 'fp-cartao-deb', nome: 'Cartão de Débito',   ativo: true },
  { id: 'fp-dinheiro',   nome: 'Dinheiro',            ativo: true },
  { id: 'fp-cheque',     nome: 'Cheque',              ativo: true },
  { id: 'fp-debito-auto',nome: 'Débito Automático',  ativo: true },
]
