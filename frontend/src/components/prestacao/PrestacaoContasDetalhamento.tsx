import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import ExportarPrestacaoPDF from './ExportarPrestacaoPDF';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  User,
  Calculator,
  Phone,
  Mail,
  Receipt,
  Hash,
  Crown,
  CheckCircle,
  FileText,
  DollarSign,
  Percent
} from 'lucide-react';

interface PrestacaoContasDetalhes {
  // Campos principais do banco
  id: number;
  contrato_id: number;
  mes: string;
  ano: string;
  status: 'pendente' | 'pago' | 'lancada';
  valor_boleto: number;
  total_retido: number;
  valor_repasse: number;
  tipo_calculo: string;
  multa_rescisoria?: number;
  data_criacao: string;

  // Detalhamento JSON completo
  detalhamento_json: {
    contrato: {
      id: number;
      codigo: string;
      valor_aluguel: number;
      taxa_administracao: number;
      locadores: Array<{
        id: number;
        nome: string;
        porcentagem: number;
        dados_bancarios?: any;
      }>;
    };
    lancamentos: {
      principais: Array<{
        tipo: string;
        descricao: string;
        valor: number;
      }>;
      extras: Array<{
        tipo: string;
        descricao: string;
        valor: number;
      }>;
    };
    totais: {
      subtotalLancamentos: number;
      totalBruto: number;
      totalLiquido: number;
      totalDescontos: number;
      valorBoleto: number;
      totalRetido: number;
      taxaAdmin: number;
      taxaBoleto: number;
      taxaTransferencia: number;
      valorRepasse: number;
      repassePorLocador: Array<{
        locador_id: number;
        locador_nome: string;
        porcentagem: number;
        valor_repasse: number;
      }>;
    };
    configuracoes: {
      deducoes: number;
      encargos: number;
      dia_vencimento: number;
      mes_referencia: string;
      retencoes: any;
    };
    valores_termo_desabilitados: Record<string, boolean>;
    valores_deletados: Record<string, boolean>;
    retidos_extras: Array<{
      tipo: string;
      descricao: string;
      valor: number;
    }>;
    data_criacao: string;
    versao_sistema: string;
  };

  // Dados opcionais do contrato
  contrato?: {
    locatario_nome: string;
    imovel_endereco: string;
    locatario_telefone?: string;
    locatario_email?: string;
  };
}

interface PrestacaoContasDetalhamentoProps {
  prestacao: PrestacaoContasDetalhes;
  readonly?: boolean;
  className?: string;
}

