export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  API_BASE_URL: 'http://localhost:8000/api'
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.API_BASE_URL}${endpoint}`;
};