import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Calendar, MapPin, User, Users, Calculator, Phone, Mail, Receipt, Hash, Crown, CheckCircle } from 'lucide-react';
import ExportarPrestacaoPDFServerSide from '../prestacao/ExportarPrestacaoPDFServerSide';

interface BoletoDetalhes {
  valores_base: {
    aluguel: number;
    iptu: number;
    seguro_fianca: number;
    seguro_incendio: number;
    condominio: number;
    energia_eletrica: number;
    gas: number;
    fci: number;
  };
  acrescimos: {
    valor_total: number;
    dias_atraso: number;
  };
  descontos: {
    desconto_pontualidade: number;
    desconto_benfeitoria_1: number;
    desconto_benfeitoria_2: number;
    desconto_benfeitoria_3: number;
    reembolso_fundo_obras: number;
    fundo_reserva: number;
    fundo_iptu: number;
    fundo_outros: number;
    honorario_advogados: number;
    boleto_advogados: number;
  };
  valor_total: number;
  numero_boleto?: string;
  contrato?: {
    locatario_nome: string;
    imovel_endereco: string;
    locatario_telefone?: string;
    locatario_email?: string;
    proprietario_nome?: string;
    proprietario_telefone?: string;
    proprietario_email?: string;
  };
  periodo?: {
    mes: number;
    ano: number;
    data_vencimento: string;
    data_pagamento?: string;
  };
}

// Nova interface para dados da API
interface PrestacaoDetalhada {
  id: number;
  contrato_id: number;
  mes: string;
  ano: string;
  status: string;
  valor_pago: number;
  valor_vencido: number;
  encargos: number;
  deducoes: number;
  total_bruto: number;
  total_liquido: number;
  observacoes_manuais: string;
  data_criacao: string;
  data_atualizacao: string;
  valor_boleto: number;
  valor_acrescimos?: number;
  dias_atraso?: number;
  acrescimos_atraso?: number;
  total_retido: number;
  valor_repasse: number;
  tipo_calculo: string | null;
  multa_rescisoria: number | null;
  detalhamento_json: any | null;
  contrato: {
    id: number;
    valor_aluguel: number;
    taxa_administracao: number;
    imovel_endereco: string;
    locatario_nome: string;
    locatario_telefone?: string;
    locatario_email?: string;
  };
  locadores?: Array<{
    locador_id: number;
    locador_nome: string;
    porcentagem: number;
    responsabilidade_principal: boolean;
    telefone?: string;
    email?: string;
    cpf_cnpj?: string;
    conta_bancaria_id?: number;
    tipo_recebimento?: string;
    conta_bancaria?: {
      tipo_recebimento?: string;
      pix_chave?: string;
      banco?: string;
      agencia?: string;
      conta?: string;
      titular?: string;
      cpf_titular?: string;
    };
  }>;
  distribuicao_repasse?: Array<{
    locador_id: number;
    locador_nome: string;
    percentual_participacao: number;
    valor_repasse: number;
    responsabilidade_principal: boolean;
  }>;
  lancamentos_detalhados: Array<{
    tipo: string;
    descricao: string;
    valor: number;
    categoria: string;
    origem: string;
    ordem: number;
  }>;
  total_lancamentos: number;
}

interface DetalhamentoBoletoProps {
  boleto?: BoletoDetalhes;  // Manter compatibilidade
  prestacao_id?: number;    // Nova prop para buscar da API
  className?: string;
}

