// Tipos para o Sistema de Geração de Boletos

export interface ComponenteBoleto {
  id?: number;
  tipo_componente: string;
  descricao: string;
  valor_original: number;
  valor_final: number;
  tem_acrescimo: boolean;
  percentual_acrescimo?: number;
  valor_acrescimo_juros?: number;
  valor_acrescimo_multa?: number;
  valor_acrescimo_correcao?: number;
}

export interface Boleto {
  id: number;
  contrato_id: number;
  mes_referencia: number;
  ano_referencia: number;
  data_vencimento: string;
  data_pagamento?: string;
  data_geracao: string;
  valor_total: number;
  valor_acrescimos: number;
  dias_atraso: number;
  status_pagamento: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
  observacoes?: string;
  
  // Dados relacionados
  locatario_nome?: string;
  locatario_cpf?: string;
  locatario_email?: string;
  locatario_telefone?: string;
  imovel_endereco?: string;
  
  // Componentes do boleto
  componentes?: ComponenteBoleto[];
}

export interface GerarBoletoRequest {
  contrato_id: number;
  mes_referencia: number;
  ano_referencia: number;
  data_vencimento: string;
}

export interface RecalcularBoletoRequest {
  indice_correcao?: 'IGPM' | 'IPCA';
}

export interface RecalcularBoletoResponse {
  dias_atraso: number;
  valor_acrescimos: number;
  valor_total_original: number;
  valor_total_novo: number;
  indice_aplicado: string;
  percentual_indice: number;
}

export interface RegistrarPagamentoRequest {
  data_pagamento?: string;
  observacoes?: string;
}

export interface IndiceCorrecao {
  nome_indice: string;
  mes: number;
  ano: number;
  valor_percentual: number;
  fonte: string;
}

export interface RelatorioMensal {
  periodo: {
    mes: number;
    ano: number;
  };
  estatisticas: {
    total_boletos: number;
    boletos_pagos: number;
    boletos_pendentes: number;
    boletos_atrasados: number;
    valor_total_mes: number;
    valor_recebido: number;
    total_acrescimos: number;
    taxa_inadimplencia: number;
  };
  boletos: Array<{
    id: number;
    data_vencimento: string;
    valor_total: number;
    valor_acrescimos: number;
    status_pagamento: string;
    dias_atraso: number;
    locatario_nome: string;
    endereco: string;
  }>;
}

export interface HistoricoBoleto {
  id: number;
  boleto_id: number;
  acao: string;
  descricao: string;
  valor_anterior?: number;
  valor_novo?: number;
  usuario_id?: number;
  data_acao: string;
}

// Constantes para tipos de componentes
export const TIPOS_COMPONENTE = {
  ALUGUEL: 'ALUGUEL',
  IPTU: 'IPTU',
  SEGURO_FIANCA: 'SEGURO_FIANCA',
  SEGURO_INCENDIO: 'SEGURO_INCENDIO',
  CONDOMINIO: 'CONDOMINIO',
  ENERGIA: 'ENERGIA',
  GAS: 'GAS',
  FCI: 'FCI',
  DESCONTO_PONTUALIDADE: 'DESCONTO_PONTUALIDADE',
  DESCONTO_BENFEITORIA_1: 'DESCONTO_BENFEITORIA_1',
  DESCONTO_BENFEITORIA_2: 'DESCONTO_BENFEITORIA_2',
  DESCONTO_BENFEITORIA_3: 'DESCONTO_BENFEITORIA_3'
} as const;

// Configurações para cálculo de acréscimos
export const CONFIGURACOES_ACRESCIMOS = {
  JUROS_MORA_MENSAL: 0.01, // 1% ao mês
  MULTA_ATRASO: 0.02, // 2% sobre o valor
  JUROS_DIARIO: 0.000333 // Aproximação de 1% mensal dividido por 30 dias
} as const;

// Componentes que podem ter acréscimo por atraso
export const COMPONENTES_COM_ACRESCIMO = [
  TIPOS_COMPONENTE.ALUGUEL,
  TIPOS_COMPONENTE.FCI,
  TIPOS_COMPONENTE.SEGURO_FIANCA,
  TIPOS_COMPONENTE.SEGURO_INCENDIO,
  TIPOS_COMPONENTE.CONDOMINIO
] as const;

// Labels amigáveis para os tipos de componentes
export const LABELS_COMPONENTES: Record<string, string> = {
  [TIPOS_COMPONENTE.ALUGUEL]: 'Aluguel',
  [TIPOS_COMPONENTE.IPTU]: 'IPTU',
  [TIPOS_COMPONENTE.SEGURO_FIANCA]: 'Seguro Fiança',
  [TIPOS_COMPONENTE.SEGURO_INCENDIO]: 'Seguro Incêndio',
  [TIPOS_COMPONENTE.CONDOMINIO]: 'Condomínio',
  [TIPOS_COMPONENTE.ENERGIA]: 'Energia Elétrica',
  [TIPOS_COMPONENTE.GAS]: 'Gás',
  [TIPOS_COMPONENTE.FCI]: 'FCI',
  [TIPOS_COMPONENTE.DESCONTO_PONTUALIDADE]: 'Desconto Pontualidade',
  [TIPOS_COMPONENTE.DESCONTO_BENFEITORIA_1]: 'Desconto Benfeitoria 1',
  [TIPOS_COMPONENTE.DESCONTO_BENFEITORIA_2]: 'Desconto Benfeitoria 2',
  [TIPOS_COMPONENTE.DESCONTO_BENFEITORIA_3]: 'Desconto Benfeitoria 3'
};

// Cores para status de boletos
export const CORES_STATUS_BOLETO: Record<string, string> = {
  PENDENTE: 'blue',
  PAGO: 'green', 
  ATRASADO: 'red',
  CANCELADO: 'gray'
};

// Labels para status de boletos
export const LABELS_STATUS_BOLETO: Record<string, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ATRASADO: 'Em Atraso',
  CANCELADO: 'Cancelado'
};