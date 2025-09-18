import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Users, DollarSign, TrendingUp, TrendingDown, Home, Calendar,
  AlertTriangle, Activity, BarChart3, PieChart, Filter, RefreshCw,
  ArrowRight, Clock, MapPin, Phone, Mail, Building2, ChevronRight,
  CheckCircle, XCircle, AlertCircle, Eye, Plus, Search, Download
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { Select } from '@/components/ui/select';
import { MetricasChart } from './widgets/MetricasChart';
import { OcupacaoChart } from './widgets/OcupacaoChart';
import type { DashboardCompleto, DashboardMetricas, DashboardOcupacao, DashboardVencimento, DashboardAlerta } from '@/services/api';
import toast from 'react-hot-toast';
import { getApiUrl } from '../../config/api';

const DashboardEnhanced: React.FC = () => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Dados do dashboard
  const [dashboardData, setDashboardData] = useState<DashboardCompleto | null>(null);
  const [metricas, setMetricas] = useState<DashboardMetricas>({
    total_contratos: 0,
    contratos_ativos: 0,
    receita_mensal: 0,
    crescimento_percentual: 0,
    total_clientes: 0,
    novos_clientes_mes: 0
  });
  const [ocupacao, setOcupacao] = useState<DashboardOcupacao>({
    taxa_ocupacao: 0,
    unidades_ocupadas: 0,
    unidades_totais: 0,
    unidades_disponiveis: 0,
    ocupacao_por_tipo: []
  });
  const [vencimentos, setVencimentos] = useState<DashboardVencimento[]>([]);
  const [alertas, setAlertas] = useState<DashboardAlerta[]>([]);

  // Função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('mes', selectedMonth.toString());
      params.append('ano', selectedYear.toString());
      
      const response = await fetch(getApiUrl(`/dashboard/completo?${params}`));
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        setMetricas(data.metricas || metricas);
        setOcupacao(data.ocupacao || ocupacao);
        setVencimentos(data.vencimentos || []);
        setAlertas(data.alertas || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      // Usar dados mockados se API falhar
      setMetricas({
        total_contratos: 15,
        contratos_ativos: 12,
        receita_mensal: 45780.50,
        crescimento_percentual: 12.5,
        total_clientes: 28,
        novos_clientes_mes: 3
      });
      setOcupacao({
        taxa_ocupacao: 85,
        unidades_ocupadas: 17,
        unidades_totais: 20,
        unidades_disponiveis: 3,
        ocupacao_por_tipo: [
          { tipo: 'Apartamento', total: 12, ocupadas: 10, percentual: 83.3 },
          { tipo: 'Casa', total: 5, ocupadas: 4, percentual: 80 },
          { tipo: 'Comercial', total: 3, ocupadas: 3, percentual: 100 }
        ]
      });
      setVencimentos([
        { id: 1, cliente_nome: 'João Silva', contrato_numero: 'CT-2024-001', data_vencimento: '2024-08-30', valor: 2500, dias_para_vencer: 3, status: 'proximo' },
        { id: 2, cliente_nome: 'Maria Santos', contrato_numero: 'CT-2024-002', data_vencimento: '2024-09-05', valor: 3200, dias_para_vencer: 9, status: 'proximo' }
      ]);
      setAlertas([
        { id: 1, tipo: 'contrato', titulo: 'Contrato próximo ao vencimento', descricao: 'O contrato CT-2024-001 vence em 30 dias', severidade: 'MEDIO', data_criacao: '2024-08-27', ativo: true },
        { id: 2, tipo: 'pagamento', titulo: 'Pagamento em atraso', descricao: 'Fatura F-2024-087 está há 5 dias em atraso', severidade: 'ALTO', data_criacao: '2024-08-26', ativo: true }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Efeito para carregar dados
  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  // Função para refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    toast.success('Dashboard atualizado!');
  };

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para obter cor da severidade
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICO': return 'bg-red-500';
      case 'ALTO': return 'bg-orange-500';
      case 'MEDIO': return 'bg-yellow-500';
      case 'BAIXO': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Função para obter ícone do alerta
  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'contrato': return FileText;
      case 'pagamento': return DollarSign;
      case 'imovel': return Home;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com Filtros */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl">
                  <BarChart3 className="w-6 h-6 text-primary-foreground" />
                </div>
                Dashboard Cobimob
              </h1>
              <p className="text-muted-foreground mt-1">Visão geral do sistema de locações</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              
              <Select
                value={`${selectedMonth}-${selectedYear}`}
                onChange={(value) => {
                  const [month, year] = value.split('-');
                  setSelectedMonth(parseInt(month));
                  setSelectedYear(parseInt(year));
                }}
                className="w-40"
              >
                <option value={`${new Date().getMonth() + 1}-${new Date().getFullYear()}`}>Este mês</option>
                <option value={`${new Date().getMonth()}-${new Date().getFullYear()}`}>Mês anterior</option>
                <option value={`1-${new Date().getFullYear()}`}>Janeiro</option>
                <option value={`2-${new Date().getFullYear()}`}>Fevereiro</option>
                <option value={`3-${new Date().getFullYear()}`}>Março</option>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Filtros Expandidos */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 p-4 bg-card rounded-xl border border-border"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputWithIcon
                    icon={Search}
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select className="w-full">
                    <option value="">Todos os tipos</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa</option>
                    <option value="comercial">Comercial</option>
                  </Select>
                  <Select className="w-full">
                    <option value="">Todos os status</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="pendente">Pendente</option>
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Cards de Métricas Principais */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Card Contratos */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-blue-100 text-sm font-medium">Total Contratos</p>
                    <p className="text-3xl font-bold text-white">{metricas.total_contratos}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {metricas.contratos_ativos} ativos
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Card Receita */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-green-100 text-sm font-medium">Receita Mensal</p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(metricas.receita_mensal)}
                    </p>
                    <div className="flex items-center gap-1 text-white/80">
                      {metricas.crescimento_percentual > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm">+{metricas.crescimento_percentual}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4" />
                          <span className="text-sm">{metricas.crescimento_percentual}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Card Clientes */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-purple-100 text-sm font-medium">Total Clientes</p>
                    <p className="text-3xl font-bold text-white">{metricas.total_clientes}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        +{metricas.novos_clientes_mes} novos
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Card Ocupação */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-amber-100 text-sm font-medium">Taxa Ocupação</p>
                    <p className="text-3xl font-bold text-white">{ocupacao.taxa_ocupacao}%</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {ocupacao.unidades_ocupadas}/{ocupacao.unidades_totais}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Gráficos - Nova Seção */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MetricasChart 
              title="Evolução de Receita" 
              type="area"
              color="#3b82f6"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <OcupacaoChart 
              title="Distribuição por Tipo"
              type="pie"
            />
          </motion.div>
        </div>

        {/* Grid de Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gráfico de Ocupação por Tipo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <PieChart className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Ocupação por Tipo</h3>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Detalhes
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {ocupacao.ocupacao_por_tipo.map((tipo, index) => (
                      <motion.div
                        key={tipo.tipo}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{tipo.tipo}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                              {tipo.ocupadas}/{tipo.total}
                            </span>
                            <Badge variant={tipo.percentual >= 80 ? 'default' : 'secondary'}>
                              {tipo.percentual.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${tipo.percentual}%` }}
                            transition={{ duration: 1, delay: 0.5 + (0.1 * index) }}
                            className={`h-full rounded-full ${
                              tipo.percentual >= 80 
                                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                : tipo.percentual >= 50 
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                : 'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{ocupacao.unidades_ocupadas}</p>
                        <p className="text-xs text-muted-foreground">Ocupadas</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{ocupacao.unidades_disponiveis}</p>
                        <p className="text-xs text-muted-foreground">Disponíveis</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{ocupacao.unidades_totais}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Contratos Vencendo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-500" />
                      </div>
                      <h3 className="text-lg font-semibold">Próximos Vencimentos</h3>
                    </div>
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      {vencimentos.length} contratos
                    </Badge>
                  </div>

                  {vencimentos.length > 0 ? (
                    <div className="space-y-3">
                      {vencimentos.map((vencimento, index) => (
                        <motion.div
                          key={vencimento.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{vencimento.cliente_nome}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {vencimento.contrato_numero}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(vencimento.data_vencimento).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {vencimento.dias_para_vencer} dias
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg">{formatCurrency(vencimento.valor)}</p>
                              <Badge 
                                variant={vencimento.dias_para_vencer <= 7 ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {vencimento.dias_para_vencer <= 7 ? 'Urgente' : 'Próximo'}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="font-medium mb-2">Nenhum vencimento próximo</h4>
                      <p className="text-sm text-muted-foreground">Todos os contratos estão em dia</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Coluna Lateral - 1/3 */}
          <div className="space-y-6">
            {/* Alertas e Notificações */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <h3 className="text-lg font-semibold">Alertas</h3>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {alertas.filter(a => a.ativo).length}
                    </Badge>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {alertas.filter(a => a.ativo).map((alerta, index) => {
                      const IconComponent = getAlertIcon(alerta.tipo);
                      return (
                        <motion.div
                          key={alerta.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alerta.severidade)}`} />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-start justify-between">
                                <h5 className="font-medium text-sm leading-tight">{alerta.titulo}</h5>
                                <IconComponent className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <p className="text-xs text-muted-foreground">{alerta.descricao}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {alerta.severidade}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(alerta.data_criacao).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {alertas.filter(a => a.ativo).length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">Sem alertas no momento</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Ações Rápidas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Ações Rápidas
                  </h3>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-between hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => window.location.pathname = '/contrato'}
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Novo Contrato
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-between hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => window.location.pathname = '/locatario'}
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Cadastrar Cliente
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-between hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => window.location.pathname = '/imovel'}
                    >
                      <span className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Adicionar Imóvel
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-between hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => window.location.pathname = '/prestacao-contas'}
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Prestação de Contas
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Status do Sistema */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                      </div>
                      <span className="font-medium text-green-700 dark:text-green-400">
                        Sistema Operacional
                      </span>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      Online
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-green-700/80 dark:text-green-400/80">
                    <div className="flex justify-between">
                      <span>Uptime</span>
                      <span className="font-medium">99.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Última atualização</span>
                      <span className="font-medium">Agora</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEnhanced;