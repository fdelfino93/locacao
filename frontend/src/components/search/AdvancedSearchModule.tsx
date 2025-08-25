import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMockData } from '@/data/mockData';
import { 
  Search, 
  Users, 
  UserCheck, 
  Home, 
  FileText, 
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

// Tipos
type EntityType = 'todos' | 'locadores' | 'locatarios' | 'imoveis' | 'contratos';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  total?: number;
  limit?: number;
  offset?: number;
}

interface SearchData {
  locadores: any[];
  locatarios: any[];
  imoveis: any[];
  contratos: any[];
}

// IMPORTANTE: Usando fonte única de dados mockados
const mockData = getMockData(); /* DADOS ANTIGOS: {
  locadores: [
    { id: 1, nome: 'João Silva', cpf_cnpj: '123.456.789-00', telefone: '(11) 99999-1111', email: 'joao@email.com', endereco: 'Rua A, 123', ativo: true, qtd_imoveis: 3, contratos_ativos: 2 },
    { id: 2, nome: 'Maria Santos', cpf_cnpj: '987.654.321-00', telefone: '(11) 99999-2222', email: 'maria@email.com', endereco: 'Rua B, 456', ativo: true, qtd_imoveis: 1, contratos_ativos: 1 },
    { id: 3, nome: 'Pedro Costa', cpf_cnpj: '456.789.123-00', telefone: '(11) 99999-3333', email: 'pedro@email.com', endereco: 'Rua C, 789', ativo: false, qtd_imoveis: 2, contratos_ativos: 0 },
    { id: 4, nome: 'Ana Oliveira', cpf_cnpj: '789.123.456-00', telefone: '(11) 99999-4444', email: 'ana@email.com', endereco: 'Rua D, 101', ativo: true, qtd_imoveis: 4, contratos_ativos: 3 },
    { id: 5, nome: 'Carlos Lima', cpf_cnpj: '321.654.987-00', telefone: '(11) 99999-5555', email: 'carlos@email.com', endereco: 'Rua E, 202', ativo: true, qtd_imoveis: 2, contratos_ativos: 2 }
  ],
  locatarios: [
    { id: 1, nome: 'Fernanda Souza', cpf_cnpj: '111.222.333-44', telefone: '(11) 88888-1111', email: 'fernanda@email.com', profissao: 'Engenheira', status_contrato: 'ativo', imovel_atual: 'Av. Paulista, 1000' },
    { id: 2, nome: 'Roberto Silva', cpf_cnpj: '222.333.444-55', telefone: '(11) 88888-2222', email: 'roberto@email.com', profissao: 'Professor', status_contrato: 'ativo', imovel_atual: 'Rua Augusta, 500' },
    { id: 3, nome: 'Juliana Costa', cpf_cnpj: '333.444.555-66', telefone: '(11) 88888-3333', email: 'juliana@email.com', profissao: 'Médica', status_contrato: 'inativo', imovel_atual: null },
    { id: 4, nome: 'Diego Santos', cpf_cnpj: '444.555.666-77', telefone: '(11) 88888-4444', email: 'diego@email.com', profissao: 'Advogado', status_contrato: 'ativo', imovel_atual: 'Av. Faria Lima, 800' },
    { id: 5, nome: 'Patrícia Lima', cpf_cnpj: '555.666.777-88', telefone: '(11) 88888-5555', email: 'patricia@email.com', profissao: 'Arquiteta', status_contrato: 'ativo', imovel_atual: 'Rua Oscar Freire, 200' }
  ],
  imoveis: [
    { id: 1, endereco: 'Av. Paulista, 1000', tipo: 'Apartamento', valor_aluguel: 2500, quartos: 2, banheiros: 1, area: 80, status: 'ocupado', locador: { nome: 'João Silva' }, locatario_atual: 'Fernanda Souza' },
    { id: 2, endereco: 'Rua Augusta, 500', tipo: 'Casa', valor_aluguel: 3200, quartos: 3, banheiros: 2, area: 120, status: 'ocupado', locador: { nome: 'Maria Santos' }, locatario_atual: 'Roberto Silva' },
    { id: 3, endereco: 'Rua Consolação, 300', tipo: 'Kitnet', valor_aluguel: 1200, quartos: 1, banheiros: 1, area: 35, status: 'disponivel', locador: { nome: 'Pedro Costa' }, locatario_atual: null },
    { id: 4, endereco: 'Av. Faria Lima, 800', tipo: 'Apartamento', valor_aluguel: 4500, quartos: 3, banheiros: 2, area: 150, status: 'ocupado', locador: { nome: 'Ana Oliveira' }, locatario_atual: 'Diego Santos' },
    { id: 5, endereco: 'Rua Oscar Freire, 200', tipo: 'Loja', valor_aluguel: 8000, quartos: 0, banheiros: 2, area: 200, status: 'ocupado', locador: { nome: 'Carlos Lima' }, locatario_atual: 'Patrícia Lima' }
  ],
  contratos: [
    { id: 1, data_inicio: '2024-01-15', data_fim: '2025-01-15', valor_aluguel: 2500, status: 'ativo', locatario: { nome: 'Fernanda Souza' }, imovel: { endereco: 'Av. Paulista, 1000' }, tipo_garantia: 'Fiador', vencimento_dia: 10 },
    { id: 2, data_inicio: '2024-03-01', data_fim: '2025-03-01', valor_aluguel: 3200, status: 'ativo', locatario: { nome: 'Roberto Silva' }, imovel: { endereco: 'Rua Augusta, 500' }, tipo_garantia: 'Caução', vencimento_dia: 5 },
    { id: 3, data_inicio: '2023-06-10', data_fim: '2024-06-10', valor_aluguel: 1800, status: 'vencido', locatario: { nome: 'Juliana Costa' }, imovel: { endereco: 'Rua Centro, 100' }, tipo_garantia: 'Seguro Fiança', vencimento_dia: 15 },
    { id: 4, data_inicio: '2024-02-20', data_fim: '2025-02-20', valor_aluguel: 4500, status: 'ativo', locatario: { nome: 'Diego Santos' }, imovel: { endereco: 'Av. Faria Lima, 800' }, tipo_garantia: 'Fiador', vencimento_dia: 20 },
    { id: 5, data_inicio: '2024-04-01', data_fim: '2025-04-01', valor_aluguel: 8000, status: 'ativo', locatario: { nome: 'Patrícia Lima' }, imovel: { endereco: 'Rua Oscar Freire, 200' }, tipo_garantia: 'Caução', vencimento_dia: 1 }
  ]
}; */

// Hook de debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AdvancedSearchModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<EntityType>('todos');
  const [activeView, setActiveView] = useState<EntityType>('todos');
  const [recentSearches, setRecentSearches] = useState<string[]>(['joão', 'apartamento', 'maria']);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    locadores: true,
    locatarios: true,
    imoveis: true,
    contratos: true
  });
  
  // Estado para dados
  const [apiData, setApiData] = useState<SearchData>({
    locadores: [],
    locatarios: [],
    imoveis: [],
    contratos: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);

  // Debounce para a busca
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // API Base URL
  const API_BASE_URL = 'http://localhost:8000';

  // Função para buscar dados da API
  const fetchApiData = useCallback(async (searchTerm: string = '', entityType: EntityType = 'todos') => {
    setLoading(true);
    setError(null);
    
    try {
      const newData: SearchData = {
        locadores: [],
        locatarios: [],
        imoveis: [],
        contratos: []
      };

      if (searchTerm.length >= 2) {
        // Busca com termo específico
        if (entityType === 'todos') {
          // Busca global
          const response = await fetch(`${API_BASE_URL}/api/search/global?q=${encodeURIComponent(searchTerm)}&limit=20`);
          const result: ApiResponse<any> = await response.json();
          
          if (result.success && result.data) {
            const { resultados_por_tipo } = result.data;
            newData.locadores = resultados_por_tipo.locadores?.dados || [];
            newData.locatarios = resultados_por_tipo.locatarios?.dados || [];
            newData.imoveis = resultados_por_tipo.imoveis?.dados || [];
            newData.contratos = resultados_por_tipo.contratos?.dados || [];
          }
        } else {
          // Busca por categoria específica
          const endpoint = entityType === 'locadores' ? 'locadores' :
                          entityType === 'locatarios' ? 'locatarios' :
                          entityType === 'imoveis' ? 'imoveis' : 'contratos';
          
          const response = await fetch(`${API_BASE_URL}/api/search/${endpoint}?q=${encodeURIComponent(searchTerm)}&limit=50`);
          const result: ApiResponse<any> = await response.json();
          
          if (result.success && result.data) {
            newData[entityType] = result.data.dados || [];
          }
        }
      } else {
        // Carregar dados iniciais (sem busca) - SEMPRE mostrar dados
        try {
          const endpoints = [
            { key: 'locadores', url: '/api/search/locadores?limit=20' },
            { key: 'locatarios', url: '/api/search/locatarios?limit=20' },
            { key: 'imoveis', url: '/api/search/imoveis?limit=20' },
            { key: 'contratos', url: '/api/search/contratos?limit=20' }
          ];

          const promises = endpoints.map(async ({ key, url }) => {
            try {
              const response = await fetch(`${API_BASE_URL}${url}`);
              const result: ApiResponse<any> = await response.json();
              return { key, data: result.success ? (result.data?.dados || []) : [] };
            } catch (err) {
              console.error(`Erro ao buscar ${key}:`, err);
              return { key, data: [] };
            }
          });

          const results = await Promise.all(promises);
          let hasAnyData = false;
          
          results.forEach(({ key, data }) => {
            if (data.length > 0) {
              hasAnyData = true;
            }
            newData[key as keyof SearchData] = data;
          });

          // Se não conseguiu dados da API, usar mock data
          if (!hasAnyData) {
            throw new Error('Nenhum dado encontrado na API');
          }
        } catch (apiError) {
          console.warn('API não disponível, usando dados de exemplo:', apiError);
          setError('Conectando ao servidor... Usando dados de exemplo.');
          // Usar dados mockados como fallback
          newData.locadores = mockData.locadores;
          newData.locatarios = mockData.locatarios;
          newData.imoveis = mockData.imoveis;
          newData.contratos = mockData.contratos;
        }
      }

      setApiData(newData);
      setHasInitialData(true);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao conectar com servidor. Usando dados de exemplo.');
      // Fallback para dados mockados em caso de erro
      setApiData({
        locadores: mockData.locadores,
        locatarios: mockData.locatarios,
        imoveis: mockData.imoveis,
        contratos: mockData.contratos
      });
      setHasInitialData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados iniciais SEMPRE ao montar o componente
  useEffect(() => {
    fetchApiData();
  }, [fetchApiData]);

  // Buscar quando o termo de busca muda (com debounce)
  useEffect(() => {
    if (hasInitialData) {
      fetchApiData(debouncedSearchQuery, activeView);
    }
  }, [debouncedSearchQuery, activeView, fetchApiData, hasInitialData]);

  // Dados filtrados (usar sempre os dados da API/mock)
  const filteredData = useMemo(() => {
    const data = { ...apiData };
    
    // Se tem busca mas está na view 'todos', mostrar todos os tipos
    // Se tem busca e está numa view específica, mostrar só esse tipo
    // Se não tem busca, mostrar todos os tipos
    
    if (activeView !== 'todos') {
      // Filtrar apenas o tipo ativo
      const emptyData = { locadores: [], locatarios: [], imoveis: [], contratos: [] };
      emptyData[activeView] = data[activeView];
      return emptyData;
    }
    
    return data;
  }, [apiData, activeView]);

  const handleCardClick = (type: EntityType) => {
    setActiveView(type);
    setSelectedFilter(type);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2 && !recentSearches.includes(query)) {
      const newHistory = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  };

  // Carregar histórico de buscas do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setRecentSearches(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Erro ao carregar histórico:', e);
      }
    }
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Componente para renderizar cada seção de dados
  const DataSection: React.FC<{ 
    title: string; 
    type: string; 
    data: any[]; 
    color: string; 
    icon: React.ReactNode;
    renderItem: (item: any) => React.ReactNode;
  }> = ({ title, type, data, color, icon, renderItem }) => {
    const isExpanded = expandedSections[type];
    const shouldShow = activeView === 'todos' || activeView === type;

    if (!shouldShow) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-8"
      >
        <div 
          className={`flex items-center justify-between p-4 bg-gradient-to-r ${color} rounded-t-xl cursor-pointer hover:shadow-md transition-all`}
          onClick={() => toggleSection(type)}
        >
          <div className="flex items-center space-x-3">
            {icon}
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <span className="bg-white/20 text-white px-2 py-1 rounded-full text-sm">
              {data.length} item(s)
            </span>
          </div>
          {isExpanded ? 
            <ChevronUp className="w-5 h-5 text-white" /> : 
            <ChevronDown className="w-5 h-5 text-white" />
          }
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-l-4 border-r border-b rounded-b-xl overflow-hidden"
              style={{ borderLeftColor: color.includes('blue') ? '#3B82F6' : color.includes('green') ? '#10B981' : color.includes('purple') ? '#8B5CF6' : '#F59E0B' }}
            >
              <div className="p-4">
                {data.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {loading ? 'Carregando...' : 'Nenhum resultado encontrado'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {renderItem(item)}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Busca Avançada - Sistema Cobimob</h1>
            </div>
            <p className="text-white/80">Encontre locadores, locatários, imóveis e contratos rapidamente</p>
          </div>

          <div className="p-8">
            {/* Mensagem de erro/status se houver */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-blue-800">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Campo de Busca */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Digite para buscar Locadores, Locatários, Imóveis, Contratos..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    disabled={loading}
                  />
                  {loading ? (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                  ) : searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedFilter}
                    onChange={(e) => {
                      setSelectedFilter(e.target.value as EntityType);
                      setActiveView(e.target.value as EntityType);
                    }}
                    className="px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="todos">Todos</option>
                    <option value="locadores">Locadores</option>
                    <option value="locatarios">Locatários</option>
                    <option value="imoveis">Imóveis</option>
                    <option value="contratos">Contratos</option>
                  </select>
                  <button 
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    onClick={() => fetchApiData(searchQuery, activeView)}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Buscas Recentes */}
            {!searchQuery && recentSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Buscas Recentes</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Cards de Categoria */}
            {activeView === 'todos' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                  onClick={() => handleCardClick('locadores')}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="w-6 h-6" />
                    <h3 className="font-semibold">Locadores</h3>
                  </div>
                  <p className="text-sm text-blue-100 mb-3">
                    Buscar por nome, CPF/CNPJ, telefone ou e-mail
                  </p>
                  <div className="flex items-center text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    {filteredData.locadores.length} resultados
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                  onClick={() => handleCardClick('locatarios')}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <UserCheck className="w-6 h-6" />
                    <h3 className="font-semibold">Locatários</h3>
                  </div>
                  <p className="text-sm text-green-100 mb-3">
                    Buscar por nome, documento ou status do contrato
                  </p>
                  <div className="flex items-center text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    {filteredData.locatarios.length} resultados
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                  onClick={() => handleCardClick('imoveis')}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Home className="w-6 h-6" />
                    <h3 className="font-semibold">Imóveis</h3>
                  </div>
                  <p className="text-sm text-purple-100 mb-3">
                    Buscar por endereço, tipo, valor ou características
                  </p>
                  <div className="flex items-center text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    {filteredData.imoveis.length} resultados
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all"
                  onClick={() => handleCardClick('contratos')}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="w-6 h-6" />
                    <h3 className="font-semibold">Contratos</h3>
                  </div>
                  <p className="text-sm text-amber-100 mb-3">
                    Buscar por status, vigência, valor ou garantia
                  </p>
                  <div className="flex items-center text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    {filteredData.contratos.length} resultados
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Botão de voltar quando não está na visão geral */}
            {activeView !== 'todos' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <button
                  onClick={() => setActiveView('todos')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                >
                  <X className="w-4 h-4" />
                  <span>Voltar para visão geral</span>
                </button>
              </motion.div>
            )}

            {/* Seções de Dados */}
            <div className="space-y-6">
              <DataSection
                title="Locadores"
                type="locadores"
                data={filteredData.locadores}
                color="from-blue-500 to-blue-600"
                icon={<Users className="w-5 h-5 text-white" />}
                renderItem={(locador) => (
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">{locador.nome}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            {locador.cpf_cnpj}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {locador.telefone}
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {locador.email}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {locador.endereco}
                          </div>
                          {locador.qtd_imoveis !== undefined && (
                            <div className="flex items-center">
                              <Home className="w-4 h-4 mr-2" />
                              {locador.qtd_imoveis} imóveis
                            </div>
                          )}
                          {locador.contratos_ativos !== undefined && (
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              {locador.contratos_ativos} contratos ativos
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        locador.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {locador.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                )}
              />

              <DataSection
                title="Locatários"
                type="locatarios"
                data={filteredData.locatarios}
                color="from-green-500 to-green-600"
                icon={<UserCheck className="w-5 h-5 text-white" />}
                renderItem={(locatario) => (
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">{locatario.nome}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            {locatario.cpf_cnpj}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {locatario.telefone}
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {locatario.email}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {locatario.profissao}
                          </div>
                          {locatario.imovel_atual && (
                            <div className="flex items-center">
                              <Home className="w-4 h-4 mr-2" />
                              {locatario.imovel_atual}
                            </div>
                          )}
                          {locatario.tipo_garantia && (
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              {locatario.tipo_garantia}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        locatario.status_contrato === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {locatario.status_contrato}
                      </span>
                    </div>
                  </div>
                )}
              />

              <DataSection
                title="Imóveis"
                type="imoveis"
                data={filteredData.imoveis}
                color="from-purple-500 to-purple-600"
                icon={<Home className="w-5 h-5 text-white" />}
                renderItem={(imovel) => (
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">{imovel.endereco}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Home className="w-4 h-4 mr-2" />
                            {imovel.tipo}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {formatCurrency(imovel.valor_aluguel)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {imovel.quartos}Q, {imovel.banheiros}B
                            {imovel.area && `, ${imovel.area}m²`}
                          </div>
                          {imovel.locador && (
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Locador: {imovel.locador.nome}
                            </div>
                          )}
                          {imovel.locatario_atual && (
                            <div className="flex items-center">
                              <UserCheck className="w-4 h-4 mr-2" />
                              Locatário: {imovel.locatario_atual}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        imovel.status === 'disponivel' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {imovel.status}
                      </span>
                    </div>
                  </div>
                )}
              />

              <DataSection
                title="Contratos"
                type="contratos"
                data={filteredData.contratos}
                color="from-amber-500 to-amber-600"
                icon={<FileText className="w-5 h-5 text-white" />}
                renderItem={(contrato) => (
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {contrato.locatario?.nome || contrato.locatario}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Home className="w-4 h-4 mr-2" />
                            {contrato.imovel?.endereco || contrato.imovel}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {formatCurrency(contrato.valor_aluguel)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(contrato.data_inicio)} - {formatDate(contrato.data_fim)}
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            {contrato.tipo_garantia}
                          </div>
                          {contrato.vencimento_dia && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Vence dia {contrato.vencimento_dia}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        contrato.status === 'ativo' ? 'bg-green-100 text-green-800' : 
                        contrato.status === 'vencido' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {contrato.status}
                      </span>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedSearchModule;