import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Users, 
  UserCheck, 
  Home, 
  FileText, 
  Filter,
  Clock,
  X,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useGlobalSearch, useSearchState } from '../../hooks/useSearch';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import EntityDetailModal from './EntityDetailModal';

const SearchModule: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{id: number, type: string} | null>(null);

  const { query, debouncedQuery, setQuery } = useSearchState('', 500);

  // Busca global
  const { data: searchData, isLoading, error } = useGlobalSearch(
    debouncedQuery,
    selectedFilter === 'todos' ? undefined : [selectedFilter]
  );

  // Carregar buscas recentes
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Mostrar resultados quando há busca
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      setShowResults(true);
    }
  }, [debouncedQuery]);

  const saveSearch = (searchTerm: string) => {
    if (searchTerm.length >= 2) {
      const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  };

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    saveSearch(searchTerm);
    setShowResults(true);
  };

  const clearSearch = () => {
    setQuery('');
    setShowResults(false);
  };

  const renderResultCard = (item: any, type: string, icon: React.ReactNode, color: string) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group`}
      onClick={() => setSelectedEntity({ id: item.id, type })}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {item.nome || item.endereco || 'Sem nome'}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {type === 'locadores' && item.cpf_cnpj}
            {type === 'locatarios' && `${item.cpf_cnpj} • ${item.telefone}`}
            {type === 'imoveis' && `${item.tipo || 'Tipo não informado'} • R$ ${item.valor_aluguel?.toLocaleString() || '0,00'}`}
            {type === 'contratos' && `${item.imovel?.endereco || 'Endereço não informado'} • ${item.locatario?.nome || 'Locatário não informado'}`}
          </p>
          {item.email && (
            <p className="text-xs text-muted-foreground mt-1">{item.email}</p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </motion.div>
  );

  const renderResultSection = (title: string, icon: React.ReactNode, results: any[], type: string, color: string) => {
    if (!results?.length) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {results.length} resultado(s)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item, index) => (
            <div key={`${type}-${item.id}-${index}`}>
              {renderResultCard(item, type, icon, color)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-2xl font-bold text-primary-foreground">Busca Global - Sistema Cobimob</h1>
            </div>
            <p className="text-primary-foreground/80 mt-2">Encontre locadores, locatários, imóveis e contratos rapidamente</p>
          </div>

          <div className="p-8">
            {/* Campo de Busca Principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Digite para buscar locadores, locatários, imóveis, contratos..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-12 pr-12 h-14 text-lg bg-muted/50 border-border"
                  />
                  {query && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-40 h-14 bg-muted/50 border-border">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="locadores">Locadores</SelectItem>
                      <SelectItem value="locatarios">Locatários</SelectItem>
                      <SelectItem value="imoveis">Imóveis</SelectItem>
                      <SelectItem value="contratos">Contratos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="lg" 
                    className="h-14 px-8"
                    onClick={() => handleSearch(query)}
                    disabled={!query.trim()}
                  >
                    Buscar
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Buscas Recentes */}
            {!showResults && recentSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">Buscas Recentes</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm text-foreground transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Estado de Loading */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-12"
              >
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Buscando...</p>
                </div>
              </motion.div>
            )}

            {/* Erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center"
              >
                <p className="text-destructive">Erro na busca. Tente novamente.</p>
              </motion.div>
            )}

            {/* Resultados */}
            {showResults && searchData?.data && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {/* Summary */}
                <div className="bg-muted/30 rounded-xl p-4 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">
                        {searchData.data.total_resultados} resultado(s) encontrado(s) para "{searchData.data.termo_busca}"
                      </span>
                    </div>
                    {selectedFilter !== 'todos' && (
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        Filtro: {selectedFilter}
                      </span>
                    )}
                  </div>
                </div>

                {/* Resultados por tipo */}
                {renderResultSection(
                  "Locadores",
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
                  searchData.data.resultados_por_tipo.locadores?.dados || [],
                  "locadores",
                  "blue"
                )}

                {renderResultSection(
                  "Locatários",
                  <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />,
                  searchData.data.resultados_por_tipo.locatarios?.dados || [],
                  "locatarios",
                  "green"
                )}

                {renderResultSection(
                  "Imóveis",
                  <Home className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
                  searchData.data.resultados_por_tipo.imoveis?.dados || [],
                  "imoveis",
                  "purple"
                )}

                {renderResultSection(
                  "Contratos",
                  <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
                  searchData.data.resultados_por_tipo.contratos?.dados || [],
                  "contratos",
                  "amber"
                )}

                {/* Nenhum resultado */}
                {searchData.data.total_resultados === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-muted-foreground">Tente usar termos diferentes ou verifique a ortografia</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Cards de Categoria (quando não há busca) */}
            {!showResults && !query && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-lg transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Locadores</h3>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Buscar por nome, CPF/CNPJ, telefone ou e-mail
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-2xl p-6 border border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-green-900 dark:text-green-100">Locatários</h3>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Buscar por nome, documento ou status do contrato
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-2xl p-6 border border-purple-200 dark:border-purple-800 cursor-pointer hover:shadow-lg transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <Home className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">Imóveis</h3>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Buscar por endereço, tipo, valor ou características
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-2xl p-6 border border-amber-200 dark:border-amber-800 cursor-pointer hover:shadow-lg transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">Contratos</h3>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Buscar por status, vigência, valor ou garantia
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Modal de Detalhes */}
        {selectedEntity && (
          <EntityDetailModal
            entityId={selectedEntity.id}
            entityType={selectedEntity.type}
            isOpen={!!selectedEntity}
            onClose={() => setSelectedEntity(null)}
          />
        )}
      </div>
    </div>
  );
};

export default SearchModule;