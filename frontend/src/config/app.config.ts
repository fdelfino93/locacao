// =====================================================
// CONFIGURAÇÃO DO SISTEMA
// =====================================================

export const AppConfig = {
  // DESABILITAR COMPLETAMENTE DADOS MOCKADOS
  USE_MOCK_DATA: false,
  
  // LIMPAR LOCALSTORAGE AO INICIAR
  CLEAR_STORAGE_ON_LOAD: true,
  
  // EXIGIR CONEXÃO COM BANCO REAL
  REQUIRE_REAL_DATABASE: true,
  
  // URL DA API BACKEND
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  
  // MENSAGENS DE ERRO
  ERROR_MESSAGES: {
    NO_API: 'Sistema requer conexão com banco de dados real. Configure a API backend.',
    NO_DATA: 'Nenhum dado encontrado. Conecte com o banco de dados.',
  }
};

export default AppConfig;