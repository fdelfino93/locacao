import type { Endereco, DadosBancarios, RepresentanteLegal, DocumentosEmpresa, Fiador, Morador } from './';

// Interface para telefone com múltiplas funcionalidades
export interface TelefoneLocatario {
  telefone: string;
  tipo?: string;
  principal?: boolean;
  whatsapp?: boolean;
  ativo?: boolean;
}

// Interface para email com múltiplas funcionalidades  
export interface EmailLocatario {
  email: string;
  tipo?: string;
  principal?: boolean;
  recebe_cobranca?: boolean;
  ativo?: boolean;
}

// Interface para formas de envio de cobrança
export interface FormaEnvioCobranca {
  tipo: 'email' | 'whatsapp' | 'imovel';
  contato: string;
  observacoes?: string;
  principal?: boolean;
  ordem?: number;
  verificado?: boolean;
}

// Interface para endereço estruturado  
export interface EnderecoEstruturado {
  id?: number;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  estado?: string;  // Alias para uf
  cep?: string;
}

// Interface expandida para representante legal
export interface RepresentanteLegalCompleto extends RepresentanteLegal {
  nome_representante?: string;
  cpf_representante?: string;  
  rg_representante?: string;
  cargo_representante?: string;
  telefone_representante?: string;
  email_representante?: string;
  endereco_representante?: EnderecoEstruturado;
}

export interface Locatario {
  id?: number;
  nome: string;
  cpf_cnpj: string;
  tipo_pessoa: 'PF' | 'PJ';
  
  // MÚLTIPLOS CONTATOS (NOVA FUNCIONALIDADE)
  telefones?: string[];  // Lista simples para compatibilidade
  emails?: string[];     // Lista simples para compatibilidade
  telefone?: string;     // Compatibilidade - telefone principal
  email?: string;        // Compatibilidade - email principal
  
  // CONTATOS DETALHADOS (NOVA FUNCIONALIDADE)
  telefones_detalhados?: TelefoneLocatario[];
  emails_detalhados?: EmailLocatario[];
  formas_envio_cobranca?: FormaEnvioCobranca[];
  
  // ENDEREÇOS HÍBRIDOS (NOVA FUNCIONALIDADE)
  endereco?: EnderecoEstruturado;        // Endereço estruturado
  endereco_estruturado?: EnderecoEstruturado; // Alias
  endereco_completo?: string;            // String formatada da view
  endereco_rua?: string;                 // Compatibilidade inline
  endereco_numero?: string;              // Compatibilidade inline
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
  Endereco_inq?: string;                 // Campo string original
  
  // CAMPOS PESSOA FÍSICA
  rg?: string;
  data_nascimento?: string;
  nacionalidade?: string;
  estado_civil?: string;
  profissao?: string;
  
  // CAMPOS PESSOA JURÍDICA EXPANDIDOS
  razao_social?: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  atividade_principal?: string;
  data_constituicao?: string;
  capital_social?: string;
  porte_empresa?: string;
  regime_tributario?: string;
  
  // REPRESENTANTE LEGAL (EXPANDIDO)
  representante_legal?: RepresentanteLegalCompleto;
  nome_representante?: string;    // Compatibilidade
  cpf_representante?: string;     // Compatibilidade
  rg_representante?: string;      // Compatibilidade
  cargo_representante?: string;   // Compatibilidade
  telefone_representante?: string;
  email_representante?: string;
  endereco_representante?: EnderecoEstruturado;
  
  // CAMPOS EXISTENTES MANTIDOS
  dados_bancarios?: DadosBancarios;
  documentos_empresa?: DocumentosEmpresa;
  tem_fiador?: boolean;
  fiador?: Fiador;
  responsavel_pgto_agua?: string;
  responsavel_pgto_luz?: string;
  responsavel_pgto_gas?: string;
  dados_empresa?: string;
  representante?: string;         // Campo legado
  dados_moradores?: string;
  tem_moradores?: boolean;
  moradores?: Morador[];
  responsavel_inq?: number | null;
  dependentes_inq?: number | null;
  qtd_dependentes_inq?: number;
  pet_inquilino?: number | null;
  qtd_pet_inquilino?: number;
  porte_pet?: string;
  
  // CÔNJUGE
  possui_conjuge?: boolean;
  existe_conjuge?: number | boolean | null;  // Compatibilidade
  nome_conjuge?: string;
  cpf_conjuge?: string;
  rg_conjuge?: string;
  endereco_conjuge?: string;
  telefone_conjuge?: string;
  regime_bens?: string;
  
  // DOCUMENTOS
  documento_pessoal?: File | string | null;
  comprovante_endereco?: File | string | null;
  
  // BOLETOS/COBRANÇA (COMPATIBILIDADE)
  forma_envio_boleto?: string[];
  email_boleto?: string;
  whatsapp_boleto?: string;
  
  // CAMPOS DIVERSOS
  observacoes?: string;
  ativo?: boolean;
  data_criacao?: string;
  data_atualizacao?: string;
  created_at?: string;
  updated_at?: string;
  
  // ESTATÍSTICAS (RETORNADAS PELA VIEW)
  telefone_principal?: string;    // Telefone principal da view
  email_principal?: string;       // Email principal da view  
  qtd_telefones?: number;         // Quantidade de telefones
  qtd_emails?: number;            // Quantidade de emails
  qtd_formas_cobranca?: number;   // Quantidade de formas de cobrança
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
