export interface PrestacaoContas {
  id?: number;
  cliente_id: number;
  mes: string;
  ano: string;
  referencia: string; // mês/ano formatado
  
  // Valores financeiros
  valor_pago: number;
  valor_vencido: number;
  encargos: number;
  deducoes: number;
  total_bruto: number;
  total_liquido: number;
  
  // Status
  status: 'pago' | 'pendente' | 'atrasado' | 'vencido';
  pagamento_atrasado: boolean;
  
  // Observações e ajustes
  observacoes_manuais?: string;
  observacoes?: string;
  
  // Datas
  data_criacao?: string;
  data_atualizacao?: string;
  
  // Lançamentos detalhados
  lancamentos?: LancamentoPrestacao[];
}

export interface LancamentoPrestacao {
  id?: number;
  prestacao_id?: number;
  tipo: 'receita' | 'despesa' | 'taxa' | 'desconto';
  descricao: string;
  valor: number;
  data_lancamento?: string;
}