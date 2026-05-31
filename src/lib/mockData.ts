import { DataStore, Lancamento, Categoria, CentroCusto, ContaBancaria } from '@/types'
import { generateId } from './utils'

export const INITIAL_COMPANY = {
  id: 'company-1',
  nome: 'TechCorp Brasil',
  cnpj: '12.345.678/0001-90',
  razaoSocial: 'TechCorp Brasil Tecnologia Ltda.',
  inscricaoEstadual: '123.456.789.012',
  endereco: 'Av. Paulista, 1000, Sala 501',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01310-100',
  telefone: '(11) 3456-7890',
  email: 'financeiro@techcorp.com.br',
  website: 'www.techcorp.com.br',
  regimeTributario: 'simples' as const,
}

export const INITIAL_USERS = [
  {
    id: 'user-1',
    name: 'Carlos Mendez',
    email: 'admin@techcorp.com.br',
    role: 'admin' as const,
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2025-05-28T08:30:00Z',
  },
  {
    id: 'user-2',
    name: 'Ana Ferreira',
    email: 'financeiro@techcorp.com.br',
    role: 'financeiro' as const,
    active: true,
    createdAt: '2024-01-15T00:00:00Z',
    lastLogin: '2025-05-27T16:45:00Z',
  },
  {
    id: 'user-3',
    name: 'Roberto Silva',
    email: 'gestor@techcorp.com.br',
    role: 'gestor' as const,
    active: true,
    createdAt: '2024-02-01T00:00:00Z',
    lastLogin: '2025-05-26T10:00:00Z',
  },
  {
    id: 'user-4',
    name: 'Mariana Costa',
    email: 'view@techcorp.com.br',
    role: 'visualizacao' as const,
    active: true,
    createdAt: '2024-03-01T00:00:00Z',
    lastLogin: '2025-05-20T09:15:00Z',
  },
]

