import { 
  CalculoPrestacaoRequest, 
  CalculoPrestacaoResponse, 
  PrestacaoContasSalvar,
  BoletoRequest,
  BoletoResponse,
  ContratoResumo
} from '@/types/CalculoPrestacao';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class CalculoPrestacaoApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          errorData.message || 
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(`✅ API Response:`, data);
      return data;
      
    } catch (error) {
      console.error(`❌ API Error:`, error);
      throw error;
    }
  }

  // Buscar contratos ativos para seleção
  async buscarContratosAtivos(): Promise<ContratoResumo[]> {
    try {
      const response = await this.request<{data: ContratoResumo[]}>('/contratos?status=ativo&fields=resumo');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      throw error;
    }
  }

  // Buscar detalhes de um contrato específico
  async buscarDetalhesContrato(contratoId: number): Promise<ContratoResumo> {
    try {
      const response = await this.request<ContratoResumo>(`/contratos/${contratoId}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar detalhes do contrato:', error);
      throw error;
    }
  }

  // Calcular prestação de contas
  async calcularPrestacao(dados: CalculoPrestacaoRequest): Promise<CalculoPrestacaoResponse> {
    try {
      console.log('📊 Enviando dados para cálculo:', dados);
      
      const response = await this.request<CalculoPrestacaoResponse>(
        '/api/contratos/calcular-prestacao',
        {
          method: 'POST',
          body: JSON.stringify(dados),
        }
      );
      
      console.log('✅ Resultado do cálculo recebido:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Erro no cálculo da prestação:', error);
      throw error;
    }
  }

  // Salvar prestação de contas calculada
  async salvarPrestacao(dados: PrestacaoContasSalvar): Promise<{id: number; message: string}> {
    try {
      console.log('💾 Salvando prestação de contas:', dados);
      
      const response = await this.request<{id: number; message: string}>(
        '/api/prestacoes-contas',
        {
          method: 'POST',
          body: JSON.stringify(dados),
        }
      );
      
      console.log('✅ Prestação salva com sucesso:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Erro ao salvar prestação:', error);
      throw error;
    }
  }

  // Gerar boleto para prestação
  async gerarBoleto(dados: BoletoRequest): Promise<BoletoResponse> {
    try {
      console.log('📋 Gerando boleto:', dados);
      
      const response = await this.request<BoletoResponse>(
        '/api/boletos/gerar',
        {
          method: 'POST',
          body: JSON.stringify(dados),
        }
      );
      
      console.log('✅ Boleto gerado com sucesso:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Erro ao gerar boleto:', error);
      throw error;
    }
  }

  // Buscar histórico de prestações de um contrato
  async buscarHistoricoPrestacoes(contratoId: number): Promise<PrestacaoContasSalvar[]> {
    try {
      const response = await this.request<{data: PrestacaoContasSalvar[]}>(
        `/api/prestacoes-contas?contrato_id=${contratoId}`
      );
      
      return response.data || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      throw error;
    }
  }

  // Validar dados antes do cálculo
  validarDadosCalculo(dados: CalculoPrestacaoRequest): {valido: boolean; erros: string[]} {
    const erros: string[] = [];

    if (!dados.contrato_id) {
      erros.push('ID do contrato é obrigatório');
    }

    if (!dados.data_entrada) {
      erros.push('Data de entrada é obrigatória');
    }

    if (!dados.data_saida) {
      erros.push('Data de saída é obrigatória');
    }

    if (dados.data_entrada && dados.data_saida) {
      const entrada = new Date(dados.data_entrada);
      const saida = new Date(dados.data_saida);
      
      if (saida <= entrada) {
        erros.push('Data de saída deve ser posterior à data de entrada');
      }
    }

    if (!dados.tipo_calculo) {
      erros.push('Tipo de cálculo é obrigatório');
    }

    if (dados.desconto < 0 || dados.desconto > 100) {
      erros.push('Desconto deve estar entre 0% e 100%');
    }

    if (dados.multa < 0) {
      erros.push('Multa não pode ser negativa');
    }

    // Validar valores mensais
    const valoresMensais = Object.values(dados.valores_mensais || {});
    if (valoresMensais.length === 0) {
      erros.push('Pelo menos um valor mensal deve ser informado');
    }

    valoresMensais.forEach((valor, index) => {
      if (valor < 0) {
        erros.push(`Valor mensal ${index + 1} não pode ser negativo`);
      }
    });

    // Validar lançamentos adicionais
    dados.lancamentos_adicionais?.forEach((lancamento, index) => {
      if (!lancamento.descricao?.trim()) {
        erros.push(`Descrição do lançamento ${index + 1} é obrigatória`);
      }
      
      if (lancamento.valor < 0) {
        erros.push(`Valor do lançamento ${index + 1} não pode ser negativo`);
      }
      
      if (!['debito', 'credito'].includes(lancamento.tipo)) {
        erros.push(`Tipo do lançamento ${index + 1} deve ser 'debito' ou 'credito'`);
      }
    });

    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Formatar dados para envio à API
  formatarDadosParaAPI(dados: CalculoPrestacaoRequest): CalculoPrestacaoRequest {
    return {
      ...dados,
      // Garantir formato de data correto
      data_entrada: new Date(dados.data_entrada).toISOString().split('T')[0],
      data_saida: new Date(dados.data_saida).toISOString().split('T')[0],
      
      // Garantir valores numéricos
      desconto: Number(dados.desconto) || 0,
      multa: Number(dados.multa) || 0,
      
      // Limpar valores mensais
      valores_mensais: Object.fromEntries(
        Object.entries(dados.valores_mensais || {})
          .filter(([, valor]) => valor > 0)
          .map(([nome, valor]) => [nome, Number(valor)])
      ),
      
      // Limpar lançamentos
      lancamentos_adicionais: (dados.lancamentos_adicionais || [])
        .filter(l => l.descricao?.trim() && l.valor > 0)
        .map(l => ({
          ...l,
          valor: Number(l.valor),
          descricao: l.descricao.trim()
        }))
    };
  }
}

// Instância singleton do serviço
export const calculoPrestacaoApi = new CalculoPrestacaoApiService();

// Exportar a classe também para casos onde é necessário criar instâncias customizadas
export default CalculoPrestacaoApiService;