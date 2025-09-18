import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  FileText,
  History,
  User,
  Building,
  Calendar,
  DollarSign,
  Settings
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import HistoricoContrato from '../contrato/HistoricoContrato';
import { getApiUrl } from '../../config/api';

interface ContratoDetalhesProps {
  contratoId: number;
  onVoltar: () => void;
  onEditar: () => void;
}

export const ContratoDetalhes: React.FC<ContratoDetalhesProps> = ({
  contratoId,
  onVoltar,
  onEditar
}) => {
  const [contrato, setContrato] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detalhes');

  useEffect(() => {
    fetchContrato();
  }, [contratoId]);

  const fetchContrato = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`/contratos/${contratoId}`));
      const data = await response.json();
      
      if (data.success) {
        setContrato(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar contrato:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando detalhes do contrato...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground">Contrato não encontrado</h2>
            <Button onClick={onVoltar} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glass rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onVoltar}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-primary-foreground">
                    Contrato #{String(contrato.id).padStart(4, '0')}
                  </h1>
                  <p className="text-primary-foreground/80 mt-1">
                    {contrato.locatario_nome} - {contrato.imovel_endereco}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={onEditar}
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border border-primary-foreground/30"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>

          <div className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="detalhes" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Detalhes</span>
                </TabsTrigger>
                <TabsTrigger value="partes" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Partes</span>
                </TabsTrigger>
                <TabsTrigger value="financeiro" className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Financeiro</span>
                </TabsTrigger>
                <TabsTrigger value="historico" className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>Histórico</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="detalhes" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Datas e Prazos</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de Início:</span>
                        <span className="font-medium">{formatDate(contrato.data_inicio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de Término:</span>
                        <span className="font-medium">{formatDate(contrato.data_fim)}</span>
                      </div>
                      {contrato.proximo_reajuste && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Próximo Reajuste:</span>
                          <span className="font-medium">{formatDate(contrato.proximo_reajuste)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={contrato.status === 'ativo' ? 'default' : 'secondary'}>
                          {contrato.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5" />
                        <span>Valores</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor do Aluguel:</span>
                        <span className="font-medium">{formatCurrency(contrato.valor_aluguel)}</span>
                      </div>
                      {contrato.taxa_administracao && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Taxa de Administração:</span>
                          <span className="font-medium">{contrato.taxa_administracao}%</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dia de Vencimento:</span>
                        <span className="font-medium">{contrato.vencimento_dia}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="partes" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Locatário</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{contrato.locatario_nome || 'Não informado'}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Locador</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{contrato.locador_nome || 'Não informado'}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="w-5 h-5" />
                      <span>Imóvel</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{contrato.imovel_endereco || 'Endereço não informado'}</p>
                    {contrato.imovel_tipo && (
                      <p className="text-muted-foreground mt-1">Tipo: {contrato.imovel_tipo}</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financeiro" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Financeiras</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Funcionalidades financeiras em desenvolvimento...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historico" className="mt-6">
                <HistoricoContrato contratoId={contratoId} />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContratoDetalhes;