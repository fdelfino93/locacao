import type { Endereco, DadosBancarios, RepresentanteLegal, DocumentosEmpresa, Fiador, Morador } from './';

export interface Locatario {
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  endereco?: Endereco;
  dados_bancarios?: DadosBancarios;
  tipo_pessoa: 'PF' | 'PJ';
  representante_legal?: RepresentanteLegal;
  documentos_empresa?: DocumentosEmpresa;
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
  regime_bens?: string;
  existe_conjuge?: number | null;
  // Documentos
  documento_pessoal?: File | string | null;
  comprovante_endereco?: File | string | null;
  // Envio de boleto
  forma_envio_boleto?: string[];
  email_boleto?: string;
  whatsapp_boleto?: string;
  observacoes?: string;
}

export interface Inquilino extends Locatario {
  // Alias para compatibilidade
  id?: number;
  data_nascimento?: string;
  renda?: number;
  ativo?: boolean;
  data_criacao?: string;
  data_atualizacao?: string;
  tipo_garantia?: string;
}
