export interface Fatura {
  id: number;
  numero_fatura: string;
  contrato_id: number;
  contrato_numero: string;
  
  // Valores financeiros
  valor_aluguel: number;
  valor_iptu?: number;
  valor_condominio?: number;
  valor_fci?: number;
  valor_gas?: number;
  valor_seguro_fianca?: number;
  valor_seguro_incendio?: number;
  valor_energia?: number;
  valor_acrescimos?: number;
  valor_total: number;
  valor_liquido?: number;
  
  // Descontos e fundos
  desconto_pontualidade?: number;
  desconto_benfeitoria_1?: number;
  desconto_benfeitoria_2?: number;
  desconto_benfeitoria_3?: number;
  reembolso_fundo_obras?: number;
  fundo_reserva?: number;
  fundo_iptu?: number;
  fundo_outros?: number;
  honorario_advogados?: number;
  boleto_advogados?: number;
  
  // Datas
  data_vencimento: string;
  data_pagamento?: string | null;
  data_criacao: string;
  mes_referencia: string; // 'YYYY-MM' formato
  referencia_display: string; // 'Janeiro/2024' formato
  
  // Status
  status: 'aberta' | 'paga' | 'pendente' | 'em_atraso' | 'cancelada';
  situacao_pagamento: 'em_dia' | 'atrasado' | 'vencido' | 'quitado';
  dias_atraso: number;
  
  // Informações relacionadas
  imovel_endereco: string;
  imovel_tipo: string;
  locatario_nome: string;
  locatario_cpf: string;
  locatario_telefone?: string;
  locatario_email?: string;
  locador_nome: string;
  proprietario_nome?: string;
  proprietario_cpf?: string;
  proprietario_telefone?: string;
  proprietario_email?: string;
  
  // Observações e detalhes
  observacoes?: string;
}

export interface FaturaStats {
  todas: number;
  abertas: number;
  pendentes: number;
  pagas: number;
  em_atraso: number;
  canceladas: number;
  valor_total_aberto: number;
  valor_total_recebido: number;
  valor_total_atrasado: number;
}

export interface FaturaFilters {
  status?: string[];
  mes?: string;
  ano?: string;
  search?: string;
  locador_id?: number;
  contrato_id?: number;
  valor_min?: number;
  valor_max?: number;
  situacao_pagamento?: string[];
}

export interface FaturasResponse {
  data: Fatura[];
  total: number;
  page: number;
  pages: number;
  stats: FaturaStats;
}

export interface FaturaDetalhada extends Fatura {
  historico_pagamentos: HistoricoPagamento[];
  lancamentos_extras: LancamentoExtra[];
}

export interface HistoricoPagamento {
  id: number;
  fatura_id: number;
  data_pagamento: string;
  valor_pago: number;
  forma_pagamento: string;
  observacoes?: string;
  comprovante?: string;
}

export interface LancamentoExtra {
  id: number;
  fatura_id: number;
  tipo: 'acrescimo' | 'desconto' | 'taxa' | 'multa';
  descricao: string;
  valor: number;
  data_lancamento: string;
}

export interface GerarBoletoRequest {
  fatura_id: number;
  data_vencimento?: string;
  valor_personalizado?: number;
  observacoes?: string;
}

export interface BoletoResponse {
  url_boleto: string;
  codigo_barras: string;
  linha_digitavel: string;
  data_vencimento: string;
  valor: number;
}