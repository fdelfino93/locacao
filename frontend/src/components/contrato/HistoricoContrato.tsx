import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Clock,
  User,
  FileText,
  TrendingUp,
  RefreshCw,
  Edit,
  AlertCircle,
  CheckCircle,
  Calendar,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { getApiUrl } from '../../config/api';

interface HistoricoItem {
  id: number;
  campo_alterado: string;
  valor_anterior: string;
  valor_novo: string;
  tipo_operacao: string;
  descricao_mudanca: string;
  data_alteracao: string;
  usuario: string;
  observacoes?: string;
}

interface HistoricoContratoProps {
  contratoId: number;
}

export const HistoricoContrato: React.FC<HistoricoContratoProps> = ({ contratoId }) => {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistorico();
  }, [contratoId]);

  const fetchHistorico = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl(`/contratos/${contratoId}/historico`));
      const data = await response.json();

      if (data.success) {
        setHistorico(data.data || []);
      } else {
        setError(data.message || 'Erro ao carregar histórico');
      }
    } catch (err) {
      setError('Erro de conexão ao carregar histórico');
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForTipo = (tipo: string) => {
    switch (tipo) {
      case 'REAJUSTE':
        return <TrendingUp className="w-4 h-4" />;
      case 'RENOVACAO':
        return <RefreshCw className="w-4 h-4" />;
      case 'CRIACAO':
        return <FileText className="w-4 h-4" />;
      case 'UPDATE':
        return <Edit className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getColorForTipo = (tipo: string) => {
    switch (tipo) {
      case 'REAJUSTE':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'RENOVACAO':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'CRIACAO':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      case 'UPDATE':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCampo = (campo: string) => {
    const campos: Record<string, string> = {
      'valor_aluguel': 'Valor do Aluguel',
      'data_inicio': 'Data de Início',
      'data_fim': 'Data de Término',
      'status': 'Status do Termo',
      'proximo_reajuste': 'Próximo Reajuste',
      'tempo_reajuste': 'Período de Reajuste',
      'taxa_administracao': 'Taxa de Administração',
      'vencimento_dia': 'Dia de Vencimento'
    };
    
    return campos[campo] || campo;
  };

  const formatValue = (value: string, campo: string) => {
    if (!value) return 'N/A';
    
    if (campo === 'valor_aluguel' || campo === 'taxa_administracao') {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(num);
      }
    }
    
    if (campo.includes('data_') && value.includes('-')) {
      try {
        const date = new Date(value + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
      } catch {
        return value;
      }
    }
    
    return value;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Histórico de Alterações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Carregando histórico...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Histórico de Alterações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="w-6 h-6 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Histórico de Alterações</span>
          </div>
          <Badge variant="outline" className="text-sm">
            {historico.length} registros
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {historico.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-base font-medium text-foreground mb-2">Nenhum histórico encontrado</h4>
            <p className="text-sm text-muted-foreground">
              Este contrato ainda não possui histórico de alterações
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {historico.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className={`p-2 rounded-lg border ${getColorForTipo(item.tipo_operacao)}`}>
                  {getIconForTipo(item.tipo_operacao)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">
                      {item.descricao_mudanca}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-sm ${getColorForTipo(item.tipo_operacao)}`}
                    >
                      {item.tipo_operacao}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{formatCampo(item.campo_alterado)}:</span>
                    {item.valor_anterior && (
                      <span className="ml-1">
                        {formatValue(item.valor_anterior, item.campo_alterado)}
                        <span className="mx-2">→</span>
                      </span>
                    )}
                    <span className="font-medium text-sm text-foreground">
                      {formatValue(item.valor_novo, item.campo_alterado)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.data_alteracao)}</span>
                    </div>
                    
                    {item.usuario && (
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{item.usuario}</span>
                      </div>
                    )}
                  </div>
                  
                  {item.observacoes && (
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      <strong>Observações:</strong> {item.observacoes}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricoContrato;