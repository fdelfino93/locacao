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
  Calculator
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

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'aberta': { label: 'Aberta', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    'paga': { label: 'Paga', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
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
    todas: 0, abertas: 0, pendentes: 0, pagas: 0, em_atraso: 0, canceladas: 0,
    valor_total_aberto: 0, valor_total_recebido: 0, valor_total_atrasado: 0
  });
  const [filtros, setFiltros] = useState<FaturaFilters>({});
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('data_vencimento');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');

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
                    placeholder="Buscar por número da fatura, cliente, imóvel ou contrato..."
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
                                <span className="font-medium text-foreground">Imóvel/Contrato</span>
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
                                      Contrato #{fatura.contrato_numero}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="space-y-1">
                                    <p className="font-medium text-foreground text-sm">
                                      {fatura.locatario_nome || 'Nome não informado'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {fatura.locatario_cpf || 'CPF não informado'}
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
                                  <span className="font-semibold text-foreground">
                                    {formatCurrency(fatura.valor_total || 0)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center space-x-2">
                                    <Button size="sm" variant="outline" className="btn-outline">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="btn-outline">
                                      <Receipt className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="btn-outline">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </div>
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
      </div>
    </div>
  );
};

export default PrestacaoContasModerna;