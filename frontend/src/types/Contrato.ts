import type { PlanoLocacao } from './';

export interface Contrato {
  id_imovel: number;
  id_inquilino: number;
  data_inicio: string;
  data_fim: string;
  plano_locacao?: PlanoLocacao;
  id_plano_locacao?: number;
  taxa_administracao: number;
  fundo_conservacao: number;
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
  
  // Renovação/Reajuste melhorada
  tempo_renovacao?: number; // em meses
  tempo_reajuste?: number; // em meses
  indice_reajuste?: string;
  
  // Corretor
  tem_corretor?: boolean;
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
    nome: string;
    tipo: string;
    raca?: string;
    idade?: number;
    vacinacao_em_dia: boolean;
  }>;
}
