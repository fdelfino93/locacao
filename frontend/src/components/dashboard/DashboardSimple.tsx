import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Users, DollarSign, Home, Calendar,
  BarChart3, RefreshCw, ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DashboardSimple: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [metricas, setMetricas] = useState({
    total_contratos: 15,
    contratos_ativos: 12,
    receita_mensal: 45780.50,
    total_clientes: 28,
    taxa_ocupacao: 85
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-xl">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Sistema de Locações</p>
              </div>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100 text-sm">Receita Mensal</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(metricas.receita_mensal)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm">Contratos Ativos</p>
                  <p className="text-2xl font-bold mt-2">{metricas.contratos_ativos}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 text-sm">Total Clientes</p>
                  <p className="text-2xl font-bold mt-2">{metricas.total_clientes}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-amber-100 text-sm">Taxa Ocupação</p>
                  <p className="text-2xl font-bold mt-2">{metricas.taxa_ocupacao}%</p>
                </div>
                <Home className="w-8 h-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => window.location.pathname = '/contrato'}>
                Novo Contrato
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => window.location.pathname = '/locatario'}>
                Novo Cliente
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => window.location.pathname = '/imovel'}>
                Novo Imóvel
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => window.location.pathname = '/prestacao-contas'}>
                Prestação Contas
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSimple;