export * from './Endereco';
export * from './DadosBancarios';
export * from './RepresentanteLegal';
export * from './DocumentosEmpresa';
export * from './Locador';
export * from './Fiador';
export * from './Morador';
export * from './Locatario';
export * from './Imovel';
export * from './PlanoLocacao';
export * from './Contrato';
export * from './ApiResponse';
export * from './CalculoPrestacao';
export * from './PrestacaoContas';

// Interfaces para boletos
export interface Boleto {
  id?: number;
  contrato_id: number;
  mes_referencia: string;
  ano_referencia?: number;
  valor_aluguel: number;
  valor_total: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'atrasado';
}

export interface GerarBoletoRequest {
  contrato_id: number;
  data_vencimento: string;
  valor: number;
  mes_referencia?: string;
  descricao?: string;
}

export interface RecalcularBoletoRequest {
  boleto_id: number;
  novo_valor: number;
  nova_data_vencimento?: string;
}

export interface RecalcularBoletoResponse {
  id: number;
  valor_antigo: number;
  valor_novo: number;
  data_recalculo: string;
}

export interface RegistrarPagamentoRequest {
  boleto_id: number;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: string;
}

export interface IndiceCorrecao {
  id: number;
  nome: string;
  valor: number;
  data_referencia: string;
}

export interface RelatorioMensal {
  mes: string;
  total_receitas: number;
  total_despesas: number;
  saldo_liquido: number;
  contratos_ativos: number;
  estatisticas?: {
    total_faturas: number;
    faturas_pagas: number;
    faturas_pendentes: number;
  };
}