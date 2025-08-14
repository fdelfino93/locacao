import React from 'react';
import { motion } from 'framer-motion';
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
  PieChart
} from 'lucide-react';

const Dashboard: React.FC = () => {
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
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">2</p>
                    <div className="flex items-center mt-2 text-xs text-blue-700 dark:text-blue-300">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Todos ativos
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Card 2 - Contratos Ativos */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-2xl p-6 border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Contratos Ativos</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">2</p>
                    <div className="flex items-center mt-2 text-xs text-green-700 dark:text-green-300">
                      <Activity className="w-3 h-3 mr-1" />
                      100% ativos
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
                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-2">R$ 0,00</p>
                    <div className="flex items-center mt-2 text-xs text-amber-700 dark:text-amber-300">
                      <Calendar className="w-3 h-3 mr-1" />
                      Agosto 2024
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

              {/* Contratos Vencendo */}
              <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">Contratos Vencendo</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium text-foreground mb-2">Nenhum contrato vencendo</h4>
                    <p className="text-sm text-muted-foreground">Próximos 60 dias</p>
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-xs text-green-700 dark:text-green-300">✓ Todos os contratos estão em dia</p>
                    </div>
                  </div>
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