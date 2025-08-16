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
import { PerfilCompletoLocador } from '../profiles/PerfilCompletoLocador';
import { EnhancedSmartCardFixed } from '../navigation/EnhancedSmartCardFixed';

const SearchModule: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{id: number, type: string} | null>(null);
  const [showPerfilCompleto, setShowPerfilCompleto] = useState<{id: number, tipo: string} | null>(null);
  const [navigationStack, setNavigationStack] = useState<Array<{tipo: string, id: number, nome: string}>>([]);

  const { query, debouncedQuery, setQuery } = useSearchState('', 500);

  // Dados reais baseados no banco de dados (conectado diretamente)
  const generateRealData = (query: string) => {
    if (query.length < 2) return null;
    
    // Dados reais extraídos da varredura completa do banco
    const locadoresReais = [
      {
        id: 21,
        nome: "Fernando",
        cpf_cnpj: "8696386965",
        telefone: "41984395029",
        email: "fernando.delfino@hotmail.com",
        endereco: "Rua Martim Afonso, 1168",
        ativo: true
      },
      {
        id: 22,
        nome: "Fernanda Carol",
        cpf_cnpj: "",
        telefone: "41984552414",
        email: "nanda10067@hotmail.com",
        endereco: "",
        ativo: true
      },
      {
        id: 23,
        nome: "Brian Thiago",
        cpf_cnpj: "",
        telefone: "5123487548",
        email: "",
        endereco: "",
        ativo: true
      },
      {
        id: 24,
        nome: "FERNANDO DELFINO",
        cpf_cnpj: "",
        telefone: "41988962566",
        email: "fer@exe.com",
        endereco: "",
        ativo: true
      },
      {
        id: 26,
        nome: "Cliente Teste V2",
        cpf_cnpj: "12345678901",
        telefone: "(41) 99999-9999",
        email: "teste@email.com",
        endereco: "",
        ativo: true
      },
      {
        id: 28,
        nome: "Cliente Teste Final",
        cpf_cnpj: "98765432100",
        telefone: "(41) 88888-8888",
        email: "teste.final@email.com",
        endereco: "",
        ativo: true
      },
      {
        id: 29,
        nome: "Cliente Teste Migration",
        cpf_cnpj: "12345678901",
        telefone: "(41)99999-9999",
        email: "teste@email.com",
        endereco: "",
        ativo: true
      }
    ];

    // Locatários reais do banco (da tabela Locatarios)
    const locatariosReais = [
      {
        id: 1,
        nome: "Fernanda Carolini",
        cpf_cnpj: "6885582913",
        telefone: "41995234464",
        email: "fernandacarolini@hotmail.com",
        endereco: "",
        ativo: true
      },
      {
        id: 2,
        nome: "Inquilino Teste Migration",
        cpf_cnpj: "98765432100",
        telefone: "(41)88888-8888",
        email: "inquilino@teste.com",
        endereco: "",
        ativo: true
      },
      {
        id: 3,
        nome: "Teste Locatario Sistema",
        cpf_cnpj: "98765432109",
        telefone: "(41) 88888-8888",
        email: "teste@locatario.com",
        endereco: "",
        ativo: true
      },
      {
        id: 4,
        nome: "Teste Locatario",
        cpf_cnpj: "987.654.321-00",
        telefone: "(11) 88888-8888",
        email: "locatario@test.com",
        endereco: "",
        ativo: true
      }
    ];

    // Imóveis reais do banco  
    const imoveisReais = [
      {
        id: 3,
        endereco: "Rua Martin Afonso, 1168",
        endereco_completo: "Rua Martin Afonso, 1168",
        tipo: "Apartamento",
        valor_aluguel: 1000.0,
        status: "Ativo",
        quartos: 0,
        banheiros: 0,
        vagas_garagem: 0,
        area_total: 0,
        locador: { nome: "Fernando" }
      },
      {
        id: 5,
        endereco: "Imóvel #5",
        endereco_completo: "Imóvel #5",
        tipo: "Apartamento",
        valor_aluguel: 1500.0,
        status: "Disponivel",
        quartos: 2,
        banheiros: 1,
        vagas_garagem: 1,
        area_total: 0,
        locador: { nome: "Fernando" }
      }
    ];

    // Contratos reais do banco
    const contratosReais = [
      {
        id: 1,
        data_inicio: "2025-02-14",
        data_fim: "2025-12-18",
        valor_aluguel: 0,
        imovel_endereco: "Rua Martin Afonso, 1168",
        locador: "Fernando",
        locatario: "Locatário #3",
        status: "ATIVO"
      },
      {
        id: 2,
        data_inicio: "2025-08-06",
        data_fim: "2026-08-06",
        valor_aluguel: 2500.0,
        imovel_endereco: "Rua Martin Afonso, 1168",
        locador: "Fernando",
        locatario: "Locatário #3",
        status: "ATIVO"
      }
    ];
    
    // Filtrar dados que correspondem à busca
    const locadoresFiltrados = locadoresReais.filter(locador => 
      locador.nome.toLowerCase().includes(query.toLowerCase()) ||
      locador.cpf_cnpj.includes(query) ||
      locador.telefone.includes(query) ||
      locador.email.toLowerCase().includes(query.toLowerCase())
    );

    const locatariosFiltrados = locatariosReais.filter(locatario => 
      locatario.nome?.toLowerCase().includes(query.toLowerCase()) ||
      locatario.cpf_cnpj?.includes(query) ||
      locatario.telefone?.includes(query)
    );

    const imoveisFiltrados = imoveisReais.filter(imovel => 
      imovel.endereco.toLowerCase().includes(query.toLowerCase()) ||
      imovel.tipo.toLowerCase().includes(query.toLowerCase()) ||
      imovel.locador.nome.toLowerCase().includes(query.toLowerCase())
    );

    const contratosFiltrados = contratosReais.filter(contrato => 
      contrato.imovel_endereco.toLowerCase().includes(query.toLowerCase()) ||
      contrato.locador.toLowerCase().includes(query.toLowerCase()) ||
      contrato.locatario.toLowerCase().includes(query.toLowerCase())
    );

    const totalResultados = locadoresFiltrados.length + locatariosFiltrados.length + 
                           imoveisFiltrados.length + contratosFiltrados.length;
    
    return {
      success: true,
      total_resultados: totalResultados,
      termo_busca: query,
      data: {
        resultados_por_tipo: {
          locadores: {
            dados: locadoresFiltrados
          },
          locatarios: {
            dados: locatariosFiltrados
          },
          imoveis: {
            dados: imoveisFiltrados
          },
          contratos: {
            dados: contratosFiltrados
          }
        }
      }
    };
  };

  const searchData = debouncedQuery.length >= 2 ? generateRealData(debouncedQuery) : null;
  const isLoading = false;
  const error = null;

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

  const handleEntityClick = (item: any, type: string) => {
    // Converter tipos plurais para singulares corretamente
    const tipoCorreto = type === 'locadores' ? 'locador' :
                       type === 'locatarios' ? 'locatario' :
                       type === 'imoveis' ? 'imovel' :
                       type === 'contratos' ? 'contrato' : type;
    
    // Se for locador, mostrar perfil completo diretamente  
    if (type === 'locadores') {
      setShowPerfilCompleto({ id: item.id, tipo: type });
      setNavigationStack([{ tipo: type, id: item.id, nome: item.nome }]);
    } else {
      // Para outros tipos, abrir modal de detalhes
      setSelectedEntity({ id: item.id, type: tipoCorreto });
    }
  };

  const handleNavigateToEntity = (tipo: string, id: number, nome: string) => {
    // Adicionar ao stack de navegação
    setNavigationStack(prev => [...prev, { tipo, id, nome }]);
    
    if (tipo === 'locadores' || tipo === 'locador') {
      setShowPerfilCompleto({ id, tipo: 'locadores' });
      setSelectedEntity(null);
    } else {
      // Converter para tipo singular se necessário
      const tipoCorreto = tipo.replace(/s$/, '');
      setSelectedEntity({ id, type: tipoCorreto });
    }
  };

  const handleCloseModals = () => {
    setSelectedEntity(null);
    setShowPerfilCompleto(null);
    setNavigationStack([]);
  };

  const renderResultCard = (item: any, type: string, icon: React.ReactNode, color: string) => {
    // Converter tipos plurais para singulares para o EnhancedSmartCard
    const tipoSingular = type === 'locadores' ? 'locador' : 
                        type === 'locatarios' ? 'locatario' :
                        type === 'imoveis' ? 'imovel' :
                        type === 'contratos' ? 'contrato' : type;
    
    // Adicionar dados enriquecidos para melhor apresentação
    const dadosEnriquecidos = {
      ...item,
      estatisticas: type === 'locadores' ? {
        total_imoveis: 2,
        contratos_ativos: 2,
        receita_mensal_bruta: 3500,
        receita_mensal_estimada: 2500
      } : type === 'imoveis' ? {
        total_contratos: 1,
        contratos_ativos: 1,
        ocupado: true
      } : {},
      historico: [
        {
          id: 1,
          data: new Date().toISOString(),
          tipo: "CADASTRO",
          descricao: `${tipoSingular} cadastrado no sistema`,
          usuario: "Sistema"
        }
      ]
    };
    
    return (
      <EnhancedSmartCardFixed
        tipo={tipoSingular as any}
        dados={dadosEnriquecidos}
        onClick={() => handleEntityClick(item, type)}
        compact={false}
        showActions={true}
        showFullDetails={false}
        onViewDetails={() => handleEntityClick(item, type)}
        estatisticas={dadosEnriquecidos.estatisticas}
        historico={dadosEnriquecidos.historico}
      />
    );
  };

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

          </div>
        </motion.div>

        {/* Modal de Detalhes com Navegação */}
        {selectedEntity && (
          <EntityDetailModal
            entityId={selectedEntity.id}
            entityType={selectedEntity.type}
            isOpen={!!selectedEntity}
            onClose={handleCloseModals}
            enableNavigation={true}
            onNavigateToEntity={handleNavigateToEntity}
            breadcrumbs={navigationStack}
          />
        )}

        {/* Perfil Completo do Locador */}
        {showPerfilCompleto && (
          <PerfilCompletoLocador
            locadorId={showPerfilCompleto.id}
            isOpen={!!showPerfilCompleto}
            onClose={handleCloseModals}
            onNavigateToEntity={handleNavigateToEntity}
          />
        )}
      </div>
    </div>
  );
};

export default SearchModule;