import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp,
  Home,
  Calendar,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { getApiUrl } from '../../config/api';

interface Contrato {
  id: number;
  numero_contrato?: string;
  locatario_nome?: string;
  locador_nome?: string;
  data_inicio: string;
  data_fim: string;
  valor_aluguel: number;
  status?: 'ativo' | 'encerrado' | 'pendente' | 'vencido';
  diasParaVencer?: number;
  imovel_endereco?: string;
  proximoReajuste?: string;
  diasParaReajuste?: number;
}

const Dashboard: React.FC = () => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchContratos();
  }, []);

  const fetchContratos = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/contratos'));
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('🔍 DADOS RECEBIDOS NO DASHBOARD:', data.data);
        
        const contratosProcessados = data.data.map((contrato: any) => {
          const hoje = new Date();
          const dataFim = new Date(contrato.data_fim);
          const dataInicio = new Date(contrato.data_inicio);
          
          let status: 'ativo' | 'encerrado' | 'pendente' | 'vencido' = contrato.status || 'pendente';
          
          const diasParaVencer = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          
          // Calcular próximo reajuste se existir
          let proximoReajuste = null;
          let diasParaReajuste = null;
          
          console.log(`📋 Contrato ${contrato.id}: proximo_reajuste = ${contrato.proximo_reajuste}`);
          
          if (contrato.proximo_reajuste) {
            proximoReajuste = new Date(contrato.proximo_reajuste);
            diasParaReajuste = Math.ceil((proximoReajuste.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            console.log(`📋 Contrato ${contrato.id}: ${diasParaReajuste} dias para reajuste`);
          }
          
          // Usar o status que vem do banco, mas também calcular vencimento local
          console.log(`📋 Contrato ${contrato.id}: status do banco = ${contrato.status}, dias para vencer = ${diasParaVencer}, dias para reajuste = ${diasParaReajuste}`);
          
          return {
            ...contrato,
            status: contrato.status || status, // Usar status do banco
            diasParaVencer,
            proximoReajuste: contrato.proximo_reajuste,
            diasParaReajuste
          };
        });
        
        console.log('📋 CONTRATOS PROCESSADOS NO DASHBOARD:', contratosProcessados);
        
        setContratos(contratosProcessados);
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleVerTodosVencimentos = () => {
    navigate('/contratos');
  };

  const totalContratos = contratos.length;
  const contratosAtivos = contratos.filter(c => c.status === 'ativo').length;
  
  // Calcular vencimentos (contratos + reajustes)
  const contratosVencendoContador = contratos.filter(c => 
    c.diasParaVencer && c.diasParaVencer <= 45 && c.diasParaVencer > 0
  ).length;
  const reajustesProximosContador = contratos.filter(c => 
    c.diasParaReajuste && c.diasParaReajuste <= 45 && c.diasParaReajuste > 0
  ).length;
  const totalVencimentos = contratosVencendoContador + reajustesProximosContador;
  
  const receita = contratos.filter(c => c.status === 'ativo').reduce((acc, c) => acc + c.valor_aluguel, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">Dashboard - Sistema Cobimob</h1>
            </div>
            <p className="text-primary-foreground/80 mt-2">Visão geral completa do sistema de locações</p>
          </div>

          <div className="p-8">
            {/* Métricas Principais */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
            >
              {/* Card 1 - Total Contratos */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Contratos</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{totalContratos}</p>
                    <div className="flex items-center mt-2 text-xs text-blue-700 dark:text-blue-300">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {totalVencimentos > 0 ? `${totalVencimentos} vencendo` : 'Todos em dia'}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Card 2 - Termos Ativos */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-2xl p-6 border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Termos Ativos</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{contratosAtivos}</p>
                    <div className="flex items-center mt-2 text-xs text-green-700 dark:text-green-300">
                      <Activity className="w-3 h-3 mr-1" />
                      {totalContratos > 0 ? `${Math.round((contratosAtivos/totalContratos)*100)}% ativos` : 'Nenhum termo'}
                    </div>
                  </div>
                  <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Card 3 - Total Clientes */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-2xl p-6 border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Clientes</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">12</p>
                    <div className="flex items-center mt-2 text-xs text-purple-700 dark:text-purple-300">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +2 novos este mês
                    </div>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Card 4 - Total Imóveis */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Total Imóveis</p>
                    <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mt-2">1</p>
                    <div className="flex items-center mt-2 text-xs text-indigo-700 dark:text-indigo-300">
                      <Home className="w-3 h-3 mr-1" />
                      1 disponível
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Card 5 - Receita Mensal */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-2xl p-6 border border-amber-200 dark:border-amber-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Receita Mensal</p>
                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-2">{formatCurrency(receita)}</p>
                    <div className="flex items-center mt-2 text-xs text-amber-700 dark:text-amber-300">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-500 rounded-xl shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Seções Secundárias */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
            >
              {/* Ocupação por Tipo */}
              <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Home className="w-5 h-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">Ocupação por Tipo de Imóvel</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-foreground">Apartamento</span>
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">0/1 (0%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: '0%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 ocupados</span>
                      <span>1 disponível</span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <PieChart className="w-4 h-4" />
                      <span className="text-sm">Taxa de ocupação geral: 0%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Próximos Vencimentos */}
              <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-white" />
                      <h3 className="text-lg font-semibold text-white">Próximos Vencimentos</h3>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 px-2 py-1 rounded-full">
                        <span className="text-xs font-medium text-white">
                          {totalVencimentos}
                        </span>
                      </div>
                      {totalVencimentos > 0 && (
                        <button
                          onClick={handleVerTodosVencimentos}
                          className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg flex items-center space-x-1 transition-all duration-200 text-white text-xs font-medium"
                        >
                          <span>Ver Todos</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6 max-h-80 overflow-y-auto">
                  {(() => {
                    // DEBUG: Forçar exibição dos dados brutos
                    console.log('=== DASHBOARD DEBUG COMPLETO ===');
                    console.log('Contratos recebidos:', contratos);
                    
                    // Filtrar contratos vencendo (≤45 dias para fim do contrato)
                    const contratosVencendoLista = contratos.filter(c => 
                      c.diasParaVencer && 
                      c.diasParaVencer <= 45 && 
                      c.diasParaVencer > 0
                    );
                    
                    // Filtrar contratos com reajuste próximo (≤45 dias para reajuste)
                    const reajustesProximos = contratos.filter(c => 
                      c.diasParaReajuste && 
                      c.diasParaReajuste <= 45 && 
                      c.diasParaReajuste > 0
                    );
                    
                    console.log('Contratos vencendo filtrados:', contratosVencendoLista);
                    console.log('Reajustes próximos filtrados:', reajustesProximos);
                    console.log('Análise por contrato:');
                    contratos.forEach(c => {
                      console.log(`  Contrato ${c.id}:`, {
                        diasParaVencer: c.diasParaVencer,
                        diasParaReajuste: c.diasParaReajuste,
                        proximoReajuste: c.proximoReajuste
                      });
                    });
                    
                    const totalItems = contratosVencendoLista.length + reajustesProximos.length;
                    
                    // TESTE: Mostrar sempre pelo menos 1 item se tivermos contratos
                    if (contratos.length > 0) {
                      return (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-bold text-blue-900">DEBUG INFO</h4>
                            <p className="text-sm">Total contratos: {contratos.length}</p>
                            <p className="text-sm">Vencendo: {contratosVencendoLista.length}</p>
                            <p className="text-sm">Reajustes: {reajustesProximos.length}</p>
                            <p className="text-sm">Total itens: {totalItems}</p>
                          </div>
                          
                          {/* Mostrar contratos com reajuste */}
                          {reajustesProximos.map((contrato) => (
                            <div key={`reajuste-${contrato.id}`} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <h4 className="font-bold text-yellow-900">Reajuste - Contrato #{contrato.id}</h4>
                              <p className="text-sm">Dias para reajuste: {contrato.diasParaReajuste}</p>
                              <p className="text-sm">Próximo reajuste: {contrato.proximoReajuste}</p>
                              <p className="text-sm">Locatário: {contrato.locatario_nome}</p>
                            </div>
                          ))}
                          
                          {totalItems === 0 && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-red-900">Nenhum item encontrado nos filtros</p>
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    if (totalItems === 0) {
                      return (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-green-600" />
                          </div>
                          <h4 className="font-medium text-foreground mb-2">Nenhum vencimento próximo</h4>
                          <p className="text-sm text-muted-foreground">Próximos 45 dias</p>
                          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                            <p className="text-xs text-green-700 dark:text-green-300">✓ Todos os contratos e reajustes estão em dia</p>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-4">
                        {/* Termos Vencendo */}
                        {contratosVencendoLista.slice(0, 3).map((contrato) => (
                          <div key={`contrato-${contrato.id}`} className="flex items-start space-x-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl">
                            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Clock className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-red-900 dark:text-red-100 truncate">
                                  Contrato #{contrato.numero_contrato || `C${String(contrato.id).padStart(4, '0')}`}
                                </h4>
                                <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                                  {contrato.diasParaVencer}d para vencer
                                </span>
                              </div>
                              <p className="text-sm text-red-700 dark:text-red-300 mb-1">
                                {contrato.locatario_nome || 'Locatário não informado'}
                              </p>
                              <p className="text-xs text-red-600 dark:text-red-400">
                                Vence em: {formatDate(contrato.data_fim)} • {formatCurrency(contrato.valor_aluguel)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Próximos Reajustes */}
                        {reajustesProximos.slice(0, 3).map((contrato) => (
                          <div key={`reajuste-${contrato.id}`} className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 truncate">
                                  Reajuste - Contrato #{contrato.numero_contrato || `C${String(contrato.id).padStart(4, '0')}`}
                                </h4>
                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                                  {contrato.diasParaReajuste}d para reajuste
                                </span>
                              </div>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                                {contrato.locatario_nome || 'Locatário não informado'}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                Reajuste em: {formatDate(contrato.proximoReajuste)} • {formatCurrency(contrato.valor_aluguel)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {totalItems > 6 && (
                          <div className="text-center pt-4">
                            <p className="text-sm text-muted-foreground">
                              +{totalItems - 6} outros vencimentos próximos
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>

            {/* Alertas do Sistema */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">Alertas do Sistema</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Home className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Imóveis disponíveis</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">1 imóvel está disponível para locação</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          Baixa prioridade
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">Sistema funcionando normalmente</span>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;