import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { InputWithIcon } from '../ui/input-with-icon';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  Users, 
  User,
  Building,
  Eye,
  Edit,
  Loader2,
  Filter,
  SortAsc,
  SortDesc,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreHorizontal,
  Download,
  Printer,
  Copy,
  Play,
  Square,
  Pause,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Contrato {
  id: number;
  numero_contrato?: string;
  id_imovel: number;
  id_locatario: number;
  imovel_endereco?: string;
  imovel_tipo?: string;
  locatario_nome?: string;
  locador_nome?: string;
  data_inicio: string;
  data_fim: string;
  valor_aluguel: number;
  valor_total?: number;
  vencimento_dia: number;
  status?: 'ativo' | 'encerrado' | 'pendente' | 'vencido';
  taxa_administracao?: number;
  tipo_garantia?: string;
  data_assinatura?: string;
  id_locador?: number;
  diasParaVencer?: number;
  diasParaReajuste?: number;
  proximoReajuste?: string;
}

interface ContratosIndexProps {
  onNavigateToCadastro: () => void;
  onNavigateToDetalhes: (contratoId: number) => void;
  onNavigateToEdicao: (contratoId: number) => void;
  initialTab?: string;
}

export const ContratosIndex: React.FC<ContratosIndexProps> = ({
  onNavigateToCadastro,
  onNavigateToDetalhes,
  onNavigateToEdicao,
  initialTab = 'todos'
}) => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'data_inicio' | 'valor_aluguel'>('data_inicio');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchContratos();
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

  const fetchContratos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar contratos da API
      const response = await fetch('http://localhost:8000/api/contratos');
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('🔍 DADOS DA API CONTRATOS:', data.data);
        console.log('🔍 Primeiro contrato:', data.data[0]);
        
        // Processar contratos para adicionar status baseado em datas
        const contratosProcessados = data.data.map((contrato: any) => {
          const hoje = new Date();
          const dataFim = new Date(contrato.data_fim);
          const dataInicio = new Date(contrato.data_inicio);
          
          let status: 'ativo' | 'encerrado' | 'pendente' | 'vencido' = contrato.status || 'pendente';
          
          // Calcular dias para vencimento do contrato
          const diasParaVencer = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          
          // Calcular dias para próximo reajuste se existir
          let diasParaReajuste = null;
          console.log(`🔍 Contrato ${contrato.id}: proximo_reajuste = ${contrato.proximo_reajuste}`);
          
          if (contrato.proximo_reajuste) {
            const proximoReajuste = new Date(contrato.proximo_reajuste);
            diasParaReajuste = Math.ceil((proximoReajuste.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            console.log(`🔍 Contrato ${contrato.id}: ${diasParaReajuste} dias para reajuste`);
          } else {
            console.log(`🔍 Contrato ${contrato.id}: sem próximo reajuste`);
          }
          
          // Lógica de status automático baseado em datas
          if (hoje < dataInicio) {
            // Contrato ainda não começou
            status = 'pendente';
          } else if (hoje > dataFim) {
            // Contrato já terminou
            status = 'encerrado';
          } else if (diasParaVencer <= 45 && diasParaVencer > 0) {
            // Contrato vencendo em até 45 dias
            status = 'vencido';
          } else if (diasParaReajuste && diasParaReajuste <= 45 && diasParaReajuste > 0) {
            // Reajuste próximo em até 45 dias (também vai para "vencendo")
            console.log(`🔍 Contrato ${contrato.id}: DEFININDO STATUS VENCIDO POR REAJUSTE (${diasParaReajuste} dias)`);
            status = 'vencido';
          } else if (hoje >= dataInicio && hoje <= dataFim) {
            // Contrato em vigência normal
            status = 'ativo';
          }
          
          // Atualizar status no backend se mudou automaticamente
          if (status !== contrato.status) {
            updateContractStatusInBackground(contrato.id, status);
          }
          
          return {
            ...contrato,
            status,
            diasParaVencer,
            diasParaReajuste,
            proximoReajuste: contrato.proximo_reajuste,
            valor_total: (contrato.valor_aluguel || 0) + (contrato.taxa_administracao || 0)
          };
        });
        
        setContratos(contratosProcessados);
      } else {
        throw new Error('Erro ao buscar contratos');
      }
    } catch (err) {
      console.error('Erro ao carregar contratos:', err);
      setError('Erro ao carregar termos');
      // Dados de exemplo para desenvolvimento
      setContratos([]);
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

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (contrato: Contrato) => {
    const status = contrato.status;
    
    switch (status) {
      case 'ativo':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'encerrado':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
            <Clock className="w-3 h-3 mr-1" />
            Encerrado
          </Badge>
        );
      case 'pendente':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'vencido':
        // Verificar se é vencimento de contrato ou reajuste próximo
        const temReajusteProximo = contrato.diasParaReajuste && contrato.diasParaReajuste <= 45 && contrato.diasParaReajuste > 0;
        const temContratoVencendo = contrato.diasParaVencer && contrato.diasParaVencer <= 45 && contrato.diasParaVencer > 0;
        
        console.log(`🔍 Badge Contrato ${contrato.id}: reajuste=${temReajusteProximo} (${contrato.diasParaReajuste}d), vencendo=${temContratoVencendo} (${contrato.diasParaVencer}d)`);
        
        if (temReajusteProximo && !temContratoVencendo) {
          return (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              <TrendingUp className="w-3 h-3 mr-1" />
              Reajuste em {contrato.diasParaReajuste}d
            </Badge>
          );
        } else if (temContratoVencendo) {
          return (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Vence em {contrato.diasParaVencer}d
            </Badge>
          );
        } else {
          return (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Vencendo
            </Badge>
          );
        }
      default:
        return null;
    }
  };

  const filteredContratos = contratos.filter(contrato => {
    // Filtro por busca
    const matchesSearch = 
      (contrato.numero_contrato && contrato.numero_contrato.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contrato.locatario_nome && contrato.locatario_nome.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contrato.locador_nome && contrato.locador_nome.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contrato.imovel_endereco && contrato.imovel_endereco.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filtro por status
    const matchesStatus = !filterStatus || contrato.status === filterStatus;
    
    // Filtro por aba
    const matchesTab = activeTab === 'todos' || 
      (activeTab === 'ativos' && contrato.status === 'ativo') || 
      (activeTab === 'vencendo' && contrato.status === 'vencido') ||
      (activeTab === 'pendentes' && contrato.status === 'pendente') ||
      (activeTab === 'encerrados' && contrato.status === 'encerrado');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const sortedContratos = [...filteredContratos].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'data_inicio') {
      aValue = new Date(aValue || '').getTime();
      bValue = new Date(bValue || '').getTime();
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

  const updateContractStatusInBackground = async (contratoId: number, novoStatus: string) => {
    try {
      await fetch(`http://localhost:8000/api/contratos/${contratoId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: novoStatus }),
      });
    } catch (error) {
      console.log('Erro silencioso ao atualizar status automaticamente:', error);
    }
  };

  const handleChangeStatus = async (contratoId: number, novoStatus: string) => {
    try {
      console.log('Alterando status do contrato', contratoId, 'para:', novoStatus);
      
      const response = await fetch(`http://localhost:8000/api/contratos/${contratoId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (response.ok) {
        // Atualizar a lista de contratos
        setContratos(prev => prev.map(contrato => 
          contrato.id === contratoId 
            ? { ...contrato, status: novoStatus as 'ativo' | 'encerrado' | 'pendente' | 'vencido' }
            : contrato
        ));
        console.log(`✅ Status alterado para: ${novoStatus}`);
      } else {
        console.error('Erro ao alterar status:', await response.text());
        alert('Erro ao alterar status do termo');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro de conexão ao alterar status');
    } finally {
      setOpenDropdown(null);
    }
  };

  const handleDuplicateContract = async (contratoId: number) => {
    try {
      // Implementar duplicação de contrato
      console.log('Duplicar contrato:', contratoId);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Erro ao duplicar contrato:', error);
    }
  };

  const handlePrintContract = (contratoId: number) => {
    // Implementar impressão de contrato
    console.log('Imprimir contrato:', contratoId);
    setOpenDropdown(null);
  };

  const handleDownloadContract = (contratoId: number) => {
    // Implementar download de contrato
    console.log('Download contrato:', contratoId);
    setOpenDropdown(null);
  };

  const toggleDropdown = (contratoId: number, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setOpenDropdown(openDropdown === contratoId ? null : contratoId);
  };

  // Calcular estatísticas
  const totalContratos = contratos.length;
  const contratosAtivos = contratos.filter(c => c.status === 'ativo').length;
  const contratosVencendo = contratos.filter(c => c.status === 'vencido').length;
  const contratosPendentes = contratos.filter(c => c.status === 'pendente').length;
  const valorTotalMensal = contratos
    .filter(c => c.status === 'ativo')
    .reduce((acc, c) => acc + (c.valor_total || c.valor_aluguel || 0), 0);

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
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Termos</h1>
                  <p className="text-muted-foreground">Gerenciamento de termos de locação</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={onNavigateToCadastro}
                  className="btn-gradient"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Termo
                </Button>
              </div>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Total Termos</p>
                    <p className="text-xl font-bold text-foreground truncate">{totalContratos}</p>
                  </div>
                  <FileText className="w-7 h-7 text-blue-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Ativos</p>
                    <p className="text-xl font-bold text-foreground truncate">{contratosAtivos}</p>
                  </div>
                  <CheckCircle className="w-7 h-7 text-green-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Vencendo</p>
                    <p className="text-xl font-bold text-foreground truncate">{contratosVencendo}</p>
                  </div>
                  <AlertCircle className="w-7 h-7 text-yellow-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Pendentes</p>
                    <p className="text-xl font-bold text-foreground truncate">{contratosPendentes}</p>
                  </div>
                  <Clock className="w-7 h-7 text-orange-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">Receita Mensal</p>
                    <p className="text-xl font-bold text-foreground truncate">{formatCurrency(valorTotalMensal)}</p>
                  </div>
                  <DollarSign className="w-7 h-7 text-purple-500 flex-shrink-0 ml-2" />
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
                    <Badge variant="secondary" className="ml-2">{totalContratos}</Badge>
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
                    <Badge variant="secondary" className="ml-2">{contratosAtivos}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('vencendo')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'vencendo' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>VENCENDO</span>
                    <Badge variant="secondary" className="ml-2">{contratosVencendo}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('pendentes')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'pendentes' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>PENDENTES</span>
                    <Badge variant="secondary" className="ml-2">{contratosPendentes}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('encerrados')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'encerrados' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>ENCERRADOS</span>
                    <Badge variant="secondary" className="ml-2">
                      {contratos.filter(c => c.status === 'encerrado').length}
                    </Badge>
                  </button>
                </div>

                {/* Filtros */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Busca */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Buscar Termos</Label>
                      <InputWithIcon
                        icon={Search}
                        placeholder="Buscar por número, inquilino, locador..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Status</Label>
                      <select 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="">Todos os status</option>
                        <option value="ativo">Ativos</option>
                        <option value="vencido">Vencendo</option>
                        <option value="pendente">Pendentes</option>
                        <option value="encerrado">Encerrados</option>
                      </select>
                    </div>

                    {/* Total */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Termos Listados</Label>
                      <div className="bg-muted/30 px-3 py-2 rounded-md">
                        <p className="text-sm font-medium text-foreground">{sortedContratos.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center space-x-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-lg text-muted-foreground">Carregando termos...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-500 mb-4">{error}</div>
                    <Button onClick={fetchContratos} variant="outline">
                      Tentar Novamente
                    </Button>
                  </div>
                ) : sortedContratos.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {searchQuery ? 'Nenhum termo encontrado' : 'Nenhum termo cadastrado'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery ? 'Tente buscar com outros termos' : 'Cadastre o primeiro termo do sistema'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={onNavigateToCadastro} className="btn-gradient">
                        <Plus className="w-5 h-5 mr-2" />
                        Cadastrar Primeiro Contrato
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 py-2 text-left">
                              <span className="font-medium text-foreground">Termo</span>
                            </th>
                            <th className="px-3 py-2 text-left">
                              <span className="font-medium text-foreground">Imóvel</span>
                            </th>
                            <th className="px-3 py-2 text-left">
                              <span className="font-medium text-foreground">Partes</span>
                            </th>
                            <th className="px-3 py-2 text-left">
                              <button 
                                onClick={() => handleSort('data_inicio')}
                                className="flex items-center space-x-2 font-medium text-foreground hover:text-primary"
                              >
                                <span>Período</span>
                                {getSortIcon('data_inicio')}
                              </button>
                            </th>
                            <th className="px-3 py-2 text-left">
                              <button 
                                onClick={() => handleSort('valor_aluguel')}
                                className="flex items-center space-x-2 font-medium text-foreground hover:text-primary"
                              >
                                <span>Valor</span>
                                {getSortIcon('valor_aluguel')}
                              </button>
                            </th>
                            <th className="px-3 py-2 text-left">
                              <span className="font-medium text-foreground">Status</span>
                            </th>
                            <th className="px-3 py-2 text-left">
                              <span className="font-medium text-foreground">Ações</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {sortedContratos.map((contrato) => (
                            <tr key={contrato.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-3 py-2">
                                <div className="flex items-center space-x-3">
                                  <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                                    <FileText className="w-3 h-3 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-foreground">
                                      #{contrato.numero_contrato || `C${String(contrato.id).padStart(4, '0')}`}
                                    </div>
                                    {contrato.tipo_garantia && (
                                      <div className="text-xs text-muted-foreground">
                                        {contrato.tipo_garantia}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center space-x-1">
                                  <Building className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-foreground truncate max-w-xs">
                                    {contrato.imovel_endereco || 'Imóvel #' + contrato.id_imovel}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1">
                                    <User className="w-3 h-3 text-green-600" />
                                    <span className="text-xs text-foreground truncate max-w-xs">
                                      {contrato.locatario_nome || 'Locatário #' + contrato.id_locatario}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-3 h-3 text-blue-600" />
                                    <span className="text-xs text-foreground truncate max-w-xs">
                                      {contrato.locador_nome || 'Locador não informado'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="space-y-1">
                                  <div className="text-xs text-foreground">
                                    {formatDate(contrato.data_inicio)} - {formatDate(contrato.data_fim)}
                                  </div>
                                  {contrato.vencimento_dia && (
                                    <div className="text-xs text-muted-foreground">
                                      Vencimento: dia {contrato.vencimento_dia}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-foreground">
                                    {formatCurrency(contrato.valor_aluguel)}
                                  </div>
                                  {contrato.valor_total && contrato.valor_total !== contrato.valor_aluguel && (
                                    <div className="text-xs text-muted-foreground">
                                      Total: {formatCurrency(contrato.valor_total)}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                {getStatusBadge(contrato)}
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onNavigateToDetalhes(contrato.id)}
                                    className="h-8 w-8 p-0"
                                    title="Visualizar termo"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onNavigateToEdicao(contrato.id)}
                                    className="h-8 w-8 p-0"
                                    title="Editar termo"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  
                                  {/* Dropdown Menu */}
                                  <div className="relative">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => toggleDropdown(contrato.id, e)}
                                      className="h-8 w-8 p-0"
                                      title="Mais ações"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                    
                                    {openDropdown === contrato.id && (
                                      <div 
                                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="py-1">
                                          <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                                            Alterar Status
                                          </div>
                                          
                                          {contrato.status !== 'ativo' && (
                                            <button
                                              onClick={() => handleChangeStatus(contrato.id, 'ativo')}
                                              className="flex items-center w-full px-4 py-2 text-sm text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                                            >
                                              <Play className="w-4 h-4 mr-2" />
                                              Ativar Contrato
                                            </button>
                                          )}
                                          
                                          {contrato.status !== 'pendente' && (
                                            <button
                                              onClick={() => handleChangeStatus(contrato.id, 'pendente')}
                                              className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                            >
                                              <Pause className="w-4 h-4 mr-2" />
                                              Marcar como Pendente
                                            </button>
                                          )}
                                          
                                          {contrato.status !== 'vencido' && (
                                            <button
                                              onClick={() => handleChangeStatus(contrato.id, 'vencido')}
                                              className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                              <AlertCircle className="w-4 h-4 mr-2" />
                                              Marcar como Vencido
                                            </button>
                                          )}
                                          
                                          {contrato.status !== 'encerrado' && (
                                            <button
                                              onClick={() => handleChangeStatus(contrato.id, 'encerrado')}
                                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                              <Square className="w-4 h-4 mr-2" />
                                              Encerrar Contrato
                                            </button>
                                          )}
                                          
                                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                          
                                          <button
                                            onClick={() => handlePrintContract(contrato.id)}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                          >
                                            <Printer className="w-4 h-4 mr-2" />
                                            Imprimir
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

export default ContratosIndex;