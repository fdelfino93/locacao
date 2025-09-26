import type { Endereco, DadosBancarios, RepresentanteLegal, DocumentosEmpresa } from './';

export interface Locador {
  id?: number;
  nome: string;
  cpf_cnpj: string;
  telefones?: string[];
  emails?: string[];
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
  tipo_locador?: string;
  data_nascimento: string;
  regime_bens?: string;
  tipo_conta?: string;
  observacoes?: string;
  
  // Campos legados para compatibilidade
  telefone?: string;
  email?: string;
  
  // Campos adicionais para formulários
  tipo_recebimento?: string;
  tipo_cliente?: string;
  conta_bancaria?: DadosBancarios;
  
  // Campos de pessoa jurídica
  razao_social?: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  atividade_principal?: string;
  data_constituicao?: string;
  capital_social?: string;
  porte_empresa?: string;
  regime_tributario?: string;
  
  // Campos de representante legal
  nome_representante?: string;
  cpf_representante?: string;
  rg_representante?: string;
  cargo_representante?: string;
  telefone_representante?: string;
  email_representante?: string;
  endereco_representante?: string | any;
  
  // Outros campos
  email_recebimento?: string;
  forma_recebimento?: string[];
  tipo_garantia?: string;
  documento_pessoal?: string;
  comprovante_endereco?: string;
  observacoes_especiais?: string;
  endereco_estruturado?: any;

  // Campos ausentes que estavam faltando
  usa_multiplas_contas?: boolean | number;
  data_cadastro?: string;
  data_atualizacao?: string;
  ativo?: boolean | number;
}