export const PrestacaoContasDetalhamento: React.FC<PrestacaoContasDetalhamentoProps> = ({
  prestacao,
  readonly = true,
  className = ""
}) => {
  console.log('🎯 PrestacaoContasDetalhamento recebeu dados:', {
    id: prestacao.id,
    valor_boleto: prestacao.valor_boleto,
    total_retido: prestacao.total_retido,
    valor_repasse: prestacao.valor_repasse,
    detalhamento: prestacao.detalhamento_json
  });

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getMesNome = (mes: string) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[parseInt(mes) - 1] || '';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'pago':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Pago</Badge>;
      case 'lancada':
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Lançada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTipoCalculoBadge = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">Entrada</Badge>;
      case 'mensal':
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Mensal</Badge>;
      case 'rescisao':
        return <Badge variant="destructive">Rescisão</Badge>;
      case 'saida':
        return <Badge variant="secondary">Saída</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  const detalhamento = prestacao.detalhamento_json;

  // ID único para o elemento que será exportado
  const elementId = `prestacao-detalhamento-${prestacao.id}`;

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Botão de Exportar PDF - fora do elemento que será exportado */}
      <div className="flex justify-end">
        <ExportarPrestacaoPDF
          elementId={elementId}
          prestacaoData={{
            id: prestacao.id,
            mes: prestacao.mes,
            ano: prestacao.ano,
            tipo: prestacao.tipo_calculo
          }}
        />
      </div>

      {/* Elemento que será exportado para PDF */}
      <div id={elementId}>
      {/* Header - Informações da Prestação */}
      <Card className="card-glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground">
                  Detalhamento da Prestação de Contas
                </CardTitle>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      #{prestacao.id}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Referência: {getMesNome(prestacao.mes)}/{prestacao.ano}
                  </p>
                  {getTipoCalculoBadge(prestacao.tipo_calculo)}
                  {getStatusBadge(prestacao.status)}
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center justify-end space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Criado em: {formatDate(prestacao.data_criacao)}</span>
              </div>
              {readonly && (
                <Badge variant="outline" className="text-xs">
                  Somente Leitura
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Informações do Contrato */}
        {detalhamento.contrato && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Contrato</p>
                <p className="font-medium text-foreground">#{detalhamento.contrato.codigo}</p>
                <p className="text-sm text-muted-foreground">ID: {detalhamento.contrato.id}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Valor Base</p>
                <p className="font-medium text-foreground">{formatMoney(detalhamento.contrato.valor_aluguel)}</p>
                <p className="text-sm text-muted-foreground">Taxa Admin: {detalhamento.contrato.taxa_administracao}%</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Locadores</p>
                <p className="font-medium text-foreground">{detalhamento.contrato.locadores.length} proprietário(s)</p>
                {prestacao.contrato && (
                  <p className="text-sm text-muted-foreground">{prestacao.contrato.locatario_nome}</p>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor do Boleto</p>
                <p className="text-2xl font-bold text-foreground">{formatMoney(prestacao.valor_boleto)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Retido</p>
                <p className="text-2xl font-bold text-red-600">{formatMoney(prestacao.total_retido)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor de Repasse</p>
                <p className="text-2xl font-bold text-primary">{formatMoney(prestacao.valor_repasse)}</p>
              </div>
              <Crown className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lançamentos Principais */}
      {detalhamento.lancamentos.principais.length > 0 && (
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-primary" />
              <span>Lançamentos Principais</span>
              <Badge variant="secondary">{detalhamento.lancamentos.principais.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {detalhamento.lancamentos.principais.map((lancamento, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-foreground">{lancamento.descricao}</span>
                    <Badge variant="outline" className="text-xs">{lancamento.tipo}</Badge>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatMoney(lancamento.valor)}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lançamentos Extras */}
      {detalhamento.lancamentos.extras.length > 0 && (
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Lançamentos Extras</span>
              <Badge variant="secondary">{detalhamento.lancamentos.extras.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {detalhamento.lancamentos.extras.map((lancamento, index) => {
                const isCredito = lancamento.tipo === 'credito';
                return (
                  <motion.div
                    key={index}
                    whileHover={{ x: 4 }}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                      isCredito
                        ? 'border-green-200 hover:border-green-300 bg-green-50/50 dark:bg-green-950/20'
                        : 'border-red-200 hover:border-red-300 bg-red-50/50 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`font-medium ${
                        isCredito ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                      }`}>
                        {lancamento.descricao}
                      </span>
                      <Badge variant="outline" className="text-xs">{lancamento.tipo}</Badge>
                    </div>
                    <span className={`font-semibold ${
                      isCredito ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isCredito ? '+' : '-'}{formatMoney(lancamento.valor)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Retidos Extras */}
      {detalhamento.retidos_extras.length > 0 && (
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-orange-600" />
              <span>Retidos Extras</span>
              <Badge variant="secondary">{detalhamento.retidos_extras.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {detalhamento.retidos_extras.map((retido, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-orange-200 hover:border-orange-300 bg-orange-50/50 dark:bg-orange-950/20 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-orange-700 dark:text-orange-300">
                      {retido.descricao}
                    </span>
                    <Badge variant="outline" className="text-xs">{retido.tipo}</Badge>
                  </div>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    -{formatMoney(retido.valor)}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distribuição de Repasses */}
      {detalhamento.totais.repassePorLocador.length > 0 && (
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-primary" />
              <span>Distribuição de Repasses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detalhamento.totais.repassePorLocador.map((repasse, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Crown className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{repasse.locador_nome}</p>
                        <p className="text-sm text-muted-foreground">{repasse.porcentagem}% da propriedade</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Valor do Repasse</p>
                      <p className="font-semibold text-foreground">
                        {formatMoney(repasse.valor_repasse)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-foreground">Valor Total a Repassar</span>
                <span className="text-lg font-bold text-foreground">
                  {formatMoney(prestacao.valor_repasse)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multa Rescisória (se aplicável) */}
      {prestacao.multa_rescisoria && prestacao.multa_rescisoria > 0 && (
        <Card className="card-glass border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
              <AlertTriangle className="w-5 h-5" />
              <span>Multa Rescisória</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-yellow-50/50 dark:bg-yellow-950/20 rounded-lg">
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-300">Valor da Multa</p>
                <p className="text-sm text-muted-foreground">Aplicada em rescisão contratual</p>
              </div>
              <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatMoney(prestacao.multa_rescisoria)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações Técnicas */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-muted-foreground" />
            <span>Informações Técnicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p><span className="text-muted-foreground">Versão do Sistema:</span> <span className="font-medium">{detalhamento.versao_sistema}</span></p>
              <p><span className="text-muted-foreground">Data de Cálculo:</span> <span className="font-medium">{formatDate(detalhamento.data_criacao)}</span></p>
              <p><span className="text-muted-foreground">Tipo de Cálculo:</span> <span className="font-medium">{prestacao.tipo_calculo}</span></p>
            </div>
            <div className="space-y-2">
              <p><span className="text-muted-foreground">Dia de Vencimento:</span> <span className="font-medium">{detalhamento.configuracoes.dia_vencimento}</span></p>
              <p><span className="text-muted-foreground">Mês de Referência:</span> <span className="font-medium">{detalhamento.configuracoes.mes_referencia}</span></p>
              <p><span className="text-muted-foreground">Status:</span> <span className="font-medium">{prestacao.status}</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default PrestacaoContasDetalhamento;