export const DetalhamentoBoleto: React.FC<DetalhamentoBoletoProps> = ({ boleto, prestacao_id, className = "" }) => {
  const [prestacaoDetalhada, setPrestacaoDetalhada] = useState<PrestacaoDetalhada | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados da API quando prestacao_id for fornecido
  useEffect(() => {
    if (prestacao_id) {
      setLoading(true);
      fetch(`/api/prestacao-contas/${prestacao_id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data: PrestacaoDetalhada) => {
          setPrestacaoDetalhada(data);
          setError(null);
        })
        .catch(err => {
          console.error('Erro ao buscar prestação detalhada:', err);
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [prestacao_id]);

  // Se estiver carregando
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Carregando detalhamento...</div>
      </div>
    );
  }

  // Se houver erro
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Erro: {error}</div>
      </div>
    );
  }

  // Usar apenas dados da API quando prestacao_id for fornecido
  if (prestacao_id && !prestacaoDetalhada) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Carregando dados da prestação...</div>
      </div>
    );
  }

  // Se não há prestacao_id nem boleto, não há dados
  if (!prestacao_id && !boleto) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Nenhum dado disponível</div>
      </div>
    );
  }

  console.log('🎯 DetalhamentoBoleto usando dados:', {
    fonte: prestacaoDetalhada ? 'API' : 'boleto antigo',
    prestacao_id: prestacaoDetalhada?.id,
    total_lancamentos: prestacaoDetalhada?.total_lancamentos,
    tem_boleto: !!boleto
  });

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getMesNome = (mes: number | string) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mesNum = typeof mes === 'string' ? parseInt(mes) : mes;
    return meses[mesNum - 1] || '';
  };

  // 🆕 NOVA LÓGICA - Calcular valores dos lançamentos detalhados
  const calcularValoresDosLancamentos = () => {
    if (!prestacaoDetalhada?.lancamentos_detalhados) {
      // Fallback para dados antigos se não há dados da API
      if (boleto?.valores_base && boleto?.descontos) {
        const subtotalBase = Object.values(boleto.valores_base).reduce((a: number, b: number) => a + b, 0);
        const totalDescontos = Object.values(boleto.descontos).reduce((a: number, b: number) => a + b, 0);
        return {
          lancamentosTermo: [],
          lancamentosRetido: [],
          lancamentosTaxa: [],
          totalBoleto: subtotalBase,
          totalRetido: totalDescontos,
          valorRepasse: subtotalBase - totalDescontos,
          usandoDadosAntigos: true
        };
      }
      return {
        lancamentosTermo: [],
        lancamentosRetido: [],
        lancamentosTaxa: [],
        totalBoleto: 0,
        totalRetido: 0,
        valorRepasse: 0,
        usandoDadosAntigos: false
      };
    }

    const lancamentosTermo = prestacaoDetalhada.lancamentos_detalhados.filter(l => l.categoria === 'termo');
    const lancamentosRetido = prestacaoDetalhada.lancamentos_detalhados.filter(l => l.categoria === 'retido');
    const lancamentosTaxa = prestacaoDetalhada.lancamentos_detalhados.filter(l => l.categoria === 'taxa');
    const lancamentosDesconto = prestacaoDetalhada.lancamentos_detalhados.filter(l => l.categoria === 'desconto');

    // PARAR DE CALCULAR! Usar apenas os dados salvos no banco
    const totalBoleto = prestacaoDetalhada.valor_boleto || prestacaoDetalhada.total_bruto || 0;
    const totalRetido = prestacaoDetalhada.total_retido || 0;

    // Para prestações com distribuição, usar soma da distribuição
    let valorRepasse = prestacaoDetalhada.valor_repasse || 0;
    if (prestacaoDetalhada.distribuicao_repasse && prestacaoDetalhada.distribuicao_repasse.length > 0) {
      valorRepasse = prestacaoDetalhada.distribuicao_repasse.reduce((sum, d) => sum + d.valor_repasse, 0);
    }

    return {
      lancamentosTermo,
      lancamentosRetido,
      lancamentosTaxa,
      lancamentosDesconto,
      totalBoleto,
      totalRetido,
      valorRepasse,
      usandoDadosAntigos: false
    };
  };

  const valoresCalculados = calcularValoresDosLancamentos();

  // Configuração dos valores base
  const valoresBaseConfig = [
    { key: 'aluguel', label: 'Aluguel', temAcrescimo: true },
    { key: 'iptu', label: 'IPTU', temAcrescimo: false },
    { key: 'seguro_fianca', label: 'Seguro Fiança', temAcrescimo: true },
    { key: 'seguro_incendio', label: 'Seguro Incêndio', temAcrescimo: true },
    { key: 'condominio', label: 'Condomínio', temAcrescimo: true },
    { key: 'energia_eletrica', label: 'Energia Elétrica', temAcrescimo: false },
    { key: 'gas', label: 'Gás', temAcrescimo: false },
    { key: 'fci', label: 'FCI', temAcrescimo: true }
  ];

  // Função para extrair valores base dos lançamentos detalhados ou dados antigos
  const getValoresBase = () => {
    if (valoresCalculados.usandoDadosAntigos && boleto?.valores_base) {
      return boleto.valores_base;
    }

    if (prestacaoDetalhada?.lancamentos_detalhados) {
      const valores: Record<string, number> = {};
      const lancamentosTermo = prestacaoDetalhada.lancamentos_detalhados.filter(l => l.categoria === 'termo');

      valoresBaseConfig.forEach(({ key }) => {
        const lancamento = lancamentosTermo.find(l => l.tipo_lancamento?.toLowerCase() === key.toLowerCase());
        valores[key] = lancamento ? lancamento.valor : 0;
      });

      return valores;
    }

    return {};
  };

  const valoresBase = getValoresBase();

  // Preparar descontos dinâmicos baseados nos valores reais
  const descontosConfig = [];
  
  // Adicionar apenas descontos que têm valor > 0
  if (boleto?.descontos?.desconto_pontualidade > 0) {
    descontosConfig.push({ key: 'desconto_pontualidade', label: 'Desconto Pontualidade', especial: true });
  }
  
  // Benfeitorias - adicionar dinamicamente baseado nos valores
  if (boleto?.descontos?.desconto_benfeitoria_1 > 0) {
    descontosConfig.push({ key: 'desconto_benfeitoria_1', label: 'Desconto Benfeitoria 1' });
  }
  if (boleto?.descontos?.desconto_benfeitoria_2 > 0) {
    descontosConfig.push({ key: 'desconto_benfeitoria_2', label: 'Desconto Benfeitoria 2' });
  }
  if (boleto?.descontos?.desconto_benfeitoria_3 > 0) {
    descontosConfig.push({ key: 'desconto_benfeitoria_3', label: 'Desconto Benfeitoria 3' });
  }
  
  // Outros descontos
  if (boleto?.descontos?.reembolso_fundo_obras > 0) {
    descontosConfig.push({ key: 'reembolso_fundo_obras', label: 'Reembolso Fundo de Obras' });
  }
  if (boleto?.descontos?.fundo_reserva > 0) {
    descontosConfig.push({ key: 'fundo_reserva', label: 'Fundo de Reserva' });
  }
  if (boleto?.descontos?.fundo_iptu > 0) {
    descontosConfig.push({ key: 'fundo_iptu', label: 'Fundo IPTU' });
  }
  if (boleto?.descontos?.fundo_outros > 0) {
    descontosConfig.push({ key: 'fundo_outros', label: 'Fundo Outros' });
  }
  if (boleto?.descontos?.honorario_advogados > 0) {
    descontosConfig.push({ key: 'honorario_advogados', label: 'Honorário Advogados' });
  }
  if (boleto?.descontos?.boleto_advogados > 0) {
    descontosConfig.push({ key: 'boleto_advogados', label: 'Boleto Advogados' });
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header - Informações do Contrato */}
      {(prestacaoDetalhada || (boleto?.contrato && boleto?.periodo)) && (
        <Card className="card-glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Receipt className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-foreground">Detalhamento do Boleto</CardTitle>
                  <div className="flex items-center space-x-4">
                    {prestacaoDetalhada && (
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          PC-{prestacaoDetalhada.id.toString().padStart(3, '0')}
                        </span>
                      </div>
                    )}
                    {!prestacaoDetalhada && boleto?.numero_boleto && (
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {boleto?.numero_boleto}
                        </span>
                      </div>
                    )}
                    <p className="text-muted-foreground">
                      Referência: {prestacaoDetalhada ?
                        `${getMesNome(prestacaoDetalhada.mes)}/${prestacaoDetalhada.ano}` :
                        `${getMesNome(boleto?.periodo?.mes || 1)}/${boleto?.periodo?.ano || new Date().getFullYear()}`
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center justify-end space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Vencimento: {prestacaoDetalhada?.data_vencimento ?
                    formatDate(prestacaoDetalhada.data_vencimento) :
                    formatDate(boleto?.periodo?.data_vencimento || '')}</span>
                </div>
                {(prestacaoDetalhada?.data_pagamento || boleto?.periodo?.data_pagamento) && (
                  <div className="flex items-center justify-end space-x-2 text-sm text-green-600 dark:text-green-400">
                    <Calendar className="w-4 h-4" />
                    <span>{prestacaoDetalhada?.data_pagamento ?
                      `Pago em: ${formatDate(prestacaoDetalhada.data_pagamento)}` :
                      `Pagamento: ${formatDate(boleto?.periodo?.data_pagamento || '')}`}</span>
                  </div>
                )}
                <div className="flex justify-end">
                  {boleto?.acrescimos?.dias_atraso > 0 ? (
                    <Badge variant="destructive" className="text-xs">
                      {boleto?.acrescimos?.dias_atraso} dias em atraso
                    </Badge>
                  ) : (prestacaoDetalhada?.data_pagamento || boleto?.periodo?.data_pagamento) ? (
                    <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                      Pago
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Em aberto
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Coluna 1 - Informações do Proprietário */}
              <div className="space-y-4">
                {/* Nova prestação - múltiplos locadores */}
                {prestacaoDetalhada?.locadores && prestacaoDetalhada.locadores.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {prestacaoDetalhada.locadores.length > 1 ? 'Locadores' : 'Locador'}
                      </p>
                    </div>
                    {prestacaoDetalhada.locadores.map((locador, index) => (
                      <div key={locador.locador_id} className="ml-6 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{locador.locador_nome}</p>
                          {prestacaoDetalhada.locadores.length > 1 && (
                            <span className="text-xs text-muted-foreground bg-muted rounded px-2 py-1">
                              {locador.percentual_participacao}%
                            </span>
                          )}
                        </div>
                        {locador.telefone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <a
                              href={`tel:${locador.telefone}`}
                              className="text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                            >
                              {locador.telefone}
                            </a>
                          </div>
                        )}
                        {locador.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <a
                              href={`mailto:${locador.email}`}
                              className="text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                            >
                              {locador.email}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Fallback para dados antigos */
                  boleto?.contrato.proprietario_nome && (
                    <div className="flex items-center space-x-3">
                      <Crown className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Proprietário</p>
                        <p className="font-medium text-foreground">{boleto?.contrato.proprietario_nome}</p>
                      </div>
                    </div>
                  )
                )}
                
                {boleto?.contrato.proprietario_telefone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <a 
                        href={`tel:${boleto?.contrato.proprietario_telefone}`}
                        className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                        title="Clique para ligar"
                      >
                        {boleto?.contrato.proprietario_telefone}
                      </a>
                    </div>
                  </div>
                )}
                
                {boleto?.contrato.proprietario_email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                      <a 
                        href={`mailto:${boleto?.contrato.proprietario_email}`}
                        className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                        title="Clique para enviar e-mail"
                      >
                        {boleto?.contrato.proprietario_email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Coluna 2 - Informações do Locatário */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Locatário</p>
                  </div>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">
                        {prestacaoDetalhada?.contrato?.locatario_nome || boleto?.contrato?.locatario_nome || 'Nome não informado'}
                      </p>
                    </div>
                    {(prestacaoDetalhada?.contrato?.locatario_telefone || boleto?.contrato?.locatario_telefone) && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <a
                          href={`tel:${prestacaoDetalhada?.contrato?.locatario_telefone || boleto?.contrato?.locatario_telefone}`}
                          className="text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                          title="Clique para ligar"
                        >
                          {prestacaoDetalhada?.contrato?.locatario_telefone || boleto?.contrato?.locatario_telefone}
                        </a>
                      </div>
                    )}
                    {(prestacaoDetalhada?.contrato?.locatario_email || boleto?.contrato?.locatario_email) && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <a
                          href={`mailto:${prestacaoDetalhada?.contrato?.locatario_email || boleto?.contrato?.locatario_email}`}
                          className="text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                          title="Clique para enviar e-mail"
                        >
                          {prestacaoDetalhada?.contrato?.locatario_email || boleto?.contrato?.locatario_email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Coluna 3 - Informações do Imóvel */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Imóvel</p>
                    <p className="font-medium text-foreground">
                      {prestacaoDetalhada?.contrato?.imovel_endereco || boleto?.contrato.imovel_endereco}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🆕 VALORES DO BOLETO - LANÇAMENTOS DETALHADOS */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Boleto</span>
            {!valoresCalculados.usandoDadosAntigos && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Dados Detalhados
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Exibir todos os lançamentos da categoria 'termo' */}
            {valoresCalculados.lancamentosTermo.map((lancamento, index) => (
              <motion.div
                key={`termo-${index}`}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">{lancamento.descricao}</span>
                  </div>
                </div>
                <span className="font-semibold text-foreground">
                  {formatMoney(lancamento.valor)}
                </span>
              </motion.div>
            ))}

            {/* Exibir descontos junto aos lançamentos do boleto */}
            {valoresCalculados.lancamentosDesconto?.map((lancamento, index) => (
              <motion.div
                key={`desconto-${index}`}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">{lancamento.descricao}</span>
                  </div>
                </div>
                <span className="font-semibold text-red-600">
                  {formatMoney(lancamento.valor)}
                </span>
              </motion.div>
            ))}

            {/* Fallback para dados antigos se não há dados da API */}
            {valoresCalculados.usandoDadosAntigos && boleto && (
              <>
                {Object.entries(boleto?.valores_base).map(([key, valor]) => {
                  if (valor === 0) return null;
                  const labels: Record<string, string> = {
                    aluguel: 'Aluguel',
                    condominio: 'Condomínio',
                    iptu: 'IPTU',
                    fci: 'FCI',
                    seguro_fianca: 'Seguro Fiança',
                    seguro_incendio: 'Seguro Incêndio',
                    energia_eletrica: 'Energia Elétrica',
                    gas: 'Gás'
                  };

                  return (
                    <motion.div
                      key={key}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-foreground">{labels[key] || key}</span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {formatMoney(valor)}
                      </span>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>

          <div className="border-t border-border mt-6 pt-4 space-y-4">
            {/* Acréscimos por Atraso - dentro da composição */}
            {(prestacaoDetalhada?.valor_acrescimos > 0 || boleto?.acrescimos?.dias_atraso > 0) && (
              <div className="flex justify-between items-center p-4 rounded-lg border border-border">
                <div>
                  <span className="font-medium text-foreground">Acréscimos por Atraso</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {prestacaoDetalhada?.dias_atraso || boleto?.acrescimos?.dias_atraso} dias em atraso
                    </Badge>
                  </div>
                </div>
                <span className="font-bold text-red-600">
                  +{formatMoney(prestacaoDetalhada?.valor_acrescimos || boleto?.acrescimos?.valor_total || 0)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center p-4 bg-muted/20 rounded-lg">
              <span className="text-sm font-medium text-foreground">Valor Total do Boleto</span>
              <span className="text-sm font-bold text-foreground">
                {formatMoney(prestacaoDetalhada?.valor_boleto || boleto?.valor_total || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🆕 VALORES RETIDOS - LANÇAMENTOS DETALHADOS */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            <span>Retidos</span>
            {!valoresCalculados.usandoDadosAntigos && (
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                Dados Detalhados
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Exibir todos os lançamentos das categorias 'retido' e 'taxa' */}
            {[...valoresCalculados.lancamentosRetido, ...valoresCalculados.lancamentosTaxa].map((lancamento, index) => (
              <motion.div
                key={`retido-${index}`}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{lancamento.descricao}</span>
                </div>
                <span className="font-semibold text-foreground">
                  {formatMoney(Math.abs(lancamento.valor))}
                </span>
              </motion.div>
            ))}

            {/* Fallback para dados antigos se não há dados da API */}
            {valoresCalculados.usandoDadosAntigos && boleto && (
              <>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Calculator className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">Taxa de Administração</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatMoney((prestacaoDetalhada?.valor_boleto || boleto?.valor_total || 0) * 0.1)}
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">Taxa de Transferência</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatMoney(10.00)}
                  </span>
                </motion.div>
              </>
            )}
          </div>

          <div className="border-t border-border mt-6 pt-4 space-y-4">
            {/* Valor Total Retido */}
            <div className="flex justify-between items-center p-4 bg-muted/20 rounded-lg">
              <span className="text-sm font-bold text-foreground">Valor Total Retido</span>
              <span className="text-sm font-bold text-foreground">
                {formatMoney(valoresCalculados.totalRetido)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Seção de Repasses */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-primary" />
            <span>Repasses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Distribuição dos proprietários */}
          <div className="space-y-4">
            {/* SEMPRE usar a estrutura completa de múltiplos locadores */}
            {/* Se não há distribuição, simular como se fosse um único locador */}
            {!prestacaoDetalhada?.distribuicao_repasse || prestacaoDetalhada.distribuicao_repasse.length === 0 ? (
              /* Fallback: Proprietário único sem dados da distribuição - criar estrutura similar */
              <div className="p-4 bg-background border border-border rounded-xl">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-muted-foreground" />
                  <span>Repasse por Locador</span>
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="text-sm font-medium text-foreground">
                            {prestacaoDetalhada?.locadores?.[0]?.locador_nome ||
                             boleto?.contrato?.proprietario_nome ||
                             'Proprietário Principal'}
                          </h5>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                            Principal
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          100.00% do valor líquido
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-600">
                          {formatMoney(valoresCalculados.valorRepasse)}
                        </span>
                      </div>
                    </div>

                    {/* Dados bancários do locador único */}
                    <div className="p-2 bg-muted/30 rounded border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground">Dados Bancários</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {/* Usar dados bancários do primeiro locador se disponível */}
                        {prestacaoDetalhada?.locadores?.[0]?.conta_bancaria?.tipo_recebimento === 'PIX' && prestacaoDetalhada?.locadores?.[0]?.conta_bancaria?.pix_chave && (
                          <div>
                            <span className="text-muted-foreground">PIX:</span>
                            <span className="ml-1 font-mono">{prestacaoDetalhada.locadores[0].conta_bancaria.pix_chave}</span>
                          </div>
                        )}
                        {prestacaoDetalhada?.locadores?.[0]?.conta_bancaria?.tipo_recebimento === 'TED' && prestacaoDetalhada?.locadores?.[0]?.conta_bancaria?.titular && (
                          <>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Titular:</span>
                              <span className="ml-1 font-medium">{prestacaoDetalhada.locadores[0].conta_bancaria.titular}</span>
                            </div>
                            {prestacaoDetalhada.locadores[0].conta_bancaria.titular_cpf && (
                              <div className="col-span-2">
                                <span className="text-muted-foreground">CPF:</span>
                                <span className="ml-1 font-mono">{prestacaoDetalhada.locadores[0].conta_bancaria.titular_cpf}</span>
                              </div>
                            )}
                          </>
                        )}
                        {prestacaoDetalhada?.locadores?.[0]?.conta_bancaria?.banco && (
                          <div>
                            <span className="text-muted-foreground">Banco:</span>
                            <span className="ml-1">{prestacaoDetalhada.locadores[0].conta_bancaria.banco}</span>
                          </div>
                        )}
                        {prestacaoDetalhada?.locadores?.[0]?.conta_bancaria?.agencia && (
                          <div>
                            <span className="text-muted-foreground">Agência:</span>
                            <span className="ml-1 font-mono">{prestacaoDetalhada.locadores[0].conta_bancaria.agencia}</span>
                          </div>
                        )}
                        {prestacaoDetalhada?.locadores?.[0]?.conta_bancaria?.conta && (
                          <div>
                            <span className="text-muted-foreground">Conta:</span>
                            <span className="ml-1 font-mono">{prestacaoDetalhada.locadores[0].conta_bancaria.conta}</span>
                          </div>
                        )}

                        {/* Fallback se não houver dados bancários */}
                        {!prestacaoDetalhada?.locadores?.[0]?.conta_bancaria && (
                          <div className="col-span-2 text-center text-muted-foreground italic">
                            Dados bancários não informados
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Estrutura normal para múltiplos locadores já existe abaixo */
              null
            )}
          </div>

          {/* 🆕 VALOR TOTAL A REPASSAR - MESMA ESTRUTURA DO LANÇAMENTO */}
          <div className="mt-6 space-y-4">
            {/* Valor total com descrição */}
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">Valor de Repasse</span>
                  <p className="text-xs text-green-500 mt-1">Líquido para o proprietário</p>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {formatMoney(valoresCalculados.valorRepasse)}
                </span>
              </div>
            </div>

            {/* Repasse por Locador - SEMPRE MOSTRAR (1 ou múltiplos locadores) */}
            {prestacaoDetalhada?.distribuicao_repasse && prestacaoDetalhada.distribuicao_repasse.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-muted-foreground" />
                  <span>Repasse por Locador</span>
                </h4>
                <div className="space-y-3">
                  {prestacaoDetalhada.distribuicao_repasse.map((distribuicao, index) => {
                    // Buscar dados bancários do locador correspondente usando a conta selecionada no termo
                    const locador = prestacaoDetalhada.locadores?.find(l => l.locador_id === distribuicao.locador_id);

                    return (
                      <div key={distribuicao.locador_id || index} className="p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h5 className="text-sm font-medium text-foreground">
                                {distribuicao.locador_nome}
                              </h5>
                              {distribuicao.responsabilidade_principal && (
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                                  Principal
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {distribuicao.percentual_participacao?.toFixed(2)}% do valor líquido
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-green-600">
                              {formatMoney(distribuicao.valor_repasse)}
                            </span>
                          </div>
                        </div>

                        {/* Dados bancários da conta selecionada no termo */}
                        <div className="p-2 bg-muted/30 rounded border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground">Dados Bancários</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {/* Usar dados bancários da conta selecionada no termo do contrato */}
                            {locador?.conta_bancaria?.tipo_recebimento === 'PIX' && locador?.conta_bancaria?.pix_chave && (
                              <div>
                                <span className="text-muted-foreground">PIX:</span>
                                <span className="ml-1 font-mono">{locador.conta_bancaria.pix_chave}</span>
                              </div>
                            )}
                            {locador?.conta_bancaria?.tipo_recebimento === 'TED' && locador?.conta_bancaria?.titular && (
                              <>
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Titular:</span>
                                  <span className="ml-1 font-medium">{locador.conta_bancaria.titular}</span>
                                </div>
                                {locador.conta_bancaria.titular_cpf && (
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">CPF:</span>
                                    <span className="ml-1 font-mono">{locador.conta_bancaria.titular_cpf}</span>
                                  </div>
                                )}
                              </>
                            )}
                            {locador?.conta_bancaria?.banco && (
                              <div>
                                <span className="text-muted-foreground">Banco:</span>
                                <span className="ml-1">{locador.conta_bancaria.banco}</span>
                              </div>
                            )}
                            {locador?.conta_bancaria?.agencia && (
                              <div>
                                <span className="text-muted-foreground">Agência:</span>
                                <span className="ml-1 font-mono">{locador.conta_bancaria.agencia}</span>
                              </div>
                            )}
                            {locador?.conta_bancaria?.conta && (
                              <div>
                                <span className="text-muted-foreground">Conta:</span>
                                <span className="ml-1 font-mono">{locador.conta_bancaria.conta}</span>
                              </div>
                            )}

                            {/* Fallback se não houver dados bancários */}
                            {!locador?.conta_bancaria && (
                              <div className="col-span-2 text-center text-muted-foreground italic">
                                Conta bancária não selecionada no termo
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Valor Final */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="card-glass border-primary/20">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Resumo de Cálculo */}
              <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-4 space-y-1">
                {/* Lançamentos do Boleto */}
                {valoresBaseConfig.map(({ key, label }) => {
                  const valor = valoresBase[key] || 0;
                  if (valor === 0) return null;
                  return (
                    <div key={key} className="flex justify-between">
                      <span>{label}:</span>
                      <span>{formatMoney(valor)}</span>
                    </div>
                  );
                })}

                {/* Subtotal */}
                <div className="flex justify-between">
                  <span>Subtotal dos valores base:</span>
                  <span>{formatMoney(valoresCalculados.totalBoleto)}</span>
                </div>

                {/* Acréscimos */}
                {((prestacaoDetalhada?.acrescimos_atraso || 0) > 0 || (boleto?.acrescimos?.dias_atraso || 0) > 0) && (
                  <div className="flex justify-between text-red-600">
                    <span>Acréscimos por atraso:</span>
                    <span>+ {formatMoney(
                      prestacaoDetalhada?.acrescimos_atraso ||
                      boleto?.acrescimos?.valor_total || 0
                    )}</span>
                  </div>
                )}
                
                {/* Descontos */}
                {valoresCalculados.totalRetido > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Total de descontos:</span>
                    <span>- {formatMoney(valoresCalculados.totalRetido)}</span>
                  </div>
                )}
                
                {/* Valor do Boleto */}
                <div className="border-t pt-1 flex justify-between font-medium">
                  <span>Valor total do boleto:</span>
                  <span>{formatMoney(prestacaoDetalhada?.valor_boleto || boleto?.valor_total || 0)}</span>
                </div>
                
                {/* Total Retido - usar valor salvo no banco */}
                <div className="border-t border-border pt-3 mt-2 flex justify-between font-medium text-red-600">
                  <span>Total retido:</span>
                  <span>- {formatMoney(valoresCalculados.totalRetido)}</span>
                </div>
                
                {/* Valor Final */}
                <div className="border-t border-border pt-3 mt-2 flex justify-between font-bold text-green-600">
                  <span>Valor total a repassar:</span>
                  <span>{formatMoney(valoresCalculados.valorRepasse)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Seção de Contato para Cobrança */}
      {(boleto?.contrato?.locatario_telefone || boleto?.contrato?.locatario_email || 
        boleto?.contrato?.proprietario_telefone || boleto?.contrato?.proprietario_email) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="card-glass border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                  <Mail className="w-5 h-5" />
                  <span>Contato para Cobrança</span>
                </CardTitle>
                {boleto?.numero_boleto && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-muted-foreground">Nº:</span>
                    <span className="font-mono font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {boleto?.numero_boleto}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Contatos do Locatário */}
                {(boleto?.contrato.locatario_telefone || boleto?.contrato.locatario_email) && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Contatos do Locatário</span>
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {boleto?.contrato.locatario_telefone && (
                        <div className="flex items-center space-x-3 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 flex-1">
                          <Phone className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Telefone</p>
                            <a 
                              href={`tel:${boleto?.contrato.locatario_telefone}`}
                              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                              title="Clique para ligar"
                            >
                              {boleto?.contrato.locatario_telefone}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {boleto?.contrato.locatario_email && (
                        <div className="flex items-center space-x-3 p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 flex-1">
                          <Mail className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">E-mail</p>
                            <a 
                              href={`mailto:${boleto?.contrato.locatario_email}?subject=Cobrança - Boleto ${boleto?.numero_boleto || getMesNome(boleto?.periodo?.mes || 1) + '/' + boleto?.periodo?.ano}&body=Prezado(a) ${boleto?.contrato.locatario_nome},%0A%0ASegue em anexo o boleto referente ao aluguel de ${getMesNome(boleto?.periodo?.mes || 1)}/${boleto?.periodo?.ano}.%0A%0AValor: ${formatMoney(boleto?.valor_total)}%0A${boleto?.numero_boleto ? 'Número do Boleto: ' + boleto?.numero_boleto + '%0A' : ''}Vencimento: ${formatDate(boleto?.periodo?.data_vencimento || new Date().toISOString())}%0A%0AAtenciosamente,`}
                              className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors break-all"
                              title="Clique para enviar cobrança por e-mail"
                            >
                              {boleto?.contrato.locatario_email}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contatos do Proprietário */}
                {(boleto?.contrato.proprietario_telefone || boleto?.contrato.proprietario_email) && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Crown className="w-4 h-4" />
                      <span>Contatos do Proprietário</span>
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {boleto?.contrato.proprietario_telefone && (
                        <div className="flex items-center space-x-3 p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800 flex-1">
                          <Phone className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Telefone</p>
                            <a 
                              href={`tel:${boleto?.contrato.proprietario_telefone}`}
                              className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                              title="Clique para ligar"
                            >
                              {boleto?.contrato.proprietario_telefone}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {boleto?.contrato.proprietario_email && (
                        <div className="flex items-center space-x-3 p-4 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800 flex-1">
                          <Mail className="w-5 h-5 text-orange-600" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">E-mail</p>
                            <a 
                              href={`mailto:${boleto?.contrato.proprietario_email}?subject=Relatório - Boleto ${boleto?.numero_boleto || getMesNome(boleto?.periodo?.mes || 1) + '/' + boleto?.periodo?.ano}&body=Prezado(a) ${boleto?.contrato.proprietario_nome},%0A%0ASegue relatório do boleto referente ao aluguel de ${getMesNome(boleto?.periodo?.mes || 1)}/${boleto?.periodo?.ano}.%0A%0AValor: ${formatMoney(boleto?.valor_total)}%0A${boleto?.numero_boleto ? 'Número do Boleto: ' + boleto?.numero_boleto + '%0A' : ''}Locatário: ${boleto?.contrato.locatario_nome}%0A%0AAtenciosamente,`}
                              className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors break-all"
                              title="Clique para enviar relatório por e-mail"
                            >
                              {boleto?.contrato.proprietario_email}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informações de Cobrança */}
                {boleto?.contrato.locatario_email && (
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Informações para Cobrança:
                    </h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Locatário:</span>
                        <span className="font-medium">{boleto?.contrato.locatario_nome}</span>
                      </div>
                      {boleto?.numero_boleto && (
                        <div className="flex justify-between">
                          <span>Nº Boleto:</span>
                          <span className="font-mono font-medium">{boleto?.numero_boleto}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Referência:</span>
                        <span className="font-medium">
                          {getMesNome(boleto?.periodo?.mes || 1)}/{boleto?.periodo?.ano}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor Total:</span>
                        <span className="font-semibold text-foreground">{formatMoney(prestacaoDetalhada?.valor_boleto || boleto?.valor_total || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vencimento:</span>
                        <span className="font-medium">
                          {formatDate(boleto?.periodo?.data_vencimento || new Date().toISOString())}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}


    </div>
  );
};

export default DetalhamentoBoleto;