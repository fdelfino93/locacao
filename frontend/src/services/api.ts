import type { Locador, Locatario, Imovel, Contrato, ApiResponse } from '../types';

// Tipos específicos para Dashboard
export interface DashboardMetricas {
  total_contratos: number;
  contratos_ativos: number;
  receita_mensal: number;
  crescimento_percentual: number;
  total_clientes: number;
  novos_clientes_mes: number;
}

export interface DashboardOcupacao {
  taxa_ocupacao: number;
  unidades_ocupadas: number;
  unidades_totais: number;
  unidades_disponiveis: number;
  ocupacao_por_tipo: Array<{
    tipo: string;
    total: number;
    ocupadas: number;
    percentual: number;
  }>;
}

export interface DashboardVencimento {
  id: number;
  cliente_nome: string;
  contrato_numero: string;
  data_vencimento: string;
  valor: number;
  dias_para_vencer: number;
  status: string;
}

export interface DashboardAlerta {
  id: number;
  tipo: string;
  titulo: string;
  descricao: string;
  severidade: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
  data_criacao: string;
  ativo: boolean;
}

export interface DashboardCompleto {
  metricas: DashboardMetricas;
  ocupacao: DashboardOcupacao;
  vencimentos: DashboardVencimento[];
  alertas: DashboardAlerta[];
  timestamp: string;
}

const API_BASE_URL = '/api'; // usa proxy do vite

class ApiService {
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

  // Métodos para Locadores
  async criarLocador(locador: Locador): Promise<ApiResponse<any>> {
    return this.request('/locadores', {
      method: 'POST',
      body: JSON.stringify(locador),
    });
  }

  async listarLocadores(): Promise<ApiResponse<any[]>> {
    return this.request('/locadores');
  }

  // Métodos para Locatarios
  async criarLocatario(locatario: Locatario): Promise<ApiResponse<any>> {
    return this.request('/locatarios', {
      method: 'POST',
      body: JSON.stringify(locatario),
    });
  }

  async listarLocatarios(): Promise<ApiResponse<any[]>> {
    return this.request('/locatarios');
  }

  // Métodos para Imóveis
  async criarImovel(imovel: Imovel): Promise<ApiResponse<any>> {
    return this.request('/imoveis', {
      method: 'POST',
      body: JSON.stringify(imovel),
    });
  }

  async listarImoveis(): Promise<ApiResponse<any[]>> {
    return this.request('/imoveis');
  }

  // Métodos para Contratos
  async criarContrato(contrato: Contrato): Promise<ApiResponse<any>> {
    return this.request('/contratos', {
      method: 'POST',
      body: JSON.stringify(contrato),
    });
  }

  async listarContratos(): Promise<ApiResponse<any[]>> {
    return this.request('/contratos');
  }

  // Métodos do Dashboard
  async obterMetricasDashboard(): Promise<DashboardMetricas> {
    const response = await fetch(`${API_BASE_URL}/dashboard/metricas`);
    if (!response.ok) throw new Error('Erro ao buscar métricas');
    return response.json();
  }

  async obterOcupacaoDashboard(): Promise<DashboardOcupacao> {
    const response = await fetch(`${API_BASE_URL}/dashboard/ocupacao`);
    if (!response.ok) throw new Error('Erro ao buscar ocupação');
    return response.json();
  }

  async obterVencimentosDashboard(dias: number = 30): Promise<DashboardVencimento[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/vencimentos?dias=${dias}`);
    if (!response.ok) throw new Error('Erro ao buscar vencimentos');
    return response.json();
  }

  async obterAlertasDashboard(): Promise<DashboardAlerta[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/alertas`);
    if (!response.ok) throw new Error('Erro ao buscar alertas');
    return response.json();
  }

  async obterDashboardCompleto(mes?: number, ano?: number): Promise<DashboardCompleto> {
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes.toString());
    if (ano) params.append('ano', ano.toString());
    
    const response = await fetch(`${API_BASE_URL}/dashboard/completo?${params}`);
    if (!response.ok) throw new Error('Erro ao buscar dashboard');
    return response.json();
  }

  async obterAlertasDashboardFiltrados(ativosApenas: boolean = true): Promise<DashboardAlerta[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/alertas?ativos_apenas=${ativosApenas}`);
    if (!response.ok) throw new Error('Erro ao buscar alertas');
    return response.json();
  }

  // Método público para requests customizados  
  public async requestPublic<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> {
    // Normalizar endpoint - adicionar / no início se não existir
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const result = await this.request<T>(normalizedEndpoint, options);
    return { data: result.data || result as any };
  }

  // Verifica se a API está viva
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch('/health'); // também usa proxy
    return response.json();
  }
}

export const apiService = new ApiService();
export default apiService;
