// Tipos para Cliente
export interface Cliente {
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  tipo_recebimento: string;
  conta_bancaria: string;
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
}

// Tipos para Inquilino
export interface Inquilino {
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  tipo_garantia: string;
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
}

// Tipos para Imóvel
export interface Imovel {
  id_cliente: number;
  id_inquilino: number;
  tipo: string;
  endereco: string;
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

// Tipos para resposta da API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}