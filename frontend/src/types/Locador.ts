import type { Endereco, DadosBancarios, RepresentanteLegal, DocumentosEmpresa } from './';

export interface Locador {
  id?: number;
  nome: string;
  cpf_cnpj: string;
  telefones: string[];
  emails: string[];
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
  tipo_locador: string;
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
}

