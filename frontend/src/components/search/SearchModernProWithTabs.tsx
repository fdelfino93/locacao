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

const SearchModernProWithTabs: React.FC = () => {
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
    if (query.length < 2 && query !== '*') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Usar nova API de busca integrada
      const tipoParam = filter === 'todos' ? '' : `&tipo=${filter}`;
      const response = await fetch(`/api/busca?query=${encodeURIComponent(query)}${tipoParam}`);
      const data = await response.json();

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
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchData(searchQuery, selectedFilter);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedFilter]);

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
                          {/* Renderização dos cards antigos aqui */}
                          {/* (mesmo código dos cards que já implementamos) */}
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
            ) : !searchQuery ? (
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
              onClick={() => setSelectedResult(null)}
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
                      onClick={() => setSelectedResult(null)}
                      className="text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Sistema de Abas */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full max-h-[calc(90vh-120px)]">
                  <div className="border-b">
                    <TabsList className="grid w-full bg-transparent h-auto rounded-none p-0" style={{gridTemplateColumns: `repeat(${selectedResult.tipo === 'locador' ? '4' : '3'}, 1fr)`}}>
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
                      <TabsTrigger 
                        value="contratos" 
                        className="flex items-center space-x-2 py-4 px-1 border-b-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent transition-colors bg-transparent rounded-none"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Contratos</span>
                      </TabsTrigger>
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
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-primary">2</p>
                                  <p className="text-sm text-muted-foreground">Imóveis</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-green-600">2</p>
                                  <p className="text-sm text-muted-foreground">Contratos</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(3500)}</p>
                                  <p className="text-sm text-muted-foreground">Receita</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(2500)}</p>
                                  <p className="text-sm text-muted-foreground">Potencial</p>
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

                    {/* Aba Imóveis (só para locadores) */}
                    {selectedResult.tipo === 'locador' && (
                      <TabsContent value="imoveis" className="p-6 mt-0">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Imóveis do Locador</h3>
                          <div className="text-center py-12 text-muted-foreground">
                            Lista de imóveis relacionados seria carregada aqui
                          </div>
                        </div>
                      </TabsContent>
                    )}

                    {/* Aba Contratos */}
                    <TabsContent value="contratos" className="p-6 mt-0">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Contratos Relacionados</h3>
                        <div className="text-center py-12 text-muted-foreground">
                          Lista de contratos relacionados seria carregada aqui
                        </div>
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

export default SearchModernProWithTabs;