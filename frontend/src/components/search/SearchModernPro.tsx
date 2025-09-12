import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, UserCheck, Home, FileText, Filter, Clock, X, 
  ChevronRight, Activity, TrendingUp, Building2, MapPin, Phone, 
  Mail, Calendar, DollarSign, Eye, ChevronDown, Sparkles,
  Database, Hash, CreditCard, User, Building, Briefcase, Shield
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SearchResult {
  id: number;
  tipo: 'locador' | 'locatario' | 'imovel' | 'contrato';
  titulo: string;
  subtitulo: string;
  status?: string;
  valor?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

const SearchModernPro: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [searchStats, setSearchStats] = useState({
    total: 0,
    locadores: 0,
    locatarios: 0,
    imoveis: 0,
    contratos: 0
  });
  const [relatedData, setRelatedData] = useState<{
    imoveis: any[];
    contratos: any[];
    locadores: any[];
    historico: any[];
    isLoading: boolean;
  }>({
    imoveis: [],
    contratos: [],
    locadores: [],
    historico: [],
    isLoading: false
  });

  // Filtros disponíveis
  const filters = [
    { value: 'todos', label: 'Todos', icon: Database, color: 'bg-gray-500' },
    { value: 'locadores', label: 'Locadores', icon: Users, color: 'bg-blue-500' },
    { value: 'locatarios', label: 'Locatários', icon: UserCheck, color: 'bg-green-500' },
    { value: 'imoveis', label: 'Imóveis', icon: Home, color: 'bg-purple-500' },
    { value: 'contratos', label: 'Contratos', icon: FileText, color: 'bg-amber-500' }
  ];

  // Buscar dados da nova API
  const searchData = async (query: string, filter: string) => {
    // Permitir busca vazia quando há filtro específico
    if (query.length < 2 && query !== '' && filter === 'todos') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Usar nova API de busca integrada
      const tipoParam = filter === 'todos' ? '' : `&tipo=${filter}`;
      const url = `/api/busca?query=${encodeURIComponent(query)}${tipoParam}`;
      console.log('Fazendo busca para:', { query, filter, url });
      const response = await fetch(url);
      const data = await response.json();
      console.log('Resposta da API:', data);

      if (data.success && data.data) {
        const allResults: SearchResult[] = [];
        let stats = { total: 0, locadores: 0, locatarios: 0, imoveis: 0, contratos: 0 };

        // Processar locadores
        if (data.data.locadores) {
          data.data.locadores.forEach((item: any) => {
            allResults.push({
              id: item.id,
              tipo: 'locador',
              titulo: item.nome || 'Locador',
              subtitulo: item.cpf_cnpj || 'Sem CPF/CNPJ',
              tags: [item.email, item.telefone].filter(Boolean),
              metadata: item
            });
            stats.locadores++;
          });
        }

        // Processar locatários
        if (data.data.locatarios) {
          data.data.locatarios.forEach((item: any) => {
            allResults.push({
              id: item.id,
              tipo: 'locatario',
              titulo: item.nome || 'Locatário',
              subtitulo: item.cpf_cnpj || 'Sem CPF/CNPJ',
              tags: [item.email, item.telefone].filter(Boolean),
              metadata: item
            });
            stats.locatarios++;
          });
        }

        // Processar imóveis
        if (data.data.imoveis) {
          data.data.imoveis.forEach((item: any) => {
            allResults.push({
              id: item.id,
              tipo: 'imovel',
              titulo: item.tipo || 'Imóvel',
              subtitulo: item.endereco || 'Sem endereço',
              valor: item.valor_aluguel,
              status: item.status || 'disponível',
              tags: [item.locador_nome].filter(Boolean),
              metadata: item
            });
            stats.imoveis++;
          });
        }

        // Processar contratos
        if (data.data.contratos) {
          data.data.contratos.forEach((item: any) => {
            allResults.push({
              id: item.id,
              tipo: 'contrato',
              titulo: `Contrato ${item.numero_contrato || item.id}`,
              subtitulo: `${item.locatario_nome || 'Locatário'} → ${item.imovel_endereco || 'Imóvel'}`,
              status: item.status || 'ativo',
              tags: [item.data_inicio, item.data_fim].filter(Boolean),
              metadata: item
            });
            stats.contratos++;
          });
        }

        stats.total = allResults.length;
        setSearchResults(allResults);
        setSearchStats(stats);

        // Adicionar às buscas recentes
        if (!recentSearches.includes(query)) {
          setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
        }
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce da busca
  useEffect(() => {
    // Se mudou o filtro mas não tem query, buscar todos daquele tipo
    if (!searchQuery && selectedFilter !== 'todos') {
      searchData('', selectedFilter);  // Enviar string vazia ao invés de *
      return;
    }
    
    // Se não tem query e está em "todos", limpar resultados
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchData(searchQuery, selectedFilter);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedFilter]);

  // Reset tab to first when selectedResult changes
  useEffect(() => {
    if (selectedResult) {
      setActiveTab('info');
    }
  }, [selectedResult]);

  // Fetch related data when selectedResult changes
  const fetchRelatedData = async (result: SearchResult) => {
    console.log('=== fetchRelatedData START ===');
    console.log('Result type:', result.tipo);
    console.log('Result ID:', result.id);
    console.log('Has metadata:', !!result.metadata);
    
    setRelatedData(prev => ({ ...prev, isLoading: true }));
    
    try {
      const promises = [];
      console.log('Building promises...');
      
      // Buscar imóveis relacionados
      if (result.tipo === 'locador') {
        const url = `http://localhost:8000/api/busca?query=*&tipo=imoveis&locador_id=${result.id}`;
        console.log('🏠 Fetching imoveis for locador:', url);
        promises.push(
          fetch(url)
            .then(res => res.json())
            .then(data => {
              console.log('🏠 Imoveis response:', data);
              return data;
            })
        );
      } else {
        promises.push(Promise.resolve({ data: { imoveis: [] } }));
      }
      
      // Buscar locadores relacionados (para imóveis)
      if (result.tipo === 'imovel') {
        const url = `http://localhost:8000/api/busca?query=*&tipo=locadores&imovel_id=${result.id}`;
        console.log('👥 Fetching locadores for imovel:', url);
        promises.push(
          fetch(url)
            .then(res => res.json())
            .then(data => {
              console.log('👥 Locadores response:', data);
              return data;
            })
        );
      } else {
        promises.push(Promise.resolve({ data: { locadores: [] } }));
      }
      
      // Buscar contratos relacionados
      if (result.tipo === 'locador') {
        const url = `http://localhost:8000/api/busca?query=*&tipo=contratos&locador_id=${result.id}`;
        console.log('📋 Fetching contratos for locador:', url);
        promises.push(
          fetch(url)
            .then(res => res.json())
            .then(data => {
              console.log('📋 Contratos response:', data);
              return data;
            })
        );
      } else if (result.tipo === 'locatario') {
        const url = `http://localhost:8000/api/busca?query=*&tipo=contratos&locatario_id=${result.id}`;
        console.log('📋 Fetching contratos for locatario:', url);
        promises.push(
          fetch(url)
            .then(res => res.json())
            .then(data => {
              console.log('📋 Contratos response:', data);
              return data;
            })
        );
      } else if (result.tipo === 'imovel') {
        const url = `http://localhost:8000/api/busca?query=*&tipo=contratos&imovel_id=${result.id}`;
        console.log('📋 Fetching contratos for imovel:', url);
        promises.push(
          fetch(url)
            .then(res => res.json())
            .then(data => {
              console.log('📋 Contratos response:', data);
              return data;
            })
        );
      } else if (result.tipo === 'contrato') {
        // Para contratos, buscar outros contratos relacionados (mesmo locador/locatário)
        if (result.metadata?.locador_id) {
          const url = `http://localhost:8000/api/busca?query=*&tipo=contratos&locador_id=${result.metadata.locador_id}`;
          console.log('📋 Fetching contratos for contrato (by locador):', url);
          promises.push(
            fetch(url)
              .then(res => res.json())
              .then(data => {
                console.log('📋 Contratos response:', data);
                return data;
              })
          );
        } else {
          promises.push(Promise.resolve({ data: { contratos: [] } }));
        }
      } else {
        promises.push(Promise.resolve({ data: { contratos: [] } }));
      }
      
      const [imoveisRes, locadoresRes, contratosRes] = await Promise.all(promises);
      
      const finalData = {
        imoveis: imoveisRes.data?.imoveis || [],
        locadores: locadoresRes.data?.locadores || [],
        contratos: contratosRes.data?.contratos || [],
        historico: [], // Would be populated from actual API
        isLoading: false
      };
      
      console.log('✅ Setting final related data:', finalData);
      setRelatedData(finalData);
    } catch (error) {
      console.error('Error fetching related data:', error);
      setRelatedData({
        imoveis: [],
        locadores: [],
        contratos: [],
        historico: [],
        isLoading: false
      });
    }
  };

  // Navigation between related entities
  const navigateToRelatedCard = (relatedItem: any, tipo: string) => {
    const newResult: SearchResult = {
      id: relatedItem.id,
      tipo: tipo as 'locador' | 'locatario' | 'imovel' | 'contrato',
      titulo: tipo === 'imovel' ? (relatedItem.endereco || 'Imóvel') : 
              tipo === 'contrato' ? `Contrato #${relatedItem.id}` : 
              relatedItem.nome || `${tipo} #${relatedItem.id}`,
      subtitulo: tipo === 'imovel' ? relatedItem.tipo :
                  tipo === 'contrato' ? relatedItem.locatario_nome :
                  relatedItem.cpf_cnpj || '',
      metadata: relatedItem
    };
    setSelectedResult(newResult);
  };

  // Trigger related data fetch when selectedResult changes
  useEffect(() => {
    console.log('🎯 useEffect triggered, selectedResult:', selectedResult);
    if (selectedResult) {
      console.log('🚀 Calling fetchRelatedData...');
      fetchRelatedData(selectedResult);
    }
  }, [selectedResult]);

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'locador': return Users;
      case 'locatario': return UserCheck;
      case 'imovel': return Home;
      case 'contrato': return FileText;
      default: return Database;
    }
  };

  const getColorByType = (tipo: string) => {
    switch (tipo) {
      case 'locador': return 'bg-blue-100 text-blue-600';
      case 'locatario': return 'bg-green-100 text-green-600';
      case 'imovel': return 'bg-purple-100 text-purple-600';
      case 'contrato': return 'bg-amber-100 text-amber-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div 
              className="text-6xl mr-4"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🔍
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">
                Sistema de Busca Avançada
              </h1>
              <p className="text-xl text-muted-foreground">
                Encontre rapidamente locadores, locatários, imóveis e contratos
              </p>
            </div>
          </div>
        </motion.div>

        {/* Barra de Busca */}
        <div className="relative">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Digite para buscar... (nome, CPF/CNPJ, endereço, email)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 focus:border-primary transition-colors"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-6 rounded-xl border-2"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filtros
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filtros Expandidos */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 p-4 bg-muted/50 rounded-xl"
              >
                <div className="flex flex-wrap gap-3">
                  {filters.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <Button
                        key={filter.value}
                        variant={selectedFilter === filter.value ? 'default' : 'outline'}
                        onClick={() => setSelectedFilter(filter.value)}
                        className="gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {filter.label}
                      </Button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Estatísticas de Busca */}
        {searchQuery && searchStats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-4 text-sm"
          >
            <Badge variant="secondary" className="px-3 py-1">
              <Database className="w-3 h-3 mr-1" />
              {searchStats.total} resultados
            </Badge>
            {searchStats.locadores > 0 && (
              <Badge variant="outline" className="px-3 py-1">
                <Users className="w-3 h-3 mr-1" />
                {searchStats.locadores} locadores
              </Badge>
            )}
            {searchStats.locatarios > 0 && (
              <Badge variant="outline" className="px-3 py-1">
                <UserCheck className="w-3 h-3 mr-1" />
                {searchStats.locatarios} locatários
              </Badge>
            )}
            {searchStats.imoveis > 0 && (
              <Badge variant="outline" className="px-3 py-1">
                <Home className="w-3 h-3 mr-1" />
                {searchStats.imoveis} imóveis
              </Badge>
            )}
            {searchStats.contratos > 0 && (
              <Badge variant="outline" className="px-3 py-1">
                <FileText className="w-3 h-3 mr-1" />
                {searchStats.contratos} contratos
              </Badge>
            )}
          </motion.div>
        )}

        {/* Resultados da Busca */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Buscando...</p>
                </div>
              </motion.div>
            ) : searchResults.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {searchResults.map((result, index) => {
                  const getCardIcon = () => {
                    switch (result.tipo) {
                      case 'locador': return <Users className="w-5 h-5" />;
                      case 'locatario': return <User className="w-5 h-5" />;
                      case 'imovel': return <Home className="w-5 h-5" />;
                      case 'contrato': return <FileText className="w-5 h-5" />;
                      default: return <Activity className="w-5 h-5" />;
                    }
                  };

                  const getCardColor = () => {
                    switch (result.tipo) {
                      case 'locador': return 'blue';
                      case 'locatario': return 'green';
                      case 'imovel': return 'purple';
                      case 'contrato': return 'amber';
                      default: return 'gray';
                    }
                  };

                  const formatCurrency = (value: number) => {
                    return new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(value);
                  };

                  const formatDate = (dateString: string | null) => {
                    if (!dateString) return 'Não informado';
                    try {
                      return new Date(dateString).toLocaleDateString('pt-BR');
                    } catch {
                      return 'Data inválida';
                    }
                  };

                  const cardColor = getCardColor();
                  
                  return (
                    <motion.div
                      key={`${result.tipo}-${result.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <Card 
                        className={`overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-${cardColor}-500 cursor-pointer`}
                        onClick={() => setSelectedResult(result)}
                      >
                        <CardContent className="p-6">
                          {result.tipo === 'locador' && result.metadata && (
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-3 rounded-xl bg-${cardColor}-100 dark:bg-${cardColor}-900/20`}>
                                    {getCardIcon()}
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-foreground">{result.titulo}</h3>
                                    <p className="text-sm text-muted-foreground">{result.metadata.cpf_cnpj || 'CPF não informado'}</p>
                                  </div>
                                </div>
                                <Badge variant={result.metadata.ativo ? 'default' : 'secondary'}>
                                  {result.metadata.ativo ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </div>

                              <div className="space-y-2 text-sm">
                                {result.metadata.telefone && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    {result.metadata.telefone}
                                  </div>
                                )}
                                
                                {result.metadata.email && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    {result.metadata.email}
                                  </div>
                                )}
                                
                                {result.metadata.endereco && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    {result.metadata.endereco}
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <div className="text-lg font-bold text-blue-600">
                                    {result.metadata.qtd_imoveis || 0}
                                  </div>
                                  <div className="text-xs text-gray-600">Imóveis</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-green-600">
                                    {result.metadata.contratos_ativos || 0}
                                  </div>
                                  <div className="text-xs text-gray-600">Contratos</div>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-amber-600">
                                    {formatCurrency(result.metadata.receita_mensal_bruta || 0)}
                                  </div>
                                  <div className="text-xs text-gray-600">Receita</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {result.tipo === 'locatario' && result.metadata && (
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-3 rounded-xl bg-${cardColor}-100 dark:bg-${cardColor}-900/20`}>
                                    {getCardIcon()}
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-foreground">{result.titulo}</h3>
                                    <p className="text-sm text-muted-foreground">{result.metadata.cpf_cnpj || 'CPF não informado'}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2 text-sm">
                                {result.metadata.telefone && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    {result.metadata.telefone}
                                  </div>
                                )}
                                
                                {result.metadata.email && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    {result.metadata.email}
                                  </div>
                                )}
                                
                                {result.metadata.endereco && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    {result.metadata.endereco}
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
                                <div>
                                  <div className="text-lg font-bold text-green-600">
                                    {result.metadata.contratos_ativos || 0}
                                  </div>
                                  <div className="text-xs text-gray-600">Contratos</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-blue-600">
                                    {result.metadata.imoveis_alugados || 0}
                                  </div>
                                  <div className="text-xs text-gray-600">Imóveis</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {result.tipo === 'imovel' && result.metadata && (
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-3 rounded-xl bg-${cardColor}-100 dark:bg-${cardColor}-900/20`}>
                                    {getCardIcon()}
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-foreground">{result.metadata.endereco || 'Endereço não informado'}</h3>
                                    <p className="text-sm text-muted-foreground">{result.metadata.tipo || 'Tipo não informado'}</p>
                                  </div>
                                </div>
                                <Badge variant={result.metadata.status === 'DISPONIVEL' ? 'default' : 'secondary'}>
                                  {result.metadata.status || 'Status não informado'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <div className="text-sm font-bold text-primary break-words">{formatCurrency(result.metadata.valor_aluguel || 0)}</div>
                                  <div className="text-xs text-gray-600">Aluguel</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-green-600">{result.metadata.quartos || 0}</div>
                                  <div className="text-xs text-gray-600">Quartos</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-purple-600">{result.metadata.area_total || 0}m²</div>
                                  <div className="text-xs text-gray-600">Área</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {result.tipo === 'contrato' && result.metadata && (
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-3 rounded-xl bg-${cardColor}-100 dark:bg-${cardColor}-900/20`}>
                                    {getCardIcon()}
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-foreground">Contrato #{result.metadata.id}</h3>
                                    <p className="text-sm text-muted-foreground">{result.metadata.locatario_nome || 'Locatário não informado'}</p>
                                  </div>
                                </div>
                                <Badge variant={result.metadata.status === 'ATIVO' ? 'default' : 'secondary'}>
                                  {result.metadata.status || 'Status não informado'}
                                </Badge>
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <DollarSign className="w-4 h-4" />
                                  {formatCurrency(result.metadata.valor_aluguel || 0)}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(result.metadata.data_inicio)} - {formatDate(result.metadata.data_fim)}
                                </div>
                                <div 
                                  className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (result.metadata.imovel_id) {
                                      const imovelData = {
                                        id: result.metadata.imovel_id,
                                        endereco: result.metadata.imovel_endereco,
                                        valor_aluguel: result.metadata.valor_aluguel
                                      };
                                      navigateToRelatedCard(imovelData, 'imovel');
                                    }
                                  }}
                                >
                                  <Home className="w-4 h-4" />
                                  <span className="truncate">{result.metadata.imovel_endereco || 'Imóvel não informado'}</span>
                                  {result.metadata.imovel_id && <ChevronRight className="w-3 h-3 text-gray-400" />}
                                </div>
                              </div>

                              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
                                <div>
                                  <div className="text-lg font-bold text-green-600">
                                    {result.metadata.vencimento_dia || 0}
                                  </div>
                                  <div className="text-xs text-gray-600">Vencimento</div>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-amber-600 break-words">
                                    {formatCurrency(result.metadata.valor_aluguel || 0)}
                                  </div>
                                  <div className="text-xs text-gray-600">Valor</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {(!result.metadata || !['locador', 'locatario', 'imovel', 'contrato'].includes(result.tipo)) && (
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-3 rounded-xl bg-${cardColor}-100 dark:bg-${cardColor}-900/20`}>
                                    {getCardIcon()}
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-foreground">{result.titulo}</h3>
                                    <p className="text-sm text-muted-foreground">{result.subtitulo}</p>
                                  </div>
                                </div>
                                <Badge variant="default">{result.status || result.tipo}</Badge>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : searchQuery && !isSearching ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
                <p className="text-muted-foreground">
                  Tente buscar com outros termos ou ajuste os filtros
                </p>
              </motion.div>
            ) : (!searchQuery || searchQuery === '') ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Sugestões */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Sugestões de Busca</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Button
                        variant="outline"
                        className="justify-start gap-3 p-4 h-auto"
                        onClick={() => {
                          setSelectedFilter('contratos');
                          setSearchQuery('*');
                          searchData('*', 'contratos');
                        }}
                      >
                        <FileText className="w-5 h-5 text-amber-600" />
                        <div className="text-left">
                          <p className="font-medium">Todos os Contratos</p>
                          <p className="text-xs text-muted-foreground">Ver todos os contratos</p>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="justify-start gap-3 p-4 h-auto"
                        onClick={() => {
                          setSelectedFilter('imoveis');
                          setSearchQuery('*');
                          searchData('*', 'imoveis');
                        }}
                      >
                        <Home className="w-5 h-5 text-purple-600" />
                        <div className="text-left">
                          <p className="font-medium">Todos os Imóveis</p>
                          <p className="text-xs text-muted-foreground">Ver todos os imóveis</p>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="justify-start gap-3 p-4 h-auto"
                        onClick={() => {
                          setSelectedFilter('locadores');
                          setSearchQuery('*');
                          searchData('*', 'locadores');
                        }}
                      >
                        <Users className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium">Todos Locadores</p>
                          <p className="text-xs text-muted-foreground">Lista completa de proprietários</p>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="justify-start gap-3 p-4 h-auto"
                        onClick={() => {
                          setSelectedFilter('locatarios');
                          setSearchQuery('*');
                          searchData('*', 'locatarios');
                        }}
                      >
                        <UserCheck className="w-5 h-5 text-green-600" />
                        <div className="text-left">
                          <p className="font-medium">Todos Locatários</p>
                          <p className="text-xs text-muted-foreground">Lista completa de inquilinos</p>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Modal de Detalhes com Sistema de Abas Completo */}
        <AnimatePresence>
          {selectedResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setSelectedResult(null);
                setSearchQuery('');
                setSelectedFilter('todos');
                setSearchResults([]);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header com gradiente */}
                <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4 text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const Icon = getIconByType(selectedResult.tipo);
                        return <Icon className="w-6 h-6" />;
                      })()}
                      <div>
                        <h2 className="text-xl font-bold">Detalhes - {selectedResult.titulo}</h2>
                        <p className="text-primary-foreground/80">ID: {selectedResult.id}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedResult(null);
                        setSearchQuery('');
                        setSelectedFilter('todos');
                        setSearchResults([]);
                      }}
                      className="text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Sistema de Abas */}
                <Tabs 
                  key={`${selectedResult.tipo}-${selectedResult.id}`}
                  value={activeTab} 
                  onValueChange={setActiveTab} 
                  defaultValue="info"
                  className="flex flex-col h-full max-h-[calc(90vh-120px)]"
                >
                  <div className="border-b">
                    <TabsList className="flex justify-start space-x-1 bg-transparent h-auto rounded-none p-0 border-0">
                      <TabsTrigger 
                        value="info" 
                        className="flex items-center space-x-2 py-4 px-1 border-b-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent transition-colors bg-transparent rounded-none"
                      >
                        <User className="w-4 h-4" />
                        <span>Cadastro</span>
                      </TabsTrigger>
                      {selectedResult.tipo === 'locador' && (
                        <TabsTrigger 
                          value="imoveis" 
                          className="flex items-center space-x-2 py-4 px-1 border-b-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent transition-colors bg-transparent rounded-none"
                        >
                          <Home className="w-4 h-4" />
                          <span>Imóveis</span>
                        </TabsTrigger>
                      )}

                      {selectedResult.tipo === 'imovel' && (
                        <TabsTrigger 
                          value="locador" 
                          className="flex items-center space-x-2 py-4 px-1 border-b-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent transition-colors bg-transparent rounded-none"
                        >
                          <Users className="w-4 h-4" />
                          <span>Locador</span>
                        </TabsTrigger>
                      )}
                      
                      {selectedResult.tipo === 'contrato' ? (
                        <>
                          <TabsTrigger 
                            value="locador" 
                            className="flex items-center space-x-2 py-4 px-1 border-b-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent transition-colors bg-transparent rounded-none"
                          >
                            <Users className="w-4 h-4" />
                            <span>Locador</span>
                          </TabsTrigger>
                          <TabsTrigger 
                            value="locatario" 
                            className="flex items-center space-x-2 py-4 px-1 border-b-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent transition-colors bg-transparent rounded-none"
                          >
                            <User className="w-4 h-4" />
                            <span>Locatário</span>
                          </TabsTrigger>
                        </>
                      ) : (
                        <TabsTrigger 
                          value="contratos" 
                          className="flex items-center space-x-2 py-4 px-1 border-b-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent transition-colors bg-transparent rounded-none"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Contratos</span>
                        </TabsTrigger>
                      )}
                      <TabsTrigger 
                        value="timeline" 
                        className="flex items-center space-x-2 py-4 px-1 border-b-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent transition-colors bg-transparent rounded-none"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Histórico</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Conteúdo das Abas */}
                  <div className="flex-1 overflow-y-auto">
                    {/* Aba Cadastro */}
                    <TabsContent value="info" className="p-6 mt-0">
                      {(() => {
                        const formatCurrency = (value: number) => {
                          return new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(value);
                        };

                        if (selectedResult.tipo === 'locador' && selectedResult.metadata) {
                          return (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <h3 className="font-semibold text-lg border-b pb-2">Dados Pessoais</h3>
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                      <User className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Nome:</span>
                                      <span>{selectedResult.metadata.nome}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Hash className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">CPF/CNPJ:</span>
                                      <span>{selectedResult.metadata.cpf_cnpj || 'Não informado'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Phone className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Telefone:</span>
                                      <span>{selectedResult.metadata.telefone || 'Não informado'}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <h3 className="font-semibold text-lg border-b pb-2">Contato</h3>
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                      <Mail className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Email:</span>
                                      <span>{selectedResult.metadata.email || 'Não informado'}</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                      <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                                      <div>
                                        <span className="font-medium">Endereço:</span>
                                        <p className="text-muted-foreground">{selectedResult.metadata.endereco || 'Não informado'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Estatísticas */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                                <div className="text-center">
                                  <p className="text-lg font-bold text-primary">{relatedData.imoveis.length}</p>
                                  <p className="text-sm text-muted-foreground">Imóveis</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-bold text-green-600">{relatedData.contratos.length}</p>
                                  <p className="text-sm text-muted-foreground">Contratos</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-bold text-amber-600">
                                    {formatCurrency(relatedData.contratos.reduce((sum, c) => sum + (c.valor_aluguel || 0), 0))}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Receita</p>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Implementações para outros tipos
                        if (selectedResult.tipo === 'locatario' && selectedResult.metadata) {
                          return (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <h3 className="font-semibold text-base border-b pb-2">Dados Pessoais</h3>
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                      <User className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Nome:</span>
                                      <span>{selectedResult.metadata.nome}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Hash className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">CPF/CNPJ:</span>
                                      <span>{selectedResult.metadata.cpf_cnpj || 'Não informado'}</span>
                                    </div>
                                    {selectedResult.metadata.data_nascimento && (
                                      <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium">Data Nascimento:</span>
                                        <span>{new Date(selectedResult.metadata.data_nascimento).toLocaleDateString('pt-BR')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <h3 className="font-semibold text-base border-b pb-2">Contato</h3>
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                      <Phone className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Telefone:</span>
                                      <span>{selectedResult.metadata.telefone || 'Não informado'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Mail className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Email:</span>
                                      <span>{selectedResult.metadata.email || 'Não informado'}</span>
                                    </div>
                                    {selectedResult.metadata.endereco && (
                                      <div className="flex items-start space-x-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                                        <div>
                                          <span className="font-medium">Endereço:</span>
                                          <p className="text-muted-foreground">{selectedResult.metadata.endereco}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (selectedResult.tipo === 'imovel' && selectedResult.metadata) {
                          return (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <h3 className="font-semibold text-base border-b pb-2">Informações do Imóvel</h3>
                                  <div className="space-y-3">
                                    <div className="flex items-start space-x-2">
                                      <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                                      <div>
                                        <span className="font-medium">Endereço:</span>
                                        <p>{selectedResult.metadata.endereco || 'Não informado'}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Building className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Tipo:</span>
                                      <span>{selectedResult.metadata.tipo || 'Não informado'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Valor Aluguel:</span>
                                      <span className="font-bold text-green-600">{formatCurrency(selectedResult.metadata.valor_aluguel || 0)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <h3 className="font-semibold text-base border-b pb-2">Características</h3>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                                      <p className="text-base font-bold text-blue-600">{selectedResult.metadata.quartos || 0}</p>
                                      <p className="text-xs text-muted-foreground">Quartos</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                                      <p className="text-base font-bold text-purple-600">{selectedResult.metadata.area_total || 0}m²</p>
                                      <p className="text-xs text-muted-foreground">Área Total</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (selectedResult.tipo === 'contrato' && selectedResult.metadata) {
                          const formatDate = (dateString: string | null) => {
                            if (!dateString) return 'Não informado';
                            try {
                              return new Date(dateString).toLocaleDateString('pt-BR');
                            } catch {
                              return 'Data inválida';
                            }
                          };

                          return (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <h3 className="font-semibold text-base border-b pb-2">Informações do Contrato</h3>
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                      <Hash className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">ID:</span>
                                      <span>{selectedResult.metadata.id}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <User className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Locatário:</span>
                                      <span>{selectedResult.metadata.locatario_nome || 'Não informado'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Valor:</span>
                                      <span className="font-bold text-green-600">{formatCurrency(selectedResult.metadata.valor_aluguel || 0)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <h3 className="font-semibold text-base border-b pb-2">Datas e Status</h3>
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Início:</span>
                                      <span>{formatDate(selectedResult.metadata.data_inicio)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Fim:</span>
                                      <span>{formatDate(selectedResult.metadata.data_fim)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Activity className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">Status:</span>
                                      <Badge variant={selectedResult.metadata.status === 'ATIVO' ? 'default' : 'secondary'}>
                                        {selectedResult.metadata.status || 'Não informado'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Informações de Cadastro</h3>
                            <div className="text-muted-foreground">
                              Dados completos para {selectedResult.tipo} #{selectedResult.id}
                            </div>
                          </div>
                        );
                      })()}
                    </TabsContent>

                    {/* Aba Locadores (para imóveis) */}
                    {selectedResult.tipo === 'imovel' && (
                      <TabsContent value="locador" className="p-6 mt-0">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Locadores do Imóvel</h3>
                          {relatedData.isLoading ? (
                            <div className="text-center py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                              <p className="text-muted-foreground">Carregando locadores...</p>
                            </div>
                          ) : relatedData.locadores && relatedData.locadores.length > 0 ? (
                            <div className="space-y-4">
                              {relatedData.locadores.map((locador) => (
                                <Card 
                                  key={locador.id} 
                                  className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                                  onClick={() => navigateToRelatedCard(locador, 'locador')}
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4 text-blue-600" />
                                        <h4 className="font-medium text-sm">{locador.nome}</h4>
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                    
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2 text-gray-600">
                                        <Hash className="w-3 h-3" />
                                        <span>{locador.cpf_cnpj || 'CPF/CNPJ não informado'}</span>
                                      </div>
                                      
                                      {locador.telefone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Phone className="w-3 h-3" />
                                          <span>{locador.telefone}</span>
                                        </div>
                                      )}
                                      
                                      {locador.email && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Mail className="w-3 h-3" />
                                          <span>{locador.email}</span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="pt-2 border-t">
                                      <Badge variant={locador.ativo ? 'default' : 'secondary'}>
                                        {locador.ativo ? 'Ativo' : 'Inativo'}
                                      </Badge>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-muted-foreground">
                              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p>Nenhum locador encontrado para este imóvel</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    )}

                    {/* Aba Imóveis (só para locadores) */}
                    {selectedResult.tipo === 'locador' && (
                      <TabsContent value="imoveis" className="p-6 mt-0">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Imóveis do Locador</h3>
                          {relatedData.isLoading ? (
                            <div className="text-center py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                              <p className="text-muted-foreground">Carregando imóveis...</p>
                            </div>
                          ) : relatedData.imoveis.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {relatedData.imoveis.map((imovel) => {
                                const formatCurrency = (value: number) => {
                                  return new Intl.NumberFormat('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL' 
                                  }).format(value);
                                };

                                return (
                                  <Card 
                                    key={imovel.id} 
                                    className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-purple-500"
                                    onClick={() => navigateToRelatedCard(imovel, 'imovel')}
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-2">
                                          <Home className="w-4 h-4 text-purple-600" />
                                          <h4 className="font-medium text-sm">{imovel.endereco || 'Endereço não informado'}</h4>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                          <p className="font-bold text-base text-purple-600">{formatCurrency(imovel.valor_aluguel || 0)}</p>
                                          <p className="text-gray-600">Aluguel</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                          <p className="font-bold text-base text-blue-600">{imovel.quartos || 0}</p>
                                          <p className="text-gray-600">Quartos</p>
                                        </div>
                                      </div>

                                      <div className="pt-2 border-t">
                                        <Badge variant={imovel.status === 'DISPONIVEL' ? 'default' : 'secondary'}>
                                          {imovel.status || 'Status não informado'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </Card>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-muted-foreground">
                              <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p>Nenhum imóvel encontrado</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    )}

                    {/* Aba Locador (para contratos) */}
                    <TabsContent value="locador" className="p-6 mt-0">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Informações do Locador</h3>
                        {relatedData.isLoading ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Carregando informações do locador...</p>
                          </div>
                        ) : selectedResult.metadata && selectedResult.metadata.locador_id ? (
                          <Card 
                            className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                            onClick={() => {
                              // Criar objeto locador para navegação
                              const locadorData = {
                                id: selectedResult.metadata.locador_id,
                                nome: selectedResult.metadata.locador_nome,
                                cpf_cnpj: selectedResult.metadata.locador_cpf_cnpj,
                                telefone: selectedResult.metadata.locador_telefone,
                                email: selectedResult.metadata.locador_email,
                                endereco: selectedResult.metadata.locador_endereco
                              };
                              navigateToRelatedCard(locadorData, 'locador');
                            }}
                          >
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                                    <Users className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm">{selectedResult.metadata.locador_nome || 'Nome não informado'}</h4>
                                    <p className="text-sm text-muted-foreground">{selectedResult.metadata.locador_cpf_cnpj || 'CPF/CNPJ não informado'}</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>

                              <div className="space-y-2 text-sm">
                                {selectedResult.metadata.locador_telefone && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    {selectedResult.metadata.locador_telefone}
                                  </div>
                                )}
                                
                                {selectedResult.metadata.locador_email && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    {selectedResult.metadata.locador_email}
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t text-center">
                                <Button variant="outline" size="sm" className="w-full">
                                  Ver Perfil Completo do Locador
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Informações do locador não disponíveis</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Aba Locatário (para contratos) */}
                    <TabsContent value="locatario" className="p-6 mt-0">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Informações do Locatário</h3>
                        {relatedData.isLoading ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Carregando informações do locatário...</p>
                          </div>
                        ) : selectedResult.metadata && selectedResult.metadata.locatario_id ? (
                          <Card 
                            className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-500"
                            onClick={() => {
                              // Criar objeto locatário para navegação
                              const locatarioData = {
                                id: selectedResult.metadata.locatario_id,
                                nome: selectedResult.metadata.locatario_nome,
                                cpf_cnpj: selectedResult.metadata.locatario_cpf_cnpj,
                                telefone: selectedResult.metadata.locatario_telefone,
                                email: selectedResult.metadata.locatario_email,
                                endereco: selectedResult.metadata.locatario_endereco
                              };
                              navigateToRelatedCard(locatarioData, 'locatario');
                            }}
                          >
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                                    <User className="w-4 h-4 text-green-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm">{selectedResult.metadata.locatario_nome || 'Nome não informado'}</h4>
                                    <p className="text-sm text-muted-foreground">{selectedResult.metadata.locatario_cpf_cnpj || 'CPF/CNPJ não informado'}</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>

                              <div className="space-y-2 text-sm">
                                {selectedResult.metadata.locatario_telefone && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    {selectedResult.metadata.locatario_telefone}
                                  </div>
                                )}
                                
                                {selectedResult.metadata.locatario_email && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    {selectedResult.metadata.locatario_email}
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t text-center">
                                <Button variant="outline" size="sm" className="w-full">
                                  Ver Perfil Completo do Locatário
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Informações do locatário não disponíveis</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Aba Contratos */}
                    <TabsContent value="contratos" className="p-6 mt-0">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Contratos Relacionados</h3>
                        {relatedData.isLoading ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Carregando contratos...</p>
                          </div>
                        ) : relatedData.contratos.length > 0 ? (
                          <div className="space-y-4">
                            {relatedData.contratos.map((contrato) => {
                              const formatCurrency = (value: number) => {
                                return new Intl.NumberFormat('pt-BR', { 
                                  style: 'currency', 
                                  currency: 'BRL' 
                                }).format(value);
                              };

                              const formatDate = (dateString: string | null) => {
                                if (!dateString) return 'Não informado';
                                try {
                                  return new Date(dateString).toLocaleDateString('pt-BR');
                                } catch {
                                  return 'Data inválida';
                                }
                              };

                              return (
                                <Card 
                                  key={contrato.id} 
                                  className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-amber-500"
                                  onClick={() => navigateToRelatedCard(contrato, 'contrato')}
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4 text-amber-600" />
                                        <h4 className="font-medium text-sm">Contrato #{contrato.id}</h4>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant={contrato.status === 'ATIVO' ? 'default' : 'secondary'}>
                                          {contrato.status || 'Status não informado'}
                                        </Badge>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <User className="w-3 h-3 text-gray-500" />
                                          <span className="text-gray-600">Locatário:</span>
                                          <span className="font-medium">{contrato.locatario_nome || 'Não informado'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <DollarSign className="w-3 h-3 text-gray-500" />
                                          <span className="text-gray-600">Valor:</span>
                                          <span className="font-bold text-green-600">{formatCurrency(contrato.valor_aluguel || 0)}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <Calendar className="w-3 h-3 text-gray-500" />
                                          <span className="text-gray-600">Início:</span>
                                          <span>{formatDate(contrato.data_inicio)}</span>
                                        </div>
                                        <div 
                                          className="flex items-center space-x-2 cursor-pointer hover:text-purple-600 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (contrato.imovel_id) {
                                              const imovelData = {
                                                id: contrato.imovel_id,
                                                endereco: contrato.imovel_endereco,
                                                valor_aluguel: contrato.valor_aluguel
                                              };
                                              navigateToRelatedCard(imovelData, 'imovel');
                                            }
                                          }}
                                        >
                                          <Home className="w-3 h-3 text-gray-500" />
                                          <span className="text-gray-600">Imóvel:</span>
                                          <span className="truncate">{contrato.imovel_endereco || 'Não informado'}</span>
                                          {contrato.imovel_id && <ChevronRight className="w-3 h-3 text-gray-400" />}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Nenhum contrato encontrado</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Aba Histórico */}
                    <TabsContent value="timeline" className="p-6 mt-0">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Histórico de Atividades</h3>
                        <div className="text-center py-12 text-muted-foreground">
                          Timeline de atividades seria carregada aqui
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchModernPro;