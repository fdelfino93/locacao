import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { InputWithIcon } from '../ui/input-with-icon';
import { 
  Home, 
  Plus, 
  Search, 
  DollarSign, 
  MapPin, 
  Building,
  Eye,
  Edit,
  Loader2,
  Filter,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  UserCheck,
  UserX,
  MoreHorizontal,
  Bed,
  Bath,
  Car
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Imovel {
  id: number;
  endereco: string;
  tipo: string;
  valor_aluguel: number;
  iptu?: number;
  condominio?: number;
  status?: string;
  ativo?: boolean;
  area_imovel?: string;
  quartos?: number;
  banheiros?: number;
  vagas_garagem?: number;
  mobiliado?: boolean;
  aceita_pets?: boolean;
  id_locador?: number;
  id_locatario?: number;
}

interface Locador {
  id: number;
  nome: string;
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
}

interface ImoveisIndexProps {
  onNavigateToCadastro: () => void;
  onNavigateToDetalhes: (imovelId: number) => void;
  onNavigateToEdicao: (imovelId: number) => void;
}

export const ImoveisIndex: React.FC<ImoveisIndexProps> = ({
  onNavigateToCadastro,
  onNavigateToDetalhes,
  onNavigateToEdicao
}) => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [locadores, setLocadores] = useState<Locador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'endereco'>('endereco');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('todos');

  // Funções para contar imóveis por status
  const getImoveisPorStatus = (status: string) => {
    return imoveis.filter(imovel => {
      const imovelStatus = imovel.status?.toLowerCase() || '';
      const targetStatus = status.toLowerCase();
      
      if (targetStatus === 'disponível' || targetStatus === 'disponivel') {
        return imovelStatus === 'disponível' || imovelStatus === 'disponivel' || (!imovel.status && imovel.ativo !== false);
      }
      
      return imovelStatus === targetStatus;
    });
  };

  const getCountByStatus = (status: string) => {
    return getImoveisPorStatus(status).length;
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setOpenDropdown(null);
    };

    if (openDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar imóveis e locadores em paralelo
      const [imoveisResponse, locadoresResponse] = await Promise.all([
        fetch('http://localhost:8000/api/imoveis'),
        fetch('http://localhost:8000/api/locadores')
      ]);

      const imoveisData = await imoveisResponse.json();
      const locadoresData = await locadoresResponse.json();
      
      if (imoveisData.success && imoveisData.data) {
        setImoveis(imoveisData.data);
      } else {
        throw new Error('Erro ao buscar imóveis');
      }

      if (locadoresData.success && locadoresData.data) {
        setLocadores(locadoresData.data);
      } else {
        throw new Error('Erro ao buscar locadores');
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchImoveis = async () => {
    await fetchData();
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const getProprietarioNome = (id_locador?: number) => {
    if (!id_locador) return 'Não informado';
    const locador = locadores.find(l => l.id === id_locador);
    return locador ? locador.nome : 'Não encontrado';
  };

  const filteredImoveis = imoveis.filter(imovel => {
    // Filtro por busca
    const proprietarioNome = getProprietarioNome(imovel.id_locador);
    const matchesSearch = imovel.endereco?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      imovel.tipo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (imovel.area_imovel && imovel.area_imovel.toLowerCase().includes(searchQuery.toLowerCase())) ||
      proprietarioNome.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por aba ativa baseado no status
    const matchesTab = (() => {
      if (activeTab === 'todos') return true;
      
      const imovelStatus = imovel.status?.toLowerCase() || '';
      
      switch (activeTab) {
        case 'disponivel':
          return imovelStatus === 'disponível' || imovelStatus === 'disponivel' || (!imovel.status && imovel.ativo !== false);
        case 'ocupado':
          return imovelStatus === 'ocupado';
        case 'manutencao':
          return imovelStatus === 'em manutenção' || imovelStatus === 'em manutencao';
        case 'inativo':
          return imovelStatus === 'inativo' || (!imovel.status && imovel.ativo === false);
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesTab;
  });

  const sortedImoveis = [...filteredImoveis].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'endereco') {
      aValue = aValue?.toLowerCase() || '';
      bValue = bValue?.toLowerCase() || '';
    } else {
      aValue = aValue || 0;
      bValue = bValue || 0;
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: typeof sortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  // Função para obter o status formatado do imóvel
  const getStatusDisplay = (imovel: Imovel) => {
    // Primeiro, verificar se há um status específico definido
    if (imovel.status) {
      const status = imovel.status.toLowerCase();
      switch (status) {
        case 'disponível':
        case 'disponivel':
          return { label: 'Disponível', variant: 'default', bgClass: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' };
        case 'ocupado':
          return { label: 'Ocupado', variant: 'default', bgClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' };
        case 'em manutenção':
        case 'em manutencao':
          return { label: 'Em Manutenção', variant: 'default', bgClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' };
        case 'inativo':
          return { label: 'Inativo', variant: 'outline', bgClass: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' };
        default:
          return { label: imovel.status, variant: 'outline', bgClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' };
      }
    }
    
    // Fallback para o sistema antigo de ativo/inativo
    if (imovel.ativo !== false) {
      return { label: 'Disponível', variant: 'default', bgClass: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' };
    } else {
      return { label: 'Inativo', variant: 'outline', bgClass: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' };
    }
  };

  const handleStatusChange = async (imovelId: number, novoStatus: string) => {
    try {
      setLoading(true);
      // Chamada para API para atualizar status
      await apiService.requestPublic(`imoveis/${imovelId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: novoStatus })
      });
      
      // Atualizar a lista local
      setImoveis(prev => prev.map(imovel => 
        imovel.id === imovelId ? { ...imovel, status: novoStatus } : imovel
      ));
      
      setOpenDropdown(null);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (imovelId: number, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setOpenDropdown(openDropdown === imovelId ? null : imovelId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Imóveis</h1>
                  <p className="text-muted-foreground">Gerenciamento e controle de imóveis</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={onNavigateToCadastro}
                  className="btn-gradient"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Imóvel
                </Button>
              </div>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Disponíveis</p>
                    <p className="text-xl font-bold text-foreground truncate">{getCountByStatus('disponível')}</p>
                  </div>
                  <UserCheck className="w-7 h-7 text-green-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Ocupados</p>
                    <p className="text-xl font-bold text-foreground truncate">{getCountByStatus('ocupado')}</p>
                  </div>
                  <Home className="w-7 h-7 text-blue-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Em Manutenção</p>
                    <p className="text-xl font-bold text-foreground truncate">{getCountByStatus('em manutenção')}</p>
                  </div>
                  <UserX className="w-7 h-7 text-yellow-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Inativos</p>
                    <p className="text-xl font-bold text-foreground truncate">{getCountByStatus('inativo')}</p>
                  </div>
                  <UserX className="w-7 h-7 text-red-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sistema de Abas */}
          <Card className="card-glass">
            <CardContent className="p-8">
              <div className="w-full">
                <div className="grid w-full grid-cols-5 gap-2 mb-8 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setActiveTab('todos')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'todos' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>TODOS</span>
                    <Badge variant="secondary" className="ml-2">{imoveis.length}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('disponivel')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'disponivel' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>DISPONÍVEIS</span>
                    <Badge variant="secondary" className="ml-2">{getCountByStatus('disponível')}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('ocupado')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'ocupado' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>OCUPADOS</span>
                    <Badge variant="secondary" className="ml-2">{getCountByStatus('ocupado')}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('manutencao')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'manutencao' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>MANUTENÇÃO</span>
                    <Badge variant="secondary" className="ml-2">{getCountByStatus('em manutenção')}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('inativo')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'inativo' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>INATIVOS</span>
                    <Badge variant="secondary" className="ml-2">{getCountByStatus('inativo')}</Badge>
                  </button>
                </div>

                {/* Filtros */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Busca */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Buscar Imóveis</Label>
                      <InputWithIcon
                        icon={Search}
                        placeholder="Buscar por endereço, tipo, área ou proprietário..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Tipo */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Tipo</Label>
                      <select 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                      >
                        <option value="">Todos os tipos</option>
                        <option value="Apartamento">Apartamento</option>
                        <option value="Casa">Casa</option>
                        <option value="Comercial">Comercial</option>
                        <option value="Terreno">Terreno</option>
                      </select>
                    </div>

                    {/* Total */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Imóveis</Label>
                      <div className="bg-muted/30 px-3 py-2 rounded-md">
                        <p className="text-sm font-medium text-foreground">{sortedImoveis.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center space-x-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-lg text-muted-foreground">Carregando imóveis...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">{error}</div>
                  <Button onClick={fetchImoveis} variant="outline">
                    Tentar Novamente
                  </Button>
                </div>
              ) : sortedImoveis.length === 0 ? (
                <div className="text-center py-12">
                  <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {searchQuery ? 'Nenhum imóvel encontrado' : 'Nenhum imóvel cadastrado'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? 'Tente buscar com outros termos' : 'Cadastre o primeiro imóvel do sistema'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={onNavigateToCadastro} className="btn-gradient">
                      <Plus className="w-5 h-5 mr-2" />
                      Cadastrar Primeiro Imóvel
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <button 
                              onClick={() => handleSort('endereco')}
                              className="flex items-center space-x-2 font-medium text-foreground hover:text-primary"
                            >
                              <span>Endereço</span>
                              {getSortIcon('endereco')}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-left">
                            <span className="font-medium text-foreground">Tipo & Valor</span>
                          </th>
                          <th className="px-4 py-3 text-left">
                            <span className="font-medium text-foreground">Proprietário</span>
                          </th>
                          <th className="px-4 py-3 text-left">
                            <span className="font-medium text-foreground">Detalhes</span>
                          </th>
                          <th className="px-4 py-3 text-left">
                            <span className="font-medium text-foreground">Status</span>
                          </th>
                          <th className="px-4 py-3 text-left">
                            <span className="font-medium text-foreground">Ações</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {sortedImoveis.map((imovel) => (
                          <tr key={imovel.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                                  <Home className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{imovel.endereco}</div>
                                  {imovel.area_imovel && (
                                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                                      {imovel.area_imovel}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <Badge variant="outline" className="mb-1">{imovel.tipo}</Badge>
                                <div className="font-semibold text-green-600">
                                  {formatCurrency(imovel.valor_aluguel)}
                                </div>
                                {(imovel.condominio || imovel.iptu) && (
                                  <div className="text-xs text-muted-foreground">
                                    {imovel.condominio && `Cond: ${formatCurrency(imovel.condominio)}`}
                                    {imovel.condominio && imovel.iptu && ' • '}
                                    {imovel.iptu && `IPTU: ${formatCurrency(imovel.iptu)}`}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <div className="p-1 bg-orange-100 dark:bg-orange-900/20 rounded">
                                  <UserCheck className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">
                                    {getProprietarioNome(imovel.id_locador)}
                                  </div>
                                  {imovel.id_locador && (
                                    <div className="text-xs text-muted-foreground">
                                      ID: {imovel.id_locador}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {imovel.quartos && (
                                    <div className="flex items-center gap-1">
                                      <Bed className="w-3 h-3" />
                                      {imovel.quartos}
                                    </div>
                                  )}
                                  {imovel.banheiros && (
                                    <div className="flex items-center gap-1">
                                      <Bath className="w-3 h-3" />
                                      {imovel.banheiros}
                                    </div>
                                  )}
                                  {imovel.vagas_garagem && (
                                    <div className="flex items-center gap-1">
                                      <Car className="w-3 h-3" />
                                      {imovel.vagas_garagem}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {(() => {
                                const statusInfo = getStatusDisplay(imovel);
                                return (
                                  <Badge className={statusInfo.bgClass}>
                                    {statusInfo.label}
                                  </Badge>
                                );
                              })()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onNavigateToDetalhes(imovel.id)}
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200"
                                  title="Visualizar detalhes do imóvel"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onNavigateToEdicao(imovel.id)}
                                  className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-200"
                                  title="Editar informações do imóvel"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                
                                {/* Dropdown Menu */}
                                <div className="relative">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => toggleDropdown(imovel.id, e)}
                                    className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-gray-300"
                                    title="Mais opções para este imóvel"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                  
                                  {openDropdown === imovel.id && (
                                    <div 
                                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="py-1">
                                        {imovel.status !== 'Disponível' && (
                                          <button
                                            onClick={() => handleStatusChange(imovel.id, 'Disponível')}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                          >
                                            <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                                            Disponível
                                          </button>
                                        )}
                                        {imovel.status !== 'Ocupado' && (
                                          <button
                                            onClick={() => handleStatusChange(imovel.id, 'Ocupado')}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                          >
                                            <UserCheck className="w-4 h-4 mr-2 text-blue-600" />
                                            Ocupado
                                          </button>
                                        )}
                                        {imovel.status !== 'Em manutenção' && (
                                          <button
                                            onClick={() => handleStatusChange(imovel.id, 'Em manutenção')}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                          >
                                            <UserX className="w-4 h-4 mr-2 text-yellow-600" />
                                            Em Manutenção
                                          </button>
                                        )}
                                        {imovel.status !== 'Inativo' && (
                                          <button
                                            onClick={() => handleStatusChange(imovel.id, 'Inativo')}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                          >
                                            <UserX className="w-4 h-4 mr-2 text-red-600" />
                                            Inativo
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ImoveisIndex;