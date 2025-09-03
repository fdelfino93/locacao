import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimpleFilters } from './SimpleFilters';
import { 
  Search, 
  Users, 
  UserCheck, 
  Home, 
  FileText, 
  Loader2,
  AlertCircle,
  BarChart3,
  SlidersHorizontal,
  Clock,
  TrendingUp,
  Eye,
  ChevronDown,
  Star
} from 'lucide-react';

interface FiltrosAvancados {
  termo_busca?: string;
  entidades?: string[];
  incluir_inativos?: boolean;
  incluir_historico?: boolean;
  ordenacao?: string;
  limite?: number;
  offset?: number;
}

interface ResultadoBusca {
  sucesso: boolean;
  termo_busca?: string;
  tipo_detectado?: string;
  total_resultados: number;
  tempo_execucao: number;
  resultados_por_tipo: {
    locadores?: { dados: any[]; total: number; };
    locatarios?: { dados: any[]; total: number; };
    imoveis?: { dados: any[]; total: number; };
    contratos?: { dados: any[]; total: number; };
  };
  relacionamentos: any;
  sugestoes: string[];
  paginacao?: any;
  erro?: string;
}

const EnhancedSearchModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultadoBusca | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  
  // Estados dos filtros avançados
  const [filtros, setFiltros] = useState<FiltrosAvancados>({
    limite: 20,
    offset: 0,
    incluir_inativos: false,
    incluir_historico: false,
    ordenacao: 'relevancia'
  });

  // Debounce para sugestões
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Buscar sugestões automáticas
  const buscarSugestoes = useCallback(async (termo: string) => {
    if (termo.length < 3) {
      setSugestoes([]);
      setShowSugestoes(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/search/advanced/sugestoes/${encodeURIComponent(termo)}`);
      if (!response.ok) throw new Error('Erro na API');
      
      const data = await response.json();
      if (data.sucesso) {
        setSugestoes(data.sugestoes || []);
        setShowSugestoes(data.sugestoes?.length > 0);
      }
    } catch (err) {
      console.warn('Erro ao buscar sugestões:', err);
      setSugestoes([]);
      setShowSugestoes(false);
    }
  }, []);

  // Handle input change sem sugestões automáticas
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Limpar sugestões para não interferir
    setSugestoes([]);
    setShowSugestoes(false);
    
    // Clear timeout anterior
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
  };

  // Executar busca principal
  const executarBusca = async (termoBusca?: string, filtrosCustom?: Partial<FiltrosAvancados>) => {
    const termo = termoBusca || searchQuery;
    if (!termo.trim()) return;

    setLoading(true);
    setError(null);
    setShowSugestoes(false);
    
    try {
      const filtrosFinais = { ...filtros, ...filtrosCustom, termo_busca: termo };
      
      const queryParams = new URLSearchParams({
        q: termo,
        limit: filtrosFinais.limite?.toString() || '20',
        offset: filtrosFinais.offset?.toString() || '0'
      });
      
      // Adicionar filtros específicos
      if (filtrosFinais.entidades && filtrosFinais.entidades.length > 0) {
        queryParams.append('tipos', filtrosFinais.entidades.join(','));
      }
      if (filtrosFinais.incluir_inativos) {
        queryParams.append('incluir_inativos', 'true');
      }
      if (filtrosFinais.incluir_historico) {
        queryParams.append('incluir_historico', 'true');
      }
      
      const response = await fetch(`http://localhost:8000/api/search/global?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse = await response.json();
      
      if (apiResponse.success) {
        // Converter formato da API básica para o formato esperado pelo frontend
        const data: ResultadoBusca = {
          sucesso: true,
          termo_busca: termo,
          tipo_detectado: 'texto',
          total_resultados: apiResponse.data.total_resultados,
          tempo_execucao: 0.1,
          resultados_por_tipo: apiResponse.data.resultados_por_tipo,
          relacionamentos: {},
          sugestoes: [],
          paginacao: {
            pagina_atual: 1,
            total_paginas: 1,
            total_resultados: apiResponse.data.total_resultados,
            limite: 20,
            offset: 0,
            tem_proxima: false,
            tem_anterior: false
          }
        };
        
        setResults(data);
        setError(null);
      } else {
        setError('Erro na busca');
        setResults(null);
      }
      
    } catch (err) {
      console.error('Erro na busca:', err);
      setError(err instanceof Error ? err.message : 'Erro na comunicação com servidor');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executarBusca();
  };

  // Seleção de sugestão
  const selecionarSugestao = (sugestao: string) => {
    setSearchQuery(sugestao);
    setShowSugestoes(false);
    executarBusca(sugestao);
  };

  // Update filtros
  const updateFiltros = (novos: Partial<FiltrosAvancados>) => {
    setFiltros(prev => ({ ...prev, ...novos }));
  };

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      limite: 20,
      offset: 0,
      incluir_inativos: false,
      incluir_historico: false,
      ordenacao: 'relevancia'
    });
  };

  // Stats dos resultados
  const stats = results ? {
    locadores: results.resultados_por_tipo.locadores?.dados?.length || 0,
    locatarios: results.resultados_por_tipo.locatarios?.dados?.length || 0,
    imoveis: results.resultados_por_tipo.imoveis?.dados?.length || 0,
    contratos: results.resultados_por_tipo.contratos?.dados?.length || 0,
    total: results.total_resultados || 0,
    tempo: results.tempo_execucao || 0,
    tipo_detectado: results.tipo_detectado || 'texto'
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header da Busca */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glass rounded-3xl shadow-2xl overflow-hidden mb-6"
        >
          {/* Cabeçalho */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-foreground/20 rounded-xl">
                  <Search className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary-foreground">Busca Avançada</h1>
                  <p className="text-primary-foreground/80 mt-1">Sistema inteligente de busca com relacionamentos</p>
                </div>
              </div>
              
              {stats && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center space-x-4 text-primary-foreground"
                >
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm font-medium">{stats.total} resultados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{(stats.tempo * 1000).toFixed(0)}ms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm capitalize">{stats.tipo_detectado}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Área de Busca */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de Busca Principal */}
              <div className="relative">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Digite para buscar... (nomes, CPF/CNPJ, endereços, valores, etc.)"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (searchQuery.trim()) {
                            executarBusca();
                          }
                        }
                      }}
                      className="input-section pl-12 pr-4 h-14 text-lg"
                      disabled={loading}
                      autoComplete="off"
                    />
                    
                    {/* Sugestões desabilitadas para permitir digitação livre */}
                  </div>
                  
                  {/* Botões de Ação */}
                  <button 
                    type="submit"
                    className="btn-primary px-8 h-14"
                    disabled={loading || !searchQuery.trim()}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Search className="w-5 h-5 mr-2" />
                    )}
                    Buscar
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-6 h-14 rounded-lg transition-all duration-200 border-2 flex items-center space-x-2 ${
                      showFilters 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-card text-foreground border-border hover:border-primary'
                    }`}
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    <span>Filtros</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Filtros Avançados */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <SimpleFilters 
                      filtros={filtros}
                      updateFiltros={updateFiltros}
                      limparFiltros={limparFiltros}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>

        {/* Resultados */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card-glass rounded-2xl p-6 mb-6"
            >
              <div className="flex items-center space-x-3 text-destructive">
                <AlertCircle className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">Erro na busca</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {results && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Cards de Estatísticas */}
              {stats && stats.total > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Locadores */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {stats.locadores}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Locadores</h3>
                    {results.resultados_por_tipo.locadores && (
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        de {results.resultados_por_tipo.locadores.total} total
                      </p>
                    )}
                  </motion.div>

                  {/* Locatários */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <UserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <span className="text-3xl font-bold text-green-900 dark:text-green-100">
                        {stats.locatarios}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Locatários</h3>
                    {results.resultados_por_tipo.locatarios && (
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        de {results.resultados_por_tipo.locatarios.total} total
                      </p>
                    )}
                  </motion.div>

                  {/* Imóveis */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Home className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      <span className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                        {stats.imoveis}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">Imóveis</h3>
                    {results.resultados_por_tipo.imoveis && (
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        de {results.resultados_por_tipo.imoveis.total} total
                      </p>
                    )}
                  </motion.div>

                  {/* Contratos */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <FileText className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                      <span className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                        {stats.contratos}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">Contratos</h3>
                    {results.resultados_por_tipo.contratos && (
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        de {results.resultados_por_tipo.contratos.total} total
                      </p>
                    )}
                  </motion.div>
                </div>
              )}

              {/* Lista de Resultados */}
              <div className="space-y-8">
                {/* Locadores */}
                {results.resultados_por_tipo.locadores && results.resultados_por_tipo.locadores.dados.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card-glass rounded-2xl overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <Users className="w-6 h-6 mr-2" />
                        Locadores ({results.resultados_por_tipo.locadores.dados.length})
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {results.resultados_por_tipo.locadores.dados.map((locador: any, index: number) => (
                        <motion.div
                          key={locador.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="card p-4 hover:shadow-lg transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-foreground">{locador.nome}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-muted-foreground">
                                <p>📞 {locador.telefone}</p>
                                <p>📧 {locador.email}</p>
                                <p>📍 {locador.endereco_completo}</p>
                              </div>
                              
                              {locador.estatisticas && (
                                <div className="flex items-center space-x-6 mt-3">
                                  <div className="flex items-center space-x-1">
                                    <Home className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium">{locador.estatisticas.total_imoveis} imóveis</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <FileText className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium">{locador.estatisticas.contratos_ativos} contratos</span>
                                  </div>
                                  {locador.estatisticas.receita_mensal_bruta > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                                      <span className="text-sm font-medium">
                                        {formatCurrency(locador.estatisticas.receita_mensal_bruta)}/mês
                                      </span>
                                    </div>
                                  )}
                                  {locador.estatisticas.avaliacao_media > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <Star className="w-4 h-4 text-yellow-600" />
                                      <span className="text-sm font-medium">
                                        {locador.estatisticas.avaliacao_media.toFixed(1)} ⭐
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                locador.ativo 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {locador.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Locatários */}
                {results.resultados_por_tipo.locatarios && results.resultados_por_tipo.locatarios.dados.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card-glass rounded-2xl overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <UserCheck className="w-6 h-6 mr-2" />
                        Locatários ({results.resultados_por_tipo.locatarios.dados.length})
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {results.resultados_por_tipo.locatarios.dados.map((locatario: any, index: number) => (
                        <motion.div
                          key={locatario.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="card p-4 hover:shadow-lg transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-foreground">{locatario.nome}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-muted-foreground">
                                <p>📞 {locatario.telefone}</p>
                                <p>📧 {locatario.email}</p>
                                <p>🆔 {locatario.cpf_cnpj}</p>
                              </div>
                              
                              <div className="flex items-center space-x-6 mt-3">
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium">💼 {locatario.profissao || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium">🔒 {locatario.tipo_garantia || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium">👫 {locatario.estado_civil || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                locatario.status_contrato === 'ativo' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}>
                                {locatario.status_contrato || 'Disponível'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Imóveis */}
                {results.resultados_por_tipo.imoveis && results.resultados_por_tipo.imoveis.dados.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="card-glass rounded-2xl overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <Home className="w-6 h-6 mr-2" />
                        Imóveis ({results.resultados_por_tipo.imoveis.dados.length})
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {results.resultados_por_tipo.imoveis.dados.map((imovel: any, index: number) => (
                        <motion.div
                          key={imovel.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="card p-4 hover:shadow-lg transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-foreground">{imovel.endereco || 'Endereço não informado'}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-muted-foreground">
                                <p>🏠 {imovel.tipo}</p>
                                <p>💰 {formatCurrency(imovel.valor_aluguel)}</p>
                                <p>👤 {imovel.locador?.nome}</p>
                              </div>
                              
                              <div className="flex items-center space-x-6 mt-3">
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium">🛏️ {imovel.quartos || 0} quartos</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium">🚿 {imovel.banheiros || 0} banheiros</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium">🚗 {imovel.vagas_garagem || 0} vagas</span>
                                </div>
                                {imovel.condominio > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-sm font-medium">🏢 {formatCurrency(imovel.condominio)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                imovel.status === 'Disponivel' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {imovel.status}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Contratos */}
                {results.resultados_por_tipo.contratos && results.resultados_por_tipo.contratos.dados.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="card-glass rounded-2xl overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <FileText className="w-6 h-6 mr-2" />
                        Contratos ({results.resultados_por_tipo.contratos.dados.length})
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {results.resultados_por_tipo.contratos.dados.map((contrato: any, index: number) => (
                        <motion.div
                          key={contrato.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="card p-4 hover:shadow-lg transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-foreground">Contrato #{contrato.id}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-muted-foreground">
                                <p>👤 {contrato.locatario?.nome}</p>
                                <p>🏠 {contrato.imovel?.endereco}</p>
                                <p>👨‍💼 {contrato.locador?.nome}</p>
                              </div>
                              
                              <div className="flex items-center space-x-6 mt-3">
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium">📅 {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')} - {new Date(contrato.data_fim).toLocaleDateString('pt-BR')}</span>
                                </div>
                                {contrato.valor_aluguel && (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-sm font-medium">💰 {formatCurrency(contrato.valor_aluguel)}</span>
                                  </div>
                                )}
                                {contrato.vencimento_dia && (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-sm font-medium">📆 Venc: dia {contrato.vencimento_dia}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                contrato.status === 'ativo' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {contrato.status}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Estado vazio */}
                {(!results || stats?.total === 0) && searchQuery && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-glass rounded-2xl p-12 text-center"
                  >
                    <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-muted-foreground mb-6">
                      Não encontramos resultados para "{searchQuery}". Tente:
                    </p>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>• Verificar a ortografia</p>
                      <p>• Usar termos mais gerais</p>
                      <p>• Incluir registros inativos nos filtros</p>
                      <p>• Tentar apenas parte do nome ou documento</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Paginação */}
              {results && results.paginacao && results.paginacao.total_paginas > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="card-glass rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Página {results.paginacao.pagina_atual} de {results.paginacao.total_paginas} 
                      ({results.paginacao.total_resultados} resultados)
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => executarBusca(searchQuery, { offset: Math.max(0, filtros.offset! - filtros.limite!) })}
                        disabled={!results.paginacao.tem_anterior || loading}
                        className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => executarBusca(searchQuery, { offset: filtros.offset! + filtros.limite! })}
                        disabled={!results.paginacao.tem_proxima || loading}
                        className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card-glass rounded-2xl p-12 text-center"
            >
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Buscando...</h3>
              <p className="text-muted-foreground">
                Analisando "{searchQuery}" em todas as entidades
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedSearchModule;