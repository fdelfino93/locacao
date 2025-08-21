import type { 
  Boleto, 
  GerarBoletoRequest, 
  RecalcularBoletoRequest,
  RecalcularBoletoResponse,
  RegistrarPagamentoRequest,
  IndiceCorrecao,
  RelatorioMensal,
  ApiResponse 
} from '../types';

const API_BASE_URL = '/api'; // usa proxy do vite

class BoletosApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Gera um novo boleto para um contrato
   */
  async gerarBoleto(dados: GerarBoletoRequest): Promise<ApiResponse<{ boleto_id: number; valor_total: number }>> {
    return this.request('/boletos/gerar', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  /**
   * Obtém dados completos de um boleto específico
   */
  async obterBoleto(boletoId: number): Promise<ApiResponse<Boleto>> {
    return this.request(`/boletos/${boletoId}`);
  }

  /**
   * Recalcula um boleto aplicando acréscimos por atraso
   */
  async recalcularBoleto(
    boletoId: number, 
    dados: RecalcularBoletoRequest = {}
  ): Promise<ApiResponse<RecalcularBoletoResponse>> {
    return this.request(`/boletos/${boletoId}/recalcular`, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  /**
   * Lista todos os boletos de um contrato
   */
  async listarBoletosContrato(contratoId: number): Promise<ApiResponse<Boleto[]>> {
    return this.request(`/boletos/contrato/${contratoId}`);
  }

  /**
   * Registra o pagamento de um boleto
   */
  async registrarPagamento(
    boletoId: number, 
    dados: RegistrarPagamentoRequest = {}
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/boletos/${boletoId}/pagar`, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  /**
   * Lista os índices de correção disponíveis
   */
  async listarIndicesCorrecao(): Promise<ApiResponse<IndiceCorrecao[]>> {
    return this.request('/indices-correcao');
  }

  /**
   * Gera relatório mensal de boletos
   */
  async relatorioMensal(mes: number, ano: number): Promise<ApiResponse<RelatorioMensal>> {
    return this.request(`/boletos/relatorio-mensal?mes=${mes}&ano=${ano}`);
  }

  /**
   * Gera boleto automaticamente para o próximo mês de um contrato
   */
  async gerarBoletoProximoMes(contratoId: number): Promise<ApiResponse<{ boleto_id: number; valor_total: number }>> {
    const hoje = new Date();
    const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
    
    // Data de vencimento: dia 10 do próximo mês (pode ser configurável)
    const dataVencimento = new Date(proximoMes.getFullYear(), proximoMes.getMonth(), 10);
    
    const dados: GerarBoletoRequest = {
      contrato_id: contratoId,
      mes_referencia: proximoMes.getMonth() + 1,
      ano_referencia: proximoMes.getFullYear(),
      data_vencimento: dataVencimento.toISOString().split('T')[0]
    };

    return this.gerarBoleto(dados);
  }

  /**
   * Verifica se existe boleto para um período específico
   */
  async verificarBoletoExistente(contratoId: number, mes: number, ano: number): Promise<boolean> {
    try {
      const response = await this.listarBoletosContrato(contratoId);
      if (response.success && response.data) {
        return response.data.some(boleto => 
          boleto.mes_referencia === mes && boleto.ano_referencia === ano
        );
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar boleto existente:', error);
      return false;
    }
  }

  /**
   * Calcula próxima data de vencimento baseada no dia de vencimento do contrato
   */
  calcularProximaDataVencimento(diaVencimento: number, mesReferencia: number, anoReferencia: number): string {
    // Garantir que o dia não seja inválido para o mês
    const ultimoDiaDoMes = new Date(anoReferencia, mesReferencia, 0).getDate();
    const diaAjustado = Math.min(diaVencimento, ultimoDiaDoMes);
    
    const dataVencimento = new Date(anoReferencia, mesReferencia - 1, diaAjustado);
    return dataVencimento.toISOString().split('T')[0];
  }

  /**
   * Formata valor monetário para exibição
   */
  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  /**
   * Formata data para exibição
   */
  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  /**
   * Calcula dias de atraso
   */
  calcularDiasAtraso(dataVencimento: string): number {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    
    if (vencimento >= hoje) {
      return 0;
    }
    
    const diferenca = hoje.getTime() - vencimento.getTime();
    return Math.floor(diferenca / (1000 * 60 * 60 * 24));
  }

  /**
   * Determina status do boleto baseado nas datas
   */
  determinarStatus(boleto: Boleto): 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO' {
    if (boleto.data_pagamento) {
      return 'PAGO';
    }
    
    const diasAtraso = this.calcularDiasAtraso(boleto.data_vencimento);
    return diasAtraso > 0 ? 'ATRASADO' : 'PENDENTE';
  }

  /**
   * Gera lote de boletos para múltiplos contratos
   */
  async gerarLoteBoletos(
    contratos: number[], 
    mes: number, 
    ano: number,
    diaVencimento: number = 10
  ): Promise<{ sucessos: number; erros: string[] }> {
    const resultados = {
      sucessos: 0,
      erros: [] as string[]
    };

    for (const contratoId of contratos) {
      try {
        // Verificar se já existe boleto
        const jaExiste = await this.verificarBoletoExistente(contratoId, mes, ano);
        if (jaExiste) {
          resultados.erros.push(`Contrato ${contratoId}: Boleto já existe para ${mes}/${ano}`);
          continue;
        }

        const dataVencimento = this.calcularProximaDataVencimento(diaVencimento, mes, ano);
        
        await this.gerarBoleto({
          contrato_id: contratoId,
          mes_referencia: mes,
          ano_referencia: ano,
          data_vencimento: dataVencimento
        });
        
        resultados.sucessos++;
      } catch (error) {
        resultados.erros.push(`Contrato ${contratoId}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    return resultados;
  }

  /**
   * Obtém estatísticas rápidas de boletos
   */
  async obterEstatisticasRapidas(mes?: number, ano?: number): Promise<{
    total: number;
    pagos: number;
    pendentes: number;
    atrasados: number;
    valorTotal: number;
    valorRecebido: number;
  }> {
    try {
      const mesAtual = mes || new Date().getMonth() + 1;
      const anoAtual = ano || new Date().getFullYear();
      
      const response = await this.relatorioMensal(mesAtual, anoAtual);
      
      if (response.success && response.data) {
        const stats = response.data.estatisticas;
        return {
          total: stats.total_boletos,
          pagos: stats.boletos_pagos,
          pendentes: stats.boletos_pendentes,
          atrasados: stats.boletos_atrasados,
          valorTotal: stats.valor_total_mes,
          valorRecebido: stats.valor_recebido
        };
      }
      
      return {
        total: 0,
        pagos: 0,
        pendentes: 0,
        atrasados: 0,
        valorTotal: 0,
        valorRecebido: 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        total: 0,
        pagos: 0,
        pendentes: 0,
        atrasados: 0,
        valorTotal: 0,
        valorRecebido: 0
      };
    }
  }
}

export const boletosApiService = new BoletosApiService();