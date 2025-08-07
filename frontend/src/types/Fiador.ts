import type { Endereco } from './Endereco';
import type { DadosBancarios } from './DadosBancarios';
import type { RepresentanteLegal } from './RepresentanteLegal';
import type { DocumentosEmpresa } from './DocumentosEmpresa';

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