export const INITIAL_CATEGORIAS: Categoria[] = [
  {
    id: 'cat-receita-vendas',
    nome: 'Vendas de Produtos',
    codigo: '1.1',
    tipo: 'receita',
    ativo: true,
    ordem: 1,
    subcategorias: [
      { id: 'sub-venda-softw', nome: 'Venda de Software', codigo: '1.1.1', ativo: true },
      { id: 'sub-venda-lic', nome: 'Licenciamento', codigo: '1.1.2', ativo: true },
      { id: 'sub-venda-sub', nome: 'Assinaturas SaaS', codigo: '1.1.3', ativo: true },
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
      { id: 'sub-serv-consul', nome: 'Consultoria', codigo: '1.2.1', ativo: true },
      { id: 'sub-serv-impl', nome: 'Implementação', codigo: '1.2.2', ativo: true },
      { id: 'sub-serv-suporte', nome: 'Suporte Técnico', codigo: '1.2.3', ativo: true },
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
      { id: 'sub-out-financ', nome: 'Receitas Financeiras', codigo: '1.3.1', ativo: true },
      { id: 'sub-out-eventuais', nome: 'Receitas Eventuais', codigo: '1.3.2', ativo: true },
    ],
  },
  {
    id: 'cat-deducao',
    nome: 'Deduções da Receita',
    codigo: '2.1',
    tipo: 'deducao',
    ativo: true,
    ordem: 4,
    subcategorias: [
      { id: 'sub-ded-devolucao', nome: 'Devoluções', codigo: '2.1.1', ativo: true },
      { id: 'sub-ded-desconto', nome: 'Descontos Concedidos', codigo: '2.1.2', ativo: true },
    ],
  },
  {
    id: 'cat-custo-mercadoria',
    nome: 'Custo de Mercadorias',
    codigo: '3.1',
    tipo: 'custo',
    ativo: true,
    ordem: 5,
    subcategorias: [
      { id: 'sub-cmv', nome: 'CMV — Custo das Mercadorias Vendidas', codigo: '3.1.1', ativo: true },
      { id: 'sub-infra', nome: 'Infraestrutura de Produção', codigo: '3.1.2', ativo: true },
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
      { id: 'sub-csp', nome: 'CSP — Custo dos Serviços Prestados', codigo: '3.2.1', ativo: true },
      { id: 'sub-terceiros', nome: 'Serviços de Terceiros', codigo: '3.2.2', ativo: true },
    ],
  },
  {
    id: 'cat-desp-rh',
    nome: 'Recursos Humanos',
    codigo: '4.1',
    tipo: 'despesa_admin',
    ativo: true,
    ordem: 7,
    subcategorias: [
      { id: 'sub-salario', nome: 'Salários e Ordenados', codigo: '4.1.1', ativo: true },
      { id: 'sub-encargos', nome: 'Encargos Sociais (FGTS/INSS)', codigo: '4.1.2', ativo: true },
      { id: 'sub-beneficios', nome: 'Benefícios (VT/VR/Plano)', codigo: '4.1.3', ativo: true },
      { id: 'sub-ferias', nome: 'Férias e 13º Salário', codigo: '4.1.4', ativo: true },
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
      { id: 'sub-aluguel', nome: 'Aluguel', codigo: '4.2.1', ativo: true },
      { id: 'sub-energia', nome: 'Energia Elétrica', codigo: '4.2.2', ativo: true },
      { id: 'sub-internet', nome: 'Internet e Telefonia', codigo: '4.2.3', ativo: true },
      { id: 'sub-limpeza', nome: 'Limpeza e Conservação', codigo: '4.2.4', ativo: true },
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
      { id: 'sub-software', nome: 'Licenças de Software', codigo: '4.3.1', ativo: true },
      { id: 'sub-cloud', nome: 'Hospedagem / Cloud', codigo: '4.3.2', ativo: true },
      { id: 'sub-hardware', nome: 'Hardware e Equipamentos', codigo: '4.3.3', ativo: true },
    ],
  },
  {
    id: 'cat-desp-marketing',
    nome: 'Marketing e Publicidade',
    codigo: '5.1',
    tipo: 'despesa_comercial',
    ativo: true,
    ordem: 10,
    subcategorias: [
      { id: 'sub-trafego', nome: 'Tráfego Pago (Google/Meta)', codigo: '5.1.1', ativo: true },
      { id: 'sub-conteudo', nome: 'Produção de Conteúdo', codigo: '5.1.2', ativo: true },
      { id: 'sub-design', nome: 'Design e Criação', codigo: '5.1.3', ativo: true },
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
      { id: 'sub-comissao', nome: 'Comissões de Vendas', codigo: '5.2.1', ativo: true },
      { id: 'sub-viagens', nome: 'Viagens e Representação', codigo: '5.2.2', ativo: true },
    ],
  },
  {
    id: 'cat-desp-financeira',
    nome: 'Despesas Financeiras',
    codigo: '6.1',
    tipo: 'despesa_financeira',
    ativo: true,
    ordem: 12,
    subcategorias: [
      { id: 'sub-juros', nome: 'Juros e Encargos', codigo: '6.1.1', ativo: true },
      { id: 'sub-tarifas', nome: 'Tarifas Bancárias', codigo: '6.1.2', ativo: true },
      { id: 'sub-emprestimo', nome: 'Parcelas de Empréstimos', codigo: '6.1.3', ativo: true },
    ],
  },
  {
    id: 'cat-impostos',
    nome: 'Impostos e Tributos',
    codigo: '7.1',
    tipo: 'imposto',
    ativo: true,
    ordem: 13,
    subcategorias: [
      { id: 'sub-simples', nome: 'Simples Nacional / DAS', codigo: '7.1.1', ativo: true },
      { id: 'sub-iss', nome: 'ISS', codigo: '7.1.2', ativo: true },
      { id: 'sub-outros-imp', nome: 'Outros Tributos', codigo: '7.1.3', ativo: true },
    ],
  },
]

export const INITIAL_CENTROS_CUSTO: CentroCusto[] = [
  { id: 'cc-matriz', nome: 'Matriz — SP', codigo: 'CC001', responsavel: 'Carlos Mendez', ativo: true },
  { id: 'cc-dev', nome: 'Desenvolvimento de Produto', codigo: 'CC002', responsavel: 'Ana Ferreira', ativo: true },
  { id: 'cc-comercial', nome: 'Comercial e Vendas', codigo: 'CC003', responsavel: 'Roberto Silva', ativo: true },
  { id: 'cc-marketing', nome: 'Marketing', codigo: 'CC004', responsavel: 'Mariana Costa', ativo: true },
  { id: 'cc-suporte', nome: 'Suporte ao Cliente', codigo: 'CC005', responsavel: 'Ana Ferreira', ativo: true },
  { id: 'cc-admin', nome: 'Administrativo', codigo: 'CC006', responsavel: 'Carlos Mendez', ativo: true },
]

export const INITIAL_CONTAS_BANCARIAS: ContaBancaria[] = [
  { id: 'conta-inter', nome: 'Banco Inter — Conta Principal', banco: 'Banco Inter', agencia: '0001', conta: '12345678-9', tipo: 'corrente', saldoInicial: 180000, ativo: true },
  { id: 'conta-itau', nome: 'Itaú — Conta Corrente', banco: 'Itaú Unibanco', agencia: '4567', conta: '98765-4', tipo: 'corrente', saldoInicial: 95000, ativo: true },
  { id: 'conta-nubank', nome: 'Nubank — Conta Empresarial', banco: 'Nubank', agencia: '0001', conta: '11223344-5', tipo: 'corrente', saldoInicial: 45000, ativo: true },
  { id: 'conta-caixa-fisico', nome: 'Caixa Físico', banco: 'Caixa', tipo: 'caixa', saldoInicial: 3000, ativo: true },
  { id: 'conta-investimento', nome: 'Reserva / Aplicação', banco: 'XP Investimentos', tipo: 'investimento', saldoInicial: 250000, ativo: true },
]

export const INITIAL_FORMAS_PAGAMENTO = [
  { id: 'fp-pix', nome: 'PIX', ativo: true },
  { id: 'fp-ted', nome: 'TED / Transferência', ativo: true },
  { id: 'fp-boleto', nome: 'Boleto Bancário', ativo: true },
  { id: 'fp-cartao-cred', nome: 'Cartão de Crédito', ativo: true },
  { id: 'fp-cartao-deb', nome: 'Cartão de Débito', ativo: true },
  { id: 'fp-dinheiro', nome: 'Dinheiro', ativo: true },
  { id: 'fp-cheque', nome: 'Cheque', ativo: true },
  { id: 'fp-debito-auto', nome: 'Débito Automático', ativo: true },
]

const monthlyRevenue = [150000, 142000, 168000, 175000, 182000, 195000, 188000, 201000, 215000, 228000, 235000, 248000]

