"use client";

import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Receipt,
  Calculator,
  X,
  Edit3,
  Save
} from 'lucide-react';
import type { Fatura, FaturaStats, FaturaFilters, FaturasResponse } from "@/types";
import toast from "react-hot-toast";

// Utilitários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Função para controlar quais botões exibir baseado no status
const getButtonsForStatus = (status: string) => {
  const buttons = {
    showRegistrarPagamento: false,
    showGerarBoleto: false,
    showLancarPrestacao: false,
    showVerPDF: true, // SEMPRE disponível
    showEditar: false,
    showMenu: false
  };

  switch (status) {
    case 'pendente':
    case 'em_atraso':
      buttons.showRegistrarPagamento = true;
      buttons.showGerarBoleto = true;
      buttons.showEditar = true;
      buttons.showMenu = true;
      break;

    case 'paga':
      buttons.showLancarPrestacao = true;
      buttons.showEditar = false; // Não pode editar quando paga
      buttons.showMenu = true;
      break;

    case 'lancada':
      buttons.showEditar = false;
      buttons.showMenu = false;
      break;

    case 'cancelada':
      buttons.showEditar = false;
      buttons.showMenu = false;
      break;

    default:
      buttons.showEditar = true;
      buttons.showMenu = true;
  }

  return buttons;
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'aberta': { label: 'Aberta', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    'paga': { label: 'Paga', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    'lancada': { label: 'Lançada', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
    'pendente': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    'em_atraso': { label: 'Em Atraso', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    'cancelada': { label: 'Cancelada', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
  
  return (
    <Badge className={`${config.color} font-medium`}>
      {config.label}
    </Badge>
  );
};

// Componente Principal
export const PrestacaoContasModerna: React.FC = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('todas');
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [stats, setStats] = useState<FaturaStats>({
    todas: 0, abertas: 0, pendentes: 0, pagas: 0, lancadas: 0, em_atraso: 0, canceladas: 0,
    valor_total_aberto: 0, valor_total_recebido: 0, valor_total_atrasado: 0
  });
  const [filtros, setFiltros] = useState<FaturaFilters>({});
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('data_vencimento');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  
  // Estados removidos - agora usa página separada para edição

  // Função para buscar faturas da API (sem useCallback)
  const buscarFaturas = async () => {
    setLoading(true);
    try {
      console.log('🔍 Buscando faturas...');
      console.log('📊 Aba ativa:', activeTab);
      console.log('🔍 Termo de busca:', searchTerm);
      console.log('📋 Filtros atuais:', filtros);
      
      // Construir parâmetros da URL
      const params = new URLSearchParams();
      
      // FILTRO PRINCIPAL: Status baseado na aba ativa (sempre sobrepõe outros filtros de status)
      if (activeTab !== 'todas') {
        params.append('status', activeTab);
        console.log('🏷️ Filtro de status aplicado pela aba:', activeTab);
      } else {
        console.log('📋 Aba "TODAS" - sem filtro de status (mostra todos)');
      }
      
      // Aplicar outros filtros
      if (filtros.mes) {
        params.append('mes', filtros.mes);
        console.log('📅 Filtro de mês:', filtros.mes);
      }
      if (filtros.ano) {
        params.append('ano', filtros.ano);
        console.log('📅 Filtro de ano:', filtros.ano);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
        console.log('🔍 Filtro de busca:', searchTerm);
      }
      if (filtros.locador_id) {
        params.append('locador_id', filtros.locador_id.toString());
        console.log('👤 Filtro de locador:', filtros.locador_id);
      }
      if (filtros.valor_min) {
        params.append('valor_min', filtros.valor_min.toString());
        console.log('💰 Valor mínimo:', filtros.valor_min);
      }
      if (filtros.valor_max) {
        params.append('valor_max', filtros.valor_max.toString());
        console.log('💰 Valor máximo:', filtros.valor_max);
      }
      
      // Ordenação
      params.append('order_by', sortField);
      params.append('order_dir', sortDirection);

      const url = `/api/faturas?${params.toString()}`;
      console.log('🌐 URL completa da API:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json() as FaturasResponse;
      console.log('✅ Resposta da API recebida:');
      console.log('📊 Total de faturas retornadas:', data.data?.length || 0);
      console.log('📈 Stats atualizadas:', data.stats);
      
      if (data.data && data.data.length > 0) {
        console.log('🏷️ Status das faturas retornadas:');
        data.data.forEach((fatura, index) => {
          console.log(`  ${index + 1}. ${fatura.numero_fatura}: status="${fatura.status}"`);
        });
      } else {
        console.log('⚠️ Nenhuma fatura retornada para os filtros aplicados');
      }
      
      setFaturas(data.data || []);
      setStats(data.stats || stats);
      
    } catch (error) {
      console.error('❌ Erro ao buscar faturas:', error);
      toast.error("Erro ao carregar faturas");
      setFaturas([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na montagem do componente
  useEffect(() => {
    console.log('🚀 Componente montado - carregando dados iniciais');
    buscarFaturas();
  }, []);

  // Recarregar IMEDIATAMENTE quando aba ou ordenação mudam (sem debounce)
  useEffect(() => {
    console.log('🔄 Mudança na aba/ordenação - recarregando imediatamente');
    console.log('📊 Aba ativa:', activeTab);
    console.log('🔀 Campo ordenação:', sortField, 'Direção:', sortDirection);
    buscarFaturas();
  }, [activeTab, sortField, sortDirection]);

  // Debounce APENAS para search e filtros de formulário (não para aba)
  useEffect(() => {
    console.log('⏱️ Debounce iniciado para filtros de texto/valores');
    const timer = setTimeout(() => {
      console.log('✅ Debounce finalizado - aplicando filtros');
      buscarFaturas();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filtros.mes, filtros.ano, filtros.valor_min, filtros.valor_max, filtros.locador_id]);

  // Funções auxiliares
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'ASC' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortDirection('DESC');
    }
  };

  // Função para redirecionar para página de edição
  const abrirDetalhes = (fatura: Fatura) => {
    console.log('🔄 CLICOU NO BOTÃO - ID da fatura:', fatura.id);
    console.log('📊 Dados da fatura:', fatura);
    
    try {
      const url = `/prestacao-contas/editar/${fatura.id}`;
      console.log('🌐 URL que será navegada:', url);
      
      // Testar se a fatura tem ID válido
      if (!fatura.id) {
        console.error('❌ ERRO: Fatura não tem ID válido!');
        alert('Erro: Fatura não tem ID válido!');
        return;
      }
      
      console.log('✅ Fazendo navegação...');
      window.location.href = url;
      console.log('✅ Comando de navegação executado');
      
    } catch (error) {
      console.error('❌ ERRO ao navegar:', error);
      alert('Erro ao navegar: ' + error);
    }
  };

  // Funções do modal removidas - agora usa página separada

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
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Prestação de Contas</h1>
                  <p className="text-muted-foreground">Gestão completa de faturas e cobranças</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button className="btn-gradient">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Aberto</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.valor_total_aberto)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recebido</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.valor_total_recebido)}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Em Atraso</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.valor_total_atrasado)}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Faturas</p>
                    <p className="text-2xl font-bold text-foreground">{stats.todas}</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <Card className="card-glass">
            <CardContent className="p-8">
              {/* Sistema de Abas */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6 mb-8">
                  <TabsTrigger value="todas" className="flex items-center space-x-2">
                    <span>TODAS</span>
                    <Badge variant="secondary" className="ml-2">{stats.todas}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="aberta" className="flex items-center space-x-2">
                    <span>ABERTAS</span>
                    <Badge variant="secondary" className="ml-2">{stats.abertas}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pendente" className="flex items-center space-x-2">
                    <span>PENDENTES</span>
                    <Badge variant="secondary" className="ml-2">{stats.pendentes}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="paga" className="flex items-center space-x-2">
                    <span>PAGAS</span>
                    <Badge variant="secondary" className="ml-2">{stats.pagas}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="em_atraso" className="flex items-center space-x-2">
                    <span>EM ATRASO</span>
                    <Badge variant="secondary" className="ml-2">{stats.em_atraso}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="cancelada" className="flex items-center space-x-2">
                    <span>CANCELADAS</span>
                    <Badge variant="secondary" className="ml-2">{stats.canceladas}</Badge>
                  </TabsTrigger>
                </TabsList>

                {/* Filtros */}
                <div className="mb-8 space-y-4">
                  {/* Busca principal */}
                  <InputWithIcon
                    icon={Search}
                    placeholder="Buscar por número da fatura, proprietário, imóvel ou termo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                  />

                  {/* Filtros básicos - Mês/Ano */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Mês</Label>
                      <Select value={filtros.mes || ''} onValueChange={(value) => setFiltros({ ...filtros, mes: value })}>
                        <SelectTrigger className="bg-muted/50 border-border text-foreground">
                          <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos os meses</SelectItem>
                          <SelectItem value="01">Janeiro</SelectItem>
                          <SelectItem value="02">Fevereiro</SelectItem>
                          <SelectItem value="03">Março</SelectItem>
                          <SelectItem value="04">Abril</SelectItem>
                          <SelectItem value="05">Maio</SelectItem>
                          <SelectItem value="06">Junho</SelectItem>
                          <SelectItem value="07">Julho</SelectItem>
                          <SelectItem value="08">Agosto</SelectItem>
                          <SelectItem value="09">Setembro</SelectItem>
                          <SelectItem value="10">Outubro</SelectItem>
                          <SelectItem value="11">Novembro</SelectItem>
                          <SelectItem value="12">Dezembro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Ano</Label>
                      <Select value={filtros.ano || ''} onValueChange={(value) => setFiltros({ ...filtros, ano: value })}>
                        <SelectTrigger className="bg-muted/50 border-border text-foreground">
                          <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos os anos</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2020">2020</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Valor Mínimo</Label>
                      <InputWithIcon
                        icon={DollarSign}
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={filtros.valor_min || ''}
                        onChange={(e) => setFiltros({ ...filtros, valor_min: parseFloat(e.target.value) || undefined })}
                        className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Botão filtros avançados */}
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="btn-outline"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros Avançados
                  </Button>

                  {/* Filtros avançados */}
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 p-4 bg-background/90 backdrop-blur-sm rounded-lg border border-border/50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Valor Máximo</Label>
                          <InputWithIcon
                            icon={DollarSign}
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={filtros.valor_max || ''}
                            onChange={(e) => setFiltros({ ...filtros, valor_max: parseFloat(e.target.value) || undefined })}
                            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Locador</Label>
                          <Select
                            value={filtros.locador_id?.toString() || ''}
                            onValueChange={(value) => setFiltros({ ...filtros, locador_id: value ? parseInt(value) : undefined })}
                          >
                            <SelectTrigger className="bg-muted/50 border-border text-foreground">
                              <SelectValue placeholder="Todos os locadores" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="" className="text-foreground hover:bg-accent">Todos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setFiltros({})}
                        className="btn-outline"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </motion.div>
                  )}
                </div>

                {/* Conteúdo das Abas - Tabela */}
                <TabsContent value={activeTab} className="mt-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center space-x-2 text-foreground">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Carregando faturas...</span>
                      </div>
                    </div>
                  ) : faturas.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma fatura encontrada</h3>
                      <p className="text-muted-foreground">Tente ajustar os filtros ou verificar os dados</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-3 text-left">
                                <button 
                                  onClick={() => handleSort('numero_fatura')}
                                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary"
                                >
                                  <span>Nº Fatura</span>
                                  {getSortIcon('numero_fatura')}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="font-medium text-foreground">Imóvel/Termo</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="font-medium text-foreground">Cliente</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <button 
                                  onClick={() => handleSort('mes_referencia')}
                                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary"
                                >
                                  <span>Referência</span>
                                  {getSortIcon('mes_referencia')}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <button 
                                  onClick={() => handleSort('data_vencimento')}
                                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary"
                                >
                                  <span>Vencimento</span>
                                  {getSortIcon('data_vencimento')}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="font-medium text-foreground">Status</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <button 
                                  onClick={() => handleSort('valor_total')}
                                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary"
                                >
                                  <span>Total</span>
                                  {getSortIcon('valor_total')}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="font-medium text-foreground">Ações</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {faturas.map((fatura, index) => (
                              <motion.tr
                                key={fatura.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="border-t border-border hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-4 py-3">
                                  <span className="font-mono text-sm font-medium text-foreground">
                                    {fatura.numero_fatura || `#${fatura.id}`}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="space-y-1">
                                    <p className="font-medium text-foreground text-sm">
                                      {fatura.imovel_endereco || 'Endereço não informado'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Termo #{fatura.contrato_numero}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="space-y-1">
                                    <p className="font-medium text-foreground text-sm">
                                      {fatura.proprietario_nome || 'Nome não informado'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {fatura.proprietario_cpf || 'CPF não informado'}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-foreground">
                                    {fatura.referencia_display || fatura.mes_referencia}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-foreground">
                                    {formatDate(fatura.data_vencimento)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {getStatusBadge(fatura.status)}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-right">
                                    <div className="font-semibold text-foreground">
                                      {formatCurrency(fatura.valor_total || 0)}
                                    </div>
                                    {fatura.valor_acrescimos && fatura.valor_acrescimos > 0 && (
                                      <div className="text-xs text-red-600 font-medium">
                                        +{formatCurrency(fatura.valor_acrescimos)} ({fatura.dias_atraso || 0} dias)
                                      </div>
                                    )}
                                    {fatura.valor_acrescimos && fatura.valor_acrescimos > 0 && (
                                      <div className="text-xs text-muted-foreground border-t border-muted mt-1 pt-1">
                                        Total: {formatCurrency((fatura.valor_total || 0) + fatura.valor_acrescimos)}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {(() => {
                                    const buttonConfig = getButtonsForStatus(fatura.status);

                                    return (
                                      <div className="flex items-center space-x-2">
                                        {/* Botão Registrar Pagamento */}
                                        {buttonConfig.showRegistrarPagamento && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="btn-outline"
                                            title="Registrar Pagamento"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              toast.success(`Registrar pagamento para fatura ${fatura.id}`);
                                            }}
                                          >
                                            <DollarSign className="w-4 h-4" />
                                          </Button>
                                        )}

                                        {/* Botão Gerar Boleto */}
                                        {buttonConfig.showGerarBoleto && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="btn-outline"
                                            title="Gerar Boleto"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              toast.success(`Gerar boleto para fatura ${fatura.id}`);
                                            }}
                                          >
                                            <FileText className="w-4 h-4" />
                                          </Button>
                                        )}

                                        {/* Botão Lançar Prestação */}
                                        {buttonConfig.showLancarPrestacao && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="btn-outline bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                            title="Lançar Prestação"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              toast.success(`Lançar prestação ${fatura.id}`);
                                            }}
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                          </Button>
                                        )}

                                        {/* Botão Editar - sempre condicional */}
                                        {buttonConfig.showEditar && (
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              console.log('🔥 BOTÃO CLICADO! Fatura ID:', fatura?.id || 'ID não encontrado');
                                              console.log('📊 Fatura completa:', fatura);

                                              const faturaId = fatura?.id || Math.floor(Math.random() * 1000);
                                              const url = `/prestacao-contas/editar/${faturaId}`;
                                              console.log('🌐 Navegando para:', url);

                                              window.location.replace(url);
                                            }}
                                            style={{
                                              padding: '6px 12px',
                                              border: '1px solid #d1d5db',
                                              borderRadius: '6px',
                                              backgroundColor: 'white',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                            title="Editar Fatura"
                                          >
                                            <Eye className="w-4 h-4" />
                                            <span style={{ fontSize: '12px' }}>Editar</span>
                                          </button>
                                        )}

                                        {/* Botão Ver PDF - SEMPRE visível */}
                                        {buttonConfig.showVerPDF && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="btn-outline"
                                            title="Ver PDF"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              toast.success(`Abrindo PDF da fatura ${fatura.id}`);
                                            }}
                                          >
                                            <Receipt className="w-4 h-4" />
                                          </Button>
                                        )}

                                        {/* Botão Menu - condicional */}
                                        {buttonConfig.showMenu && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="btn-outline"
                                            title="Mais opções"
                                          >
                                            <MoreVertical className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de Detalhes da Fatura - Versão Simples */}
        {modalDetalhesAberto && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
            onClick={fecharDetalhes}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '800px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Simples */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '16px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  Detalhes da Fatura - {faturaDetalhes?.numero_fatura}
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!modoEdicao && (
                    <button 
                      onClick={() => setModoEdicao(true)} 
                      style={{ 
                        backgroundColor: '#3b82f6', 
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Editar
                    </button>
                  )}
                  {modoEdicao && (
                    <>
                      <button 
                        onClick={salvarEdicoes}
                        style={{ 
                          backgroundColor: '#10b981', 
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '14px',
                          cursor: 'pointer',
                          marginRight: '8px'
                        }}
                      >
                        Salvar
                      </button>
                      <button 
                        onClick={() => setModoEdicao(false)}
                        style={{ 
                          backgroundColor: 'white', 
                          color: '#374151',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                          cursor: 'pointer',
                          marginRight: '8px'
                        }}
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  <button 
                    onClick={fecharDetalhes}
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: '#6b7280',
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Conteúdo Simples */}
              {faturaDetalhes && (
                <div>
                  {/* Informações Básicas */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px'
                    }}>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>Número</p>
                      <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{faturaDetalhes.numero_fatura}</p>
                    </div>
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px'
                    }}>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>Valor Total</p>
                      <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{formatCurrency(faturaDetalhes.valor_total)}</p>
                    </div>
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px'
                    }}>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>Status</p>
                      <div style={{ marginTop: '4px' }}>{getStatusBadge(faturaDetalhes.status)}</div>
                    </div>
                  </div>

                  {/* Seção de Lançamentos Simplificada */}
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        Lançamentos da Fatura
                      </h3>
                      {modoEdicao && (
                        <button 
                          onClick={() => setMostrandoFormulario(!mostrandoFormulario)}
                          style={{ 
                            backgroundColor: '#3b82f6', 
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          {mostrandoFormulario ? 'Cancelar' : '+ Adicionar'}
                        </button>
                      )}
                    </div>

                    {/* Lista de Lançamentos */}
                    {lancamentosEdicao.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {lancamentosEdicao.map((lancamento, index) => (
                          <div 
                            key={index} 
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px',
                              backgroundColor: '#f9fafb',
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            <div>
                              <p style={{ fontWeight: '500' }}>{lancamento.descricao}</p>
                              <p style={{ fontSize: '12px', color: '#6b7280' }}>{lancamento.tipo}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 'bold', color: '#10b981' }}>
                                {formatCurrency(lancamento.valor)}
                              </span>
                              {modoEdicao && (
                                <button
                                  onClick={() => removerLancamento(index)}
                                  style={{ 
                                    backgroundColor: 'transparent',
                                    color: '#ef4444',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#6b7280'
                      }}>
                        <p>Nenhum lançamento encontrado</p>
                        <p style={{ fontSize: '12px', marginTop: '4px' }}>
                          {modoEdicao ? 'Clique em "Adicionar" para incluir lançamentos' : 'Esta fatura não possui lançamentos extras'}
                        </p>
                      </div>
                    )}

                    {/* Formulário Simples */}
                    {modoEdicao && mostrandoFormulario && (
                      <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <h4 style={{ marginBottom: '16px', fontWeight: '600' }}>Novo Lançamento</h4>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '12px',
                          marginBottom: '16px'
                        }}>
                          <div>
                            <Label>Tipo</Label>
                            <Select 
                              value={novoLancamento.tipo} 
                              onValueChange={(value) => setNovoLancamento({...novoLancamento, tipo: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="receita">Receita</SelectItem>
                                <SelectItem value="despesa">Despesa</SelectItem>
                                <SelectItem value="taxa">Taxa</SelectItem>
                                <SelectItem value="desconto">Desconto</SelectItem>
                                <SelectItem value="ajuste">Ajuste</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Descrição</Label>
                            <input
                              type="text"
                              value={novoLancamento.descricao}
                              onChange={(e) => setNovoLancamento({...novoLancamento, descricao: e.target.value})}
                              placeholder="Descreva o lançamento"
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px'
                              }}
                            />
                          </div>
                          <div>
                            <Label>Valor (R$)</Label>
                            <input
                              type="number"
                              step="0.01"
                              value={novoLancamento.valor}
                              onChange={(e) => setNovoLancamento({...novoLancamento, valor: Number(e.target.value) || 0})}
                              placeholder="0,00"
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px'
                              }}
                            />
                          </div>
                        </div>
                        <button onClick={adicionarLancamento} style={{ 
                          backgroundColor: '#10b981', 
                          color: 'white',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '14px',
                          cursor: 'pointer',
                          width: '100%'
                        }}>
                          Adicionar Lançamento
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrestacaoContasModerna;