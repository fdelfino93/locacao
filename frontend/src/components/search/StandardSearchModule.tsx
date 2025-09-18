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
  AlertCircle,
  BarChart3,
  TrendingUp,
  Refresh
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
    { id: 5, nome: 'Carlos Lima', cpf_cnpj: '321.654.987-00', telefone: '(11) 99999-5555', email: 'carlos@email.com', endereco: 'Rua E, 202', ativo: true, qtd_imoveis: 2, contratos_ativos: 2 },
    { id: 6, nome: 'Luiza Fernandes', cpf_cnpj: '111.333.555-77', telefone: '(11) 99999-6666', email: 'luiza@email.com', endereco: 'Av. Brasil, 300', ativo: true, qtd_imoveis: 5, contratos_ativos: 4 },
    { id: 7, nome: 'Ricardo Almeida', cpf_cnpj: '222.444.666-88', telefone: '(11) 99999-7777', email: 'ricardo@email.com', endereco: 'Rua das Flores, 450', ativo: false, qtd_imoveis: 1, contratos_ativos: 0 },
    { id: 8, nome: 'Camila Rodrigues', cpf_cnpj: '333.555.777-99', telefone: '(11) 99999-8888', email: 'camila@email.com', endereco: 'Av. Liberdade, 600', ativo: true, qtd_imoveis: 3, contratos_ativos: 2 }
  ],
  locatarios: [
    { id: 1, nome: 'Fernanda Souza', cpf_cnpj: '111.222.333-44', telefone: '(11) 88888-1111', email: 'fernanda@email.com', profissao: 'Engenheira', status_contrato: 'ativo', imovel_atual: 'Av. Paulista, 1000', tipo_garantia: 'Fiador' },
    { id: 2, nome: 'Roberto Silva', cpf_cnpj: '222.333.444-55', telefone: '(11) 88888-2222', email: 'roberto@email.com', profissao: 'Professor', status_contrato: 'ativo', imovel_atual: 'Rua Augusta, 500', tipo_garantia: 'Caução' },
    { id: 3, nome: 'Juliana Costa', cpf_cnpj: '333.444.555-66', telefone: '(11) 88888-3333', email: 'juliana@email.com', profissao: 'Médica', status_contrato: 'inativo', imovel_atual: null, tipo_garantia: 'Seguro Fiança' },
    { id: 4, nome: 'Diego Santos', cpf_cnpj: '444.555.666-77', telefone: '(11) 88888-4444', email: 'diego@email.com', profissao: 'Advogado', status_contrato: 'ativo', imovel_atual: 'Av. Faria Lima, 800', tipo_garantia: 'Fiador' },
    { id: 5, nome: 'Patrícia Lima', cpf_cnpj: '555.666.777-88', telefone: '(11) 88888-5555', email: 'patricia@email.com', profissao: 'Arquiteta', status_contrato: 'ativo', imovel_atual: 'Rua Oscar Freire, 200', tipo_garantia: 'Caução' },
    { id: 6, nome: 'Marcos Pereira', cpf_cnpj: '666.777.888-99', telefone: '(11) 88888-6666', email: 'marcos@email.com', profissao: 'Dentista', status_contrato: 'ativo', imovel_atual: 'Av. Ibirapuera, 1500', tipo_garantia: 'Seguro Fiança' },
    { id: 7, nome: 'Isabela Martins', cpf_cnpj: '777.888.999-00', telefone: '(11) 88888-7777', email: 'isabela@email.com', profissao: 'Designer', status_contrato: 'inativo', imovel_atual: null, tipo_garantia: 'Fiador' },
    { id: 8, nome: 'André Carvalho', cpf_cnpj: '888.999.000-11', telefone: '(11) 88888-8888', email: 'andre@email.com', profissao: 'Contador', status_contrato: 'ativo', imovel_atual: 'Av. Rebouças, 1200', tipo_garantia: 'Caução' }
  ],
  imoveis: [
    { id: 1, endereco: 'Av. Paulista, 1000', tipo: 'Apartamento', valor_aluguel: 2500, quartos: 2, banheiros: 1, area: 80, status: 'ocupado', locador: { nome: 'João Silva' }, locatario_atual: 'Fernanda Souza', status_ocupacao: 'ocupado' },
    { id: 2, endereco: 'Rua Augusta, 500', tipo: 'Casa', valor_aluguel: 3200, quartos: 3, banheiros: 2, area: 120, status: 'ocupado', locador: { nome: 'Maria Santos' }, locatario_atual: 'Roberto Silva', status_ocupacao: 'ocupado' },
    { id: 3, endereco: 'Rua Consolação, 300', tipo: 'Kitnet', valor_aluguel: 1200, quartos: 1, banheiros: 1, area: 35, status: 'disponivel', locador: { nome: 'Pedro Costa' }, locatario_atual: null, status_ocupacao: 'livre' },
    { id: 4, endereco: 'Av. Faria Lima, 800', tipo: 'Apartamento', valor_aluguel: 4500, quartos: 3, banheiros: 2, area: 150, status: 'ocupado', locador: { nome: 'Ana Oliveira' }, locatario_atual: 'Diego Santos', status_ocupacao: 'ocupado' },
    { id: 5, endereco: 'Rua Oscar Freire, 200', tipo: 'Loja', valor_aluguel: 8000, quartos: 0, banheiros: 2, area: 200, status: 'ocupado', locador: { nome: 'Carlos Lima' }, locatario_atual: 'Patrícia Lima', status_ocupacao: 'ocupado' },
    { id: 6, endereco: 'Av. Ibirapuera, 1500', tipo: 'Apartamento', valor_aluguel: 3800, quartos: 2, banheiros: 2, area: 95, status: 'ocupado', locador: { nome: 'Luiza Fernandes' }, locatario_atual: 'Marcos Pereira', status_ocupacao: 'ocupado' },
    { id: 7, endereco: 'Rua Vergueiro, 750', tipo: 'Studio', valor_aluguel: 1800, quartos: 1, banheiros: 1, area: 45, status: 'disponivel', locador: { nome: 'Ricardo Almeida' }, locatario_atual: null, status_ocupacao: 'livre' },
    { id: 8, endereco: 'Av. Rebouças, 1200', tipo: 'Casa', valor_aluguel: 5500, quartos: 4, banheiros: 3, area: 200, status: 'ocupado', locador: { nome: 'Camila Rodrigues' }, locatario_atual: 'André Carvalho', status_ocupacao: 'ocupado' }
  ],
  contratos: [
    { id: 1, data_inicio: '2024-01-15', data_fim: '2025-01-15', valor_aluguel: 2500, status: 'ativo', locatario: { nome: 'Fernanda Souza' }, imovel: { endereco: 'Av. Paulista, 1000' }, tipo_garantia: 'Fiador', vencimento_dia: 10, locador: { nome: 'João Silva' } },
    { id: 2, data_inicio: '2024-03-01', data_fim: '2025-03-01', valor_aluguel: 3200, status: 'ativo', locatario: { nome: 'Roberto Silva' }, imovel: { endereco: 'Rua Augusta, 500' }, tipo_garantia: 'Caução', vencimento_dia: 5, locador: { nome: 'Maria Santos' } },
    { id: 3, data_inicio: '2023-06-10', data_fim: '2024-06-10', valor_aluguel: 1800, status: 'vencido', locatario: { nome: 'Juliana Costa' }, imovel: { endereco: 'Rua Centro, 100' }, tipo_garantia: 'Seguro Fiança', vencimento_dia: 15, locador: { nome: 'Pedro Costa' } },
    { id: 4, data_inicio: '2024-02-20', data_fim: '2025-02-20', valor_aluguel: 4500, status: 'ativo', locatario: { nome: 'Diego Santos' }, imovel: { endereco: 'Av. Faria Lima, 800' }, tipo_garantia: 'Fiador', vencimento_dia: 20, locador: { nome: 'Ana Oliveira' } },
    { id: 5, data_inicio: '2024-04-01', data_fim: '2025-04-01', valor_aluguel: 8000, status: 'ativo', locatario: { nome: 'Patrícia Lima' }, imovel: { endereco: 'Rua Oscar Freire, 200' }, tipo_garantia: 'Caução', vencimento_dia: 1, locador: { nome: 'Carlos Lima' } },
    { id: 6, data_inicio: '2024-05-15', data_fim: '2025-05-15', valor_aluguel: 3800, status: 'ativo', locatario: { nome: 'Marcos Pereira' }, imovel: { endereco: 'Av. Ibirapuera, 1500' }, tipo_garantia: 'Seguro Fiança', vencimento_dia: 15, locador: { nome: 'Luiza Fernandes' } },
    { id: 7, data_inicio: '2023-12-01', data_fim: '2024-12-01', valor_aluguel: 1800, status: 'pendente', locatario: { nome: 'Isabela Martins' }, imovel: { endereco: 'Rua Vergueiro, 750' }, tipo_garantia: 'Fiador', vencimento_dia: 1, locador: { nome: 'Ricardo Almeida' } },
    { id: 8, data_inicio: '2024-06-10', data_fim: '2025-06-10', valor_aluguel: 5500, status: 'ativo', locatario: { nome: 'André Carvalho' }, imovel: { endereco: 'Av. Rebouças, 1200' }, tipo_garantia: 'Caução', vencimento_dia: 10, locador: { nome: 'Camila Rodrigues' } }
  ]
}; */

// Hook de debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const StandardSearchModule: React.FC = () => {
  // Estados principais
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<EntityType>('todos');
  const [activeView, setActiveView] = useState<EntityType>('todos');
  const [recentSearches, setRecentSearches] = useState<string[]>(['joão', 'apartamento', 'silva']);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    locadores: true,
    locatarios: true,
    imoveis: true,
    contratos: true
  });
  
  // Estados para dados e loading
  const [apiData, setApiData] = useState<SearchData>({
    locadores: [],
    locatarios: [],
    imoveis: [],
    contratos: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Debounce para otimização
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // API Configuration
  const API_BASE_URL = 'http://192.168.1.159:8080';

  // Função principal para buscar dados
  const fetchApiData = useCallback(async (searchTerm: string = '', entityType: EntityType = 'todos') => {
    setLoading(true);
    setError(null);
    
    try {
      const newData: SearchData = { locadores: [], locatarios: [], imoveis: [], contratos: [] };

      if (searchTerm.length >= 2) {
        // Busca com termo específico
        if (entityType === 'todos') {
          const response = await fetch(`${API_BASE_URL}/api/search/global?q=${encodeURIComponent(searchTerm)}&limit=30`);
          if (!response.ok) throw new Error('API não disponível');
          
          const result: ApiResponse<any> = await response.json();
          if (result.success && result.data) {
            const { resultados_por_tipo } = result.data;
            newData.locadores = resultados_por_tipo.locadores?.dados || [];
            newData.locatarios = resultados_por_tipo.locatarios?.dados || [];
            newData.imoveis = resultados_por_tipo.imoveis?.dados || [];
            newData.contratos = resultados_por_tipo.contratos?.dados || [];
          }
        } else {
          const endpoint = entityType;
          const response = await fetch(`${API_BASE_URL}/api/search/${endpoint}?q=${encodeURIComponent(searchTerm)}&limit=50`);
          if (!response.ok) throw new Error('API não disponível');
          
          const result: ApiResponse<any> = await response.json();
          if (result.success && result.data) {
            newData[entityType] = result.data.dados || [];
          }
        }
      } else {
        // Carregar dados iniciais
        const endpoints = [
          { key: 'locadores', url: '/api/search/locadores?limit=30' },
          { key: 'locatarios', url: '/api/search/locatarios?limit=30' },
          { key: 'imoveis', url: '/api/search/imoveis?limit=30' },
          { key: 'contratos', url: '/api/search/contratos?limit=30' }
        ];

        const promises = endpoints.map(async ({ key, url }) => {
          try {
            const response = await fetch(`${API_BASE_URL}${url}`);
            if (!response.ok) throw new Error('API não disponível');
            
            const result: ApiResponse<any> = await response.json();
            return { key, data: result.success ? (result.data?.dados || []) : [] };
          } catch (err) {
            console.warn(`Erro ao buscar ${key}:`, err);
            return { key, data: [] };
          }
        });

        const results = await Promise.all(promises);
        let hasAnyData = false;
        
        results.forEach(({ key, data }) => {
          if (data.length > 0) hasAnyData = true;
          newData[key as keyof SearchData] = data;
        });

        if (!hasAnyData) {
          throw new Error('Sem dados da API');
        }
      }

      setApiData(newData);
      setIsUsingMockData(false);
      setHasInitialData(true);
      
    } catch (err) {
      console.warn('Usando dados de exemplo:', err);
      setError('Conectando ao servidor... Exibindo dados de exemplo.');
      setIsUsingMockData(true);
      
      // Usar dados mockados filtrados
      const filteredMockData = {
        locadores: searchTerm ? mockData.locadores.filter(item => 
          item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.cpf_cnpj.includes(searchTerm) ||
          item.telefone.includes(searchTerm) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase())
        ) : mockData.locadores,
        
        locatarios: searchTerm ? mockData.locatarios.filter(item =>
          item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.cpf_cnpj.includes(searchTerm) ||
          item.profissao.toLowerCase().includes(searchTerm.toLowerCase())
        ) : mockData.locatarios,
        
        imoveis: searchTerm ? mockData.imoveis.filter(item =>
          item.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tipo.toLowerCase().includes(searchTerm.toLowerCase())
        ) : mockData.imoveis,
        
        contratos: searchTerm ? mockData.contratos.filter(item =>
          item.locatario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.imovel.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tipo_garantia.toLowerCase().includes(searchTerm.toLowerCase())
        ) : mockData.contratos
      };
      
      setApiData(filteredMockData);
      setHasInitialData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchApiData();
  }, [fetchApiData]);

  useEffect(() => {
    if (hasInitialData) {
      fetchApiData(debouncedSearchQuery, activeView);
    }
  }, [debouncedSearchQuery, activeView, fetchApiData, hasInitialData]);

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

  // Handlers
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Utilitários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Dados filtrados
  const filteredData = useMemo(() => {
    if (activeView !== 'todos') {
      const emptyData = { locadores: [], locatarios: [], imoveis: [], contratos: [] };
      emptyData[activeView] = apiData[activeView];
      return emptyData;
    }
    return apiData;
  }, [apiData, activeView]);

  // Componente de seção de dados
  const DataSection: React.FC<{ 
    title: string; 
    type: string; 
    data: any[]; 
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
    renderItem: (item: any) => React.ReactNode;
  }> = ({ title, type, data, bgColor, borderColor, icon, renderItem }) => {
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
          className={`card-interactive ${bgColor} border-2 ${borderColor} cursor-pointer`}
          onClick={() => toggleSection(type)}
        >
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              {icon}
              <h3 className="text-xl font-bold">{title}</h3>
              <span className="status-primary px-3 py-1 text-sm">
                {data.length} item(s)
              </span>
            </div>
            {isExpanded ? 
              <ChevronUp className="w-6 h-6 text-muted-foreground" /> : 
              <ChevronDown className="w-6 h-6 text-muted-foreground" />
            }
          </div>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`card border-2 ${borderColor} border-t-0 rounded-t-none overflow-hidden`}
            >
              <div className="p-6">
                {data.length === 0 ? (
                  <div className="text-center py-12">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <p className="text-muted-foreground">Carregando dados...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">Nenhum resultado encontrado</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glass rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-foreground/20 rounded-xl">
                <Search className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">Busca Avançada - Sistema Cobimob</h1>
            </div>
            <p className="text-primary-foreground/80 mt-2">Encontre locadores, locatários, imóveis e contratos rapidamente</p>
          </div>

          <div className="p-8 space-content">
            {/* Status da conexão */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="status-info mb-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => fetchApiData(searchQuery, activeView)}
                    className="btn-ghost px-4 py-2 h-auto"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Refresh className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Campo de Busca */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="form-section"
            >
              <div className="form-group">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Digite para buscar Locadores, Locatários, Imóveis, Contratos..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="input-section pl-12 pr-12"
                      disabled={loading}
                    />
                    {loading ? (
                      <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 animate-spin" />
                    ) : searchQuery ? (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    ) : null}
                  </div>
                  
                  <select
                    value={selectedFilter}
                    onChange={(e) => {
                      setSelectedFilter(e.target.value as EntityType);
                      setActiveView(e.target.value as EntityType);
                    }}
                    className="input-section"
                  >
                    <option value="todos">Todos os Tipos</option>
                    <option value="locadores">Apenas Locadores</option>
                    <option value="locatarios">Apenas Locatários</option>
                    <option value="imoveis">Apenas Imóveis</option>
                    <option value="contratos">Apenas Contratos</option>
                  </select>
                  
                  <button 
                    className="btn-primary"
                    onClick={() => fetchApiData(searchQuery, activeView)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Buscar
                      </>
                    )}
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
                className="form-section"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Buscas Recentes</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="btn-ghost px-4 py-2 h-auto text-sm"
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
                className="grid-features mb-8"
              >
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 card-interactive cursor-pointer"
                  onClick={() => handleCardClick('locadores')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {filteredData.locadores.length}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">Locadores</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Buscar por nome, CPF/CNPJ, telefone ou e-mail
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800 card-interactive cursor-pointer"
                  onClick={() => handleCardClick('locatarios')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <UserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <span className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {filteredData.locatarios.length}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">Locatários</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Buscar por nome, documento ou status do contrato
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800 card-interactive cursor-pointer"
                  onClick={() => handleCardClick('imoveis')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Home className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <span className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {filteredData.imoveis.length}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-2">Imóveis</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Buscar por endereço, tipo, valor ou características
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800 card-interactive cursor-pointer"
                  onClick={() => handleCardClick('contratos')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    <span className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                      {filteredData.contratos.length}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">Contratos</h3>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Buscar por status, vigência, valor ou garantia
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Botão de voltar */}
            {activeView !== 'todos' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <button
                  onClick={() => setActiveView('todos')}
                  className="btn-outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Voltar para visão geral
                </button>
              </motion.div>
            )}

            {/* Seções de Dados */}
            <div className="space-content">
              <DataSection
                title="Locadores"
                type="locadores"
                data={filteredData.locadores}
                bgColor="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
                borderColor="border-blue-200 dark:border-blue-800"
                icon={<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                renderItem={(locador) => (
                  <div className="card p-4 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <h4 className="text-lg font-bold">{locador.nome}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>{locador.cpf_cnpj}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{locador.telefone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{locador.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{locador.endereco}</span>
                          </div>
                          {locador.qtd_imoveis !== undefined && (
                            <div className="flex items-center space-x-2">
                              <Home className="w-4 h-4" />
                              <span>{locador.qtd_imoveis} imóveis</span>
                            </div>
                          )}
                          {locador.contratos_ativos !== undefined && (
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4" />
                              <span>{locador.contratos_ativos} termos ativos</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={locador.ativo ? 'status-success' : 'status-error'}>
                        {locador.ativo ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                  </div>
                )}
              />

              <DataSection
                title="Locatários"
                type="locatarios"
                data={filteredData.locatarios}
                bgColor="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
                borderColor="border-green-200 dark:border-green-800"
                icon={<UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />}
                renderItem={(locatario) => (
                  <div className="card p-4 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <h4 className="text-lg font-bold">{locatario.nome}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>{locatario.cpf_cnpj}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{locatario.telefone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{locatario.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{locatario.profissao}</span>
                          </div>
                          {locatario.imovel_atual && (
                            <div className="flex items-center space-x-2">
                              <Home className="w-4 h-4" />
                              <span>Imóvel: {locatario.imovel_atual}</span>
                            </div>
                          )}
                          {locatario.tipo_garantia && (
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4" />
                              <span>Garantia: {locatario.tipo_garantia}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={locatario.status_contrato === 'ativo' ? 'status-success' : 'status-error'}>
                        {locatario.status_contrato}
                      </div>
                    </div>
                  </div>
                )}
              />

              <DataSection
                title="Imóveis"
                type="imoveis"
                data={filteredData.imoveis}
                bgColor="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
                borderColor="border-purple-200 dark:border-purple-800"
                icon={<Home className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                renderItem={(imovel) => (
                  <div className="card p-4 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <h4 className="text-lg font-bold">{imovel.endereco}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Home className="w-4 h-4" />
                            <span>{imovel.tipo}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatCurrency(imovel.valor_aluguel)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{imovel.quartos}Q, {imovel.banheiros}B{imovel.area && `, ${imovel.area}m²`}</span>
                          </div>
                          {imovel.locador && (
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4" />
                              <span>Locador: {imovel.locador.nome}</span>
                            </div>
                          )}
                          {imovel.locatario_atual && (
                            <div className="flex items-center space-x-2">
                              <UserCheck className="w-4 h-4" />
                              <span>Locatário: {imovel.locatario_atual}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={(imovel.status === 'disponivel' || imovel.status_ocupacao === 'livre') ? 'status-success' : 'status-warning'}>
                        {imovel.status || imovel.status_ocupacao}
                      </div>
                    </div>
                  </div>
                )}
              />

              <DataSection
                title="Contratos"
                type="contratos"
                data={filteredData.contratos}
                bgColor="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900"
                borderColor="border-amber-200 dark:border-amber-800"
                icon={<FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
                renderItem={(contrato) => (
                  <div className="card p-4 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <h4 className="text-lg font-bold">
                          {contrato.locatario?.nome || contrato.locatario}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Home className="w-4 h-4" />
                            <span>{contrato.imovel?.endereco || contrato.imovel}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatCurrency(contrato.valor_aluguel)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(contrato.data_inicio)} - {formatDate(contrato.data_fim)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>{contrato.tipo_garantia}</span>
                          </div>
                          {contrato.vencimento_dia && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>Vence dia {contrato.vencimento_dia}</span>
                            </div>
                          )}
                          {contrato.locador && (
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4" />
                              <span>Locador: {contrato.locador.nome}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={
                        contrato.status === 'ativo' ? 'status-success' : 
                        contrato.status === 'vencido' ? 'status-error' : 'status-warning'
                      }>
                        {contrato.status}
                      </div>
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

export default StandardSearchModule;