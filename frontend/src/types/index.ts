// Tipos auxiliares
export interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface DadosBancarios {
  tipo_recebimento: 'PIX' | 'TED' | 'Conta Corrente' | 'Conta Poupança';
  chave_pix?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: 'Corrente' | 'Poupança' | 'Conta Digital';
  titular?: string;
  cpf_titular?: string;
}

export interface RepresentanteLegal {
  nome: string;
  cpf: string;
  rg: string;
  telefone?: string;
  email?: string;
  endereco?: Endereco;
  data_nascimento?: string;
  nacionalidade?: string;
  estado_civil?: string;
  profissao?: string;
}

export interface DocumentosEmpresa {
  contrato_social?: string;
  cartao_cnpj?: string;
  comprovante_renda?: string;
  comprovante_endereco?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
}

// Tipos para Cliente
export interface Cliente {
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  endereco?: Endereco;
  dados_bancarios?: DadosBancarios;
  tipo_pessoa: 'PF' | 'PJ';
  representante_legal?: RepresentanteLegal;
  documentos_empresa?: DocumentosEmpresa;
  deseja_fci: string;
  deseja_seguro_fianca: string;
  deseja_seguro_incendio: string;
  rg: string;
  dados_empresa: string;
  representante: string;
  nacionalidade: string;
  estado_civil: string;
  profissao: string;
  existe_conjuge?: number | null;
  nome_conjuge?: string;
  cpf_conjuge?: string;
  rg_conjuge?: string;
  endereco_conjuge?: string;
  telefone_conjuge?: string;
  tipo_cliente: string;
  data_nascimento: string;
  observacoes?: string;
}

// Tipos para Fiador
export interface Fiador {
  nome: string;
  cpf_cnpj: string;
  rg?: string;
  telefone?: string;
  email?: string;
  endereco?: Endereco;
  dados_bancarios?: DadosBancarios;
  tipo_pessoa: 'PF' | 'PJ';
  representante_legal?: RepresentanteLegal;
  documentos_empresa?: DocumentosEmpresa;
  renda_mensal?: number;
  profissao?: string;
  observacoes?: string;
}

// Tipos para Morador
export interface Morador {
  nome: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string;
  parentesco?: string;
  profissao?: string;
  telefone?: string;
  email?: string;
}

// Tipos para Inquilino
export interface Inquilino {
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  endereco?: Endereco;
  dados_bancarios?: DadosBancarios;
  tipo_pessoa: 'PF' | 'PJ';
  representante_legal?: RepresentanteLegal;
  documentos_empresa?: DocumentosEmpresa;
  tipo_garantia: string;
  tem_fiador: boolean;
  fiador?: Fiador;
  responsavel_pgto_agua: string;
  responsavel_pgto_luz: string;
  responsavel_pgto_gas: string;
  rg: string;
  dados_empresa: string;
  representante: string;
  nacionalidade: string;
  estado_civil: string;
  profissao: string;
  dados_moradores: string;
  tem_moradores: boolean;
  moradores?: Morador[];
  Endereco_inq: string;
  responsavel_inq?: number | null;
  dependentes_inq?: number | null;
  qtd_dependentes_inq: number;
  pet_inquilino?: number | null;
  qtd_pet_inquilino: number;
  porte_pet?: string;
  nome_conjuge?: string;
  cpf_conjuge?: string;
  rg_conjuge?: string;
  endereco_conjuge?: string;
  telefone_conjuge?: string;
  observacoes?: string;
}

// Tipos para Imóvel
export interface Imovel {
  id_cliente: number;
  id_inquilino: number;
  tipo: string;
  endereco?: Endereco;
  valor_aluguel: number;
  iptu: number;
  condominio: number;
  taxa_incendio: number;
  status: string;
  matricula_imovel: string;
  area_imovel: string;
  dados_imovel: string;
  permite_pets: boolean;
  info_iptu: string;
  observacoes_condominio: string;
  copel_unidade_consumidora: string;
  sanepar_matricula: string;
  tem_gas: boolean;
  info_gas: string;
  boleto_condominio: boolean;
}

// Tipos para Planos de Locação
export interface PlanoLocacao {
  id: number;
  codigo: string;
  nome: string;
  categoria: 'COMPLETO' | 'BASICO';
  opcao: 1 | 2;
  taxa_primeiro_aluguel: number;
  taxa_demais_alugueis: number;
  taxa_administracao: number;
  descricao?: string;
}

// Tipos para Contrato
export interface Contrato {
  id_imovel: number;
  id_inquilino: number;
  data_inicio: string;
  data_fim: string;
  plano_locacao?: PlanoLocacao;
  id_plano_locacao?: number;
  taxa_administracao: number;
  fundo_conservacao: number;
  tipo_reajuste: string;
  percentual_reajuste: number;
  vencimento_dia: number;
  renovacao_automatica: boolean;
  seguro_obrigatorio: boolean;
  clausulas_adicionais: string;
  tipo_plano_locacao: string;
  
  // Valores estruturados
  valor_aluguel: number;
  valor_iptu: number;
  valor_condominio: number;
  
  // Antecipação estruturada
  antecipa_condominio: boolean;
  antecipa_seguro_fianca: boolean;
  antecipa_seguro_incendio: boolean;
  
  // Retidos estruturados
  retido_fci: boolean;
  retido_condominio: boolean;
  retido_seguro_fianca: boolean;
  retido_seguro_incendio: boolean;
  
  // Datas de seguro estruturadas
  seguro_fianca_inicio?: string;
  seguro_fianca_fim?: string;
  seguro_incendio_inicio?: string;
  seguro_incendio_fim?: string;
  
  // Campos legados (manter compatibilidade)
  valores_contrato: string;
  data_vigencia_segfianca: string;
  data_vigencia_segincendio: string;
  data_assinatura: string;
  ultimo_reajuste: string;
  proximo_reajuste: string;
  antecipacao_encargos: boolean;
  aluguel_garantido: boolean;
  mes_de_referencia: string;
  tipo_garantia: string;
  bonificacao: number;
  retidos: string;
  info_garantias: string;
}

// Tipos para resposta da API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}