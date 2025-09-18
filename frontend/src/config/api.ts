// Configuração dinâmica e robusta de API
// Regras:
// - VITE_API_URL: URL completa da API (com sufixo /api). Se definida, tem prioridade.
// - VITE_API_BASE_URL: apenas host/porta (sem /api). O código adiciona /api automaticamente.
// - Remover barras finais e evitar duplicação de /api. Se endpoint iniciar com /api, remover esse prefixo.

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function stripApiSuffix(url: string): string {
  return url.replace(/\/+$/, '').replace(/\/?api$/i, '');
}

function ensureApiSuffix(base: string): string {
  const clean = stripTrailingSlash(base);
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

function detectDefaultBase(): string {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080';
  }
  return 'http://192.168.1.159:8080';
}

function buildApiConfig() {
  const envApiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
  const envBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;

  // Prioridade 1: VITE_API_URL (com /api)
  if (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.trim()) {
    const apiBase = ensureApiSuffix(envApiUrl.trim());
    const base = stripApiSuffix(apiBase);
    return {
      BASE_URL: base,
      API_BASE_URL: apiBase,
      SOURCE: 'VITE_API_URL'
    } as const;
  }

  // Prioridade 2: VITE_API_BASE_URL (sem /api)
  if (envBaseUrl && typeof envBaseUrl === 'string' && envBaseUrl.trim()) {
    const base = stripApiSuffix(envBaseUrl.trim());
    const apiBase = ensureApiSuffix(base);
    return {
      BASE_URL: base,
      API_BASE_URL: apiBase,
      SOURCE: 'VITE_API_BASE_URL'
    } as const;
  }

  // Fallback: detectar por hostname
  const detectedBase = detectDefaultBase();
  const base = stripApiSuffix(detectedBase);
  const apiBase = ensureApiSuffix(base);
  return {
    BASE_URL: base,
    API_BASE_URL: apiBase,
    SOURCE: 'DETECTED'
  } as const;
}

export const API_CONFIG = buildApiConfig();

export const getApiUrl = (endpoint: string): string => {
  if (!endpoint) return API_CONFIG.API_BASE_URL;
  let path = endpoint.trim();
  // Remover base completa se foi passado por engano
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const url = new URL(path);
      path = url.pathname + url.search + url.hash;
    } catch (_) {
      // keep as-is if URL parsing falha
    }
  }
  // Remover prefixo /api se presente e garantir barra inicial
  path = path.replace(/^\s*\/?api\/?/i, '/');
  if (!path.startsWith('/')) path = `/${path}`;
  return `${API_CONFIG.API_BASE_URL}${path}`;
};

// Log da configuração atual (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_CONFIG.BASE_URL,
    apiUrl: API_CONFIG.API_BASE_URL,
    source: (API_CONFIG as any).SOURCE,
    hostname: window.location.hostname,
    exemploUrl: getApiUrl('/contratos')
  });
}