function buildLancamentos(): Lancamento[] {
  const lancamentos: Lancamento[] = []
  const now = new Date()
  const currentYear = 2025

  for (let m = 1; m <= 12; m++) {
    if (m > now.getMonth() + 1 && currentYear >= now.getFullYear()) break

    const revenue = monthlyRevenue[m - 1]
    const year = currentYear
    const monthStr = String(m).padStart(2, '0')
    const competencia = `${year}-${monthStr}`

    // Receitas — Assinaturas SaaS (60% da receita)
    lancamentos.push({
      id: generateId(), data: `${year}-${monthStr}-05`, competencia,
      descricao: 'Faturamento Assinaturas SaaS — Mensalidades', categoriaId: 'cat-receita-vendas',
      subcategoriaId: 'sub-venda-sub', centroCustoId: 'cc-dev', contaBancariaId: 'conta-inter',
      formaPagamento: 'fp-pix', clienteFornecedor: 'Clientes Recorrentes', tipo: 'entrada',
      valor: revenue * 0.60, observacoes: '', status: 'confirmado', createdAt: `${year}-${monthStr}-05T10:00:00Z`,
      updatedAt: `${year}-${monthStr}-05T10:00:00Z`, userId: 'user-2',
    })

    // Receitas — Consultoria (25%)
    lancamentos.push({
      id: generateId(), data: `${year}-${monthStr}-15`, competencia,
      descricao: 'Serviços de Consultoria e Implementação', categoriaId: 'cat-receita-servicos',
      subcategoriaId: 'sub-serv-consul', centroCustoId: 'cc-comercial', contaBancariaId: 'conta-inter',
      formaPagamento: 'fp-ted', clienteFornecedor: 'Clientes PJ', tipo: 'entrada',
      valor: revenue * 0.25, observacoes: '', status: 'confirmado', createdAt: `${year}-${monthStr}-15T10:00:00Z`,
      updatedAt: `${year}-${monthStr}-15T10:00:00Z`, userId: 'user-2',
    })

    // Receitas — Suporte e Licenças (15%)
    lancamentos.push({
      id: generateId(), data: `${year}-${monthStr}-20`, competencia,
      descricao: 'Suporte Técnico e Licenças de Software', categoriaId: 'cat-receita-vendas',
      subcategoriaId: 'sub-venda-lic', centroCustoId: 'cc-suporte', contaBancariaId: 'conta-itau',
      formaPagamento: 'fp-boleto', clienteFornecedor: 'Diversos Clientes', tipo: 'entrada',
      valor: revenue * 0.15, observacoes: '', status: 'confirmado', createdAt: `${year}-${monthStr}-20T10:00:00Z`,
      updatedAt: `${year}-${monthStr}-20T10:00:00Z`, userId: 'user-2',
    })

    // Custos de Serviços (30%)
    lancamentos.push({
      id: generateId(), data: `${year}-${monthStr}-10`, competencia,
      descricao: 'Custo dos Serviços Prestados — Equipe Técnica', categoriaId: 'cat-custo-servicos',
      subcategoriaId: 'sub-csp', centroCustoId: 'cc-dev', contaBancariaId: 'conta-inter',
      formaPagamento: 'fp-ted', clienteFornecedor: '', tipo: 'saida',
      valor: revenue * 0.30, observacoes: '', status: 'confirmado', createdAt: `${year}-${monthStr}-10T10:00:00Z`,
      updatedAt: `${year}-${monthStr}-10T10:00:00Z`, userId: 'user-2',
    })

    // Despesas Admin — Folha de Pagamento (12%)
    lancamentos.push({
      id: generateId(), data: `${year}-${monthStr}-05`, competencia,
      descricao: 'Folha de Pagamento — Salários e Encargos', categoriaId: 'cat-desp-rh',
      subcategoriaId: 'sub-salario', centroCustoId: 'cc-admin', contaBancariaId: 'conta-itau',
      formaPagamento: 'fp-ted', clienteFornecedor: 'Colaboradores', tipo: 'saida',
      valor: revenue * 0.12, observacoes: '', status: 'confirmado', createdAt: `${year}-${monthStr}-05T10:00:00Z`,
      updatedAt: `${year}-${monthStr}-05T10:00:00Z`, userId: 'user-2',
    })

    // Despesas Admin — Estrutura (4%)
    lancamentos.push({
      id: generateId(), data: `${year}-${monthStr}-01`, competencia,
      descricao: 'Aluguel Escritório + Condomínio', categoriaId: 'cat-desp-estrutura',
      subcategoriaId: 'sub-aluguel', centroCustoId: 'cc-admin', contaBancariaId: 'conta-itau',
      formaPagamento: 'fp-debito-auto', clienteFornecedor: 'Imobiliária Delta', tipo: 'saida',
      valor: revenue * 0.04, observacoes: '', status: 'confirmado', createdAt: `${year}-${monthStr}-01T10:00:00Z`,
      updatedAt: `${year}-${monthStr}-01T10:00:00Z`, userId: 'user-2',
    })

    // Despesas Admin — TI (3%)
    lancamentos.push({
      id: generateId(), data: `${year}-${monthStr}-02`, competencia,
      descricao: 'Licenças de Software e Infraestrutura Cloud', categoriaId: 'cat-desp-ti',
      subcategoriaId: 'sub-cloud', centroCustoId: 'cc-dev', contaBancariaId: 'conta-nubank',
      formaPagamento: 'fp-cartao-cred', clienteFornecedor: 'AWS / Google / Microsoft', tipo: 'saida',
      valor: revenue * 0.03, observacoes: '', status: 'confirmado', createdAt: `${year}-${monthStr}-02T10:00:00Z`,
      updatedAt: `${year}-${monthStr}-02T10:00:00Z`, userId: 'user-2',
    })

    // Despesas Comerciais — Marketing (8%)
    lancamentos.push({
      id: generateId(), data: `${year}-${monthStr}-03`, competencia,
      descricao: 'Investimento em Tráfego Pago e Marketing Digital', categoriaId: 'cat-desp-marketing',
      subcategoriaId: 'sub-trafego', centroCustoId: 'cc-marketing', contaBancariaId: 'conta-nubank',
      formaPagamento: 'fp-cartao-cred', clienteFornecedor: 'Google / Meta Ads', tipo: 'saida',
      valor: revenue * 0.08, observacoes: '', status: 'confirmado', createdAt: `${year}-${monthStr}-03T10:00:00Z`,
      updatedAt: `${year}-${monthStr}-03T10:00:00Z`, userId: 'user-2',
    })

    // Despesas Comerciais — Comissões (5%)
    lancamentos.push({
      id: generateId(), data: `${year}-${monthStr}-25`, competencia,
      descricao: 'Comissões Equipe de Vendas', categoriaId: 'cat-desp-comercial',
      subcategoriaId: 'sub-comissao', centroCustoId: 'cc-comercial', contaBancariaId: 'conta-itau',
      formaPagamento: 'fp-ted', clienteFornecedor: 'Equipe Comercial', tipo: 'saida',
      valor: revenue * 0.05, observacoes: '', status: 'confirmado', createdAt: `${year}-${monthStr}-25T10:00:00Z`,
      updatedAt: `${year}-${monthStr}-25T10:00:00Z`, userId: 'user-2',
    })

    // Despesas Financeiras (1.5%)
    lancamentos.push({
      id: generateId(), data: `${year}-${monthStr}-28`, competencia,
      descricao: 'Tarifas Bancárias e Encargos Financeiros', categoriaId: 'cat-desp-financeira',
      subcategoriaId: 'sub-tarifas', centroCustoId: 'cc-admin', contaBancariaId: 'conta-inter',
      formaPagamento: 'fp-debito-auto', clienteFornecedor: 'Bancos', tipo: 'saida',
      valor: revenue * 0.015, observacoes: '', status: 'confirmado', createdAt: `${year}-${monthStr}-28T10:00:00Z`,
      updatedAt: `${year}-${monthStr}-28T10:00:00Z`, userId: 'user-2',
    })

    // Impostos — Simples Nacional (6%)
    lancamentos.push({
      id: generateId(), data: `${year}-${monthStr}-20`, competencia,
      descricao: `DAS — Simples Nacional ${getMonthLabel(m)}/${year}`, categoriaId: 'cat-impostos',
      subcategoriaId: 'sub-simples', centroCustoId: 'cc-admin', contaBancariaId: 'conta-inter',
      formaPagamento: 'fp-boleto', clienteFornecedor: 'Receita Federal', tipo: 'saida',
      valor: revenue * 0.06, observacoes: '', status: 'confirmado', createdAt: `${year}-${monthStr}-20T10:00:00Z`,
      updatedAt: `${year}-${monthStr}-20T10:00:00Z`, userId: 'user-2',
    })
  }

  return lancamentos
}

function getMonthLabel(m: number): string {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return months[m - 1] || ''
}

export function createInitialDataStore(): DataStore {
  return {
    users: INITIAL_USERS,
    company: INITIAL_COMPANY,
    lancamentos: buildLancamentos(),
    categorias: INITIAL_CATEGORIAS,
    centrosCusto: INITIAL_CENTROS_CUSTO,
    contasBancarias: INITIAL_CONTAS_BANCARIAS,
    formasPagamento: INITIAL_FORMAS_PAGAMENTO,
    initialized: true,
  }
}
