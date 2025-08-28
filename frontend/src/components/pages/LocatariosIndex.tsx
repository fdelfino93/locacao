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
  Home,
  PawPrint
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Locatario {
  id: number;
  nome: string;
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  estado_civil?: string;
  profissao?: string;
  pet_inquilino?: boolean;
  qtd_pet_inquilino?: number;
  porte_pet?: string;
  contratos_ativos?: number;
  ativo?: boolean;
}

interface LocatariosIndexProps {
  onNavigateToCadastro: () => void;
  onNavigateToDetalhes: (locatarioId: number) => void;
  onNavigateToEdicao: (locatarioId: number) => void;
}

export const LocatariosIndex: React.FC<LocatariosIndexProps> = ({
  onNavigateToCadastro,
  onNavigateToDetalhes,
  onNavigateToEdicao
}) => {
  const [locatarios, setLocatarios] = useState<Locatario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'nome'>('nome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    fetchLocatarios();
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

  const fetchLocatarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar todos os locatários usando API direta (que inclui campo 'ativo')
      const response = await fetch('http://localhost:8000/api/locatarios');
      const data = await response.json();
      
      if (data.success && data.data) {
        setLocatarios(data.data);
      } else {
        // Se não funcionar, usar busca geral
        const searchResponse = await fetch('http://localhost:8000/api/busca?query=*&tipo=locatarios');
        const searchData = await searchResponse.json();
        
        if (searchData.success && searchData.data && searchData.data.locatarios) {
          setLocatarios(searchData.data.locatarios);
        } else {
          throw new Error('Erro ao buscar locatários');
        }
      }
    } catch (err) {
      console.error('Erro ao carregar locatários:', err);
      setError('Erro ao carregar locatários');
    } finally {
      setLoading(false);
    }
  };


  const filteredLocatarios = locatarios.filter(locatario => {
    // Filtro por busca
    const matchesSearch = locatario.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (locatario.cpf_cnpj && locatario.cpf_cnpj.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (locatario.email && locatario.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filtro por aba ativa
    const isActive = locatario.ativo !== false; // Considera ativo quando ativo=true ou undefined
    const matchesTab = activeTab === 'todos' || 
      (activeTab === 'ativos' && isActive) || 
      (activeTab === 'inativos' && !isActive);
    
    // Filtro por tipo
    const matchesTipo = !filtroTipo || 
      (locatario.cpf_cnpj && locatario.cpf_cnpj.length === 11 && filtroTipo === 'PF') ||
      (locatario.cpf_cnpj && locatario.cpf_cnpj.length === 14 && filtroTipo === 'PJ');
    
    return matchesSearch && matchesTab && matchesTipo;
  });

  const sortedLocatarios = [...filteredLocatarios].sort((a, b) => {
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

  const handleStatusChange = async (locatarioId: number, novoStatus: boolean) => {
    try {
      setLoading(true);
      // Chamada para API para atualizar status
      await apiService.requestPublic(`locatarios/${locatarioId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ ativo: novoStatus })
      });
      
      // Atualizar a lista local
      setLocatarios(prev => prev.map(loc => 
        loc.id === locatarioId ? { ...loc, ativo: novoStatus } : loc
      ));
      
      setOpenDropdown(null);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (locatarioId: number, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setOpenDropdown(openDropdown === locatarioId ? null : locatarioId);
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
                  <h1 className="text-3xl font-bold text-foreground">Locatários</h1>
                  <p className="text-muted-foreground">Gerenciamento e controle de locatários</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={onNavigateToCadastro}
                  className="btn-gradient"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Locatário
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
                    <p className="text-sm font-medium text-muted-foreground truncate">Total Locatários</p>
                    <p className="text-xl font-bold text-foreground truncate">{locatarios.length}</p>
                  </div>
                  <Users className="w-7 h-7 text-blue-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Locatários Ativos</p>
                    <p className="text-xl font-bold text-foreground truncate">
                      {locatarios.filter(loc => loc.ativo !== false).length}
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
                    <p className="text-sm font-medium text-muted-foreground truncate">Locatários Inativos</p>
                    <p className="text-xl font-bold text-foreground truncate">
                      {locatarios.filter(loc => loc.ativo === false).length}
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
                    <Badge variant="secondary" className="ml-2">{locatarios.length}</Badge>
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
                    <Badge variant="secondary" className="ml-2">{locatarios.filter(loc => loc.ativo !== false).length}</Badge>
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
                    <Badge variant="secondary" className="ml-2">{locatarios.filter(loc => loc.ativo === false).length}</Badge>
                  </button>
                </div>

                {/* Filtros */}
                <div className="mb-8">
                  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Busca */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Buscar Locatários</Label>
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
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                      >
                        <option value="">Todos os tipos</option>
                        <option value="PF">Pessoa Física</option>
                        <option value="PJ">Pessoa Jurídica</option>
                      </select>
                    </div>

                    {/* Total */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Locatários</Label>
                      <div className="bg-muted/30 px-3 py-2 rounded-md">
                        <p className="text-sm font-medium text-foreground">{sortedLocatarios.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center space-x-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-lg text-muted-foreground">Carregando locatários...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">{error}</div>
                  <Button onClick={fetchLocatarios} variant="outline">
                    Tentar Novamente
                  </Button>
                </div>
              ) : sortedLocatarios.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {searchQuery || filtroTipo ? 'Nenhum locatário encontrado' : 'Nenhum locatário cadastrado'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || filtroTipo ? 'Tente ajustar os filtros' : 'Cadastre o primeiro locatário do sistema'}
                  </p>
                  {!searchQuery && !filtroTipo && (
                    <Button onClick={onNavigateToCadastro} className="btn-gradient">
                      <Plus className="w-5 h-5 mr-2" />
                      Cadastrar Primeiro Locatário
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
                        {sortedLocatarios.map((locatario) => {
                          return (
                            <tr key={locatario.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                                    <Home className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground flex items-center gap-2">
                                      {locatario.nome}
                                      {locatario.cpf_cnpj && locatario.cpf_cnpj.length === 14 && (
                                        <Badge variant="outline" className="px-1 py-0 text-xs">PJ</Badge>
                                      )}
                                      {locatario.pet_inquilino && (
                                        <Badge variant="outline" className="px-1 py-0 text-xs">
                                          <PawPrint className="w-3 h-3 mr-1" />
                                          {locatario.qtd_pet_inquilino}
                                        </Badge>
                                      )}
                                    </div>
                                    {locatario.profissao && (
                                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                                        {locatario.profissao}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  {locatario.telefone && (
                                    <div className="text-sm text-foreground">{locatario.telefone}</div>
                                  )}
                                  {locatario.email && (
                                    <div className="text-sm text-muted-foreground truncate max-w-xs">{locatario.email}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-foreground">
                                  {locatario.cpf_cnpj || '-'}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {locatario.ativo !== false ? (
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
                                    onClick={() => onNavigateToDetalhes(locatario.id)}
                                    className="h-8 w-8 p-0"
                                    title="Visualizar locatário"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onNavigateToEdicao(locatario.id)}
                                    className="h-8 w-8 p-0"
                                    title="Editar locatário"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  
                                  {/* Dropdown Menu */}
                                  <div className="relative">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => toggleDropdown(locatario.id, e)}
                                      className="h-8 w-8 p-0"
                                      title="Mais ações"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                    
                                    {openDropdown === locatario.id && (
                                      <div 
                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="py-1">
                                          <button
                                            onClick={() => handleStatusChange(locatario.id, true)}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                            disabled={locatario.ativo === true}
                                          >
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            Ativo
                                          </button>
                                          <button
                                            onClick={() => handleStatusChange(locatario.id, false)}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                            disabled={locatario.ativo === false}
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
                          );
                        })}
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