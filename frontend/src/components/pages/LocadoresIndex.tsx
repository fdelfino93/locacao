import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { InputWithIcon } from '../ui/input-with-icon';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
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
  MoreHorizontal
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Locador {
  id: number;
  nome: string;
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  tipo_recebimento?: string;
  qtd_imoveis?: number;
  contratos_ativos?: number;
  receita_mensal_bruta?: number;
  ativo?: boolean;
}

interface LocadoresIndexProps {
  onNavigateToCadastro: () => void;
  onNavigateToDetalhes: (locadorId: number) => void;
  onNavigateToEdicao: (locadorId: number) => void;
}

export const LocadoresIndex: React.FC<LocadoresIndexProps> = ({
  onNavigateToCadastro,
  onNavigateToDetalhes,
  onNavigateToEdicao
}) => {
  const [locadores, setLocadores] = useState<Locador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'nome'>('nome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('todos');

  useEffect(() => {
    fetchLocadores();
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

  const fetchLocadores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar todos os locadores usando proxy configurado
      const response = await fetch('/api/locadores');
      const data = await response.json();
      
      if (data.success && data.data) {
        setLocadores(data.data);
      } else {
        throw new Error('Erro ao buscar locadores');
      }
    } catch (err) {
      console.error('Erro ao carregar locadores:', err);
      setError('Erro ao carregar locadores');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const filteredLocadores = locadores.filter(locador => {
    // Filtro por busca
    const matchesSearch = locador.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (locador.cpf_cnpj && locador.cpf_cnpj.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (locador.email && locador.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filtro por aba ativa
    const isActive = locador.ativo !== false; // Considera ativo quando ativo=true ou undefined
    const matchesTab = activeTab === 'todos' || 
      (activeTab === 'ativos' && isActive) || 
      (activeTab === 'inativos' && !isActive);
    
    return matchesSearch && matchesTab;
  });

  const sortedLocadores = [...filteredLocadores].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'nome') {
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

  const handleStatusChange = async (locadorId: number, novoStatus: boolean) => {
    try {
      setLoading(true);
      // Chamada para API para atualizar status
      await apiService.requestPublic(`locadores/${locadorId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ ativo: novoStatus })
      });
      
      // Atualizar a lista local
      setLocadores(prev => prev.map(loc => 
        loc.id === locadorId ? { ...loc, ativo: novoStatus } : loc
      ));
      
      setOpenDropdown(null);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (locadorId: number, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setOpenDropdown(openDropdown === locadorId ? null : locadorId);
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
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Locadores</h1>
                  <p className="text-muted-foreground">Gerenciamento e controle de locadores</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={onNavigateToCadastro}
                  className="btn-gradient"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Locador
                </Button>
              </div>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Total Locadores</p>
                    <p className="text-xl font-bold text-foreground truncate">{locadores.length}</p>
                  </div>
                  <Users className="w-7 h-7 text-blue-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Locadores Ativos</p>
                    <p className="text-xl font-bold text-foreground truncate">
                      {locadores.filter(loc => loc.ativo !== false).length}
                    </p>
                  </div>
                  <UserCheck className="w-7 h-7 text-green-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Locadores Inativos</p>
                    <p className="text-xl font-bold text-foreground truncate">
                      {locadores.filter(loc => loc.ativo === false).length}
                    </p>
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
                <div className="grid w-full grid-cols-3 gap-2 mb-8 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setActiveTab('todos')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'todos' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>TODOS</span>
                    <Badge variant="secondary" className="ml-2">{locadores.length}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('ativos')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'ativos' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>ATIVOS</span>
                    <Badge variant="secondary" className="ml-2">{locadores.filter(loc => loc.ativo !== false).length}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('inativos')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'inativos' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>INATIVOS</span>
                    <Badge variant="secondary" className="ml-2">{locadores.filter(loc => loc.ativo === false).length}</Badge>
                  </button>
                </div>

                {/* Filtros */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Busca */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Buscar Locadores</Label>
                      <InputWithIcon
                        icon={Search}
                        placeholder="Buscar por nome, CPF/CNPJ ou email..."
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
                        <option value="pf">Pessoa Física</option>
                        <option value="pj">Pessoa Jurídica</option>
                      </select>
                    </div>

                    {/* Total */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Locadores</Label>
                      <div className="bg-muted/30 px-3 py-2 rounded-md">
                        <p className="text-sm font-medium text-foreground">{sortedLocadores.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center space-x-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-lg text-muted-foreground">Carregando locadores...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">{error}</div>
                  <Button onClick={fetchLocadores} variant="outline">
                    Tentar Novamente
                  </Button>
                </div>
              ) : sortedLocadores.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {searchQuery ? 'Nenhum locador encontrado' : 'Nenhum locador cadastrado'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? 'Tente buscar com outros termos' : 'Cadastre o primeiro locador do sistema'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={onNavigateToCadastro} className="btn-gradient">
                      <Plus className="w-5 h-5 mr-2" />
                      Cadastrar Primeiro Locador
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
                              onClick={() => handleSort('nome')}
                              className="flex items-center space-x-2 font-medium text-foreground hover:text-primary"
                            >
                              <span>Nome</span>
                              {getSortIcon('nome')}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-left">
                            <span className="font-medium text-foreground">Contato</span>
                          </th>
                          <th className="px-4 py-3 text-left">
                            <span className="font-medium text-foreground">CPF/CNPJ</span>
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
                        {sortedLocadores.map((locador) => (
                          <tr key={locador.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                                  <UserCheck className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{locador.nome}</div>
                                  {locador.endereco && (
                                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                                      {locador.endereco}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                {locador.telefone && (
                                  <div className="text-sm text-foreground">{locador.telefone}</div>
                                )}
                                {locador.email && (
                                  <div className="text-sm text-muted-foreground truncate max-w-xs">{locador.email}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-foreground">
                                {locador.cpf_cnpj || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {locador.ativo !== false ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                                  Inativo
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onNavigateToDetalhes(locador.id)}
                                  className="h-8 w-8 p-0"
                                  title="Visualizar locador"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onNavigateToEdicao(locador.id)}
                                  className="h-8 w-8 p-0"
                                  title="Editar locador"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                
                                {/* Dropdown Menu */}
                                <div className="relative">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => toggleDropdown(locador.id, e)}
                                    className="h-8 w-8 p-0"
                                    title="Mais ações"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                  
                                  {openDropdown === locador.id && (
                                    <div 
                                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="py-1">
                                        <button
                                          onClick={() => handleStatusChange(locador.id, true)}
                                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                          disabled={locador.ativo === true}
                                        >
                                          <UserCheck className="w-4 h-4 mr-2" />
                                          Ativo
                                        </button>
                                        <button
                                          onClick={() => handleStatusChange(locador.id, false)}
                                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                          disabled={locador.ativo === false}
                                        >
                                          <UserX className="w-4 h-4 mr-2" />
                                          Inativo
                                        </button>
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

export default LocadoresIndex;