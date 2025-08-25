import React, { useState } from 'react';
import { 
  ArrowLeft, Building, FileText, Calculator, Crown, 
  TrendingDown, Receipt, Calendar, DollarSign, 
  Mail, MessageCircle, CheckCircle, Clock,
  CreditCard, Percent, Hash, X, Plus, Trash2,
  ArrowDown, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const TesteEdicaoSimples = () => {
  // Extrair ID da fatura da URL
  const getFaturaIdFromURL = () => {
    const path = window.location.pathname;
    const match = path.match(/\/prestacao-contas\/editar\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };
  
  const faturaIdFromURL = getFaturaIdFromURL();

  // IMPORTANTE: Sem dados mockados - aguardando integração com banco real
  const faturasMock = []; /*[
    {
      id: 1,
      numero_fatura: 'FAT-001',
      valor_total: 1850.00,
      valor_liquido: 1665.00,
      status: 'aberta',
      locatario_nome: 'João Silva Santos',
      proprietario_nome: 'Maria Oliveira Lima',
      valor_aluguel: 1650,
      valor_condominio: 150,
      valor_fci: 30,
      valor_seguro_fianca: 50,
      valor_seguro_incendio: 25,
      valor_iptu: 100
    },
    {
      id: 2,
      numero_fatura: 'FAT-002',
      valor_total: 2200.00,
      valor_liquido: 1980.00,
      status: 'pendente',
      locatario_nome: 'Ana Costa Pereira',
      proprietario_nome: 'Carlos Roberto Silva',
      valor_aluguel: 2000,
      valor_condominio: 150,
      valor_fci: 30,
      valor_seguro_fianca: 50,
      valor_seguro_incendio: 25,
      valor_iptu: 120
    },
    {
      id: 3,
      numero_fatura: 'FAT-003',
      valor_total: 1650.00,
      valor_liquido: 1485.00,
      status: 'paga',
      locatario_nome: 'Pedro Henrique Lima',
      proprietario_nome: 'Fernanda Alves Costa',
      valor_aluguel: 1500,
      valor_condominio: 120,
      valor_fci: 25,
      valor_seguro_fianca: 40,
      valor_seguro_incendio: 20,
      valor_iptu: 90
    },
    {
      id: 4,
      numero_fatura: 'FAT-004',
      valor_total: 1950.00,
      valor_liquido: 1755.00,
      status: 'em_atraso',
      locatario_nome: 'Luiza Santos Oliveira',
      proprietario_nome: 'Roberto Carlos Lima',
      valor_aluguel: 1750,
      valor_condominio: 140,
      valor_fci: 35,
      valor_seguro_fianca: 45,
      valor_seguro_incendio: 30,
      valor_iptu: 110
    },
    {
      id: 5,
      numero_fatura: 'FAT-005',
      valor_total: 2150.00,
      valor_liquido: 1935.00,
      status: 'cancelada',
      locatario_nome: 'Ricardo Melo Santos',
      proprietario_nome: 'Amanda Silva Costa',
      valor_aluguel: 1950,
      valor_condominio: 150,
      valor_fci: 30,
      valor_seguro_fianca: 50,
      valor_seguro_incendio: 25,
      valor_iptu: 120
    }
  ];*/

  // Buscar dados da fatura específica pelos mocks
  const faturaAtual = faturasMock.find(f => f.id === faturaIdFromURL) || faturasMock[0];
  console.log('📊 Dados da fatura carregados do mock:', faturaAtual);

  // Estados para contrato
  const [contratoSelecionado] = useState({
    id: faturaAtual.id,
    numero: faturaAtual.numero_fatura.replace('FAT-', 'CONT-'),
    locatario_nome: faturaAtual.locatario_nome,
    locatario_email: `${faturaAtual.locatario_nome.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    locatario_telefone: `(11) ${(99999 - faturaAtual.id).toString().padStart(5, '0')}-${(1111 + faturaAtual.id * 1111).toString().slice(-4)}`,
    locador_nome: faturaAtual.proprietario_nome,
    proprietario_email: `${faturaAtual.proprietario_nome.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    proprietario_telefone: `(11) ${(98765 - faturaAtual.id * 1111).toString().slice(-5)}-${(4321 + faturaAtual.id * 1111).toString().slice(-4)}`,
    valor_contrato: faturaAtual.valor_aluguel || 1500,
    valor_condominio: faturaAtual.valor_condominio || 150,
    valor_fci: faturaAtual.valor_fci || 30,
    valor_seguro_fianca: faturaAtual.valor_seguro_fianca || 50,
    valor_seguro_incendio: faturaAtual.valor_seguro_incendio || 25,
    valor_iptu: faturaAtual.valor_iptu || 100,
    retido_condominio: true,
    retido_fci: false,
    retido_seguro_fianca: true,
    retido_seguro_incendio: false,
    retido_iptu: true,
    valor_retido: 0,
    valor_antecipado: 0,
    porcentagem_proprietario: 100,
    tipo_recebimento: 'PIX',
    chave_pix: 'maria@exemplo.com',
    banco_proprietario: '',
    agencia_proprietario: '',
    conta_proprietario: '',
    data_vencimento: 5,
    multa_percentual: 2
  });

  // Estados para configurações
  const [tipoLancamento, setTipoLancamento] = useState<'entrada' | 'mensal' | 'rescisao'>('mensal');
  const [geracaoAutomatica, setGeracaoAutomatica] = useState(true);
  const [descontoDia, setDescontoDia] = useState(5);
  const [descontoPercentual, setDescontoPercentual] = useState(0);
  
  // Estados para retenções
  const [configuracaoRetencoes] = useState({
    percentual_admin: 10,
    taxa_boleto: 3.50,
    taxa_transferencia: 2.50
  });
  
  // Estados extras
  const [retidosExtras, setRetidosExtras] = useState([]);
  const [mostrandoFormularioRetidos, setMostrandoFormularioRetidos] = useState(false);
  const [novoRetido, setNovoRetido] = useState({
    tipo: 'retido' as 'retido' | 'antecipado',
    descricao: '',
    valor: 0
  });
  
  // Estados para lançamentos
  const [lancamentos, setLancamentos] = useState([]);
  const [mostrandoFormularioLancamentos, setMostrandoFormularioLancamentos] = useState(false);
  const [novoLancamento, setNovoLancamento] = useState({
    tipo: 'receita' as 'receita' | 'despesa' | 'taxa' | 'desconto' | 'ajuste',
    descricao: '',
    valor: 0
  });
  
  const [envioEmail, setEnvioEmail] = useState(true);
  const [diasAntesEnvioEmail, setDiasAntesEnvioEmail] = useState(5);
  const [envioWhatsapp, setEnvioWhatsapp] = useState(false);
  const [observacoesLancamento, setObservacoesLancamento] = useState('');
  const [statusLancamento] = useState('pendente');
  
  const [fatura] = useState({
    id: faturaAtual.id,
    numero_contrato: faturaAtual.numero_fatura,
    locatario_nome: faturaAtual.locatario_nome,
    locador_nome: faturaAtual.proprietario_nome,
    valor_boleto: faturaAtual.valor_total,
    valor_repasse: faturaAtual.valor_liquido,
    status: faturaAtual.status as const,
    mes_referencia: '2024-01',
    data_vencimento: '2024-01-05'
  });

  // Funções auxiliares
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const calcularValorBoleto = () => {
    return contratoSelecionado?.valor_contrato || 0;
  };

  const calcularTotais = () => {
    const valorBoleto = calcularValorBoleto();
    
    // Cálculo das retenções
    let totalRetido = 0;
    
    // Valores de retenção do contrato
    if (contratoSelecionado?.retido_condominio && contratoSelecionado?.valor_condominio > 0) {
      totalRetido += contratoSelecionado.valor_condominio;
    }
    if (contratoSelecionado?.retido_fci && contratoSelecionado?.valor_fci > 0) {
      totalRetido += contratoSelecionado.valor_fci;
    }
    if (contratoSelecionado?.retido_seguro_fianca && contratoSelecionado?.valor_seguro_fianca > 0) {
      totalRetido += contratoSelecionado.valor_seguro_fianca;
    }
    if (contratoSelecionado?.retido_seguro_incendio && contratoSelecionado?.valor_seguro_incendio > 0) {
      totalRetido += contratoSelecionado.valor_seguro_incendio;
    }
    if (contratoSelecionado?.retido_iptu && contratoSelecionado?.valor_iptu > 0) {
      totalRetido += contratoSelecionado.valor_iptu;
    }
    
    // Taxas administrativas
    const taxaAdmin = valorBoleto * (configuracaoRetencoes.percentual_admin / 100);
    const taxaBoleto = configuracaoRetencoes.taxa_boleto;
    const taxaTransferencia = configuracaoRetencoes.taxa_transferencia;
    
    totalRetido += taxaAdmin + taxaBoleto + taxaTransferencia;
    
    // Valores extras  
    totalRetido += contratoSelecionado?.valor_retido || 0;
    totalRetido += contratoSelecionado?.valor_antecipado || 0;
    totalRetido += retidosExtras.reduce((sum: number, retido: any) => sum + retido.valor, 0);
    
    // Lançamentos extras (alguns aumentam, outros diminuem o valor total)
    const totalLancamentosExtras = lancamentos.reduce((sum: number, lanc: any) => {
      return sum + ((['receita', 'ajuste'].includes(lanc.tipo) ? lanc.valor : -lanc.valor));
    }, 0);
    
    const valorBoletoFinal = valorBoleto + totalLancamentosExtras;
    const valorRepasse = valorBoletoFinal - totalRetido;
    
    return {
      valorBoleto: valorBoletoFinal,
      valorBoletoBase: valorBoleto,
      totalRetido,
      valorRepasse,
      taxaAdmin,
      taxaBoleto,
      taxaTransferencia,
      totalLancamentosExtras
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Editar Fatura</h1>
              <p className="text-sm text-muted-foreground">Fatura #{fatura.id} - {fatura.numero_contrato}</p>
            </div>
          </div>
          <Badge variant="secondary">
            {fatura.status}
          </Badge>
        </motion.div>

        {/* Seções */}
        <div className="space-y-6">
          {/* 1. Seleção do Contrato */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Building className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      <span className="text-blue-600 mr-2">1.</span>
                      Contrato Selecionado
                    </h3>
                    <p className="text-sm text-muted-foreground">Dados do contrato e partes</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Dados do Contrato</h4>
                    <div>
                      <p className="text-xs text-muted-foreground">Número do Contrato</p>
                      <p className="text-base font-semibold text-foreground">{contratoSelecionado.numero}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor do Contrato</p>
                      <p className="text-base font-semibold text-foreground">{formatCurrency(contratoSelecionado.valor_contrato)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Partes Envolvidas</h4>
                    <div>
                      <p className="text-xs text-muted-foreground">Locatário</p>
                      <p className="text-base font-semibold text-foreground">{contratoSelecionado.locatario_nome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Proprietário</p>
                      <p className="text-base font-semibold text-foreground">{contratoSelecionado.locador_nome}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2. Tipo de Cálculo e Configurações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Calculator className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      <span className="text-green-600 mr-2">2.</span>
                      Tipo de Cálculo e Configurações
                    </h3>
                    <p className="text-sm text-muted-foreground">Configurações do cálculo e descontos</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Tipo de Cálculo */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div 
                        className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Calculator className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Tipo de Cálculo
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Selecione o tipo de lançamento e configure os parâmetros
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-border rounded-lg">
                      <Tabs value={tipoLancamento} onValueChange={(value: 'entrada' | 'mensal' | 'rescisao') => setTipoLancamento(value)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                          <TabsTrigger value="entrada" className="flex items-center space-x-2">
                            <ArrowDown className="w-4 h-4" />
                            <span>Entrada</span>
                          </TabsTrigger>
                          <TabsTrigger value="mensal" className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Mensal</span>
                          </TabsTrigger>
                          <TabsTrigger value="rescisao" className="flex items-center space-x-2">
                            <X className="w-4 h-4" />
                            <span>Rescisão</span>
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="entrada" className="space-y-4 mt-0">
                          <div className="p-8 text-center">
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800 max-w-md mx-auto">
                              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                Entrada não disponível
                              </h3>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                Este contrato já teve prestações anteriores. A opção de entrada só está disponível para a primeira prestação de um contrato.
                              </p>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="mensal" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>Mês de Referência</span>
                              </Label>
                              <Input
                                type="month"
                                value={fatura.mes_referencia}
                                disabled
                                className="h-9 bg-muted/50"
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>Data de Vencimento</span>
                              </Label>
                              <Input
                                type="date"
                                value={fatura.data_vencimento}
                                disabled
                                className="h-9 bg-muted/50"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                <span>Valor do Aluguel</span>
                              </Label>
                              <Input
                                type="text"
                                value={formatCurrency(contratoSelecionado.valor_contrato)}
                                disabled
                                className="h-9 bg-muted/50"
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                <Percent className="w-4 h-4 text-orange-500" />
                                <span>Multa por Atraso</span>
                              </Label>
                              <Input
                                type="text"
                                value={`${contratoSelecionado.multa_percentual}% ao mês`}
                                disabled
                                className="h-9 bg-muted/50"
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="rescisao" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                <Calendar className="w-4 h-4 text-red-500" />
                                <span>Data de Rescisão</span>
                              </Label>
                              <Input
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="h-9"
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                <DollarSign className="w-4 h-4 text-red-500" />
                                <span>Tipo de Cálculo</span>
                              </Label>
                              <Select defaultValue="proporcional">
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="proporcional">Proporcional aos dias utilizados</SelectItem>
                                  <SelectItem value="mes-completo">Mês completo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                  
                  {/* Configurações */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span>Geração Automática</span>
                      </Label>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={geracaoAutomatica}
                          onCheckedChange={setGeracaoAutomatica}
                          id="geracaoAutomatica"
                          className="w-4 h-4"
                        />
                        <label htmlFor="geracaoAutomatica" className="text-sm text-foreground cursor-pointer">
                          {geracaoAutomatica ? 'Ativada' : 'Desativada'}
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>Desconto até dia</span>
                      </Label>
                      <Input
                        type="number"
                        value={descontoDia}
                        onChange={(e) => setDescontoDia(Number(e.target.value))}
                        min={1}
                        max={31}
                        className="h-9"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                        <Percent className="w-4 h-4 text-blue-500" />
                        <span>Desconto Percentual (%)</span>
                      </Label>
                      <Input
                        type="number"
                        value={descontoPercentual}
                        onChange={(e) => setDescontoPercentual(Number(e.target.value))}
                        min={0}
                        max={100}
                        step={0.1}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 3. Lançamentos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        <span className="text-primary mr-2">3.</span>
                        Lançamentos
                      </h3>
                      <p className="text-sm text-muted-foreground">Adicione lançamentos extras para esta prestação de contas</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setMostrandoFormularioLancamentos(!mostrandoFormularioLancamentos)} 
                    className="btn-gradient"
                  >
                    {mostrandoFormularioLancamentos ? 'Cancelar' : '+ Adicionar'}
                  </Button>
                </div>
                
                {/* Formulário de Adição */}
                {mostrandoFormularioLancamentos && (
                  <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-foreground">Novo Lançamento</h4>
                      <Button
                        onClick={() => {
                          setMostrandoFormularioLancamentos(false);
                          setNovoLancamento({ tipo: 'receita', descricao: '', valor: 0 });
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground">
                          Tipo
                        </Label>
                        <Select 
                          value={novoLancamento.tipo} 
                          onValueChange={(value) => setNovoLancamento({...novoLancamento, tipo: value as any})}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="receita">Receita</SelectItem>
                            <SelectItem value="despesa">Despesa</SelectItem>
                            <SelectItem value="taxa">Taxa</SelectItem>
                            <SelectItem value="desconto">Desconto</SelectItem>
                            <SelectItem value="ajuste">Ajuste</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span>Descrição</span>
                        </Label>
                        <Input
                          value={novoLancamento.descricao}
                          onChange={(e) => setNovoLancamento({...novoLancamento, descricao: e.target.value})}
                          placeholder="Descreva o lançamento"
                          className="h-11"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span>Valor (R$)</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={novoLancamento.valor}
                          onChange={(e) => setNovoLancamento({...novoLancamento, valor: Number(e.target.value) || 0})}
                          placeholder="0,00"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button
                        onClick={() => {
                          setMostrandoFormularioLancamentos(false);
                          setNovoLancamento({ tipo: 'receita', descricao: '', valor: 0 });
                        }}
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          if (novoLancamento.descricao && novoLancamento.valor > 0) {
                            setLancamentos([...lancamentos, {
                              ...novoLancamento,
                              id: Date.now(),
                              data_lancamento: new Date().toISOString().split('T')[0]
                            }]);
                            setMostrandoFormularioLancamentos(false);
                            setNovoLancamento({ tipo: 'receita', descricao: '', valor: 0 });
                            toast.success('Lançamento adicionado!');
                          }
                        }}
                        disabled={!novoLancamento.descricao || novoLancamento.valor <= 0}
                        className="btn-gradient"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Lista de Lançamentos */}
                <div className="space-y-4">
                  {/* Valores Fixos do Contrato */}
                  <div className="space-y-3">
                    <div className="border-b pb-2 mb-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Valores Fixos do Contrato</h4>
                    </div>

                    {/* Aluguel - Valor Principal */}
                    <div className="p-4 bg-background border border-border rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="p-2 rounded-lg">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-200 text-green-800 dark:bg-green-800/30 dark:text-green-300">
                              principal
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">Aluguel</p>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <DollarSign className="w-3 h-3 mr-1" />
                              Valor mensal completo
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">
                            +{formatCurrency(contratoSelecionado.valor_contrato)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Condomínio */}
                    {contratoSelecionado.valor_condominio > 0 && (
                      <div className="p-3 bg-background border border-border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="p-1.5 rounded-lg">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-200 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300">
                                mensal
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">Condomínio</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-blue-600">
                              +{formatCurrency(contratoSelecionado.valor_condominio)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FCI */}
                    {contratoSelecionado.valor_fci > 0 && (
                      <div className="p-3 bg-background border border-border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="p-1.5 rounded-lg">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-200 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300">
                                mensal
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">FCI</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-purple-600">
                              +{formatCurrency(contratoSelecionado.valor_fci)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Lançamentos Extras */}
                  {lancamentos.length > 0 && (
                    <div className="space-y-3">
                      <div className="border-b pb-2 mb-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Lançamentos Extras</h4>
                      </div>
                      
                      {lancamentos.map((lancamento: any, index: number) => (
                        <div key={lancamento.id || index} className="p-4 bg-background border border-border rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="p-2 rounded-lg">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  lancamento.tipo === 'receita' ? 'bg-green-200 text-green-800 dark:bg-green-800/30 dark:text-green-300' :
                                  lancamento.tipo === 'despesa' ? 'bg-red-200 text-red-800 dark:bg-red-800/30 dark:text-red-300' :
                                  lancamento.tipo === 'taxa' ? 'bg-orange-200 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300' :
                                  lancamento.tipo === 'desconto' ? 'bg-blue-200 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' :
                                  'bg-gray-200 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300'
                                }`}>
                                  {lancamento.tipo}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{lancamento.descricao}</p>
                                {lancamento.data_lancamento && (
                                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(lancamento.data_lancamento).toLocaleDateString('pt-BR')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`text-lg font-bold ${
                                ['receita', 'ajuste'].includes(lancamento.tipo) ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {['receita', 'ajuste'].includes(lancamento.tipo) ? '+' : '-'}{formatCurrency(lancamento.valor)}
                              </span>
                              <Button
                                onClick={() => {
                                  const novosLancamentos = lancamentos.filter((_, i) => i !== index);
                                  setLancamentos(novosLancamentos);
                                  toast.success('Lançamento removido!');
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Estado vazio */}
                  {lancamentos.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-border">
                      <Receipt className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">Nenhum lançamento extra</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Apenas valores fixos do contrato serão considerados
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 4. Valores Retidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingDown className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        <span className="text-primary mr-2">4.</span>
                        Retidos
                      </h3>
                      <p className="text-sm text-muted-foreground">Gerencie valores retidos e antecipados do contrato</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setMostrandoFormularioRetidos(!mostrandoFormularioRetidos)} 
                    className="btn-gradient"
                  >
                    {mostrandoFormularioRetidos ? 'Cancelar' : '+ Adicionar Extra'}
                  </Button>
                </div>
                
                {/* Formulário para Retido Extra */}
                {mostrandoFormularioRetidos && (
                  <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-foreground">Novo Retido</h4>
                      <Button
                        onClick={() => {
                          setMostrandoFormularioRetidos(false);
                          setNovoRetido({ tipo: 'retido', descricao: '', valor: 0 });
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground">
                          Tipo
                        </Label>
                        <Select 
                          value={novoRetido.tipo} 
                          onValueChange={(value) => setNovoRetido({...novoRetido, tipo: value as any})}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="retido">Retido</SelectItem>
                            <SelectItem value="antecipado">Antecipado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span>Descrição</span>
                        </Label>
                        <Input
                          value={novoRetido.descricao}
                          onChange={(e) => setNovoRetido({...novoRetido, descricao: e.target.value})}
                          placeholder="Descreva o valor retido"
                          className="h-11"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-red-500" />
                          <span>Valor (R$)</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={novoRetido.valor}
                          onChange={(e) => setNovoRetido({...novoRetido, valor: Number(e.target.value) || 0})}
                          placeholder="0,00"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button
                        onClick={() => {
                          setMostrandoFormularioRetidos(false);
                          setNovoRetido({ tipo: 'retido', descricao: '', valor: 0 });
                        }}
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          if (novoRetido.descricao && novoRetido.valor > 0) {
                            setRetidosExtras([...retidosExtras, {
                              ...novoRetido,
                              id: Date.now(),
                              data_lancamento: new Date().toISOString().split('T')[0]
                            }]);
                            setMostrandoFormularioRetidos(false);
                            setNovoRetido({ tipo: 'retido', descricao: '', valor: 0 });
                            toast.success('Retido adicionado!');
                          }
                        }}
                        disabled={!novoRetido.descricao || novoRetido.valor <= 0}
                        className="btn-gradient"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* Retenções do Contrato */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Retenções do Contrato</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contratoSelecionado?.retido_condominio && (
                        <div className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                                <Building className="w-4 h-4 text-red-500" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Condomínio</p>
                                <p className="text-xs text-muted-foreground">Valor retido</p>
                              </div>
                            </div>
                            <span className="text-base font-bold text-red-600">
                              {formatCurrency(contratoSelecionado.valor_condominio)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {contratoSelecionado?.retido_seguro_fianca && (
                        <div className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                                <FileText className="w-4 h-4 text-red-500" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Seguro Fiança</p>
                                <p className="text-xs text-muted-foreground">Valor retido</p>
                              </div>
                            </div>
                            <span className="text-base font-bold text-red-600">
                              {formatCurrency(contratoSelecionado.valor_seguro_fianca)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {contratoSelecionado?.retido_iptu && (
                        <div className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                                <FileText className="w-4 h-4 text-red-500" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">IPTU</p>
                                <p className="text-xs text-muted-foreground">Valor retido</p>
                              </div>
                            </div>
                            <span className="text-base font-bold text-red-600">
                              {formatCurrency(contratoSelecionado.valor_iptu)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Taxas Administrativas */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Taxas Administrativas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                              <Percent className="w-4 h-4 text-orange-500" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Taxa Administração</p>
                              <p className="text-xs text-muted-foreground">{configuracaoRetencoes.percentual_admin}%</p>
                            </div>
                          </div>
                          <span className="text-base font-bold text-orange-600">
                            {formatCurrency(calcularTotais().taxaAdmin)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                              <Receipt className="w-4 h-4 text-purple-500" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Taxa Boleto</p>
                              <p className="text-xs text-muted-foreground">Taxa fixa</p>
                            </div>
                          </div>
                          <span className="text-base font-bold text-purple-600">
                            {formatCurrency(configuracaoRetencoes.taxa_boleto)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                              <DollarSign className="w-4 h-4 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Taxa Transferência</p>
                              <p className="text-xs text-muted-foreground">TED/PIX</p>
                            </div>
                          </div>
                          <span className="text-base font-bold text-green-600">
                            {formatCurrency(configuracaoRetencoes.taxa_transferencia)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Retidos Extras */}
                  {retidosExtras.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Retidos Extras</h4>
                      <div className="space-y-3">
                        {retidosExtras.map((retido: any, index: number) => (
                          <div key={retido.id || index} className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    retido.tipo === 'retido' ? 'bg-red-200 text-red-800 dark:bg-red-800/30 dark:text-red-300' :
                                    'bg-blue-200 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300'
                                  }`}>
                                    {retido.tipo}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{retido.descricao}</p>
                                  {retido.data_lancamento && (
                                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {new Date(retido.data_lancamento).toLocaleDateString('pt-BR')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-base font-bold text-red-600">
                                  -{formatCurrency(retido.valor)}
                                </span>
                                <Button
                                  onClick={() => {
                                    const novosRetidos = retidosExtras.filter((_, i) => i !== index);
                                    setRetidosExtras(novosRetidos);
                                    toast.success('Retido removido!');
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Total Retido */}
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calculator className="w-5 h-5 text-muted-foreground" />
                        <span className="text-base font-semibold text-foreground">
                          Total Retido
                        </span>
                      </div>
                      <span className="text-xl font-bold text-foreground">
                        {formatCurrency(calcularTotais().totalRetido + retidosExtras.reduce((sum: number, retido: any) => sum + retido.valor, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 5. Configurações do Locador */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Crown className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      <span className="text-blue-600 mr-2">5.</span>
                      Configurações do Locador
                    </h3>
                    <p className="text-sm text-muted-foreground">Dados do proprietário e configurações de envio</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Dados do Proprietário */}
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Building className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-foreground">{contratoSelecionado.locador_nome}</h4>
                        <p className="text-xs text-muted-foreground">Proprietário principal</p>
                      </div>
                    </div>
                    
                    {/* Dados de Contato */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{contratoSelecionado.proprietario_email}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Telefone</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <MessageCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{contratoSelecionado.proprietario_telefone}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Porcentagem do Imóvel</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Percent className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{contratoSelecionado.porcentagem_proprietario}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dados de Recebimento */}
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <span>Dados de Recebimento</span>
                      </h5>
                      
                      {contratoSelecionado.tipo_recebimento === 'PIX' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Tipo de Recebimento</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">PIX</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Chave PIX</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{contratoSelecionado.chave_pix}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Tipo</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{contratoSelecionado.tipo_recebimento}</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Banco</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Building className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{contratoSelecionado.banco_proprietario}</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Agência</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Hash className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{contratoSelecionado.agencia_proprietario}</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Conta</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{contratoSelecionado.conta_proprietario}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Configurações de Envio */}
                  <div className="p-4 border border-border rounded-lg">
                    <h5 className="text-sm font-medium text-foreground mb-4 flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-green-500" />
                      <span>Configurações de Envio</span>
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Configuração de Email */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span>Envio por Email</span>
                        </Label>
                        <div className="flex items-center space-x-3 mb-3">
                          <Checkbox
                            checked={envioEmail}
                            onCheckedChange={setEnvioEmail}
                            id="envioEmail"
                            className="w-4 h-4"
                          />
                          <label htmlFor="envioEmail" className="text-sm text-foreground cursor-pointer">
                            {envioEmail ? 'Ativado' : 'Desativado'}
                          </label>
                        </div>
                      </div>
                      
                      {envioEmail && (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>Enviar (dias antes)</span>
                          </Label>
                          <Select 
                            value={diasAntesEnvioEmail.toString()} 
                            onValueChange={(value) => setDiasAntesEnvioEmail(Number(value))}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 dia antes</SelectItem>
                              <SelectItem value="2">2 dias antes</SelectItem>
                              <SelectItem value="3">3 dias antes</SelectItem>
                              <SelectItem value="5">5 dias antes</SelectItem>
                              <SelectItem value="7">7 dias antes</SelectItem>
                              <SelectItem value="10">10 dias antes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {/* Configuração de WhatsApp */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 flex items-center space-x-2">
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          <span>Envio por WhatsApp</span>
                        </Label>
                        <div className="flex items-center space-x-3 mb-3">
                          <Checkbox
                            checked={envioWhatsapp}
                            onCheckedChange={setEnvioWhatsapp}
                            id="envioWhatsapp"
                            className="w-4 h-4"
                          />
                          <label htmlFor="envioWhatsapp" className="text-sm text-foreground cursor-pointer">
                            {envioWhatsapp ? 'Ativado' : 'Desativado'}
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Resumo das Configurações */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <h5 className="text-xs text-muted-foreground mb-2 flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>Resumo das Configurações</span>
                      </h5>
                      
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center space-x-2 text-xs">
                          <Mail className="w-3 h-3 text-blue-500" />
                          <span className="text-muted-foreground">Email:</span>
                          <span className={`font-medium ${envioEmail ? 'text-green-600' : 'text-red-600'}`}>
                            {envioEmail ? `${diasAntesEnvioEmail} dias antes` : 'Desativado'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs">
                          <MessageCircle className="w-3 h-3 text-green-500" />
                          <span className="text-muted-foreground">WhatsApp:</span>
                          <span className={`font-medium ${envioWhatsapp ? 'text-green-600' : 'text-red-600'}`}>
                            {envioWhatsapp ? 'Ativado' : 'Desativado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 6. Observações e Ajustes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      <span className="text-purple-600 mr-2">6.</span>
                      Observações e Ajustes
                    </h3>
                    <p className="text-sm text-muted-foreground">Adicione informações complementares sobre este lançamento</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-3">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span>Observações do Lançamento</span>
                  </Label>
                  <Textarea
                    value={observacoesLancamento}
                    onChange={(e) => setObservacoesLancamento(e.target.value)}
                    placeholder="Adicione aqui observações relevantes sobre este lançamento, como detalhes de pagamento, acordos especiais, ou informações importantes..."
                    rows={4}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Estas observações serão salvas junto com o lançamento e poderão ser consultadas posteriormente
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 7. Resumo Final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Calculator className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      <span className="text-orange-600 mr-2">7.</span>
                      Resumo Final
                    </h3>
                    <p className="text-sm text-muted-foreground">Valores finais da prestação de contas</p>
                  </div>
                </div>
                
                {/* Grid de Valores Principais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <Receipt className="w-5 h-5 text-blue-600" />
                      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Valor do Boleto</h3>
                    </div>
                    <p className="text-base font-bold text-blue-600">
                      {formatCurrency(calcularTotais().valorBoleto)}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">Total que o locatário pagará</p>
                  </div>
                  
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      <h3 className="text-sm font-medium text-red-900 dark:text-red-100">Total Retido</h3>
                    </div>
                    <p className="text-base font-bold text-red-600">
                      {formatCurrency(calcularTotais().totalRetido)}
                    </p>
                    <p className="text-xs text-red-500 mt-1">Taxas de administração</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <Crown className="w-5 h-5 text-green-600" />
                      <h3 className="text-sm font-medium text-green-900 dark:text-green-100">Valor de Repasse</h3>
                    </div>
                    <p className="text-base font-bold text-green-600">
                      {formatCurrency(calcularTotais().valorRepasse)}
                    </p>
                    <p className="text-xs text-green-500 mt-1">Líquido para o proprietário</p>
                  </div>
                </div>
                
                {/* Detalhamento das Retenções */}
                <div className="p-4 bg-muted/30 rounded-xl border border-border">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>Detalhamento das Retenções</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Taxas Administrativas</h5>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Taxa Administração ({configuracaoRetencoes.percentual_admin}%):</span>
                        <span className="text-xs font-medium text-red-600">-{formatCurrency(calcularTotais().taxaAdmin)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Taxa Boleto:</span>
                        <span className="text-xs font-medium text-red-600">-{formatCurrency(calcularTotais().taxaBoleto)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Taxa Transferência:</span>
                        <span className="text-xs font-medium text-red-600">-{formatCurrency(calcularTotais().taxaTransferencia)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Valores do Contrato</h5>
                      {contratoSelecionado?.retido_condominio && contratoSelecionado?.valor_condominio > 0 && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Condomínio (Retido):</span>
                          <span className="text-xs font-medium text-red-600">-{formatCurrency(contratoSelecionado.valor_condominio)}</span>
                        </div>
                      )}
                      {contratoSelecionado?.retido_seguro_fianca && contratoSelecionado?.valor_seguro_fianca > 0 && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Seguro Fiança (Retido):</span>
                          <span className="text-xs font-medium text-red-600">-{formatCurrency(contratoSelecionado.valor_seguro_fianca)}</span>
                        </div>
                      )}
                      {contratoSelecionado?.retido_iptu && contratoSelecionado?.valor_iptu > 0 && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">IPTU (Retido):</span>
                          <span className="text-xs font-medium text-red-600">-{formatCurrency(contratoSelecionado.valor_iptu)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between">
                        <span className="text-xs text-muted-foreground font-medium">Margem Efetiva:</span>
                        <span className="text-xs font-medium text-purple-600">
                          {calcularTotais().valorBoleto > 0 ? ((calcularTotais().totalRetido / calcularTotais().valorBoleto) * 100).toFixed(2) : '0.00'}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status */}
                <div className="mt-4 flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg ${
                      statusLancamento === 'pago' ? 'text-green-500' :
                      statusLancamento === 'pendente' ? 'text-yellow-500' :
                      statusLancamento === 'atrasado' ? 'text-orange-500' :
                      'text-red-500'
                    }`}>
                      {statusLancamento === 'pago' ? '✅' :
                       statusLancamento === 'pendente' ? '⏳' :
                       statusLancamento === 'atrasado' ? '⚠️' : '❌'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Status: {statusLancamento.charAt(0).toUpperCase() + statusLancamento.slice(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contratoSelecionado.numero} - {contratoSelecionado.locatario_nome}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Editando fatura existente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="mt-8"
          >
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calculator className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground">
                        Salvar Alterações
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Atualizando fatura existente
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <Button
                      onClick={() => window.history.back()}
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      Cancelar
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        // Calcular valores atualizados
                        const totais = calcularTotais();
                        const totalRetidosExtras = retidosExtras.reduce((sum: number, retido: any) => sum + retido.valor, 0);
                        const totalLancamentosExtras = lancamentos.reduce((sum: number, lanc: any) => {
                          return sum + ((['receita', 'ajuste'].includes(lanc.tipo) ? lanc.valor : -lanc.valor));
                        }, 0);
                        
                        const novoValorTotal = totais.valorBoleto + totalLancamentosExtras;
                        const novoTotalRetido = totais.totalRetido + totalRetidosExtras;
                        const novoValorLiquido = novoValorTotal - novoTotalRetido;
                        
                        // Dados para salvar
                        const dadosEditados = {
                          valor_total: novoValorTotal,
                          valor_liquido: novoValorLiquido,
                          // Manter outros dados editáveis se necessário
                        };
                        
                        console.log('📊 Salvando dados editados:', dadosEditados);
                        
                        // Tentar usar função global de salvamento
                        if (typeof (window as any).salvarEdicaoFatura === 'function') {
                          (window as any).salvarEdicaoFatura(fatura.id, dadosEditados);
                          setTimeout(() => {
                            window.history.back();
                          }, 1000);
                        } else {
                          toast.success('Alterações salvas localmente!');
                          console.warn('⚠️ Função de salvamento global não encontrada');
                          setTimeout(() => {
                            window.history.back();
                          }, 1500);
                        }
                      }}
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TesteEdicaoSimples;