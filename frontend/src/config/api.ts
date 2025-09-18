// Configuração dinâmica de API
// Prioriza variáveis de ambiente, com fallbacks para diferentes ambientes

function getApiBaseUrl(): string {
  // 1. Prioridade máxima: variável de ambiente VITE_API_BASE_URL
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Detectar se estamos em desenvolvimento local ou VM
  const hostname = window.location.hostname;

  // 3. Se estivermos no localhost, usar API local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080';
  }

  // 4. Fallback para VM/produção (192.168.1.159:8080)
  return 'http://192.168.1.159:8080';
}

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(), // Base sem /api
  API_BASE_URL: `${getApiBaseUrl()}/api` // Adiciona /api
};

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.API_BASE_URL}${cleanEndpoint}`;
};

// Log da configuração atual (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_CONFIG.BASE_URL,
    apiUrl: API_CONFIG.API_BASE_URL,
    hostname: window.location.hostname,
    env: import.meta.env.VITE_API_BASE_URL || 'não definida',
    exemploUrl: getApiUrl('/contratos')
  });
}