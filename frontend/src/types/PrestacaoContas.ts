export interface ProprietarioImovel {
  id: number;
  contrato_id: number;
  nome_proprietario: string;
  cpf_cnpj: string;
  email?: string;
  telefone?: string;
  percentual_propriedade: number;
  chave_pix?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  ativo: boolean;
}

export interface ValorRetido {
  id: number;
  prestacao_id: number;
  tipo_retencao: string;
  descricao: string;
  valor: number;
  percentual?: number;
}

export interface RepasseProprietario {
  id: number;
  prestacao_id: number;
  proprietario_id: number;
  proprietario: ProprietarioImovel;
  valor_repasse: number;
  data_repasse?: string;
  comprovante_pix?: string;
  status: 'PENDENTE' | 'REALIZADO';
}

export interface PrestacaoContas {
  id: number;
  boleto_id?: number;
  contrato_id: number;
  mes_referencia: number;
  ano_referencia: number;
  data_vencimento?: string;
  data_pagamento?: string;
  valor_total_boleto: number;
  valor_total_acrescimos: number;
  valor_total_retido: number;
  valor_total_repasse: number;
  status: 'PENDENTE' | 'PROCESSADA' | 'REPASSADA';
  data_criacao: string;
  data_repasse?: string;
  valores_retidos: ValorRetido[];
  repasses: RepasseProprietario[];
  proprietarios: ProprietarioImovel[];
  locatario_nome?: string;
  imovel_endereco?: string;
  numero_boleto?: string;
}

export interface ConfiguracaoRetencoes {
  id: number;
  percentual_admin: number;
  taxa_boleto: number;
  taxa_transferencia: number;
  ativo: boolean;
}

export interface PrestacaoContasStats {
  total_prestacoes: number;
  valor_total_boletos: number;
  valor_total_retido: number;
  valor_total_repasses: number;
  prestacoes_pendentes: number;
  prestacoes_processadas: number;
  prestacoes_repassadas: number;
}