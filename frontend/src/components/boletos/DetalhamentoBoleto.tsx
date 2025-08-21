import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Calendar, MapPin, User, Calculator, Phone, Mail, Receipt, Hash, Crown, CheckCircle } from 'lucide-react';

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

interface DetalhamentoBoletoProps {
  boleto: BoletoDetalhes;
  className?: string;
}

export const DetalhamentoBoleto: React.FC<DetalhamentoBoletoProps> = ({ boleto, className = "" }) => {
  const formatMoney = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1] || '';
  };

  const subtotalBase = Object.values(boleto.valores_base).reduce((a, b) => a + b, 0);
  const totalDescontos = Object.values(boleto.descontos).reduce((a, b) => a + b, 0);

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

  // Preparar descontos dinâmicos baseados nos valores reais
  const descontosConfig = [];
  
  // Adicionar apenas descontos que têm valor > 0
  if (boleto.descontos.desconto_pontualidade > 0) {
    descontosConfig.push({ key: 'desconto_pontualidade', label: 'Desconto Pontualidade', especial: true });
  }
  
  // Benfeitorias - adicionar dinamicamente baseado nos valores
  if (boleto.descontos.desconto_benfeitoria_1 > 0) {
    descontosConfig.push({ key: 'desconto_benfeitoria_1', label: 'Desconto Benfeitoria 1' });
  }
  if (boleto.descontos.desconto_benfeitoria_2 > 0) {
    descontosConfig.push({ key: 'desconto_benfeitoria_2', label: 'Desconto Benfeitoria 2' });
  }
  if (boleto.descontos.desconto_benfeitoria_3 > 0) {
    descontosConfig.push({ key: 'desconto_benfeitoria_3', label: 'Desconto Benfeitoria 3' });
  }
  
  // Outros descontos
  if (boleto.descontos.reembolso_fundo_obras > 0) {
    descontosConfig.push({ key: 'reembolso_fundo_obras', label: 'Reembolso Fundo de Obras' });
  }
  if (boleto.descontos.fundo_reserva > 0) {
    descontosConfig.push({ key: 'fundo_reserva', label: 'Fundo de Reserva' });
  }
  if (boleto.descontos.fundo_iptu > 0) {
    descontosConfig.push({ key: 'fundo_iptu', label: 'Fundo IPTU' });
  }
  if (boleto.descontos.fundo_outros > 0) {
    descontosConfig.push({ key: 'fundo_outros', label: 'Fundo Outros' });
  }
  if (boleto.descontos.honorario_advogados > 0) {
    descontosConfig.push({ key: 'honorario_advogados', label: 'Honorário Advogados' });
  }
  if (boleto.descontos.boleto_advogados > 0) {
    descontosConfig.push({ key: 'boleto_advogados', label: 'Boleto Advogados' });
  }

  return (
    <div className={`max-w-5xl mx-auto space-y-6 ${className}`}>
      {/* Header - Informações do Contrato */}
      {boleto.contrato && boleto.periodo && (
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
                    {boleto.numero_boleto && (
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {boleto.numero_boleto}
                        </span>
                      </div>
                    )}
                    <p className="text-muted-foreground">
                      Referência: {getMesNome(boleto.periodo.mes)}/{boleto.periodo.ano}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center justify-end space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Vencimento: {formatDate(boleto.periodo.data_vencimento)}</span>
                </div>
                {boleto.periodo.data_pagamento && (
                  <div className="flex items-center justify-end space-x-2 text-sm text-green-600 dark:text-green-400">
                    <Calendar className="w-4 h-4" />
                    <span>Pagamento: {formatDate(boleto.periodo.data_pagamento)}</span>
                  </div>
                )}
                <div className="flex justify-end">
                  {boleto.acrescimos.dias_atraso > 0 ? (
                    <Badge variant="destructive" className="text-xs">
                      {boleto.acrescimos.dias_atraso} dias em atraso
                    </Badge>
                  ) : boleto.periodo.data_pagamento ? (
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
              {/* Coluna 1 - Informações do Locatário */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Locatário</p>
                    <p className="font-medium text-foreground">{boleto.contrato.locatario_nome}</p>
                  </div>
                </div>
                
                {boleto.contrato.locatario_telefone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <a 
                        href={`tel:${boleto.contrato.locatario_telefone}`}
                        className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                        title="Clique para ligar"
                      >
                        {boleto.contrato.locatario_telefone}
                      </a>
                    </div>
                  </div>
                )}
                
                {boleto.contrato.locatario_email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                      <a 
                        href={`mailto:${boleto.contrato.locatario_email}`}
                        className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                        title="Clique para enviar e-mail"
                      >
                        {boleto.contrato.locatario_email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Coluna 2 - Informações do Proprietário */}
              <div className="space-y-4">
                {boleto.contrato.proprietario_nome && (
                  <div className="flex items-center space-x-3">
                    <Crown className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Proprietário</p>
                      <p className="font-medium text-foreground">{boleto.contrato.proprietario_nome}</p>
                    </div>
                  </div>
                )}
                
                {boleto.contrato.proprietario_telefone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <a 
                        href={`tel:${boleto.contrato.proprietario_telefone}`}
                        className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                        title="Clique para ligar"
                      >
                        {boleto.contrato.proprietario_telefone}
                      </a>
                    </div>
                  </div>
                )}
                
                {boleto.contrato.proprietario_email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                      <a 
                        href={`mailto:${boleto.contrato.proprietario_email}`}
                        className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                        title="Clique para enviar e-mail"
                      >
                        {boleto.contrato.proprietario_email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Coluna 3 - Informações do Imóvel */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Imóvel</p>
                    <p className="font-medium text-foreground">{boleto.contrato.imovel_endereco}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Valores Base */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Composição do Valor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {valoresBaseConfig.map(({ key, label, temAcrescimo }) => {
              const valor = boleto.valores_base[key as keyof typeof boleto.valores_base];
              if (valor === 0) return null;
              
              return (
                <motion.div
                  key={key}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">{label}</span>
                      {temAcrescimo && boleto.acrescimos.dias_atraso > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          sujeito a acréscimos
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatMoney(valor)}
                  </span>
                </motion.div>
              );
            })}
          </div>
          
          <div className="border-t border-border mt-6 pt-4 space-y-4">
            <div className="flex justify-between items-center p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg">
              <span className="text-lg font-medium text-purple-700 dark:text-purple-300">Subtotal dos Lançamentos</span>
              <span className="text-xl font-bold text-purple-700 dark:text-purple-300">
                {formatMoney(subtotalBase)}
              </span>
            </div>

            {/* Acréscimos por Atraso - dentro da composição */}
            {boleto.acrescimos.dias_atraso > 0 && (
              <div className="flex justify-between items-center p-4 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div>
                  <span className="text-lg font-medium text-red-700 dark:text-red-300">Acréscimos por Atraso</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="destructive" className="text-xs">
                      {boleto.acrescimos.dias_atraso} dias em atraso
                    </Badge>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Juros e multa aplicados
                  </p>
                </div>
                <span className="text-xl font-bold text-red-700 dark:text-red-300">
                  +{formatMoney(boleto.acrescimos.valor_total)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-lg font-medium text-blue-700 dark:text-blue-300">Valor do Boleto</span>
              <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {formatMoney(boleto.valor_total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Valores Retidos do Locador */}
      <Card className="card-glass border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span>Valores Retidos do Locador</span>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              Retidos do proprietário
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Taxa de Administração */}
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Calculator className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <span className="font-medium text-red-700 dark:text-red-300">Taxa de Administração</span>
                  <p className="text-xs text-red-600 dark:text-red-400">10% retido do valor recebido</p>
                </div>
              </div>
              <span className="font-semibold text-red-700 dark:text-red-300">
                {formatMoney(boleto.valor_total * 0.1)}
              </span>
            </motion.div>

            {/* Taxa de Registro de Boleto */}
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Receipt className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <span className="font-medium text-red-700 dark:text-red-300">Taxa de Registro de Boleto</span>
                  <p className="text-xs text-red-600 dark:text-red-400">Custo operacional retido</p>
                </div>
              </div>
              <span className="font-semibold text-red-700 dark:text-red-300">
                {formatMoney(2.50)}
              </span>
            </motion.div>

            {/* Taxa de Transferência */}
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <span className="font-medium text-red-700 dark:text-red-300">Taxa de Transferência</span>
                  <p className="text-xs text-red-600 dark:text-red-400">Custo PIX/TED ao proprietário</p>
                </div>
              </div>
              <span className="font-semibold text-red-700 dark:text-red-300">
                {formatMoney(10.00)}
              </span>
            </motion.div>
          </div>
          
          <div className="border-t border-border mt-6 pt-4 space-y-4">
            {/* Valor Total Retido */}
            <div className="flex justify-between items-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
              <div>
                <span className="text-lg font-bold text-red-700 dark:text-red-300">Valor Total Retido</span>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Soma de todas as retenções
                </p>
              </div>
              <span className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatMoney(boleto.valor_total * 0.1 + 2.50 + 10.00)}
              </span>
            </div>


            {/* Informações adicionais */}
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-xs text-red-700 dark:text-red-300 space-y-1">
                <p><strong>• De quem retemos:</strong> Locador (proprietário)</p>
                <p><strong>• Quando é retido:</strong> No momento do repasse</p>
                <p><strong>• Finalidade:</strong> Taxa de administração e custos operacionais</p>
                <p><strong>• Margem da administradora:</strong> {((boleto.valor_total * 0.1 + 2.50 + 10.00) / boleto.valor_total * 100).toFixed(2)}% do valor recebido</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Descontos e Ajustes - só mostrar se houver descontos aplicados */}
      {descontosConfig.length > 0 && (
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <span>Descontos e Ajustes</span>
              <Badge variant="secondary">{descontosConfig.length} aplicado(s)</Badge>
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {descontosConfig.map(({ key, label, especial }) => {
              const valor = boleto.descontos[key as keyof typeof boleto.descontos];
              
              return (
                <motion.div
                  key={key}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-green-200 hover:border-green-300 bg-green-50/50 dark:bg-green-950/20 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-green-700 dark:text-green-300">
                      {label}
                    </span>
                    {especial && (
                      <Badge variant="secondary" className="text-xs">
                        aplicado
                      </Badge>
                    )}
                  </div>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    -{formatMoney(valor)}
                  </span>
                </motion.div>
              );
            })}
          </div>
          
          <div className="border-t border-border mt-6 pt-4">
            <div className="flex justify-between items-center p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg">
              <span className="text-lg font-medium text-foreground">Total de Descontos</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                -{formatMoney(totalDescontos)}
              </span>
            </div>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Nova Seção - Detalhamento do Boleto com Repasses */}
      <Card className="card-glass border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <span>Detalhamento Financeiro - Repasses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Valor Total do Boleto */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Valor Total do Boleto</h4>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatMoney(boleto.valor_total)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Valor que o inquilino paga</p>
            </div>

            {/* Total Valor Retido */}
            <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h4 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Total Valor Retido</h4>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {formatMoney(boleto.valor_total * 0.1)}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Taxa administração (10%)</p>
            </div>

            {/* Repasse ao Proprietário */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Crown className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Repasse ao Proprietário</h4>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatMoney(boleto.valor_total * 0.9)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Valor líquido (90%)</p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Seção de Repasses para Múltiplos Proprietários */}
      <Card className="card-glass border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <span>Divisão de Repasses - Proprietários</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Exemplo de múltiplos proprietários - seria vindo de dados reais */}
          <div className="space-y-4">
            {/* Proprietário 1 */}
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h4 className="font-medium text-foreground">
                      {boleto.contrato?.proprietario_nome || 'Proprietário Principal'}
                    </h4>
                    <p className="text-sm text-muted-foreground">100% da propriedade</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Valor do Repasse</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {formatMoney(boleto.valor_total * 0.9 - 2.50)}
                  </p>
                </div>
              </div>
              
              {/* Dados bancários */}
              <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {boleto.contrato?.proprietario_email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-yellow-600" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{boleto.contrato.proprietario_email}</span>
                    </div>
                  )}
                  {boleto.contrato?.proprietario_telefone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-yellow-600" />
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-medium">{boleto.contrato.proprietario_telefone}</span>
                    </div>
                  )}
                </div>
                
                {/* Simulação de dados bancários */}
                <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">PIX:</span>
                      <span className="ml-2 font-mono">***@email.com</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Banco:</span>
                      <span className="ml-2">Banco do Brasil</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Agência:</span>
                      <span className="ml-2 font-mono">0001-5</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conta:</span>
                      <span className="ml-2 font-mono">12345-6</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo da Divisão */}
            <div className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
              <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-blue-500" />
                <span>Resumo da Divisão</span>
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="font-medium text-blue-600">Total Coletado</p>
                  <p className="text-lg font-bold text-foreground">{formatMoney(boleto.valor_total)}</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <p className="font-medium text-red-600">Total Retido</p>
                  <p className="text-lg font-bold text-foreground">{formatMoney(boleto.valor_total * 0.1 + 2.50)}</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="font-medium text-green-600">Total Repassado</p>
                  <p className="text-lg font-bold text-foreground">{formatMoney(boleto.valor_total * 0.9 - 2.50)}</p>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground text-center">
                <p>• Taxa de administração aplicada: 10%</p>
                <p>• Taxa de registro de boleto: R$ 2,50</p>
                <p>• Proprietários beneficiados: 1</p>
              </div>
            </div>
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
              {/* Título e Valor Principal */}
              <div className="text-center space-y-4">
                <div className="text-sm font-medium text-muted-foreground">Valor Total a Repassar</div>
                <div className="text-4xl font-bold text-green-600">
                  {formatMoney(boleto.valor_total - (boleto.valor_total * 0.1) - 2.50 - 10.00)}
                </div>
              </div>

              {/* Breakdown Detalhado Integrado */}
              <div className="border-t border-border pt-6">
                <h5 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center space-x-2">
                  <Calculator className="w-5 h-5 text-indigo-500" />
                  <span>Breakdown Detalhado</span>
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  {/* Composição do Valor */}
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h6 className="font-medium text-foreground mb-3 text-blue-600">💰 Composição do Valor:</h6>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal dos Lançamentos:</span>
                        <span className="font-medium">{formatMoney(subtotalBase)}</span>
                      </div>
                      {boleto.acrescimos.dias_atraso > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Acréscimos por Atraso:</span>
                          <span className="font-medium text-red-600">+{formatMoney(boleto.acrescimos.valor_total)}</span>
                        </div>
                      )}
                      {totalDescontos > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Descontos/Ajustes:</span>
                          <span className="font-medium text-green-600">-{formatMoney(totalDescontos)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 font-bold flex justify-between">
                        <span>Valor do Boleto:</span>
                        <span className="text-blue-600">{formatMoney(boleto.valor_total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Valor Total a Repassar */}
                  <div className="p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h6 className="font-medium text-foreground mb-3 text-green-600">📊 Valor Total a Repassar:</h6>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor do Boleto:</span>
                        <span className="font-medium">{formatMoney(boleto.valor_total)}</span>
                      </div>
                      <div className="border-t pt-2 text-red-600 font-medium">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Taxa Administração (10%):</span>
                          <span>-{formatMoney(boleto.valor_total * 0.1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Taxa Registro Boleto:</span>
                          <span>-{formatMoney(2.50)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Taxa Transferência:</span>
                          <span>-{formatMoney(10.00)}</span>
                        </div>
                      </div>
                      <div className="border-t pt-2 font-bold flex justify-between">
                        <span className="text-green-700">Total Retido:</span>
                        <span className="text-red-600">-{formatMoney(boleto.valor_total * 0.1 + 2.50 + 10.00)}</span>
                      </div>
                      <div className="border-t pt-2 font-bold flex justify-between text-lg">
                        <span className="text-green-700">Valor Total a Repassar:</span>
                        <span className="text-green-600">{formatMoney(boleto.valor_total - (boleto.valor_total * 0.1) - 2.50 - 10.00)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status do Pagamento */}
              {boleto.periodo?.data_pagamento ? (
                <div className="text-sm text-muted-foreground bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-1">
                  <p className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Boleto pago em {formatDate(boleto.periodo.data_pagamento)}</span>
                  </p>
                  {boleto.acrescimos.dias_atraso > 0 && (
                    <>
                      <p>Valor original: {formatMoney(subtotalBase - totalDescontos)}</p>
                      <p>Acréscimos por atraso: {formatMoney(boleto.acrescimos.valor_total)}</p>
                    </>
                  )}
                </div>
              ) : boleto.acrescimos.dias_atraso > 0 ? (
                <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 space-y-1">
                  <p className="flex items-center justify-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span>Boleto em atraso há {boleto.acrescimos.dias_atraso} dias</span>
                  </p>
                  <p>Valor original: {formatMoney(subtotalBase - totalDescontos)}</p>
                  <p>Acréscimos aplicados: {formatMoney(boleto.acrescimos.valor_total)}</p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="flex items-center justify-center space-x-2 text-blue-700 dark:text-blue-300">
                    <Calendar className="w-4 h-4" />
                    <span>Vencimento: {formatDate(boleto.periodo?.data_vencimento || new Date().toISOString())}</span>
                  </p>
                </div>
              )}

              {/* Resumo de Cálculo */}
              <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-4 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal dos valores base:</span>
                  <span>{formatMoney(subtotalBase)}</span>
                </div>
                {boleto.acrescimos.dias_atraso > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Acréscimos por atraso:</span>
                    <span>+ {formatMoney(boleto.acrescimos.valor_total)}</span>
                  </div>
                )}
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Total de descontos:</span>
                  <span>- {formatMoney(totalDescontos)}</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-medium">
                  <span>Valor final:</span>
                  <span>{formatMoney(boleto.valor_total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Seção de Contato para Cobrança */}
      {(boleto.contrato?.locatario_telefone || boleto.contrato?.locatario_email || 
        boleto.contrato?.proprietario_telefone || boleto.contrato?.proprietario_email) && (
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
                {boleto.numero_boleto && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-muted-foreground">Nº:</span>
                    <span className="font-mono font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {boleto.numero_boleto}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Contatos do Locatário */}
                {(boleto.contrato.locatario_telefone || boleto.contrato.locatario_email) && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Contatos do Locatário</span>
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {boleto.contrato.locatario_telefone && (
                        <div className="flex items-center space-x-3 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 flex-1">
                          <Phone className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Telefone</p>
                            <a 
                              href={`tel:${boleto.contrato.locatario_telefone}`}
                              className="text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                              title="Clique para ligar"
                            >
                              {boleto.contrato.locatario_telefone}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {boleto.contrato.locatario_email && (
                        <div className="flex items-center space-x-3 p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 flex-1">
                          <Mail className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">E-mail</p>
                            <a 
                              href={`mailto:${boleto.contrato.locatario_email}?subject=Cobrança - Boleto ${boleto.numero_boleto || getMesNome(boleto.periodo?.mes || 1) + '/' + boleto.periodo?.ano}&body=Prezado(a) ${boleto.contrato.locatario_nome},%0A%0ASegue em anexo o boleto referente ao aluguel de ${getMesNome(boleto.periodo?.mes || 1)}/${boleto.periodo?.ano}.%0A%0AValor: ${formatMoney(boleto.valor_total)}%0A${boleto.numero_boleto ? 'Número do Boleto: ' + boleto.numero_boleto + '%0A' : ''}Vencimento: ${formatDate(boleto.periodo?.data_vencimento || new Date().toISOString())}%0A%0AAtenciosamente,`}
                              className="text-lg font-semibold text-green-600 hover:text-green-700 transition-colors break-all"
                              title="Clique para enviar cobrança por e-mail"
                            >
                              {boleto.contrato.locatario_email}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contatos do Proprietário */}
                {(boleto.contrato.proprietario_telefone || boleto.contrato.proprietario_email) && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                      <Crown className="w-4 h-4" />
                      <span>Contatos do Proprietário</span>
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {boleto.contrato.proprietario_telefone && (
                        <div className="flex items-center space-x-3 p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800 flex-1">
                          <Phone className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Telefone</p>
                            <a 
                              href={`tel:${boleto.contrato.proprietario_telefone}`}
                              className="text-lg font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                              title="Clique para ligar"
                            >
                              {boleto.contrato.proprietario_telefone}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {boleto.contrato.proprietario_email && (
                        <div className="flex items-center space-x-3 p-4 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800 flex-1">
                          <Mail className="w-5 h-5 text-orange-600" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">E-mail</p>
                            <a 
                              href={`mailto:${boleto.contrato.proprietario_email}?subject=Relatório - Boleto ${boleto.numero_boleto || getMesNome(boleto.periodo?.mes || 1) + '/' + boleto.periodo?.ano}&body=Prezado(a) ${boleto.contrato.proprietario_nome},%0A%0ASegue relatório do boleto referente ao aluguel de ${getMesNome(boleto.periodo?.mes || 1)}/${boleto.periodo?.ano}.%0A%0AValor: ${formatMoney(boleto.valor_total)}%0A${boleto.numero_boleto ? 'Número do Boleto: ' + boleto.numero_boleto + '%0A' : ''}Locatário: ${boleto.contrato.locatario_nome}%0A%0AAtenciosamente,`}
                              className="text-lg font-semibold text-orange-600 hover:text-orange-700 transition-colors break-all"
                              title="Clique para enviar relatório por e-mail"
                            >
                              {boleto.contrato.proprietario_email}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informações de Cobrança */}
                {boleto.contrato.locatario_email && (
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Informações para Cobrança:
                    </h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Locatário:</span>
                        <span className="font-medium">{boleto.contrato.locatario_nome}</span>
                      </div>
                      {boleto.numero_boleto && (
                        <div className="flex justify-between">
                          <span>Nº Boleto:</span>
                          <span className="font-mono font-medium">{boleto.numero_boleto}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Referência:</span>
                        <span className="font-medium">
                          {getMesNome(boleto.periodo?.mes || 1)}/{boleto.periodo?.ano}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor Total:</span>
                        <span className="font-semibold text-foreground">{formatMoney(boleto.valor_total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vencimento:</span>
                        <span className="font-medium">
                          {formatDate(boleto.periodo?.data_vencimento || new Date().toISOString())}
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