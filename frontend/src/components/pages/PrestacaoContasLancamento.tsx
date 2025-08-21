"use client";

import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, FileText, DollarSign, CheckCircle, AlertCircle, Loader2, Receipt, ArrowLeft, ArrowDown, Search, User, Building, Hash, Calendar, Settings, Mail, MessageCircle, Clock, Percent, CreditCard, TrendingDown, X, Crown, Users } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import type { Fatura } from "@/types";
import toast from "react-hot-toast";
import { DescontosAjustesForm, type DescontoAjuste } from "@/components/forms/DescontosAjustesForm";
import { ProprietariosMultiplosForm } from "@/components/forms/ProprietariosMultiplosForm";
import { ConfiguracoesRetencaoForm } from "@/components/forms/ConfiguracoesRetencaoForm";
import type { ProprietarioImovel, ConfiguracaoRetencoes } from "@/types/PrestacaoContas";


export const PrestacaoContasLancamento: React.FC = () => {
  // Estados dos dados da transferência
  const [dadosTransferencia, setDadosTransferencia] = useState<any>(null);
  const [faturaParaLancamento, setFaturaParaLancamento] = useState<Fatura | null>(null);
  const [isNovaPrestacao, setIsNovaPrestacao] = useState(false);
  
  // Estados do formulário de lançamento
  const [valorPago, setValorPago] = useState<number>(0);
  const [valorVencido, setValorVencido] = useState<number>(0);
  const [encargos, setEncargos] = useState<number>(0);
  const [deducoes, setDeducoes] = useState<number>(0);
  const [statusLancamento, setStatusLancamento] = useState<'pago' | 'pendente' | 'atrasado' | 'vencido'>('pendente');
  const [observacoesLancamento, setObservacoesLancamento] = useState<string>('');
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  
  // Novos estados para nova prestação
  const [tipoLancamento, setTipoLancamento] = useState<'entrada' | 'mensal' | 'rescisao'>('mensal');
  const [contratoSelecionado, setContratoSelecionado] = useState<any>(null);
  const [contratos, setContratos] = useState<any[]>([]);
  const [loadingContratos, setLoadingContratos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buscaContrato, setBuscaContrato] = useState('');
  const [contratosFiltrados, setContratosFiltrados] = useState<any[]>([]);
  
  // Estados para seleção de locador
  const [locadorSelecionado, setLocadorSelecionado] = useState<any>(null);
  const [locadores, setLocadores] = useState<any[]>([]);
  const [loadingLocadores, setLoadingLocadores] = useState(false);
  const [buscaLocador, setBuscaLocador] = useState('');
  
  const [calculando, setCalculando] = useState(false);
  
  // Estados para configuração da fatura
  const [diaVencimento, setDiaVencimento] = useState(10);
  const [geracaoAutomatica, setGeracaoAutomatica] = useState(true);
  const [descontoAteDia, setDescontoAteDia] = useState(0);
  const [valorDesconto, setValorDesconto] = useState(0);
  const [multaPercentual, setMultaPercentual] = useState(2);
  const [mesReferencia, setMesReferencia] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });
  const [envioEmail, setEnvioEmail] = useState(true);
  const [diasAntesEnvioEmail, setDiasAntesEnvioEmail] = useState(5);
  const [envioWhatsapp, setEnvioWhatsapp] = useState(false);
  
  // Estados para descontos e ajustes
  const [descontosAjustes, setDescontosAjustes] = useState<DescontoAjuste[]>([]);

  // Estados para múltiplos proprietários e configurações de retenção
  const [proprietarios, setProprietarios] = useState<ProprietarioImovel[]>([]);
  const [configuracaoRetencoes, setConfiguracaoRetencoes] = useState<ConfiguracaoRetencoes>({
    id: 1,
    percentual_admin: 10.0,
    taxa_boleto: 2.50,
    taxa_transferencia: 10.00,
    ativo: true
  });

  // Carregar dados do localStorage na montagem do componente
  useEffect(() => {
    console.log('🔄 PrestacaoContasLancamento montado - Carregando dados...');
    
    try {
      // Simplificar para debug - sempre nova prestação
      console.log('⚠️ Modo debug - carregando como nova prestação');
      setIsNovaPrestacao(true);
      buscarContratos();
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setIsNovaPrestacao(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar contratos com base na busca
  useEffect(() => {
    if (buscaContrato.trim() === '') {
      setContratosFiltrados(contratos);
    } else {
      const filtered = contratos.filter(contrato =>
        contrato.numero.toLowerCase().includes(buscaContrato.toLowerCase()) ||
        contrato.locatario_nome.toLowerCase().includes(buscaContrato.toLowerCase()) ||
        contrato.locador_nome.toLowerCase().includes(buscaContrato.toLowerCase()) ||
        contrato.imovel_endereco.toLowerCase().includes(buscaContrato.toLowerCase())
      );
      setContratosFiltrados(filtered);
    }
  }, [buscaContrato, contratos]);

  // Atualizar contratos filtrados quando contratos carregam
  useEffect(() => {
    setContratosFiltrados(contratos);
  }, [contratos]);

  const buscarLocadores = async () => {
    setLoadingLocadores(true);
    
    console.log('🔍 Carregando locadores mock...');
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const locadoresMock = [
      {
        id: 1,
        nome: 'Maria Oliveira Lima',
        cpf: '123.456.789-01',
        email: 'maria.oliveira@email.com',
        telefone: '(11) 98765-4321',
        endereco: 'Rua das Palmeiras, 456 - Vila Madalena',
        contratos_ativos: 2
      },
      {
        id: 2,
        nome: 'Carlos Eduardo Souza',
        cpf: '987.654.321-09',
        email: 'carlos.souza@email.com',
        telefone: '(11) 91234-5678',
        endereco: 'Av. Faria Lima, 123 - Itaim Bibi',
        contratos_ativos: 1
      },
      {
        id: 3,
        nome: 'Luciana Martins',
        cpf: '456.789.123-45',
        email: 'luciana.martins@email.com',
        telefone: '(11) 95555-6666',
        endereco: 'Rua Oscar Freire, 789 - Jardins',
        contratos_ativos: 1
      }
    ];
    
    setLocadores(locadoresMock);
    console.log('✅ Locadores mock carregados:', locadoresMock.length);
    setLoadingLocadores(false);
  };

  const buscarContratos = async () => {
    setLoadingContratos(true);
    
    try {
      // Temporariamente desabilitado para debug
      console.log('🔍 Carregando contratos mock (API desabilitada para debug)...');
      
      const contratosMock = [
        {
          id: 1,
          numero: 'CTR-2024-001',
          locatario_nome: 'João Silva Santos',
          locador_nome: 'Maria Oliveira Lima',
          locador_id: 1,
          locatario_email: 'joao.silva@email.com',
          locatario_telefone: '(11) 99999-1111',
          proprietario_email: 'maria.oliveira@email.com',
          proprietario_telefone: '(11) 98765-4321',
          imovel_endereco: 'Rua das Flores, 123 - Centro',
          imovel_tipo: 'Apartamento',
          valor_aluguel: 1500.00,
          status: 'ativo',
          data_inicio: '2024-01-15',
          data_fim: '2024-12-15'
        },
        {
          id: 2,
          numero: 'CTR-2024-002',
          locatario_nome: 'Ana Paula Costa',
          locador_nome: 'Carlos Eduardo Souza',
          locador_id: 2,
          locatario_email: 'ana.costa@email.com',
          locatario_telefone: '(11) 99999-2222',
          proprietario_email: 'carlos.souza@email.com',
          proprietario_telefone: '(11) 91234-5678',
          imovel_endereco: 'Av. Paulista, 456 - Bela Vista',
          imovel_tipo: 'Casa',
          valor_aluguel: 2200.00,
          status: 'ativo',
          data_inicio: '2024-03-01',
          data_fim: '2025-02-28'
        },
        {
          id: 3,
          numero: 'CTR-2024-003',
          locatario_nome: 'Roberto Ferreira',
          locador_nome: 'Luciana Martins',
          locador_id: 3,
          locatario_email: 'roberto.ferreira@email.com',
          locatario_telefone: '(11) 99999-3333',
          proprietario_email: 'luciana.martins@email.com',
          proprietario_telefone: '(11) 95555-6666',
          imovel_endereco: 'Rua Augusta, 789 - Jardins',
          imovel_tipo: 'Kitnet',
          valor_aluguel: 900.00,
          status: 'ativo',
          data_inicio: '2024-02-10'
        },
        {
          id: 4,
          numero: 'CTR-2024-004',
          locatario_nome: 'Pedro Santos',
          locador_nome: 'Maria Oliveira Lima',
          locador_id: 1,
          locatario_email: 'pedro.santos@email.com',
          locatario_telefone: '(11) 99999-4444',
          proprietario_email: 'maria.oliveira@email.com',
          proprietario_telefone: '(11) 98765-4321',
          imovel_endereco: 'Rua das Acácias, 88 - Centro',
          imovel_tipo: 'Apartamento',
          valor_aluguel: 1200.00,
          status: 'ativo',
          data_inicio: '2024-04-01'
        }
      ];
      
      setContratos(contratosMock);
      console.log('✅ Contratos mock carregados:', contratosMock.length);
    } catch (error) {
      console.error('❌ Erro ao carregar contratos mock:', error);
      setContratos([]);
    } finally {
      setLoadingContratos(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'aberta': { label: 'Aberta', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      'paga': { label: 'Paga', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      'pendente': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
      'em_atraso': { label: 'Em Atraso', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
      'cancelada': { label: 'Cancelada', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    
    return (
      <Badge className={`${config.color} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const adicionarLancamento = () => {
    const novoLancamento = {
      tipo: 'receita',
      descricao: '',
      valor: 0,
      data_lancamento: new Date().toISOString().split('T')[0]
    };
    setLancamentos([...lancamentos, novoLancamento]);
  };

  const removerLancamento = (index: number) => {
    const novosLancamentos = lancamentos.filter((_, i) => i !== index);
    setLancamentos(novosLancamentos);
  };

  const atualizarLancamento = (index: number, campo: string, valor: any) => {
    const novosLancamentos = [...lancamentos];
    novosLancamentos[index] = {
      ...novosLancamentos[index],
      [campo]: valor
    };
    setLancamentos(novosLancamentos);
  };

  const calcularTotais = () => {
    // Subtotal dos lançamentos (sem acréscimos por atraso)
    const subtotalLancamentos = (contratoSelecionado?.valor_aluguel || 1500) + encargos + 
      lancamentos.reduce((total, lanc) => total + lanc.valor, 0);
    
    // Total bruto incluindo acréscimos por atraso
    const totalBruto = subtotalLancamentos + valorVencido;
    const totalDescontos = descontosAjustes.reduce((total, desconto) => total + desconto.valor, 0);
    
    // Valor do boleto = subtotal + acréscimos - descontos
    const valorBoleto = totalBruto - totalDescontos;
    
    // Cálculos de retenção baseados na configuração
    const numProprietarios = proprietarios.length || 1;
    const taxaAdmin = valorBoleto * (configuracaoRetencoes.percentual_admin / 100);
    const taxaBoleto = configuracaoRetencoes.taxa_boleto;
    const taxaTransferencia = configuracaoRetencoes.taxa_transferencia * numProprietarios;
    const totalRetido = taxaAdmin + taxaBoleto + taxaTransferencia;
    
    // Valor final de repasse aos proprietários
    const valorRepasse = valorBoleto - totalRetido - deducoes;
    
    return { 
      subtotalLancamentos,
      totalBruto, 
      totalLiquido: valorRepasse, // Mantém compatibilidade
      totalDescontos,
      valorBoleto,
      totalRetido,
      taxaAdmin,
      taxaBoleto,
      taxaTransferencia,
      valorRepasse,
      numProprietarios
    };
  };

  const salvarLancamento = async () => {
    try {
      // Validações para nova prestação
      if (isNovaPrestacao) {
        if (!tipoLancamento) {
          toast.error("Selecione o tipo de lançamento");
          return;
        }
        if (!contratoSelecionado) {
          toast.error("Selecione um contrato");
          return;
        }
        // Os dados de entrada/saída serão puxados automaticamente do servidor
        // Validação do mês de referência
        if (!mesReferencia) {
          toast.error("Informe o mês de referência da fatura");
          return;
        }
      }

      const { totalBruto, totalLiquido, totalDescontos } = calcularTotais();
      
      const dadosLancamento = {
        // Dados existentes
        fatura_id: faturaParaLancamento?.id,
        valor_pago: valorPago,
        valor_vencido: valorVencido,
        encargos,
        deducoes,
        total_bruto: totalBruto,
        total_liquido: totalLiquido,
        total_descontos: totalDescontos,
        status: statusLancamento,
        observacoes_manuais: observacoesLancamento,
        lancamentos,
        descontos_ajustes: descontosAjustes,
        
        // Novos dados para prestação
        tipo_lancamento: isNovaPrestacao ? tipoLancamento : null,
        contrato_id: isNovaPrestacao ? contratoSelecionado?.id : faturaParaLancamento?.contrato_id,
        contrato_dados: isNovaPrestacao ? contratoSelecionado : null,
        
        // Dados do contexto
        is_nova_prestacao: isNovaPrestacao,
        is_fatura_existente: !isNovaPrestacao
      };

      console.log('💾 Salvando lançamento:', dadosLancamento);
      console.log('🏷️ Tipo:', tipoLancamento);
      console.log('📄 Contrato:', contratoSelecionado?.id);
      
      // Preparar dados para envio ao SQL Server via API backend - Inspirado no módulo antigo
      const dadosParaAPI = {
        contrato_id: isNovaPrestacao ? contratoSelecionado?.id : faturaParaLancamento?.contrato_id,
        tipo_prestacao: isNovaPrestacao ? tipoLancamento : 'fatura_existente',
        
        // Configurações do cálculo (datas são obtidas do servidor)
        configuracao_calculo: isNovaPrestacao ? {
          tipo_calculo: tipoLancamento,
          desconto_percentual: deducoes,
          multa_valor: encargos
        } : null,
        
        // Configurações da fatura
        configuracao_fatura: isNovaPrestacao ? {
          dia_vencimento: diaVencimento,
          mes_referencia: mesReferencia,
          geracao_automatica: geracaoAutomatica,
          desconto_ate_dia: descontoAteDia,
          valor_desconto_percentual: valorDesconto,
          multa_percentual: multaPercentual,
          envio_email: envioEmail,
          dias_antes_envio_email: diasAntesEnvioEmail,
          envio_whatsapp: envioWhatsapp
        } : null,
        
        dados_financeiros: {
          valor_pago: valorPago,
          valor_vencido: valorVencido,
          encargos,
          deducoes,
          total_bruto: totalBruto,
          total_liquido: totalLiquido
        },
        status: statusLancamento,
        observacoes: observacoesLancamento,
        lancamentos_extras: lancamentos,
        
        // Incluir dados do contrato para referência
        contrato_dados: isNovaPrestacao ? contratoSelecionado : null,
        fatura_origem: !isNovaPrestacao ? faturaParaLancamento : null,
        data_processamento: new Date().toISOString()
      };

      try {
        // Simular chamada para API que processará via SQL Server
        console.log('🔄 Enviando para SQL Server via API:', dadosParaAPI);
        
        // Aqui seria feita a chamada real para a API
        // const response = await fetch('/api/prestacao-contas/salvar', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(dadosParaAPI)
        // });
        
        // Simular tempo de processamento como no módulo antigo
        setCalculando(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const tipoMsg = isNovaPrestacao 
          ? `${tipoLancamento === 'entrada' ? 'Entrada' : tipoLancamento === 'mensal' ? 'Cobrança mensal' : 'Rescisão'}`
          : 'Lançamento de fatura';
          
        toast.success(`${tipoMsg} processada com sucesso no SQL Server!`);
        
        // Limpar localStorage e voltar para lista
        localStorage.removeItem('prestacao_dados_temp');
        setTimeout(() => {
          window.location.href = '/prestacao-contas';
        }, 2000);
        
      } catch (apiError) {
        console.error('❌ Erro na API:', apiError);
        toast.error("Erro ao processar no SQL Server");
        return;
      } finally {
        setCalculando(false);
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar lançamento:', error);
      toast.error("Erro ao salvar lançamento");
    }
  };

  const voltarParaLista = () => {
    // Limpar localStorage e voltar
    localStorage.removeItem('prestacao_dados_temp');
    window.location.href = '/prestacao-contas';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="flex items-center space-x-3 text-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xl font-medium">Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header com Botão de Voltar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={voltarParaLista}
                  variant="outline"
                  size="lg"
                  className="btn-outline"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar à Lista
                </Button>
                
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl">
                    <Receipt className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {faturaParaLancamento ? 'Lançamento de Fatura' : 'Nova Prestação de Contas'}
                    </h1>
                    {faturaParaLancamento && (
                      <p className="text-base text-muted-foreground">
                        {faturaParaLancamento.numero_fatura} • {faturaParaLancamento.locatario_nome}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="space-y-8">
            {/* 1. Seleção de Contrato - PRIMEIRA SEÇÃO para nova prestação */}
            {isNovaPrestacao && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="card-glass">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-foreground">
                            <span className="text-primary mr-2">1.</span>
                            Selecionar Contrato
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">Escolha o contrato para criar a prestação de contas</p>
                        </div>
                      </div>
                      
                      {contratosFiltrados.length > 0 && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Building className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{contratosFiltrados.length}</p>
                            <p className="text-sm text-muted-foreground">contratos disponíveis</p>
                          </div>
                        </div>
                      )}
                    </div>
                  
                    {loadingContratos ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 bg-primary/10 rounded-xl">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-base font-semibold text-foreground">Carregando contratos</h3>
                            <p className="text-sm text-muted-foreground">Aguarde um momento...</p>
                          </div>
                        </div>
                      </div>
                    ) : contratosFiltrados.length === 0 ? (
                      <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
                        <div className="p-4 bg-muted/50 rounded-xl w-fit mx-auto mb-6">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-bold text-foreground mb-3">Nenhum contrato encontrado</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          {contratos.length === 0 
                            ? 'Carregando contratos...' 
                            : 'Nenhum contrato ativo encontrado no sistema'
                          }
                        </p>
                        <Button onClick={buscarContratos} variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          Atualizar Lista
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Campo de Busca */}
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <input
                            type="text"
                            value={buscaContrato}
                            onChange={(e) => setBuscaContrato(e.target.value)}
                            placeholder="Busque por número, locatário, locador ou endereço..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          />
                          {buscaContrato && (
                            <button
                              onClick={() => setBuscaContrato('')}
                              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        {/* Lista de Contratos - Layout Tabela */}
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                          {contratosFiltrados.map((contrato) => (
                            <motion.div
                              key={contrato.id}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setContratoSelecionado(contrato)}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                contratoSelecionado?.id === contrato.id
                                  ? 'border-primary bg-primary/5 shadow-md'
                                  : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 flex-1">
                                  {/* Indicador de Seleção */}
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    contratoSelecionado?.id === contrato.id
                                      ? 'border-primary bg-primary'
                                      : 'border-muted-foreground'
                                  }`}>
                                    {contratoSelecionado?.id === contrato.id && (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  
                                  {/* Info Principal */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h3 className="text-sm font-semibold text-foreground">
                                        {contrato.numero || `CTR-${contrato.id}`}
                                      </h3>
                                      <div className={`w-2 h-2 rounded-full ${
                                        contrato.status === 'ativo' ? 'bg-green-500' : 'bg-gray-400'
                                      }`} />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                                      <div className="flex items-center space-x-1">
                                        <User className="w-3 h-3" />
                                        <span className="truncate">{contrato.locatario_nome}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Crown className="w-3 h-3" />
                                        <span className="truncate">{contrato.locador_nome}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Building className="w-3 h-3" />
                                        <span className="truncate">{contrato.imovel_endereco}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Valor */}
                                <div className="text-right ml-4">
                                  <div className="text-sm font-bold text-green-600">
                                    {formatCurrency(contrato.valor_aluguel || 0)}
                                  </div>
                                  {contrato.data_inicio && (
                                    <div className="text-xs text-muted-foreground">
                                      desde {formatDate(contrato.data_inicio)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        
                        {/* Indicador de Busca */}
                        {buscaContrato.trim() !== '' && (
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              {contratosFiltrados.length === 0 
                                ? `Nenhum resultado para "${buscaContrato}"` 
                                : `${contratosFiltrados.length} contrato(s) encontrado(s) para "${buscaContrato}"`
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  
                    {/* Resumo do Contrato Selecionado */}
                    {contratoSelecionado && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-1 bg-primary/20 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">Contrato Selecionado</h4>
                            <p className="text-xs text-muted-foreground">Confirme os dados antes de prosseguir</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-background/60 rounded-lg border border-border/50">
                            <div className="flex items-center space-x-2 mb-1">
                              <Building className="w-3 h-3 text-primary" />
                              <span className="text-xs font-medium text-muted-foreground">Imóvel</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {contratoSelecionado.imovel_endereco}
                            </p>
                            {contratoSelecionado.imovel_tipo && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {contratoSelecionado.imovel_tipo}
                              </p>
                            )}
                          </div>
                          
                          <div className="p-3 bg-background/60 rounded-lg border border-border/50">
                            <div className="flex items-center space-x-2 mb-1">
                              <User className="w-3 h-3 text-primary" />
                              <span className="text-xs font-medium text-muted-foreground">Locatário</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {contratoSelecionado.locatario_nome}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Locador: {contratoSelecionado.locador_nome}
                            </p>
                          </div>
                          
                          <div className="p-3 bg-background/60 rounded-lg border border-border/50">
                            <div className="flex items-center space-x-2 mb-1">
                              <DollarSign className="w-3 h-3 text-green-500" />
                              <span className="text-xs font-medium text-muted-foreground">Valor Mensal</span>
                            </div>
                            <p className="text-sm font-bold text-green-600">
                              {formatCurrency((contratoSelecionado?.valor_aluguel || 1500) || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {contratoSelecionado.numero}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Informações da Fatura (se selecionada) */}
            {faturaParaLancamento && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="card-glass border-primary/20 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">Informações da Fatura</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Número da Fatura</p>
                          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{faturaParaLancamento.numero_fatura}</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Valor Total</p>
                          <p className="text-xl font-bold text-green-900 dark:text-green-100">{formatCurrency(faturaParaLancamento.valor_total)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
                          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Vencimento</p>
                          <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{formatDate(faturaParaLancamento.data_vencimento)}</p>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800">
                          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Status Atual</p>
                          <div className="mt-2">{getStatusBadge(faturaParaLancamento.status)}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-800">
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Cliente</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{faturaParaLancamento.locatario_nome}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{faturaParaLancamento.locatario_cpf}</p>
                        </div>
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Imóvel</p>
                          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">{faturaParaLancamento.imovel_endereco}</p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400">{faturaParaLancamento.imovel_tipo}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 2. Configuração de Cálculo e Fatura */}
            {isNovaPrestacao && contratoSelecionado && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-6"
              >
                <Card className="card-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Receipt className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          <span className="text-green-600 mr-2">2.</span>
                          Configuração do Cálculo
                        </h3>
                        <p className="text-sm text-muted-foreground">Configure o tipo e parâmetros do cálculo</p>
                      </div>
                    </div>
                    
                    {/* Tipo de Lançamento - Cards Selecionáveis */}
                    <div className="space-y-4 mb-6">
                      <Label className="text-sm font-medium text-foreground">Tipo de Lançamento</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            value: 'entrada',
                            icon: '🏠',
                            title: 'Entrada de Imóvel',
                            description: 'Primeira cobrança do contrato',
                            color: 'blue'
                          },
                          {
                            value: 'mensal',
                            icon: '📅',
                            title: 'Cobrança Mensal',
                            description: 'Aluguel e taxas mensais',
                            color: 'green'
                          },
                          {
                            value: 'rescisao',
                            icon: '📋',
                            title: 'Rescisão de Contrato',
                            description: 'Acertos finais e devolução',
                            color: 'orange'
                          }
                        ].map((tipo) => (
                          <motion.div
                            key={tipo.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setTipoLancamento(tipo.value as any)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              tipoLancamento === tipo.value
                                ? tipo.value === 'entrada' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' :
                                  tipo.value === 'mensal' ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' :
                                  'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                                : 'border-border bg-background hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-2xl">{tipo.icon}</span>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                tipoLancamento === tipo.value
                                  ? tipo.value === 'entrada' ? 'border-blue-500 bg-blue-500' :
                                    tipo.value === 'mensal' ? 'border-green-500 bg-green-500' :
                                    'border-orange-500 bg-orange-500'
                                  : 'border-muted-foreground'
                              }`}>
                                {tipoLancamento === tipo.value && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                            </div>
                            <h4 className="text-sm font-semibold text-foreground mb-1">
                              {tipo.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {tipo.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Parâmetros Condicionais por Tipo */}
                    {tipoLancamento && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        {/* Entrada de Imóvel */}
                        {tipoLancamento === 'entrada' && (
                          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-lg">🏠</span>
                              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                Primeira Cobrança do Contrato
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-blue-600 dark:text-blue-400">Caução/Depósito</Label>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="R$ 0,00"
                                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-blue-600 dark:text-blue-400">Taxa Administrativa</Label>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="R$ 0,00"
                                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md"
                                />
                              </div>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                              Inclui primeiro aluguel + caução + taxas de entrada
                            </p>
                          </div>
                        )}
                        
                        {/* Cobrança Mensal */}
                        {tipoLancamento === 'mensal' && (
                          <div className="p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-lg">📅</span>
                              <h4 className="text-sm font-semibold text-green-700 dark:text-green-300">
                                Cobrança Mensal Recorrente
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-green-600 dark:text-green-400">Correção IGPM (%)</Label>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="0,00"
                                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-green-600 dark:text-green-400">Multa Atraso (%)</Label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={encargos}
                                  onChange={(e) => setEncargos(Number(e.target.value) || 0)}
                                  placeholder="2,00"
                                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-green-600 dark:text-green-400">Juros Mora (%/dia)</Label>
                                <input
                                  type="number"
                                  step="0.001"
                                  placeholder="0,033"
                                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md"
                                />
                              </div>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-3">
                              Aluguel base + correções + taxas mensais + encargos (se houver)
                            </p>
                          </div>
                        )}
                        
                        {/* Rescisão */}
                        {tipoLancamento === 'rescisao' && (
                          <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-lg">📋</span>
                              <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                                Rescisão e Acertos Finais
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-orange-600 dark:text-orange-400">Devolução Caução</Label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={deducoes}
                                  onChange={(e) => setDeducoes(Number(e.target.value) || 0)}
                                  placeholder="R$ 0,00"
                                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-orange-600 dark:text-orange-400">Desconto Proporcional</Label>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="R$ 0,00"
                                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md"
                                />
                              </div>
                            </div>
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-3">
                              Último aluguel proporcional + devolução de caução - descontos de danos
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 2.1. Proprietários do Imóvel */}
            {isNovaPrestacao && contratoSelecionado && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <ProprietariosMultiplosForm
                  proprietarios={proprietarios}
                  onProprietariosChange={setProprietarios}
                />
              </motion.div>
            )}

            {/* 2.2. Configurações de Retenção */}
            {isNovaPrestacao && contratoSelecionado && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.18 }}
              >
                <ConfiguracoesRetencaoForm
                  configuracao={configuracaoRetencoes}
                  onConfigChange={setConfiguracaoRetencoes}
                  onSave={async () => {
                    // Implementar salvamento das configurações
                    toast.success('Configurações de retenção salvas com sucesso!');
                  }}
                />
              </motion.div>
            )}

            {/* 3. Configuração da Fatura (quando há contrato selecionado) */}
            {isNovaPrestacao && contratoSelecionado && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="card-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Settings className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          <span className="text-purple-600 mr-2">3.</span>
                          Configuração da Fatura
                        </h3>
                        <p className="text-sm text-muted-foreground">Configure os dados de cobrança e repasse</p>
                      </div>
                    </div>

                    {/* Dados de Cobrança do Locatário */}
                    <div className="mb-8">
                      <h4 className="text-md font-semibold text-foreground mb-4 flex items-center space-x-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <span>Dados de Cobrança - {contratoSelecionado.locatario_nome}</span>
                      </h4>
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-foreground">Email:</span>
                            <span className="text-muted-foreground font-mono text-xs bg-background px-2 py-1 rounded">
                              {contratoSelecionado.locatario_email}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-foreground">Telefone:</span>
                            <span className="text-muted-foreground font-mono text-xs bg-background px-2 py-1 rounded">
                              {contratoSelecionado.locatario_telefone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {/* Dia de Vencimento */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>Dia de Vencimento</span>
                        </Label>
                        <Select value={diaVencimento.toString()} onValueChange={(value) => setDiaVencimento(Number(value))}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Selecione o dia" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                              <SelectItem key={dia} value={dia.toString()}>Dia {dia}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Mês de Referência */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span>Mês de Referência</span>
                        </Label>
                        <input
                          type="month"
                          value={mesReferencia}
                          onChange={(e) => setMesReferencia(e.target.value)}
                          className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-base font-medium focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      {/* Geração Automática */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span>Geração Automática</span>
                        </Label>
                        <div className="flex items-center space-x-3 h-12">
                          <Checkbox
                            checked={geracaoAutomatica}
                            onCheckedChange={setGeracaoAutomatica}
                            id="geracaoAutomatica"
                            className="w-5 h-5"
                          />
                          <label htmlFor="geracaoAutomatica" className="text-base text-foreground cursor-pointer">
                            {geracaoAutomatica ? '✅ Ativado' : '❌ Desativado'}
                          </label>
                        </div>
                      </div>
                      
                      {/* Desconto até Dia */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-green-500" />
                          <span>Desconto até Dia</span>
                        </Label>
                        <Select value={descontoAteDia.toString()} onValueChange={(value) => setDescontoAteDia(Number(value))}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Selecione o dia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Sem desconto</SelectItem>
                            {Array.from({ length: 15 }, (_, i) => i + 1).map(dia => (
                              <SelectItem key={dia} value={dia.toString()}>Até dia {dia}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Valor do Desconto */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <Percent className="w-4 h-4 text-green-500" />
                          <span>Valor do Desconto (%)</span>
                        </Label>
                        <InputWithIcon
                          type="number"
                          step="0.01"
                          max="100"
                          icon={Percent}
                          value={valorDesconto}
                          onChange={(e) => setValorDesconto(Number(e.target.value) || 0)}
                          placeholder="0.00"
                          className="text-base font-medium h-12"
                          disabled={descontoAteDia === 0}
                        />
                      </div>
                      
                      {/* Multa Percentual */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span>Multa Percentual (%)</span>
                        </Label>
                        <InputWithIcon
                          type="number"
                          step="0.01"
                          max="100"
                          icon={Percent}
                          value={multaPercentual}
                          onChange={(e) => setMultaPercentual(Number(e.target.value) || 0)}
                          placeholder="2.00"
                          className="text-base font-medium h-12"
                        />
                      </div>
                    </div>

                    {/* Resumo da Configuração da Fatura */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                      <h5 className="font-bold text-purple-900 dark:text-purple-100 mb-3 flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Resumo da Fatura</span>
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-purple-700 dark:text-purple-300">
                            <strong>Vencimento:</strong> Todo dia {diaVencimento}
                          </p>
                          <p className="text-purple-700 dark:text-purple-300">
                            <strong>Geração:</strong> {geracaoAutomatica ? 'Automática' : 'Manual'}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-purple-700 dark:text-purple-300">
                            <strong>Desconto:</strong> {descontoAteDia > 0 ? `${valorDesconto}% até dia ${descontoAteDia}` : 'Não configurado'}
                          </p>
                          <p className="text-purple-700 dark:text-purple-300">
                            <strong>Multa:</strong> {multaPercentual}% após vencimento
                          </p>
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 4. Configurações de Envio (nova seção separada) */}
            {isNovaPrestacao && contratoSelecionado && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="card-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          <span className="text-blue-600 mr-2">4.</span>
                          Configurações de Envio
                        </h3>
                        <p className="text-sm text-muted-foreground">Configure quando e como enviar as faturas</p>
                      </div>
                    </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Envio para Email */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span>Envio para Email</span>
                          </Label>
                          <div className="flex items-center space-x-3 h-12">
                            <Checkbox
                              checked={envioEmail}
                              onCheckedChange={setEnvioEmail}
                              id="envioEmail"
                              className="w-5 h-5"
                            />
                            <label htmlFor="envioEmail" className="text-base text-foreground cursor-pointer">
                              {envioEmail ? '📧 Ativado' : '❌ Desativado'}
                            </label>
                          </div>
                        </div>
                        
                        {/* Dias Antes do Envio Email */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>Enviar Email (dias antes)</span>
                          </Label>
                          <Select 
                            value={diasAntesEnvioEmail.toString()} 
                            onValueChange={(value) => setDiasAntesEnvioEmail(Number(value))}
                            disabled={!envioEmail}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Selecione os dias" />
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
                        
                        {/* Envio para WhatsApp */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            <span>Envio para WhatsApp</span>
                          </Label>
                          <div className="flex items-center space-x-3 h-12">
                            <Checkbox
                              checked={envioWhatsapp}
                              onCheckedChange={setEnvioWhatsapp}
                              id="envioWhatsapp"
                              className="w-5 h-5"
                            />
                            <label htmlFor="envioWhatsapp" className="text-base text-foreground cursor-pointer">
                              {envioWhatsapp ? '📱 Ativado' : '❌ Desativado'}
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Resumo das Configurações de Envio */}
                      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h5 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Resumo do Envio</span>
                        </h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1">
                            <p className="text-blue-700 dark:text-blue-300">
                              <strong>Email:</strong> {envioEmail ? `${diasAntesEnvioEmail} dias antes` : 'Desabilitado'}
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-blue-700 dark:text-blue-300">
                              <strong>WhatsApp:</strong> {envioWhatsapp ? 'Habilitado' : 'Desabilitado'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
            )}

            {/* 5. Configuração de Repasses (nova seção separada) */}
            {isNovaPrestacao && contratoSelecionado && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card className="card-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <Crown className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          <span className="text-yellow-600 mr-2">5.</span>
                          Configuração de Repasses
                        </h3>
                        <p className="text-sm text-muted-foreground">Configure os repasses para o proprietário</p>
                      </div>
                    </div>

                    {/* Dados do Proprietário */}
                    <div className="mb-6">
                        <h5 className="text-md font-semibold text-foreground mb-3 flex items-center space-x-2">
                          <Building className="w-4 h-4 text-yellow-500" />
                          <span>Proprietário - {contratoSelecionado.locador_nome}</span>
                        </h5>
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-yellow-600" />
                              <span className="font-medium text-foreground">Email:</span>
                              <span className="text-muted-foreground font-mono text-xs bg-background px-2 py-1 rounded">
                                {contratoSelecionado.proprietario_email}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-foreground">Telefone:</span>
                              <span className="text-muted-foreground font-mono text-xs bg-background px-2 py-1 rounded">
                                {contratoSelecionado.proprietario_telefone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Configurações de Repasse */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                            <Percent className="w-4 h-4 text-yellow-500" />
                            <span>Taxa Administração (%)</span>
                          </Label>
                          <InputWithIcon
                            type="number"
                            step="0.1"
                            max="100"
                            icon={Percent}
                            value={10} // Valor padrão
                            placeholder="10.0"
                            className="text-base font-medium h-12"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span>Valor Aluguel</span>
                          </Label>
                          <InputWithIcon
                            type="text"
                            icon={DollarSign}
                            value={formatCurrency((contratoSelecionado?.valor_aluguel || 1500))}
                            readOnly
                            className="text-base font-medium h-12 bg-muted/30"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span>Taxa Retida (R$)</span>
                          </Label>
                          <InputWithIcon
                            type="text"
                            icon={DollarSign}
                            value={formatCurrency((contratoSelecionado?.valor_aluguel || 1500) * 0.1)}
                            readOnly
                            className="text-base font-medium h-12 bg-red-50 dark:bg-red-950/20"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Valor Líquido (R$)</span>
                          </Label>
                          <InputWithIcon
                            type="text"
                            icon={DollarSign}
                            value={formatCurrency((contratoSelecionado?.valor_aluguel || 1500) * 0.9)}
                            readOnly
                            className="text-base font-medium h-12 bg-green-50 dark:bg-green-950/20 font-bold"
                          />
                        </div>
                      </div>

                      {/* Resumo do Repasse */}
                      <div className="mt-6 p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                        <h6 className="text-sm font-semibold text-foreground mb-3 flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span>Resumo do Repasse</span>
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                            <p className="font-medium text-blue-600">Valor Bruto</p>
                            <p className="font-bold text-foreground">{formatCurrency((contratoSelecionado?.valor_aluguel || 1500))}</p>
                          </div>
                          <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
                            <p className="font-medium text-red-600">Taxa (10%)</p>
                            <p className="font-bold text-foreground">- {formatCurrency((contratoSelecionado?.valor_aluguel || 1500) * 0.1)}</p>
                          </div>
                          <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                            <p className="font-medium text-green-600">Valor Líquido</p>
                            <p className="font-bold text-foreground">{formatCurrency((contratoSelecionado?.valor_aluguel || 1500) * 0.9)}</p>
                          </div>
                        </div>
                      </div>

                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 6. Dados Financeiros */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="card-glass">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <DollarSign className="w-5 h-5 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      <span className="text-orange-600 mr-2">6.</span>
                      Dados Financeiros
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <span>💰</span>
                          <span>Valor Pago</span>
                        </Label>
                        <InputWithIcon
                          type="number"
                          step="0.01"
                          icon={DollarSign}
                          value={valorPago}
                          onChange={(e) => setValorPago(Number(e.target.value) || 0)}
                          placeholder="0,00"
                          className="text-base font-medium h-12"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <span>⏰</span>
                          <span>Valor Vencido</span>
                        </Label>
                        <InputWithIcon
                          type="number"
                          step="0.01"
                          icon={DollarSign}
                          value={valorVencido}
                          onChange={(e) => setValorVencido(Number(e.target.value) || 0)}
                          placeholder="0,00"
                          className="text-base font-medium h-12"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <span>📈</span>
                          <span>Encargos</span>
                        </Label>
                        <InputWithIcon
                          type="number"
                          step="0.01"
                          icon={DollarSign}
                          value={encargos}
                          onChange={(e) => setEncargos(Number(e.target.value) || 0)}
                          placeholder="0,00"
                          className="text-base font-medium h-12"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <span>📉</span>
                          <span>Deduções</span>
                        </Label>
                        <InputWithIcon
                          type="number"
                          step="0.01"
                          icon={DollarSign}
                          value={deducoes}
                          onChange={(e) => setDeducoes(Number(e.target.value) || 0)}
                          placeholder="0,00"
                          className="text-base font-medium h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                        <span>📊</span>
                        <span>Status do Lançamento</span>
                      </Label>
                      <Select value={statusLancamento} onValueChange={(value) => setStatusLancamento(value as any)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pago">✅ Pago</SelectItem>
                          <SelectItem value="pendente">⏳ Pendente</SelectItem>
                          <SelectItem value="atrasado">⚠️ Atrasado</SelectItem>
                          <SelectItem value="vencido">❌ Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Seção de Descontos e Ajustes */}
                  <div className="mt-8 pt-8 border-t border-border">
                    <DescontosAjustesForm
                      descontos={descontosAjustes}
                      onDescontosChange={setDescontosAjustes}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 7. Lançamentos Detalhados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="card-glass">
                <CardContent className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        <span className="text-indigo-600 mr-2">7.</span>
                        Lançamentos Extras
                      </h3>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={adicionarLancamento} 
                        className="btn-gradient px-6 py-3"
                      >
                        <Receipt className="w-5 h-5 mr-2" />
                        Adicionar Lançamento
                      </Button>
                    </motion.div>
                  </div>
                  
                  {lancamentos.length === 0 ? (
                    <div className="p-12 text-center bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border-2 border-dashed border-muted-foreground/30">
                      <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">Nenhum lançamento extra</h4>
                      <p className="text-muted-foreground mb-4">Adicione taxas, descontos ou outros valores específicos</p>
                      <Button onClick={adicionarLancamento} variant="outline" className="btn-outline">
                        <Receipt className="w-4 h-4 mr-2" />
                        Criar Primeiro Lançamento
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {lancamentos.map((lancamento, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="p-6 bg-gradient-to-br from-background to-muted/20 rounded-2xl border border-border shadow-lg"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                                🏷️ Tipo
                              </Label>
                              <Select 
                                value={lancamento.tipo} 
                                onValueChange={(value) => atualizarLancamento(index, 'tipo', value)}
                              >
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="receita">💰 Receita</SelectItem>
                                  <SelectItem value="despesa">💸 Despesa</SelectItem>
                                  <SelectItem value="taxa">📋 Taxa</SelectItem>
                                  <SelectItem value="desconto">🎯 Desconto</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="md:col-span-2 space-y-2">
                              <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                                📝 Descrição
                              </Label>
                              <InputWithIcon
                                icon={FileText}
                                value={lancamento.descricao}
                                onChange={(e) => atualizarLancamento(index, 'descricao', e.target.value)}
                                placeholder="Ex: Taxa de administração, desconto pontualidade..."
                                className="h-12 text-lg"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                                💵 Valor (R$)
                              </Label>
                              <InputWithIcon
                                icon={DollarSign}
                                type="number"
                                step="0.01"
                                value={lancamento.valor}
                                onChange={(e) => atualizarLancamento(index, 'valor', Number(e.target.value) || 0)}
                                placeholder="0,00"
                                className="h-12 text-lg font-semibold"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">
                                📅 Data
                              </Label>
                              <input
                                type="date"
                                value={lancamento.data_lancamento || ''}
                                onChange={(e) => atualizarLancamento(index, 'data_lancamento', e.target.value)}
                                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button 
                                onClick={() => removerLancamento(index)} 
                                variant="destructive"
                                size="sm"
                                className="rounded-xl"
                              >
                                🗑️ Remover
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* 6. Observações */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="card-glass">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      <span className="text-red-600 mr-2">8.</span>
                      Observações e Ajustes
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                      <span>📝</span>
                      <span>Observações Gerais</span>
                    </Label>
                    <Textarea
                      value={observacoesLancamento}
                      onChange={(e) => setObservacoesLancamento(e.target.value)}
                      placeholder="Ex: Pagamento realizado com atraso de 3 dias, aplicado desconto de pontualidade, taxa extra de manutenção..."
                      rows={5}
                      className="text-lg resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      💡 Adicione detalhes importantes sobre este lançamento que possam ser úteis para futuras consultas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 9. Detalhamento do Boleto - DEBUG: sempre visível */}
          {console.log('🔍 Debug - isNovaPrestacao:', isNovaPrestacao, 'contratoSelecionado:', !!contratoSelecionado)}
          {true && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-8"
            >
              <Card className="card-glass border-indigo-200 dark:border-indigo-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <Receipt className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        <span className="text-indigo-600 mr-2">9.</span>
                        Detalhamento do Boleto
                      </h3>
                      <p className="text-sm text-muted-foreground">Breakdown detalhado dos valores</p>
                    </div>
                  </div>

                  {/* Cálculos dos valores */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Valor Total do Boleto */}
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Valor Total do Boleto</h4>
                      <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(
                          (contratoSelecionado?.valor_aluguel || 1500) + 
                          encargos + 
                          lancamentos.reduce((total, lanc) => total + lanc.valor, 0) + 
                          descontosAjustes.reduce((total, desc) => total + desc.valor, 0)
                        )}
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
                      <p className="text-xl font-bold text-red-900 dark:text-red-100">
                        {formatCurrency((contratoSelecionado?.valor_aluguel || 1500) * 0.1)}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">Taxa administração (10%)</p>
                    </div>

                    {/* Repasse ao Proprietário */}
                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Repasse ao Proprietário</h4>
                      <p className="text-xl font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(
                          ((contratoSelecionado?.valor_aluguel || 1500) + 
                          encargos + 
                          lancamentos.reduce((total, lanc) => total + lanc.valor, 0) + 
                          descontosAjustes.reduce((total, desc) => total + desc.valor, 0)) - 
                          ((contratoSelecionado?.valor_aluguel || 1500) * 0.1) - 2.50 - 10.00
                        )}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">Valor líquido (descontadas todas as taxas)</p>
                    </div>
                  </div>

                  {/* Breakdown detalhado */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                    <h5 className="text-md font-semibold text-foreground mb-4 flex items-center space-x-2">
                      <Calculator className="w-4 h-4 text-indigo-500" />
                      <span>Breakdown Detalhado</span>
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      {/* Composição do Valor */}
                      <div>
                        <h6 className="font-medium text-foreground mb-3 text-blue-600">💰 Composição do Valor:</h6>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Valor Aluguel:</span>
                            <span className="font-medium">{formatCurrency((contratoSelecionado?.valor_aluguel || 1500))}</span>
                          </div>
                          {encargos > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Encargos:</span>
                              <span className="font-medium">{formatCurrency(encargos)}</span>
                            </div>
                          )}
                          {lancamentos.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Lançamentos Extras:</span>
                              <span className="font-medium">{formatCurrency(lancamentos.reduce((total, lanc) => total + lanc.valor, 0))}</span>
                            </div>
                          )}
                          <div className="border-t pt-2 flex justify-between font-medium">
                            <span className="text-purple-600">Subtotal dos Lançamentos:</span>
                            <span className="text-purple-600">
                              {formatCurrency(calcularTotais().subtotalLancamentos)}
                            </span>
                          </div>
                          {valorVencido > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Acréscimos por Atraso:</span>
                              <span className="font-medium text-red-600">{formatCurrency(valorVencido)}</span>
                            </div>
                          )}
                          {descontosAjustes.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Descontos/Ajustes:</span>
                              <span className="font-medium text-green-600">-{formatCurrency(descontosAjustes.reduce((total, desc) => total + desc.valor, 0))}</span>
                            </div>
                          )}
                          <div className="border-t pt-2 font-bold flex justify-between">
                            <span>Valor do Boleto:</span>
                            <span className="text-blue-600">
                              {formatCurrency(calcularTotais().valorBoleto)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Valor Total a Repassar */}
                      <div>
                        <h6 className="font-medium text-foreground mb-3 text-green-600">📊 Valor Total a Repassar:</h6>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Valor do Boleto:</span>
                            <span className="font-medium">{formatCurrency(calcularTotais().valorBoleto)}</span>
                          </div>
                          <div className="border-t pt-2 text-red-600 font-medium">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Taxa Administração ({configuracaoRetencoes.percentual_admin}%):</span>
                              <span>-{formatCurrency(calcularTotais().taxaAdmin)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Taxa Registro Boleto:</span>
                              <span>-{formatCurrency(calcularTotais().taxaBoleto)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Taxa Transferência ({proprietarios.length || 1}x):</span>
                              <span>-{formatCurrency(calcularTotais().taxaTransferencia)}</span>
                            </div>
                          </div>
                          <div className="border-t pt-2 font-bold flex justify-between">
                            <span className="text-green-700">Total Retido:</span>
                            <span className="text-red-600">-{formatCurrency(calcularTotais().totalRetido)}</span>
                          </div>
                          <div className="border-t pt-2 font-bold flex justify-between text-lg">
                            <span className="text-green-700">Valor Total a Repassar:</span>
                            <span className="text-green-600">{formatCurrency(calcularTotais().valorRepasse)}</span>
                          </div>
                          <div className="border-t pt-2 text-xs text-muted-foreground">
                            <p>• Para {proprietarios.length || 1} proprietário(s)</p>
                            <p>• Margem efetiva: {calcularTotais().valorBoleto > 0 ? ((calcularTotais().totalRetido / calcularTotais().valorBoleto) * 100).toFixed(2) : '0.00'}%</p>
                            <p>• Este é o valor que será repassado aos proprietários</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Resumo Financeiro - Seção Final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mt-8"
          >
            <Card className="card-glass border-primary/30 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                    <Calculator className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      <span className="text-primary mr-2">10. 📊</span>
                      Resumo Final - Valor a Repassar
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Conferência dos valores de repasse aos proprietários</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Valor do Boleto */}
                  <motion.div 
                    className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-blue-700 dark:text-blue-300 text-lg">💰 Valor do Boleto</p>
                      <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                        <Receipt className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-blue-900 dark:text-blue-100">
                      {formatCurrency(calcularTotais().valorBoleto)}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      Total bruto - descontos
                    </p>
                  </motion.div>
                  
                  {/* Total Retido */}
                  <motion.div 
                    className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-red-700 dark:text-red-300 text-lg">🏦 Total Retido</p>
                      <div className="p-2 bg-red-200 dark:bg-red-800 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-red-700 dark:text-red-300" />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-red-900 dark:text-red-100">
                      {formatCurrency(calcularTotais().totalRetido)}
                    </p>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-2 space-y-1">
                      <p>Admin: {formatCurrency(calcularTotais().taxaAdmin)}</p>
                      <p>Boleto: {formatCurrency(calcularTotais().taxaBoleto)}</p>
                      <p>Transfer.: {formatCurrency(calcularTotais().taxaTransferencia)}</p>
                    </div>
                  </motion.div>
                  
                  {/* Valor Repasse */}
                  <motion.div 
                    className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-green-700 dark:text-green-300 text-lg">💎 Valor Repasse</p>
                      <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                        <Crown className="w-5 h-5 text-green-700 dark:text-green-300" />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-green-900 dark:text-green-100">
                      {formatCurrency(calcularTotais().valorRepasse)}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Para {proprietarios.length || 1} proprietário(s)
                    </p>
                  </motion.div>
                  
                  {/* Margem Efetiva */}
                  <motion.div 
                    className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-purple-700 dark:text-purple-300 text-lg">📊 Margem</p>
                      <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                        <Percent className="w-5 h-5 text-purple-700 dark:text-purple-300" />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-purple-900 dark:text-purple-100">
                      {calcularTotais().valorBoleto > 0 ? ((calcularTotais().totalRetido / calcularTotais().valorBoleto) * 100).toFixed(2) : '0.00'}%
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                      Efetiva sobre boleto
                    </p>
                  </motion.div>
                </div>
                
                {/* Status e Informações Adicionais */}
                <div className="mt-6 p-6 bg-muted/30 rounded-2xl border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <span className={`text-2xl font-bold ${
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
                          <p className="font-semibold text-foreground">
                            Status: {statusLancamento.charAt(0).toUpperCase() + statusLancamento.slice(1)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {lancamentos.length > 0 ? `${lancamentos.length} lançamento(s) extra(s)` : 'Sem lançamentos extras'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {faturaParaLancamento ? '📄 Editando fatura existente' : '🆕 Criando nova prestação'}
                      </p>
                      {isNovaPrestacao && contratoSelecionado && (
                        <p className="text-sm text-muted-foreground">
                          📋 {contratoSelecionado.numero} - {contratoSelecionado.locatario_nome}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
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
                        Finalizar Lançamento
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {faturaParaLancamento ? 'Editando fatura existente' : 'Criando nova prestação de contas'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <Button
                      onClick={voltarParaLista}
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      Cancelar
                    </Button>
                    
                    <Button 
                      onClick={salvarLancamento}
                      disabled={calculando}
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      {calculando ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4 mr-2" />
                          Salvar Lançamento
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrestacaoContasLancamento;