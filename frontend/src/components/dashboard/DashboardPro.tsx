import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Users, DollarSign, TrendingUp, TrendingDown, Home, Calendar,
  AlertTriangle, Activity, BarChart3, Filter, RefreshCw, ChevronRight,
  CheckCircle, Eye, Plus, Clock, Building2, ArrowUpRight, ArrowDownRight,
  CalendarCheck, Wallet, ChevronLeft, ChevronDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricasChart } from './widgets/MetricasChart';
import { OcupacaoChart } from './widgets/OcupacaoChart';
import { apiService } from '@/services/api';
import type { DashboardCompleto, DashboardMetricas, DashboardOcupacao, DashboardVencimento, DashboardAlerta } from '@/services/api';
import toast from 'react-hot-toast';

const DashboardPro: React.FC = () => {
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  
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

  // Meses e anos disponíveis
  const meses = [
    { value: 1, label: 'Janeiro', abrev: 'Jan' },
    { value: 2, label: 'Fevereiro', abrev: 'Fev' },
    { value: 3, label: 'Março', abrev: 'Mar' },
    { value: 4, label: 'Abril', abrev: 'Abr' },
    { value: 5, label: 'Maio', abrev: 'Mai' },
    { value: 6, label: 'Junho', abrev: 'Jun' },
    { value: 7, label: 'Julho', abrev: 'Jul' },
    { value: 8, label: 'Agosto', abrev: 'Ago' },
    { value: 9, label: 'Setembro', abrev: 'Set' },
    { value: 10, label: 'Outubro', abrev: 'Out' },
    { value: 11, label: 'Novembro', abrev: 'Nov' },
    { value: 12, label: 'Dezembro', abrev: 'Dez' }
  ];

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do dashboard completo
      const dashboardCompleto = await apiService.obterDashboardCompleto(selectedMonth, selectedYear);
      
      if (dashboardCompleto) {
        setDashboardData(dashboardCompleto);
        setMetricas(dashboardCompleto.metricas);
        setOcupacao(dashboardCompleto.ocupacao);
        setVencimentos(dashboardCompleto.vencimentos);
        setAlertas(dashboardCompleto.alertas);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      
      // Fallback: tentar buscar dados individuais
      try {
        const [metricasData, ocupacaoData, vencimentosData, alertasData] = await Promise.all([
          apiService.obterMetricasDashboard(),
          apiService.obterOcupacaoDashboard(),
          apiService.obterVencimentosDashboard(60),
          apiService.obterAlertasDashboard()
        ]);
        
        setMetricas(metricasData);
        setOcupacao(ocupacaoData);
        setVencimentos(vencimentosData);
        setAlertas(alertasData);
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        // Usar dados mockados se tudo falhar
        useMockData();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Dados mockados de fallback
  const useMockData = () => {
    setMetricas({
      total_contratos: 24,
      contratos_ativos: 21,
      receita_mensal: 67890.50,
      crescimento_percentual: 15.3,
      total_clientes: 42,
      novos_clientes_mes: 5
    });
    
    setOcupacao({
      taxa_ocupacao: 87.5,
      unidades_ocupadas: 21,
      unidades_totais: 24,
      unidades_disponiveis: 3,
      ocupacao_por_tipo: [
        { tipo: 'Apartamento', total: 15, ocupadas: 13, percentual: 86.7 },
        { tipo: 'Casa', total: 6, ocupadas: 5, percentual: 83.3 },
        { tipo: 'Sala Comercial', total: 3, ocupadas: 3, percentual: 100 }
      ]
    });
    
    setVencimentos([
      { id: 1, cliente_nome: 'Maria Silva', contrato_numero: 'CT-2024-001', data_vencimento: '2024-08-30', valor: 3500, dias_para_vencer: 3, status: 'proximo' },
      { id: 2, cliente_nome: 'João Santos', contrato_numero: 'CT-2024-002', data_vencimento: '2024-09-05', valor: 2800, dias_para_vencer: 9, status: 'proximo' },
      { id: 3, cliente_nome: 'Pedro Oliveira', contrato_numero: 'CT-2024-003', data_vencimento: '2024-09-10', valor: 4200, dias_para_vencer: 14, status: 'normal' }
    ]);
    
    setAlertas([
      { id: 1, tipo: 'pagamento', titulo: 'Pagamento em atraso', descricao: 'Fatura F-2024-087 vencida há 3 dias', severidade: 'ALTO', data_criacao: '2024-08-27', ativo: true },
      { id: 2, tipo: 'contrato', titulo: 'Contrato próximo ao vencimento', descricao: 'Contrato CT-2024-004 vence em 15 dias', severidade: 'MEDIO', data_criacao: '2024-08-26', ativo: true },
      { id: 3, tipo: 'imovel', titulo: 'Manutenção necessária', descricao: 'Apartamento 302 precisa de reparos', severidade: 'BAIXO', data_criacao: '2024-08-25', ativo: true }
    ]);
  };

  // Carregar dados ao montar e quando mudar período
  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  // Função para refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    toast.success('Dashboard atualizado!');
  };

  // Formatadores
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Período selecionado formatado
  const periodLabel = useMemo(() => {
    const mes = meses.find(m => m.value === selectedMonth);
    return `${mes?.label} ${selectedYear}`;
  }, [selectedMonth, selectedYear]);

  // Navegação de período
  const navigatePeriod = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // Cor baseada na severidade
  const getSeverityColor = (severity: string) => {
    const colors = {
      'CRITICO': 'bg-red-500 text-white',
      'ALTO': 'bg-orange-500 text-white',
      'MEDIO': 'bg-yellow-500 text-white',
      'BAIXO': 'bg-blue-500 text-white'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  // Ícone do alerta
  const getAlertIcon = (tipo: string) => {
    const icons = {
      'contrato': FileText,
      'pagamento': DollarSign,
      'imovel': Home,
      'default': AlertTriangle
    };
    return icons[tipo as keyof typeof icons] || icons.default;
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="max-w-[1440px] mx-auto p-3 sm:p-4 lg:p-8 space-y-6 lg:space-y-8">
        {/* Header Aprimorado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border shadow-xl p-4 sm:p-6"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Visão geral do sistema de locações</p>
              </div>
            </div>

            {/* Seletor de Período Melhorado */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigatePeriod('prev')}
                className="p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowPeriodSelector(!showPeriodSelector)}
                  className="min-w-[180px] justify-between font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{periodLabel}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showPeriodSelector ? 'rotate-180' : ''}`} />
                </Button>

                <AnimatePresence>
                  {showPeriodSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl p-4 z-50"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Ano</label>
                          <div className="grid grid-cols-3 gap-2">
                            {anos.map(ano => (
                              <Button
                                key={ano}
                                variant={selectedYear === ano ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedYear(ano)}
                              >
                                {ano}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Mês</label>
                          <div className="grid grid-cols-3 gap-2">
                            {meses.map(mes => (
                              <Button
                                key={mes.value}
                                variant={selectedMonth === mes.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                  setSelectedMonth(mes.value);
                                  setShowPeriodSelector(false);
                                }}
                                className="text-xs"
                              >
                                {mes.abrev}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedMonth(new Date().getMonth() + 1);
                              setSelectedYear(new Date().getFullYear());
                              setShowPeriodSelector(false);
                            }}
                          >
                            Hoje
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => setShowPeriodSelector(false)}
                          >
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigatePeriod('next')}
                className="p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <div className="h-8 w-px bg-border mx-2" />

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Cards de Métricas Principais - Layout Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Receita Mensal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="relative"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                    <Wallet className="w-5 h-5" />
                  </div>
                  {metricas.crescimento_percentual !== 0 && (
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                      {metricas.crescimento_percentual > 0 ? (
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-1" />
                      )}
                      {formatPercentage(metricas.crescimento_percentual)}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-green-100 text-sm mb-1">Receita Mensal</p>
                  <p className="text-3xl font-bold">{formatCurrency(metricas.receita_mensal)}</p>
                  <p className="text-green-100 text-xs mt-2">
                    Crescimento vs. mês anterior
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Contratos Ativos */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="relative"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                    {((metricas.contratos_ativos / metricas.total_contratos) * 100).toFixed(0)}% ativos
                  </Badge>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Contratos</p>
                  <p className="text-3xl font-bold">{metricas.contratos_ativos}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-blue-100 text-xs">
                      Total: {metricas.total_contratos}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Taxa de Ocupação */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="relative"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                    <Home className="w-5 h-5" />
                  </div>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                    {ocupacao.unidades_disponiveis} disponíveis
                  </Badge>
                </div>
                <div>
                  <p className="text-purple-100 text-sm mb-1">Taxa de Ocupação</p>
                  <p className="text-3xl font-bold">{ocupacao.taxa_ocupacao}%</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-purple-100 text-xs">
                      {ocupacao.unidades_ocupadas}/{ocupacao.unidades_totais} imóveis
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Total de Clientes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4 }}
            className="relative"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                    <Users className="w-5 h-5" />
                  </div>
                  {metricas.novos_clientes_mes > 0 && (
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur">
                      +{metricas.novos_clientes_mes} novos
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-amber-100 text-sm mb-1">Total de Clientes</p>
                  <p className="text-3xl font-bold">{metricas.total_clientes}</p>
                  <p className="text-amber-100 text-xs mt-2">
                    Crescimento este mês
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Seção de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MetricasChart 
              title="Evolução Mensal" 
              type="area"
              color="#10b981"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <OcupacaoChart 
              title="Distribuição de Imóveis"
              type="pie"
              data={ocupacao.ocupacao_por_tipo.map(item => ({
                name: item.tipo,
                value: item.total,
                ocupados: item.ocupadas,
                color: item.tipo === 'Apartamento' ? '#3b82f6' : 
                       item.tipo === 'Casa' ? '#8b5cf6' : '#10b981'
              }))}
            />
          </motion.div>
        </div>

        {/* Seção de Alertas e Vencimentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Próximos Vencimentos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-0 shadow-lg h-full">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <CalendarCheck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Próximos Vencimentos</h3>
                      <p className="text-sm text-muted-foreground">{vencimentos.length} contratos</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver todos
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                  {vencimentos.length > 0 ? (
                    vencimentos.map((vencimento, index) => (
                      <motion.div
                        key={vencimento.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-4 bg-muted/30 hover:bg-muted/50 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{vencimento.cliente_nome}</p>
                              <Badge variant="outline" className="text-xs">
                                {vencimento.contrato_numero}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
                            <p className="font-semibold">{formatCurrency(vencimento.valor)}</p>
                            <Badge 
                              variant={vencimento.dias_para_vencer <= 7 ? 'destructive' : 'secondary'}
                              className="text-xs mt-1"
                            >
                              {vencimento.dias_para_vencer <= 7 ? 'Urgente' : 
                               vencimento.dias_para_vencer <= 15 ? 'Próximo' : 'Normal'}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="font-medium">Nenhum vencimento próximo</p>
                      <p className="text-sm text-muted-foreground mt-1">Todos os contratos estão em dia</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alertas e Notificações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-0 shadow-lg h-full">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Alertas do Sistema</h3>
                      <p className="text-sm text-muted-foreground">
                        {alertas.filter(a => a.ativo).length} ativos
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver todos
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                  {alertas.filter(a => a.ativo).length > 0 ? (
                    alertas.filter(a => a.ativo).map((alerta, index) => {
                      const IconComponent = getAlertIcon(alerta.tipo);
                      return (
                        <motion.div
                          key={alerta.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="p-4 bg-muted/30 hover:bg-muted/50 rounded-xl transition-all cursor-pointer group"
                        >
                          <div className="flex gap-3">
                            <div className="p-2 bg-background rounded-lg">
                              <IconComponent className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <p className="font-medium text-sm">{alerta.titulo}</p>
                                <Badge className={`text-xs ${getSeverityColor(alerta.severidade)}`}>
                                  {alerta.severidade}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{alerta.descricao}</p>
                              <span className="text-xs text-muted-foreground">
                                {new Date(alerta.data_criacao).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="font-medium">Sem alertas no momento</p>
                      <p className="text-sm text-muted-foreground mt-1">Sistema funcionando normalmente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Seção de Ações Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Ações Rápidas</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-center gap-3 p-4 hover:bg-primary hover:text-primary-foreground transition-all group"
                  onClick={() => window.location.pathname = '/contrato'}
                >
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-primary-foreground/20">
                    <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium">Novo Contrato</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-center gap-3 p-4 hover:bg-primary hover:text-primary-foreground transition-all group"
                  onClick={() => window.location.pathname = '/locatario'}
                >
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-primary-foreground/20">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium">Novo Cliente</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-center gap-3 p-4 hover:bg-primary hover:text-primary-foreground transition-all group"
                  onClick={() => window.location.pathname = '/imovel'}
                >
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-primary-foreground/20">
                    <Home className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium">Novo Imóvel</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-center gap-3 p-4 hover:bg-primary hover:text-primary-foreground transition-all group"
                  onClick={() => window.location.pathname = '/prestacao-contas'}
                >
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg group-hover:bg-primary-foreground/20">
                    <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium">Prestação Contas</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPro;