import type { PlanoLocacao } from './';

export interface ContratoLocador {
  id?: number;
  locador_id: number;
  locador_nome?: string;
  locador_documento?: string;
  conta_bancaria_id: number;
  conta_tipo_recebimento?: string;
  conta_chave_pix?: string;
  conta_banco?: string;
  conta_agencia?: string;
  conta_conta?: string;
  conta_tipo_conta?: string;
  conta_titular?: string;
  conta_cpf_titular?: string;
  porcentagem: number;
  data_criacao?: string;
}

export interface ContaBancariaLocador {
  id: number;
  tipo_recebimento: string;
  chave_pix?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: string;
  titular?: string;
  cpf_titular?: string;
  principal: boolean;
  ativo: boolean;
  descricao: string;
}

export interface LocadorOption {
  id: number;
  nome: string;
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
}

export interface ContratoLocatario {
  id?: number;
  locatario_id: number;
  locatario_nome?: string;
  locatario_cpf?: string;
  locatario_telefone?: string;
  locatario_email?: string;
  responsabilidade_principal?: boolean;
}

export interface Contrato {
  id_imovel: number;
  id_inquilino: number;
  utilizacao_imovel?: 'residencial' | 'comercial';
  data_inicio: string;
  data_fim: string;
  data_entrega_chaves?: string; // Nova: Data de entrega das chaves
  periodo_contrato?: number; // Nova: Período em meses para cálculo automático
  plano_locacao?: PlanoLocacao;
  id_plano_locacao?: number;
  taxa_administracao: number;
  fundo_conservacao: number;
  multa_atraso?: number;
  tipo_reajuste: string;
  percentual_reajuste: number;
  vencimento_dia: number;
  renovacao_automatica: boolean;
  seguro_obrigatorio: boolean;
  clausulas_adicionais: string;
  tipo_plano_locacao: string;

  // Valores estruturados
  valor_aluguel?: number;
  valor_iptu?: number;
  valor_condominio?: number;

  // Antecipação estruturada
  antecipa_condominio?: boolean;
  antecipa_seguro_fianca?: boolean;
  antecipa_seguro_incendio?: boolean;

  // Retidos estruturados
  retido_fci?: boolean;
  retido_iptu?: boolean;
  retido_condominio?: boolean;
  retido_seguro_fianca?: boolean;
  retido_seguro_incendio?: boolean;

  // Datas de seguro estruturadas
  seguro_fianca_inicio?: string;
  seguro_fianca_fim?: string;
  seguro_incendio_inicio?: string;
  seguro_incendio_fim?: string;

  // Campos legados
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
  
  // Seguros e Serviços
  deseja_fci?: string;
  deseja_seguro_fianca?: string;
  deseja_seguro_incendio?: string;
  
  // Valores de seguros separados
  valor_fci?: number;
  valor_seguro_fianca?: number;
  valor_seguro_incendio?: number;
  
  // Parcelamento de seguros
  parcelas_seguro_fianca?: number;
  parcelas_seguro_incendio?: number;
  
  // Datas dos seguros
  data_inicio_seguro_fianca?: string;
  data_fim_seguro_fianca?: string;
  data_inicio_seguro_incendio?: string;
  data_fim_seguro_incendio?: string;
  
  // IPTU
  parcelas_iptu?: number;
  data_inicio_iptu?: string;
  data_fim_iptu?: string;
  
  // Garantias - Fiadores
  fiadores?: Array<{
    id?: number;
    nome: string;
    cpf_cnpj: string;
    telefone?: string;
    email?: string;
    endereco?: {
      rua?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cidade?: string;
      uf?: string;
      cep?: string;
    };
    renda?: number;
    profissao?: string;
    estado_civil?: string;
    documentos_arquivo?: {
      nome: string;
      tipo: string;
      tamanho: number;
      url?: string;
      data_upload?: string;
    };
  }>;
  
  // Garantias - Caução
  caucao?: {
    valor: number;
    tipo: 'dinheiro' | 'titulo' | 'imovel';
    descricao?: string;
    banco?: string;
    agencia?: string;
    conta?: string;
    data_deposito?: string;
    comprovante_arquivo?: {
      nome: string;
      tipo: string;
      tamanho: number;
      url?: string;
      data_upload?: string;
    };
  };
  
  // Garantias - Título de Capitalização
  titulo_capitalizacao?: {
    seguradora: string;
    numero_titulo: string;
    valor_nominal: number;
    valor_resgate: number;
    data_inicio: string;
    data_vencimento: string;
    numero_sorteios?: number;
    titulo_arquivo?: {
      nome: string;
      tipo: string;
      tamanho: number;
      url?: string;
      data_upload?: string;
    };
  };
  
  // Garantias - Seguro Fiança (informações da apólice)
  apolice_seguro_fianca?: {
    seguradora: string;
    numero_apolice: string;
    valor_cobertura: number;
    data_inicio: string;
    data_fim: string;
    premio: number;
    contrato_arquivo?: {
      nome: string;
      tipo: string;
      tamanho: number;
      url?: string;
      data_upload?: string;
    };
  };
  
  // Renovação/Reajuste melhorada
  tempo_renovacao?: number; // em meses
  tempo_reajuste?: number; // em meses
  indice_reajuste?: string;
  proximo_reajuste_automatico?: boolean; // Nova: Próximo reajuste automático
  
  // Corretor
  tem_corretor?: boolean;
  corretor_nome?: string;
  corretor_creci?: string;
  corretor_cpf?: string;
  corretor_telefone?: string;
  corretor_email?: string;
  dados_bancarios_corretor?: {
    banco?: string;
    agencia?: string;
    conta?: string;
    tipo_conta?: string;
    chave_pix?: string;
  };
  
  
  // Animais de estimação
  quantidade_pets?: number;
  pets?: Array<{
    raca: string;
    tamanho: string;
  }>;

  // Obrigações Adicionais
  obrigacao_manutencao?: boolean;
  obrigacao_pintura?: boolean;
  obrigacao_jardim?: boolean;
  obrigacao_limpeza?: boolean;
  obrigacao_pequenos_reparos?: boolean;
  obrigacao_vistoria?: boolean;

  // Multas por Quebra de Contrato
  multa_locador?: number;
  multa_locatario?: number;
  
  // Locadores associados ao contrato
  locadores?: ContratoLocador[];
  
  // Locatários associados ao contrato
  locatarios?: ContratoLocatario[];
}
