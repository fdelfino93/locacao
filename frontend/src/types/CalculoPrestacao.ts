export interface CalculoPrestacaoRequest {
  contrato_id: number;
  data_entrada: string;
  data_saida: string;
  tipo_calculo: 'Entrada' | 'Saída' | 'Entrada + Proporcional' | 'Total' | 'Rescisão';
  valores_mensais: {[key: string]: number};
  lancamentos_adicionais: LancamentoAdicional[];
  desconto: number; // Percentual (0-100)
  multa: number; // Valor fixo
  observacoes?: string;
}

export interface LancamentoAdicional {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'debito' | 'credito';
}

export interface CalculoPrestacaoResponse {
  // Valores calculados
  proporcional_entrada: number;
  meses_completos: number;
  qtd_meses_completos: number;
  proporcional_saida: number;
  
  // Lançamentos e ajustes
  lancamentos_adicionais: LancamentoDetalhado[];
  desconto: number;
  multa: number;
  percentual_desconto: number;
  
  // Totais
  total: number;
  valor_boleto: number; // Valor que o inquilino paga
  valor_repassado_locadores: number; // Valor líquido para os proprietários
  valor_retido: number; // Valor retido pela administradora
  
  // Breakdown da retenção
  breakdown_retencao: {
    taxa_admin: number;
    seguro: number;
    outros: number;
  };
  percentual_admin: number;
  
  // Metadados
  periodo_dias: number;
  data_calculo: string;
  contrato_dados: ContratoResumo;
}

export interface LancamentoDetalhado extends LancamentoAdicional {
  data_lancamento?: string;
  aplicado_calculo: boolean;
}

export interface ContratoResumo {
  id: number;
  numero: string;
  locatario_nome: string;
  locador_nome: string;
  imovel_endereco: string;
  valor_aluguel: number;
  status: string;
}

export interface PrestacaoContasSalvar {
  contrato_id: number;
  configuracao: {
    data_entrada: string;
    data_saida: string;
    tipo_calculo: string;
    desconto: number;
    multa: number;
    observacoes: string;
  };
  valores_mensais: {[key: string]: number};
  lancamentos_adicionais: LancamentoAdicional[];
  resultado: CalculoPrestacaoResponse;
  data_criacao: string;
  usuario_id?: number;
}

export interface BoletoRequest {
  contrato_id: number;
  valor: number;
  data_vencimento: string;
  descricao: string;
  observacoes?: string;
  tipo_cobranca: 'prestacao_contas';
  prestacao_id?: number;
}

export interface BoletoResponse {
  id: number;
  codigo_barras: string;
  linha_digitavel: string;
  url_boleto: string;
  data_vencimento: string;
  valor: number;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  data_criacao: string;
}

// Constantes para maior type safety
export const TipoCalculo = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída', 
  PERIODO_COMPLETO: 'Entrada + Proporcional',
  TOTAL: 'Total',
  RESCISAO: 'Rescisão'
} as const;

export const TipoLancamento = {
  DEBITO: 'debito',
  CREDITO: 'credito'
} as const;

export const StatusBoleto = {
  PENDENTE: 'pendente',
  PAGO: 'pago',
  VENCIDO: 'vencido',
  CANCELADO: 'cancelado'
} as const;