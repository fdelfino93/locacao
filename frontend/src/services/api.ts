import type { Cliente, Inquilino, Imovel, ApiResponse } from '../types';

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

  // Métodos para Clientes
  async criarCliente(cliente: Cliente): Promise<ApiResponse<any>> {
    return this.request('/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    });
  }

  async listarClientes(): Promise<ApiResponse<any[]>> {
    return this.request('/clientes');
  }

  // Métodos para Inquilinos
  async criarInquilino(inquilino: Inquilino): Promise<ApiResponse<any>> {
    return this.request('/inquilinos', {
      method: 'POST',
      body: JSON.stringify(inquilino),
    });
  }

  async listarInquilinos(): Promise<ApiResponse<any[]>> {
    return this.request('/inquilinos');
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

  // Verifica se a API está viva
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch('/health'); // também usa proxy
    return response.json();
  }
}

export const apiService = new ApiService();
