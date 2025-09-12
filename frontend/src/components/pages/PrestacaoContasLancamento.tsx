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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calculator, FileText, DollarSign, CheckCircle, AlertCircle, Loader2, Receipt, ArrowLeft, ArrowDown, Search, User, Building, Hash, Calendar, Settings, Mail, MessageCircle, Clock, Percent, CreditCard, TrendingDown, X, Crown, Users, Send } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import type { Fatura } from "@/types";
import toast from "react-hot-toast";
import { DescontosAjustesForm, type DescontoAjuste } from "@/components/forms/DescontosAjustesForm";
import { ProprietariosMultiplosForm } from "@/components/forms/ProprietariosMultiplosForm";
import { ConfiguracoesRetencaoForm } from "@/components/forms/ConfiguracoesRetencaoForm";
import type { ProprietarioImovel, ConfiguracaoRetencoes } from "@/types/PrestacaoContas";
import { calculoPrestacaoApi } from "@/services/calculoPrestacaoApi";
import type { CalculoPrestacaoRequest, CalculoPrestacaoResponse } from "@/types/CalculoPrestacao";


// Configuração da URL base da API
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';

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
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [novoLancamento, setNovoLancamento] = useState({
    tipo: 'receita',
    descricao: '',
    valor: 0
  });
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  
  // Estados para retidos extras
  const [mostrandoFormularioRetidos, setMostrandoFormularioRetidos] = useState(false);
  const [novoRetido, setNovoRetido] = useState({
    tipo: 'retido',
    descricao: '',
    valor: 0
  });
  const [retidosExtras, setRetidosExtras] = useState<any[]>([]);
  
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
  
  // Estado para método de cálculo (proporcional ou dias+completo)
  const [metodoCalculo, setMetodoCalculo] = useState<'proporcional-dias' | 'dias-completo'>('proporcional-dias');
  
  // Estados para datas de entrada/saída/rescisão
  const [dataEntrada, setDataEntrada] = useState<string>('');
  const [dataRescisao, setDataRescisao] = useState<string>('');
  
  // Estados para cálculo de prestação
  const [resultadoCalculo, setResultadoCalculo] = useState<CalculoPrestacaoResponse | null>(null);
  const [calculandoPrestacao, setCalculandoPrestacao] = useState(false);
  
  // Estados para configuração da fatura
  const [diaVencimento, setDiaVencimento] = useState(10);
  const [geracaoAutomatica, setGeracaoAutomatica] = useState(true);
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
      // Verificar se há dados de fatura no localStorage
      const dadosTemp = localStorage.getItem('prestacao_dados_temp');
      console.log('📦 Dados do localStorage:', dadosTemp);
      
      if (dadosTemp) {
        const dados = JSON.parse(dadosTemp);
        console.log('📊 Dados parsedos:', dados);
        
        if (dados.tipo === 'fatura_existente' && dados.fatura) {
          console.log('✅ Carregando fatura existente:', dados.fatura);
          setFaturaParaLancamento(dados.fatura);
          setIsNovaPrestacao(false);
          
          // Carregar valores iniciais da fatura
          setValorPago(dados.fatura.valor_total || 0);
          
        } else {
          console.log('ℹ️ Carregando nova prestação');
          setIsNovaPrestacao(true);
          buscarContratos();
        }
      } else {
        console.log('ℹ️ Sem dados no localStorage - nova prestação');
        setIsNovaPrestacao(true);
        buscarContratos();
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setIsNovaPrestacao(true);
      buscarContratos();
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
        (contrato.locador_nome || contrato.locadores?.[0]?.locador_nome || '').toLowerCase().includes(buscaContrato.toLowerCase()) ||
        contrato.imovel_endereco.toLowerCase().includes(buscaContrato.toLowerCase())
      );
      setContratosFiltrados(filtered);
    }
  }, [buscaContrato, contratos]);

  // Atualizar contratos filtrados quando contratos carregam
  useEffect(() => {
    setContratosFiltrados(contratos);
  }, [contratos]);

  // Reset tipo de lançamento quando contrato muda e carrega valores do contrato
  useEffect(() => {
    if (contratoSelecionado) {
      // Se não for primeira prestação e está em entrada, muda para mensal
      if (!contratoSelecionado.primeira_prestacao && tipoLancamento === 'entrada') {
        setTipoLancamento('mensal');
      }
      
      // Carrega valores do contrato
      if (contratoSelecionado.dia_vencimento) {
        setDiaVencimento(contratoSelecionado.dia_vencimento);
      }
      // Multa rescisória agora é calculada automaticamente pela Lei 8.245/91
      // Removido: campo multa_rescisoria não é mais usado
      
      // Define mês de referência atual se não estiver definido
      if (!mesReferencia) {
        const hoje = new Date();
        setMesReferencia(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`);
      }
    }
  }, [contratoSelecionado]);

  // Recalcular prestação quando dados relevantes mudam
  useEffect(() => {
    if (contratoSelecionado && tipoLancamento && isNovaPrestacao) {
      recalcularPrestacao();
    }
  }, [contratoSelecionado, tipoLancamento, metodoCalculo, dataEntrada, dataRescisao, lancamentos, encargos, deducoes, observacoesLancamento]);

  const buscarLocadores = async () => {
    setLoadingLocadores(true);
    
    try {
      console.log('🔍 Buscando locadores ativos da API...');
      
      const response = await fetch(`${API_BASE_URL}/locadores`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Locadores carregados da API:', data.data?.length || 0);
      
      setLocadores(data.data || []);
      
    } catch (error) {
      console.error('❌ Erro ao carregar locadores:', error);
      toast.error("Erro ao carregar locadores. Verifique a conexão com o banco de dados.");
      setLocadores([]);
    } finally {
      setLoadingLocadores(false);
    }
  };

  const buscarContratos = async () => {
    setLoadingContratos(true);
    
    try {
      const url = `${API_BASE_URL}/prestacao-contas/contratos-ativos`;
      console.log('🔍 Buscando contratos ativos da API:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Resposta de erro da API:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Resposta completa da API:', data);
      console.log('✅ Contratos carregados:', data.data?.length || 0, 'contratos');
      
      if (data.data && Array.isArray(data.data)) {
        setContratos(data.data);
        console.log('✅ Contratos definidos no estado:', data.data);
      } else {
        console.warn('⚠️ Formato de dados inesperado:', data);
        setContratos([]);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar contratos:', error);
      toast.error("Erro ao carregar contratos. Verifique a conexão com o servidor.");
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

  // Função para calcular a taxa de administração do contrato
  const calcularTaxaAdministracao = (contrato: any) => {
    if (!contrato) return 0;
    const valorAluguel = contrato.valor_aluguel || 0;
    const taxaPercentual = contrato.taxa_administracao || 10; // fallback para 10%
    return (valorAluguel * taxaPercentual) / 100;
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

  // Função para recalcular prestação
  const recalcularPrestacao = async () => {
    if (!contratoSelecionado || !tipoLancamento) return;

    setCalculandoPrestacao(true);
    try {
      const hoje = new Date();
      const dataAtual = hoje.toISOString().split('T')[0];
      
      // Determinar datas baseado no tipo de lançamento
      let dataEntradaFinal = dataAtual;
      let dataSaidaFinal = dataAtual;
      
      if (tipoLancamento === 'entrada' && dataEntrada) {
        dataEntradaFinal = dataEntrada;
        dataSaidaFinal = dataEntrada; // Para entrada, usar a mesma data
      } else if (tipoLancamento === 'rescisao' && dataRescisao) {
        dataEntradaFinal = dataRescisao;
        dataSaidaFinal = dataRescisao; // Para rescisão, usar a data de rescisão
      }
      
      // Mapear tipo de lançamento para tipo de cálculo da API
      let tipoCalculoMapeado: string;
      switch (tipoLancamento) {
        case 'entrada':
          tipoCalculoMapeado = 'Entrada';
          break;
        case 'rescisao':
          tipoCalculoMapeado = 'Rescisão';
          break;
        default:
          tipoCalculoMapeado = 'Mensal';
      }

      // Preparar lançamentos adicionais
      const lancamentosParaAPI = lancamentos.map(lanc => ({
        id: Date.now() + Math.random(), // ID temporário
        descricao: lanc.descricao || 'Lançamento',
        valor: Number(lanc.valor) || 0,
        tipo: lanc.tipo === 'despesa' ? 'debito' : 'credito'
      }));

      // Definir método baseado no tipo de lançamento
      let metodoFinal = metodoCalculo;
      if (tipoLancamento === 'mensal') {
        metodoFinal = 'dias-completo'; // Mensal sempre é mês completo
      } else if (tipoLancamento === 'rescisao') {
        metodoFinal = 'proporcional-dias'; // Rescisão sempre é proporcional
      }

      const dadosCalculo: CalculoPrestacaoRequest = {
        contrato_id: contratoSelecionado.id,
        data_entrada: dataEntradaFinal,
        data_saida: dataSaidaFinal,
        tipo_calculo: tipoCalculoMapeado,
        metodo_calculo: metodoFinal,
        valores_mensais: {
          aluguel: contratoSelecionado.valor_aluguel || 0,
          iptu: contratoSelecionado.valor_iptu || 0,
          condominio: contratoSelecionado.valor_condominio || 0,
          fci: contratoSelecionado.valor_fci || 0,
          seguro_incendio: contratoSelecionado.valor_seguro_incendio || 0,
          seguro_fianca: contratoSelecionado.valor_seguro_fianca || 0
        },
        lancamentos_adicionais: lancamentosParaAPI,
        desconto: deducoes || 0,
        multa: encargos || 0,
        observacoes: observacoesLancamento
      };

      const resultado = await calculoPrestacaoApi.calcularPrestacao(dadosCalculo);
      setResultadoCalculo(resultado);
      
      toast.success('Prestação recalculada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao calcular prestação:', error);
      toast.error('Erro ao calcular prestação: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setCalculandoPrestacao(false);
    }
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

  // Função para obter valores baseados no tipo de cálculo selecionado
  const obterValoresPorTipo = () => {
    // Se estamos editando uma fatura existente, usar valores originais da fatura
    if (faturaParaLancamento && !isNovaPrestacao) {
      console.log('📊 Usando valores da fatura original:', faturaParaLancamento);
      return {
        valor_aluguel: faturaParaLancamento.valor_aluguel || 0,
        valor_condominio: faturaParaLancamento.valor_condominio || 0,
        valor_fci: faturaParaLancamento.valor_fci || 0,
        valor_seguro_fianca: faturaParaLancamento.valor_seguro_fianca || 0,
        valor_seguro_incendio: faturaParaLancamento.valor_seguro_incendio || 0,
        valor_iptu: faturaParaLancamento.valor_iptu || 0,
      };
    }
    
    if (!contratoSelecionado) return {};
    
    // Se temos resultado do cálculo da API e é proporcional, calcular valores proporcionais
    if (resultadoCalculo && isNovaPrestacao) {
      // Rescisão usa valores proporcionais aos dias ocupados (multa é calculada sobre valor integral)
      if (tipoLancamento === 'rescisao' && resultadoCalculo?.periodo_dias) {
        const proporcao = resultadoCalculo.periodo_dias / 30;
        
        return {
          valor_aluguel: (contratoSelecionado.valor_aluguel || 0) * proporcao,
          valor_condominio: (contratoSelecionado.valor_condominio || 0) * proporcao,
          valor_fci: (contratoSelecionado.valor_fci || 0) * proporcao,
          valor_seguro_fianca: (contratoSelecionado.valor_seguro_fianca || 0) * proporcao,
          valor_seguro_incendio: (contratoSelecionado.valor_seguro_incendio || 0) * proporcao, // Seguros também proporcionais
          valor_iptu: (contratoSelecionado.valor_iptu || 0) * proporcao,
        };
      }
      
      // Para entrada proporcional, calcular valores proporcionais
      const isProporcional = tipoLancamento === 'entrada' && metodoCalculo === 'proporcional-dias';
      
      if (isProporcional && resultadoCalculo.periodo_dias) {
        // Calcular proporção baseada nos dias
        const proporcao = resultadoCalculo.periodo_dias / 30;
        
        return {
          valor_aluguel: (contratoSelecionado.valor_aluguel || 0) * proporcao,
          valor_condominio: (contratoSelecionado.valor_condominio || 0) * proporcao,
          valor_fci: (contratoSelecionado.valor_fci || 0) * proporcao,
          valor_seguro_fianca: (contratoSelecionado.valor_seguro_fianca || 0) * proporcao,
          valor_seguro_incendio: (contratoSelecionado.valor_seguro_incendio || 0) * proporcao,
          valor_iptu: (contratoSelecionado.valor_iptu || 0) * proporcao,
        };
      }
    }
    
    // Valores completos do contrato (para mensal ou entrada dias-completo)
    return {
      valor_aluguel: contratoSelecionado.valor_aluguel || 0,
      valor_condominio: contratoSelecionado.valor_condominio || 0,
      valor_fci: contratoSelecionado.valor_fci || 0,
      valor_seguro_fianca: contratoSelecionado.valor_seguro_fianca || 0,
      valor_seguro_incendio: contratoSelecionado.valor_seguro_incendio || 0,
      valor_iptu: contratoSelecionado.valor_iptu || 0,
    };
  };

  // Função para obter valores retidos baseados no cálculo
  const obterValoresRetidos = () => {
    const valoresPorTipo = obterValoresPorTipo();
    
    return {
      valor_condominio: valoresPorTipo.valor_condominio || 0,
      valor_fci: valoresPorTipo.valor_fci || 0,
      valor_seguro_fianca: valoresPorTipo.valor_seguro_fianca || 0,
      valor_seguro_incendio: valoresPorTipo.valor_seguro_incendio || 0,
      valor_iptu: valoresPorTipo.valor_iptu || 0
    };
  };

  // Função auxiliar para calcular valor do boleto (sem dependência circular)
  const calcularValorBoleto = () => {
    const lancamentosPositivos = lancamentos.filter(lanc => lanc.tipo !== 'desconto' && lanc.tipo !== 'ajuste');
    const descontos = lancamentos.filter(lanc => lanc.tipo === 'desconto' || lanc.tipo === 'ajuste');
    const valoresPorTipo = obterValoresPorTipo();
    
    const subtotalLancamentos = Object.values(valoresPorTipo).reduce((total: number, valor: any) => total + (typeof valor === 'number' ? valor : 0), 0) + 
      lancamentosPositivos.reduce((total, lanc) => total + lanc.valor, 0);
    const totalBruto = subtotalLancamentos + valorVencido;
    const totalDescontos = descontos.reduce((total, desconto) => total + desconto.valor, 0);
    
    // Incluir desconto por bonificação de pontualidade
    const descontoPontualidade = contratoSelecionado?.bonificacao || 0;
    
    return totalBruto - totalDescontos - descontoPontualidade;
  };

  const calcularTotais = () => {
    // Se temos um resultado calculado pela API, usar esses valores
    if (resultadoCalculo && isNovaPrestacao) {
      console.log('📊 Usando valores totais calculados pela API:', resultadoCalculo);
      
      // Calcular repasse por locador baseado no valor total
      const valorRepasse = resultadoCalculo.valor_repassado_locadores;
      const numProprietarios = contratoSelecionado?.locadores?.length || 1;
      
      return {
        subtotalLancamentos: resultadoCalculo.total - (resultadoCalculo.desconto || 0) - (resultadoCalculo.multa || 0),
        totalBruto: resultadoCalculo.total,
        totalLiquido: valorRepasse,
        totalDescontos: resultadoCalculo.desconto || 0,
        valorBoleto: resultadoCalculo.valor_boleto,
        totalRetido: resultadoCalculo.valor_retido,
        taxaAdmin: resultadoCalculo.breakdown_retencao?.taxa_admin || 0,
        taxaBoleto: 2.50, // Valor fixo da taxa de boleto
        taxaTransferencia: Math.max(0, (resultadoCalculo.breakdown_retencao?.outros || 0) - 2.50), // outros inclui boleto + transferência, subtrair boleto
        valorRepasse,
        numProprietarios,
        repassePorLocador: contratoSelecionado?.locadores?.map(locador => ({
          locador_id: locador.locador_id,
          locador_nome: locador.locador_nome,
          porcentagem: locador.porcentagem || 100,
          responsabilidade_principal: locador.responsabilidade_principal || false,
          valor_repasse: valorRepasse * ((locador.porcentagem || 100) / 100)
        })) || []
      };
    }
    
    // Fallback para cálculo manual quando não temos resultado da API
    const lancamentosPositivos = lancamentos.filter(lanc => lanc.tipo !== 'desconto' && lanc.tipo !== 'ajuste');
    const descontos = lancamentos.filter(lanc => lanc.tipo === 'desconto' || lanc.tipo === 'ajuste');
    
    const valoresPorTipo = obterValoresPorTipo();
    
    // Subtotal dos lançamentos (sem acréscimos por atraso)
    const subtotalLancamentos = Object.values(valoresPorTipo).reduce((total: number, valor: any) => total + (typeof valor === 'number' ? valor : 0), 0) + 
      lancamentosPositivos.reduce((total, lanc) => total + lanc.valor, 0);
    
    // Total bruto incluindo acréscimos por atraso
    const totalBruto = subtotalLancamentos + valorVencido;
    const totalDescontos = descontos.reduce((total, desconto) => total + desconto.valor, 0);
    
    // Incluir desconto por bonificação de pontualidade
    const descontoPontualidade = contratoSelecionado?.bonificacao || 0;
    const totalDescontosComBonificacao = totalDescontos + descontoPontualidade;
    
    // Valor do boleto = subtotal + acréscimos - descontos (incluindo bonificação)
    const valorBoleto = totalBruto - totalDescontosComBonificacao;
    
    // Cálculos de retenção baseados na configuração
    // Para lançamento de fatura, usar locadores do contrato, não proprietarios do estado
    const numProprietarios = contratoSelecionado?.locadores?.length || 1;
    // Taxa de administração: (aluguel - desconto) × percentual do contrato
    const valorAluguel = contratoSelecionado?.valor_aluguel || 0;
    const baseCalculo = valorAluguel - descontoPontualidade;
    const percentualAdmin = contratoSelecionado?.taxa_administracao || configuracaoRetencoes.percentual_admin;
    const taxaAdmin = baseCalculo * (percentualAdmin / 100);
    const taxaBoleto = configuracaoRetencoes.taxa_boleto;
    // Taxa de transferência só se aplica para proprietários adicionais (além do primeiro)
    const taxaTransferencia = numProprietarios > 1 ? configuracaoRetencoes.taxa_transferencia * (numProprietarios - 1) : 0;
    
    
    // Calcular TODOS os valores retidos (igual à seção Retidos) usando valores proporcionais
    let totalRetido = 0;
    const valoresRetidos = obterValoresRetidos();
    
    // Valores de retenção do contrato (proporcionais)
    if (contratoSelecionado?.retido_condominio && contratoSelecionado?.valor_condominio > 0) {
      totalRetido += valoresRetidos.valor_condominio;
    }
    if (contratoSelecionado?.retido_fci && contratoSelecionado?.valor_fci > 0) {
      totalRetido += valoresRetidos.valor_fci;
    }
    if (contratoSelecionado?.retido_seguro_fianca && contratoSelecionado?.valor_seguro_fianca > 0) {
      totalRetido += valoresRetidos.valor_seguro_fianca;
    }
    if (contratoSelecionado?.retido_seguro_incendio && contratoSelecionado?.valor_seguro_incendio > 0) {
      totalRetido += valoresRetidos.valor_seguro_incendio;
    }
    if (contratoSelecionado?.retido_iptu && contratoSelecionado?.valor_iptu > 0) {
      totalRetido += valoresRetidos.valor_iptu;
    }
    
    // Taxas administrativas
    totalRetido += taxaAdmin;
    totalRetido += taxaBoleto;
    totalRetido += taxaTransferencia;
    
    // Taxa de 5% sobre valores antecipados do contrato (proporcionais)
    if (contratoSelecionado?.antecipa_condominio && contratoSelecionado?.valor_condominio > 0) {
      const taxa = valoresRetidos.valor_condominio * 0.05; // 5% de taxa
      totalRetido += taxa;
    }
    if (contratoSelecionado?.antecipa_seguro_fianca && contratoSelecionado?.valor_seguro_fianca > 0) {
      const taxa = valoresRetidos.valor_seguro_fianca * 0.05; // 5% de taxa
      totalRetido += taxa;
    }
    if (contratoSelecionado?.antecipa_seguro_incendio && contratoSelecionado?.valor_seguro_incendio > 0) {
      const taxa = valoresRetidos.valor_seguro_incendio * 0.05; // 5% de taxa
      totalRetido += taxa;
    }
    
    // Valores extras (lançados manualmente)
    const retidosExtrasValor = retidosExtras.reduce((sum, retido) => sum + retido.valor, 0);
    totalRetido += retidosExtrasValor;
    
    
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
      numProprietarios,
      repassePorLocador: contratoSelecionado?.locadores?.map(locador => ({
        locador_id: locador.locador_id,
        locador_nome: locador.locador_nome,
        porcentagem: locador.porcentagem || 100,
        valor_repasse: (valorRepasse * (locador.porcentagem || 100)) / 100,
        responsabilidade_principal: locador.responsabilidade_principal
      })) || [{
        locador_id: null,
        locador_nome: 'Locador Principal',
        porcentagem: 100,
        valor_repasse: valorRepasse,
        responsabilidade_principal: true
      }]
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
          toast.error("Selecione um termo");
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
        // Chamada real para API que processará via SQL Server
        console.log('🔄 Enviando para SQL Server via API:', dadosParaAPI);
        
        setCalculando(true);
        const response = await fetch(`${API_BASE_URL}/prestacao-contas/salvar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dadosParaAPI)
        });
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const resultado = await response.json();
        console.log('✅ Resposta da API:', resultado);
        
        const tipoMsg = isNovaPrestacao 
          ? `${tipoLancamento === 'entrada' ? 'Entrada' : tipoLancamento === 'mensal' ? 'Cobrança mensal' : 'Rescisão'}`
          : 'Lançamento de fatura';
          
        toast.success(`${tipoMsg} processada com sucesso no SQL Server!`);
        
        // IMPORTANTE: Salvar dados editados da fatura para que apareçam na lista
        if (!isNovaPrestacao && faturaParaLancamento) {
          const dadosEditados = {
            valor_total: totalBruto,
            valor_liquido: totalLiquido,
            status: statusLancamento,
            data_pagamento: statusLancamento === 'pago' ? new Date().toISOString() : null
          };
          
          // Carregar dados editados existentes
          const faturasEditadas = JSON.parse(localStorage.getItem('faturas_editadas') || '{}');
          faturasEditadas[faturaParaLancamento.id] = dadosEditados;
          localStorage.setItem('faturas_editadas', JSON.stringify(faturasEditadas));
          
          console.log('💾 Dados editados salvos:', {
            faturaId: faturaParaLancamento.id,
            dadosEditados,
            todasEdicoes: faturasEditadas
          });
          
          // Notificar componente principal via event
          window.dispatchEvent(new CustomEvent('fatura-atualizada', {
            detail: { faturaId: faturaParaLancamento.id, dadosEditados }
          }));
        }
        
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
                            Selecionar Termo
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
                  
{contratoSelecionado ? (
                      // Modo: Contrato Selecionado
                      <div className="space-y-6">
                        {/* Botão Voltar e Contrato Selecionado */}
                        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center space-x-4">
                            <Button
                              onClick={() => setContratoSelecionado(null)}
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-2"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              <span>Voltar</span>
                            </Button>
                            <div className="flex items-center space-x-3">
                              <div className="p-1 bg-primary/20 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-foreground">Contrato Selecionado</h4>
                                <p className="text-xs text-muted-foreground">
                                  {contratoSelecionado.numero || `CTR-${contratoSelecionado.id}`} - {contratoSelecionado.locatario_nome}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Resumo do Contrato */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Building className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">Imóvel</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {contratoSelecionado.imovel_endereco}
                            </p>
                            {contratoSelecionado.imovel_tipo && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {contratoSelecionado.imovel_tipo}
                              </Badge>
                            )}
                          </div>

                          <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">Partes</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {contratoSelecionado.locador_nome || contratoSelecionado.locadores?.[0]?.locador_nome || 'Locador não definido'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Locatário: {contratoSelecionado.locatario_nome}
                            </p>
                          </div>

                          <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">Valor</span>
                            </div>
                            <p className="text-sm font-bold text-green-600">
                              {formatCurrency((contratoSelecionado?.valor_aluguel || 1500) || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contratoSelecionado.numero}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : loadingContratos ? (
                      // Modo: Carregando
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
                      // Modo: Nenhum contrato
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
                      // Modo: Lista de contratos
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
                              className="p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 border-border bg-background hover:border-primary/50 hover:bg-primary/5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 flex-1">
                                  {/* Info Principal */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h3 className="text-sm font-semibold text-foreground">
                                        {contrato.numero || `CTR-${contrato.id}`}
                                      </h3>
                                      <div className={`w-2 h-2 rounded-full ${
                                        contrato.status === 'ativo' ? 'bg-green-500' : 'bg-gray-400'
                                      }`} />
                                      {contrato.primeira_prestacao && (
                                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                          1ª Prestação
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                                      <div className="flex items-center space-x-1">
                                        <User className="w-3 h-3" />
                                        <span className="truncate">{contrato.locatario_nome}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Crown className="w-3 h-3" />
                                        <span className="truncate">
                                          {contrato.locador_nome || 
                                           (contrato.locadores && contrato.locadores[0]?.locador_nome) || 
                                           'Locador não definido'}
                                        </span>
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
                        <p className="text-sm text-muted-foreground">Configure os parâmetros da fatura e cálculos</p>
                      </div>
                    </div>

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
                            {!contratoSelecionado?.primeira_prestacao ? (
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
                            ) : (
                              <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <Calendar className="w-4 h-4 text-blue-500" />
                                  <span>Data de Entrada</span>
                                </Label>
                                <InputWithIcon
                                  type="date"
                                  icon={Calendar}
                                  value={dataEntrada || (contratoSelecionado?.data_inicio ? new Date(contratoSelecionado.data_inicio).toISOString().split('T')[0] : '')}
                                  onChange={(e: any) => setDataEntrada(e.target.value)}
                                  className="h-9"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <Calendar className="w-4 h-4 text-blue-500" />
                                  <span>Tipo de Cobrança</span>
                                </Label>
                                <Select 
                                  value={metodoCalculo} 
                                  onValueChange={(value: 'proporcional-dias' | 'dias-completo') => setMetodoCalculo(value)}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="proporcional-dias">Proporcional aos dias utilizados</SelectItem>
                                    <SelectItem value="dias-completo">Dias utilizados + mês completo</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span>Valor do Aluguel</span>
                                </Label>
                                <InputWithIcon
                                  type="text"
                                  icon={DollarSign}
                                  value={`R$ ${contratoSelecionado?.valor_aluguel || '0,00'}`}
                                  disabled
                                  className="h-9 bg-muted/50"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <Calendar className="w-4 h-4 text-purple-500" />
                                  <span>Dia de Vencimento</span>
                                </Label>
                                <InputWithIcon
                                  type="text"
                                  icon={Calendar}
                                  value={`Dia ${contratoSelecionado?.dia_vencimento || diaVencimento}`}
                                  disabled
                                  className="h-9 bg-muted/50"
                                />
                              </div>
                            </div>

                            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                              <p className="text-sm text-green-700 dark:text-green-300">
                                <strong>Entrada:</strong> Será calculado baseado na data de entrada e tipo de cobrança selecionado
                              </p>
                            </div>
                              </>
                            )}
                          </TabsContent>

                          <TabsContent value="mensal" className="space-y-4 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <Calendar className="w-4 h-4 text-blue-500" />
                                  <span>Mês de Referência</span>
                                </Label>
                                <InputWithIcon
                                  type="month"
                                  icon={Calendar}
                                  value={mesReferencia}
                                  onChange={(e) => setMesReferencia(e.target.value)}
                                  placeholder="YYYY-MM"
                                  className="h-9"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <Calendar className="w-4 h-4 text-blue-500" />
                                  <span>Tipo de Cobrança</span>
                                </Label>
                                <Select defaultValue="mes-completo" disabled>
                                  <SelectTrigger className="h-9 bg-muted/50">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="mes-completo">Mês completo</SelectItem>
                                    <SelectItem value="proporcional-dias">Proporcional aos dias utilizados</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span>Valor do Aluguel</span>
                                </Label>
                                <InputWithIcon
                                  type="text"
                                  icon={DollarSign}
                                  value={`R$ ${contratoSelecionado?.valor_aluguel || '0,00'}`}
                                  disabled
                                  className="h-9 bg-muted/50"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <Calendar className="w-4 h-4 text-purple-500" />
                                  <span>Dia de Vencimento</span>
                                </Label>
                                <InputWithIcon
                                  type="text"
                                  icon={Calendar}
                                  value={`Dia ${contratoSelecionado?.dia_vencimento || diaVencimento}`}
                                  disabled
                                  className="h-9 bg-muted/50"
                                />
                              </div>
                            </div>

                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Mensal:</strong> Cobrança completa para o mês selecionado
                              </p>
                            </div>
                          </TabsContent>

                          <TabsContent value="rescisao" className="space-y-4 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <Calendar className="w-4 h-4 text-red-500" />
                                  <span>Data de Rescisão</span>
                                </Label>
                                <InputWithIcon
                                  type="date"
                                  icon={Calendar}
                                  value={dataRescisao}
                                  onChange={(e: any) => setDataRescisao(e.target.value)}
                                  className="h-9"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <Calendar className="w-4 h-4 text-red-500" />
                                  <span>Tipo de Cobrança</span>
                                </Label>
                                <InputWithIcon
                                  type="text"
                                  icon={Calendar}
                                  value="Proporcional aos dias utilizados"
                                  disabled
                                  className="h-9 bg-muted/50"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span>Valor do Aluguel</span>
                                </Label>
                                <InputWithIcon
                                  type="text"
                                  icon={DollarSign}
                                  value={`R$ ${contratoSelecionado?.valor_aluguel || '0,00'}`}
                                  disabled
                                  className="h-9 bg-muted/50"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <Calendar className="w-4 h-4 text-purple-500" />
                                  <span>Dia de Vencimento</span>
                                </Label>
                                <InputWithIcon
                                  type="text"
                                  icon={Calendar}
                                  value={`Dia ${contratoSelecionado?.dia_vencimento || diaVencimento}`}
                                  disabled
                                  className="h-9 bg-muted/50"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                                  <AlertCircle className="w-4 h-4 text-orange-500" />
                                  <span>Multa Rescisória (Contrato)</span>
                                </Label>
                                <InputWithIcon
                                  type="text"
                                  icon={AlertCircle}
                                  value="Calculada conforme Lei 8.245/91"
                                  disabled
                                  className="h-9 bg-muted/50"
                                />
                              </div>
                            </div>

                            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                              <p className="text-sm text-red-700 dark:text-red-300">
                                <strong>Rescisão:</strong> Cálculo baseado no tipo de cobrança selecionado + multas e taxas
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>

                    {/* Configurações de Cálculo */}
                    <div className="mt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Settings className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Configurações de Cálculo
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Parâmetros de geração e desconto
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4 border border-border rounded-lg space-y-4">
                        {/* Geração Automática */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-green-500" />
                              <Label className="text-sm font-medium text-foreground">Geração Automática Mensal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={geracaoAutomatica}
                                onCheckedChange={(checked) => setGeracaoAutomatica(checked === true)}
                                id="geracaoAutomatica"
                                className="w-5 h-5"
                              />
                              <label htmlFor="geracaoAutomatica" className="text-sm text-muted-foreground cursor-pointer">
                                {geracaoAutomatica ? 'Ativado' : 'Desativado'}
                              </label>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {geracaoAutomatica 
                              ? '✅ As faturas serão criadas automaticamente todo mês na lista de prestação de contas' 
                              : '❌ As faturas precisarão ser criadas manualmente a cada mês'}
                          </p>
                        </div>


                        {/* Resumo das Configurações */}
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Vencimento:</span>
                              <span className="ml-2 font-medium">Dia {contratoSelecionado?.dia_vencimento || 10}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Multa:</span>
                              <span className="ml-2 font-medium">Lei 8.245/91</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Mês Ref.:</span>
                              <span className="ml-2 font-medium">{mesReferencia}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            )}


            {/* 2.2. Lançamentos */}
            {isNovaPrestacao && contratoSelecionado && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card className="card-glass">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Receipt className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-foreground">
                            <span className="text-primary mr-2">3.</span>
                            Lançamentos
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">Adicione lançamentos extras para esta prestação de contas</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setMostrandoFormulario(!mostrandoFormulario)} 
                        className="btn-gradient"
                      >
                        {mostrandoFormulario ? 'Cancelar' : '+ Adicionar'}
                      </Button>
                    </div>
                    
                    {/* Formulário de Adição */}
                    {mostrandoFormulario && (
                      <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-foreground">Novo Lançamento</h4>
                          <Button
                            onClick={() => {
                              setMostrandoFormulario(false);
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
                            <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                              <span>Tipo</span>
                            </Label>
                            <Select 
                              value={novoLancamento.tipo} 
                              onValueChange={(value) => setNovoLancamento({...novoLancamento, tipo: value})}
                            >
                              <SelectTrigger className="text-base font-medium h-12">
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
                            <InputWithIcon
                              icon={FileText}
                              value={novoLancamento.descricao}
                              onChange={(e) => setNovoLancamento({...novoLancamento, descricao: e.target.value})}
                              placeholder="Descreva o lançamento"
                              className="text-base font-medium h-12"
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span>Valor (R$)</span>
                            </Label>
                            <InputWithIcon
                              icon={DollarSign}
                              type="number"
                              step="0.01"
                              value={novoLancamento.valor}
                              onChange={(e) => setNovoLancamento({...novoLancamento, valor: Number(e.target.value) || 0})}
                              placeholder="0,00"
                              className="text-base font-medium h-12"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                          <Button
                            onClick={() => {
                              setMostrandoFormulario(false);
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
                                  data_lancamento: new Date().toISOString().split('T')[0]
                                }]);
                                setMostrandoFormulario(false);
                                setNovoLancamento({ tipo: 'receita', descricao: '', valor: 0 });
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

{(() => {
                          return (
                            <>
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
                                        {tipoLancamento === 'entrada' ? 'Proporcional à entrada' : 
                                         tipoLancamento === 'mensal' ? 'Valor mensal completo' : 
                                         'Valor para rescisão'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-lg font-bold text-green-600">
                                      +{formatCurrency(obterValoresPorTipo().valor_aluguel || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Condomínio */}
                              {obterValoresPorTipo().valor_condominio > 0 && (
                                <div className="p-3 bg-background border border-border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className="p-1.5 rounded-lg">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-200 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300">
                                          {tipoLancamento}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-foreground">Condomínio</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-sm font-bold text-blue-600">
                                        +{formatCurrency(obterValoresPorTipo().valor_condominio)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* FCI */}
                              {obterValoresPorTipo().valor_fci > 0 && (
                                <div className="p-3 bg-background border border-border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className="p-1.5 rounded-lg">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-200 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300">
                                          {tipoLancamento}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-foreground">FCI</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-sm font-bold text-purple-600">
                                        +{formatCurrency(obterValoresPorTipo().valor_fci)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Seguro Fiança */}
                              {obterValoresPorTipo().valor_seguro_fianca > 0 && (
                                <div className="p-3 bg-background border border-border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className="p-1.5 rounded-lg">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-200 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300">
                                          {tipoLancamento}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-foreground">Seguro Fiança</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-sm font-bold text-orange-600">
                                        +{formatCurrency(obterValoresPorTipo().valor_seguro_fianca)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Seguro Incêndio */}
                              {obterValoresPorTipo().valor_seguro_incendio > 0 && (
                                <div className="p-3 bg-background border border-border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className="p-1.5 rounded-lg">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-200 text-red-800 dark:bg-red-800/30 dark:text-red-300">
                                          {tipoLancamento}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-foreground">Seguro Incêndio</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-sm font-bold text-red-600">
                                        +{formatCurrency(obterValoresPorTipo().valor_seguro_incendio)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* IPTU */}
                              {obterValoresPorTipo().valor_iptu > 0 && (
                                <div className="p-3 bg-background border border-border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className="p-1.5 rounded-lg">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-200 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-300">
                                          {tipoLancamento}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-foreground">IPTU</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-sm font-bold text-indigo-600">
                                        +{formatCurrency(obterValoresPorTipo().valor_iptu)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Multa Rescisória - Exibir quando for rescisão e API já calculou */}
                              {tipoLancamento === 'rescisao' && resultadoCalculo && resultadoCalculo.multa > 0 && (
                                <div className="p-3 bg-background border border-border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className="p-1.5 rounded-lg">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-200 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300">
                                          multa
                                        </span>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-foreground">Multa Rescisória</h4>
                                        <p className="text-xs text-muted-foreground">Lei 8.245/91 - Proporcional ao tempo restante</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-sm font-bold text-orange-600">
                                        +{formatCurrency(resultadoCalculo.multa)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Desconto por Pontualidade - quando houver bonificação configurada */}
                              {contratoSelecionado?.bonificacao > 0 && (
                                <div className="p-3 bg-background border border-border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className="p-1.5 rounded-lg">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-200 text-green-800 dark:bg-green-800/30 dark:text-green-300">
                                          desconto
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-foreground">Desconto Pontualidade</p>
                                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                                          <CreditCard className="w-3 h-3 mr-1" />
                                          Pagamento em dia
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-sm font-bold text-red-600">
                                        -{formatCurrency((() => {
                                          if (tipoLancamento === 'rescisao' && resultadoCalculo?.periodo_dias) {
                                            // Para rescisão, usar o desconto proporcional
                                            const proporcao = resultadoCalculo.periodo_dias / 30;
                                            return (contratoSelecionado.bonificacao || 0) * proporcao;
                                          }
                                          return contratoSelecionado.bonificacao || 0;
                                        })())}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      {lancamentos.length > 0 && (
                        <div className="space-y-3">
                          <div className="border-t pt-3">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Lançamentos Extras</h4>
                          </div>
                          {lancamentos.map((lancamento, index) => (
                            <div key={index} className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className={`p-2 rounded-lg ${
                                    lancamento.tipo === 'receita' ? 'bg-green-50 dark:bg-green-950/20' :
                                    lancamento.tipo === 'despesa' ? 'bg-red-50 dark:bg-red-950/20' :
                                    lancamento.tipo === 'taxa' ? 'bg-blue-50 dark:bg-blue-950/20' :
                                    lancamento.tipo === 'desconto' ? 'bg-orange-50 dark:bg-orange-950/20' :
                                    'bg-purple-50 dark:bg-purple-950/20'
                                  }`}>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                      lancamento.tipo === 'receita' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                      lancamento.tipo === 'despesa' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                      lancamento.tipo === 'taxa' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                      lancamento.tipo === 'desconto' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                    }`}>
                                      {lancamento.tipo}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-foreground">{lancamento.descricao}</p>
                                    {lancamento.data_lancamento && (
                                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {formatDate(lancamento.data_lancamento)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className={`text-base font-bold ${
                                    lancamento.tipo === 'desconto' || lancamento.tipo === 'ajuste' 
                                      ? 'text-red-600' 
                                      : 'text-foreground'
                                  }`}>
                                    {lancamento.tipo === 'desconto' || lancamento.tipo === 'ajuste' ? '-' : ''}
                                    {formatCurrency(lancamento.valor)}
                                  </span>
                                  <Button
                                    onClick={() => removerLancamento(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {lancamentos.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                          <Receipt className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm">Nenhum lançamento extra adicionado</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Clique em "Adicionar" para incluir receitas, despesas, taxas ou descontos
                          </p>
                        </div>
                      )}

                      {/* Total Boleto */}
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calculator className="w-5 h-5 text-muted-foreground" />
                            <span className="text-base font-semibold text-foreground">
                              Total Boleto
                            </span>
                          </div>
                          <span className="text-xl font-bold text-foreground">
                            {formatCurrency((() => {
                              // Se temos resultado da API, usar o valor total dela
                              if (resultadoCalculo && isNovaPrestacao) {
                                return resultadoCalculo.valor_boleto;
                              }
                              
                              // Caso contrário, calcular manualmente
                              const valoresPorTipo = obterValoresPorTipo();
                              const totalFixos = Object.values(valoresPorTipo).reduce((total: number, valor: any) => 
                                total + (typeof valor === 'number' ? valor : 0), 0);
                              const totalExtras = lancamentos.reduce((total, lanc) => 
                                lanc.tipo === 'desconto' || lanc.tipo === 'ajuste' ? total - lanc.valor : total + lanc.valor, 0);
                              const descontoPontualidade = contratoSelecionado?.bonificacao || 0;
                              const multaRescisao = (tipoLancamento === 'rescisao' && resultadoCalculo?.multa) ? resultadoCalculo.multa : 0;
                              return totalFixos + totalExtras - descontoPontualidade + multaRescisao;
                            })())}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 2.3. Retidos */}
            {isNovaPrestacao && contratoSelecionado && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.18 }}
              >
                <Card className="card-glass">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <TrendingDown className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-foreground">
                            <span className="text-primary mr-2">4.</span>
                            Retidos
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">Gerencie valores retidos e antecipados do contrato</p>
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
                          <h4 className="text-sm font-semibold text-foreground">Novo Retido Extra</h4>
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
                            <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                              <span>Tipo</span>
                            </Label>
                            <Select 
                              value={novoRetido.tipo} 
                              onValueChange={(value) => setNovoRetido({...novoRetido, tipo: value})}
                            >
                              <SelectTrigger className="text-base font-medium h-12">
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
                            <InputWithIcon
                              icon={FileText}
                              value={novoRetido.descricao}
                              onChange={(e) => setNovoRetido({...novoRetido, descricao: e.target.value})}
                              placeholder="Descreva o retido/antecipado"
                              className="text-base font-medium h-12"
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-foreground flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-red-500" />
                              <span>Valor (R$)</span>
                            </Label>
                            <InputWithIcon
                              icon={DollarSign}
                              type="number"
                              step="0.01"
                              value={novoRetido.valor}
                              onChange={(e) => setNovoRetido({...novoRetido, valor: Number(e.target.value) || 0})}
                              placeholder="0,00"
                              className="text-base font-medium h-12"
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
                                  data_lancamento: new Date().toISOString().split('T')[0]
                                }]);
                                setMostrandoFormularioRetidos(false);
                                setNovoRetido({ tipo: 'retido', descricao: '', valor: 0 });
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

                    {/* Lista de Retidos */}
                    <div className="space-y-4">
                      {/* Valores de Retenção do Contrato */}
                      <div className="space-y-3">
                        <div className="border-b pb-2 mb-3">
                          <h4 className="text-sm font-medium text-muted-foreground">Valores de Retenção do Contrato</h4>
                        </div>

                        {/* Retenções baseadas nos campos retido_* do contrato */}
                        {contratoSelecionado?.retido_condominio && contratoSelecionado?.valor_condominio > 0 && (
                          <div className="p-3 bg-background border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-1.5 rounded-lg">
                                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-200 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300">
                                    retenção
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">Condomínio (Retido)</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-green-600">
                                  +{formatCurrency(obterValoresRetidos().valor_condominio)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {contratoSelecionado?.retido_fci && contratoSelecionado?.valor_fci > 0 && (
                          <div className="p-3 bg-background border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-1.5 rounded-lg ">
                                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-200 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300">
                                    retenção
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">FCI (Retido)</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-green-600">
                                  +{formatCurrency(obterValoresRetidos().valor_fci)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {contratoSelecionado?.retido_seguro_fianca && contratoSelecionado?.valor_seguro_fianca > 0 && (
                          <div className="p-3 bg-background border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-1.5 rounded-lg ">
                                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-200 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300">
                                    retenção
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">Seguro Fiança (Retido)</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-green-600">
                                  +{formatCurrency(obterValoresRetidos().valor_seguro_fianca)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {contratoSelecionado?.retido_seguro_incendio && contratoSelecionado?.valor_seguro_incendio > 0 && (
                          <div className="p-3 bg-background border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-1.5 rounded-lg ">
                                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-200 text-red-800 dark:bg-red-800/30 dark:text-red-300">
                                    retenção
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">Seguro Incêndio (Retido)</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-green-600">
                                  +{formatCurrency(obterValoresRetidos().valor_seguro_incendio)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {contratoSelecionado?.retido_iptu && contratoSelecionado?.valor_iptu > 0 && (
                          <div className="p-3 bg-background border border-border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-1.5 rounded-lg ">
                                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-200 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-300">
                                    retenção
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">IPTU (Retido)</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-green-600">
                                  +{formatCurrency(obterValoresRetidos().valor_iptu)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Taxas Administrativas */}
                      <div className="space-y-3">
                        <div className="border-t pt-3">
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">Taxas Administrativas</h4>
                        </div>

                        {/* Taxa de Administração */}
                        <div className="p-3 bg-background border border-border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="p-1.5 rounded-lg ">
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-200 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300">
                                  taxa
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">Taxa de Administração</p>
                                <p className="text-xs text-muted-foreground">
                                  {contratoSelecionado?.taxa_administracao || 10}% do aluguel líquido
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-green-600">
                                +{formatCurrency(calcularTotais().taxaAdmin)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Taxa de Boleto */}
                        <div className="p-3 bg-background border border-border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="p-1.5 rounded-lg ">
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-300">
                                  taxa
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">Taxa de Boleto</p>
                                <p className="text-xs text-muted-foreground">
                                  Taxa fixa por boleto emitido
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-green-600">
                                +{formatCurrency(configuracaoRetencoes.taxa_boleto)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Taxa de Transferência - só mostra se houver mais de 1 locador (CORRIGIDO) */}
                        {(() => {
                          const numLocadores = contratoSelecionado?.locadores?.length || 1;
                          const taxaTransferenciaTotal = calcularTotais().taxaTransferencia;
                          const locadoresAdicionais = Math.max(0, numLocadores - 1);
                          
                          return locadoresAdicionais > 0 && (
                            <div className="p-3 bg-background border border-border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className="p-1.5 rounded-lg ">
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-200 text-cyan-800 dark:bg-cyan-800/30 dark:text-cyan-300">
                                      taxa
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-foreground">Taxa de TED/PIX Adicional</p>
                                    <p className="text-xs text-muted-foreground">
                                      {locadoresAdicionais} transferência(s) adicional(is) × R$ {configuracaoRetencoes.taxa_transferencia}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-bold text-green-600">
                                    +{formatCurrency(taxaTransferenciaTotal)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Valores Extras */}
                      <div className="space-y-3">
                        {(contratoSelecionado?.antecipa_condominio || contratoSelecionado?.antecipa_seguro_fianca || contratoSelecionado?.antecipa_seguro_incendio || retidosExtras.length > 0) && (
                          <div className="border-t pt-3">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Valores Extras</h4>
                          </div>
                        )}
                        
                        {/* Valores Antecipados do Contrato */}
                        {contratoSelecionado?.antecipa_condominio && contratoSelecionado?.valor_condominio > 0 && (
                          <div className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    antecipado
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">Taxa Condomínio Antecipado</p>
                                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    5% sobre {formatCurrency(contratoSelecionado?.valor_condominio)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-base font-bold text-green-600">
                                  +{formatCurrency(contratoSelecionado?.valor_condominio * 0.05)}
                                </span>
                                <div className="w-8 h-8 flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">Fixo</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {contratoSelecionado?.antecipa_seguro_fianca && contratoSelecionado?.valor_seguro_fianca > 0 && (
                          <div className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    antecipado
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">Taxa Seguro Fiança Antecipado</p>
                                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    5% sobre {formatCurrency(contratoSelecionado?.valor_seguro_fianca)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-base font-bold text-green-600">
                                  +{formatCurrency(contratoSelecionado?.valor_seguro_fianca * 0.05)}
                                </span>
                                <div className="w-8 h-8 flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">Fixo</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {contratoSelecionado?.antecipa_seguro_incendio && contratoSelecionado?.valor_seguro_incendio > 0 && (
                          <div className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    antecipado
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">Taxa Seguro Incêndio Antecipado</p>
                                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    5% sobre {formatCurrency(contratoSelecionado?.valor_seguro_incendio)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-base font-bold text-green-600">
                                  +{formatCurrency(contratoSelecionado?.valor_seguro_incendio * 0.05)}
                                </span>
                                <div className="w-8 h-8 flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">Fixo</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Retidos Extras */}
                        {retidosExtras.map((retido, index) => (
                          <div key={index} className="p-4 bg-gradient-to-r from-background to-muted/30 border border-border rounded-xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className={`p-2 rounded-lg ${
                                  retido.tipo === 'retido' ? 'bg-red-50 dark:bg-red-950/20' : 'bg-blue-50 dark:bg-blue-950/20'
                                }`}>
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    retido.tipo === 'retido' 
                                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  }`}>
                                    {retido.tipo}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{retido.descricao}</p>
                                  {retido.data_lancamento && (
                                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {formatDate(retido.data_lancamento)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-base font-bold text-green-600">
                                  +{formatCurrency(retido.valor)}
                                </span>
                                <Button
                                  onClick={() => {
                                    const novosRetidos = retidosExtras.filter((_, i) => i !== index);
                                    setRetidosExtras(novosRetidos);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Estado vazio */}
                      {(contratoSelecionado?.valor_retido || 0) === 0 && 
                       (contratoSelecionado?.valor_antecipado || 0) === 0 && 
                       retidosExtras.length === 0 && 
                       !contratoSelecionado?.retido_condominio &&
                       !contratoSelecionado?.retido_fci &&
                       !contratoSelecionado?.retido_seguro_fianca &&
                       !contratoSelecionado?.retido_seguro_incendio &&
                       !contratoSelecionado?.retido_iptu && (
                        <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-border">
                          <TrendingDown className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm">Nenhum valor retido ou antecipado</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Clique em "Adicionar Extra" para incluir valores retidos ou antecipados
                          </p>
                        </div>
                      )}

                      {/* Total Retido */}
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calculator className="w-5 h-5 text-muted-foreground" />
                            <span className="text-base font-semibold text-foreground">
                              Total Retido
                            </span>
                          </div>
                          <span className="text-xl font-bold text-foreground">
                            {formatCurrency((() => {
                              // Se temos resultado da API para nova prestação, usar o valor total retido dela
                              if (resultadoCalculo && isNovaPrestacao) {
                                return resultadoCalculo.valor_retido;
                              }
                              
                              // Caso contrário, calcular manualmente
                              let total = 0;
                              const valoresRetidos = obterValoresRetidos();
                              
                              // Valores de retenção do contrato usando valores proporcionais
                              if (contratoSelecionado?.retido_condominio && contratoSelecionado?.valor_condominio > 0) {
                                total += valoresRetidos.valor_condominio;
                              }
                              if (contratoSelecionado?.retido_fci && contratoSelecionado?.valor_fci > 0) {
                                total += valoresRetidos.valor_fci;
                              }
                              if (contratoSelecionado?.retido_seguro_fianca && contratoSelecionado?.valor_seguro_fianca > 0) {
                                total += valoresRetidos.valor_seguro_fianca;
                              }
                              if (contratoSelecionado?.retido_seguro_incendio && contratoSelecionado?.valor_seguro_incendio > 0) {
                                total += valoresRetidos.valor_seguro_incendio;
                              }
                              if (contratoSelecionado?.retido_iptu && contratoSelecionado?.valor_iptu > 0) {
                                total += valoresRetidos.valor_iptu;
                              }
                              
                              // Usar totalRetido já calculado pela função calcularTotais
                              return calcularTotais().totalRetido;
                              
                              // Taxas de antecipação (5% do valor) também proporcionais
                              if (contratoSelecionado?.antecipa_condominio && contratoSelecionado?.valor_condominio > 0) {
                                total += valoresRetidos.valor_condominio * 0.05;
                              }
                              if (contratoSelecionado?.antecipa_seguro_fianca && contratoSelecionado?.valor_seguro_fianca > 0) {
                                total += valoresRetidos.valor_seguro_fianca * 0.05;
                              }
                              if (contratoSelecionado?.antecipa_seguro_incendio && contratoSelecionado?.valor_seguro_incendio > 0) {
                                total += valoresRetidos.valor_seguro_incendio * 0.05;
                              }
                              
                              // Valores extras (lançados manualmente)
                              total += retidosExtras.reduce((sum, retido) => sum + retido.valor, 0);
                              
                              return total;
                            })())}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 3. Configurações do Locador */}
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
                        <Crown className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          <span className="text-blue-600 mr-2">4.</span>
                          Configurações do Locador
                        </h3>
                        <p className="text-sm text-muted-foreground">Dados do proprietário e configurações de envio</p>
                      </div>
                    </div>

                    {/* Dados do Proprietário */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Building className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Proprietário
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Dados do proprietário do imóvel
                          </p>
                        </div>
                      </div>
                      
                      {/* Seção Individual do Proprietário */}
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Building className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-foreground">
                              {contratoSelecionado.locador_nome || contratoSelecionado.locadores?.[0]?.locador_nome || 'Locador não definido'}
                            </h4>
                            <p className="text-xs text-muted-foreground">Proprietário principal</p>
                          </div>
                        </div>

                        {/* Dados de Contato */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label className="text-sm font-medium text-foreground">Email</Label>
                            <InputWithIcon
                              type="email"
                              value={contratoSelecionado.proprietario_email}
                              placeholder="email@exemplo.com"
                              icon={Mail}
                              disabled
                              className="bg-muted/50"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-foreground">Telefone</Label>
                            <InputWithIcon
                              type="tel"
                              value={contratoSelecionado.proprietario_telefone}
                              placeholder="(41) 99999-9999"
                              icon={MessageCircle}
                              disabled
                              className="bg-muted/50"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-foreground">Porcentagem do Imóvel</Label>
                            <InputWithIcon
                              type="text"
                              value={`${contratoSelecionado.porcentagem_proprietario || 100}%`}
                              placeholder="100%"
                              icon={Percent}
                              disabled
                              className="bg-muted/50"
                            />
                          </div>
                        </div>

                        {/* Dados de Recebimento */}
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-primary" />
                            <span>Dados de Recebimento</span>
                          </h5>
                          
                          {/* Exibição condicional baseada no tipo de recebimento */}
                          {(contratoSelecionado.tipo_recebimento || 'PIX') === 'PIX' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-foreground">Tipo de Recebimento</Label>
                                <InputWithIcon
                                  type="text"
                                  value="PIX"
                                  icon={DollarSign}
                                  disabled
                                  className="bg-muted/50"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground">Chave PIX</Label>
                                <InputWithIcon
                                  type="text"
                                  value={contratoSelecionado.chave_pix || 'Não informado'}
                                  placeholder="Chave PIX"
                                  icon={CreditCard}
                                  disabled
                                  className="bg-muted/50"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-foreground">Tipo de Recebimento</Label>
                                <InputWithIcon
                                  type="text"
                                  value={contratoSelecionado.tipo_recebimento || 'TED'}
                                  icon={DollarSign}
                                  disabled
                                  className="bg-muted/50"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground">Banco</Label>
                                <InputWithIcon
                                  type="text"
                                  value={contratoSelecionado.banco_proprietario || 'Não informado'}
                                  placeholder="Nome do banco"
                                  icon={Building}
                                  disabled
                                  className="bg-muted/50"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground">Agência</Label>
                                <InputWithIcon
                                  type="text"
                                  value={contratoSelecionado.agencia_proprietario || 'Não informado'}
                                  placeholder="0000"
                                  icon={Hash}
                                  disabled
                                  className="bg-muted/50"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground">Conta</Label>
                                <InputWithIcon
                                  type="text"
                                  value={contratoSelecionado.conta_proprietario || 'Não informado'}
                                  placeholder="00000-0"
                                  icon={CreditCard}
                                  disabled
                                  className="bg-muted/50"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Configurações de Envio */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Mail className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Configurações de Envio
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Configure como enviar a prestação de contas
                          </p>
                        </div>
                      </div>
                      
                      {/* Seção Unificada de Configurações */}
                      <div className="p-4 border border-border rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Configuração de Email */}
                          <div>
                            <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                              <Mail className="w-4 h-4 text-blue-500" />
                              <span>Envio por Email</span>
                            </Label>
                            <div className="flex items-center space-x-3 mb-3">
                              <Checkbox
                                checked={envioEmail}
                                onCheckedChange={(checked) => setEnvioEmail(checked === true)}
                                id="envioEmail"
                                className="w-4 h-4"
                              />
                              <label htmlFor="envioEmail" className="text-sm text-foreground cursor-pointer">
                                {envioEmail ? 'Ativado' : 'Desativado'}
                              </label>
                            </div>
                          </div>

                          {/* Dias antes do envio (só aparece se email ativado) */}
                          {envioEmail && (
                            <div>
                              <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
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
                            <Label className="text-sm font-medium text-foreground flex items-center space-x-2 mb-2">
                              <MessageCircle className="w-4 h-4 text-green-500" />
                              <span>Envio por WhatsApp</span>
                            </Label>
                            <div className="flex items-center space-x-3 mb-3">
                              <Checkbox
                                checked={envioWhatsapp}
                                onCheckedChange={(checked) => setEnvioWhatsapp(checked === true)}
                                id="envioWhatsapp"
                                className="w-4 h-4"
                              />
                              <label htmlFor="envioWhatsapp" className="text-sm text-foreground cursor-pointer">
                                {envioWhatsapp ? 'Ativado' : 'Desativado'}
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Resumo das Configurações - Integrado */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <h5 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>Resumo das Configurações</span>
                          </h5>
                          
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="w-4 h-4 text-blue-500" />
                              <span className="text-muted-foreground">Email:</span>
                              <span className={`font-medium ${envioEmail ? 'text-green-600' : 'text-red-600'}`}>
                                {envioEmail ? `${diasAntesEnvioEmail} dias antes` : 'Desativado'}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm">
                              <MessageCircle className="w-4 h-4 text-green-500" />
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
            )}

            {/* 5. Observações e Ajustes */}
            {(isNovaPrestacao && contratoSelecionado) || (!isNovaPrestacao && faturaParaLancamento) ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="card-glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">
                          <span className="text-primary mr-2">5.</span>
                          Observações e Ajustes
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">Adicione informações complementares sobre este lançamento</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
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
                        className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Estas observações serão salvas junto com o lançamento e poderão ser consultadas posteriormente
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            ) : null}
          </div>


          {/* 6. Resumo Final */}
          {(isNovaPrestacao && contratoSelecionado) || (!isNovaPrestacao && faturaParaLancamento) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-8"
          >
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Calculator className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      <span className="text-primary mr-2">6.</span>
                      Resumo Final
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Valores finais da prestação de contas</p>
                  </div>
                </div>
                
                {/* Grid de Valores Principais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Valor do Boleto */}
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
                  
                  {/* Total Retido */}
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
                  
                  {/* Valor de Repasse */}
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

                {/* Repasse por Locador */}
                {contratoSelecionado && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-blue-600" />
                      <span>Repasse por Locador</span>
                    </h4>
                    <div className="space-y-3">
                      {calcularTotais().repassePorLocador.map((locador, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-blue-200 dark:border-blue-700/50">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h5 className="text-sm font-medium text-foreground">
                                {locador.locador_nome}
                              </h5>
                              {locador.responsabilidade_principal && (
                                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
                                  Principal
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {locador.porcentagem}% do valor líquido
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-blue-600">
                              {formatCurrency(locador.valor_repasse)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                        <span className="text-xs text-muted-foreground">Taxa Administração ({(() => {
                          const percentualAdmin = contratoSelecionado?.taxa_administracao || configuracaoRetencoes.percentual_admin;
                          return percentualAdmin;
                        })()}%):</span>
                        <span className="text-xs font-medium text-red-600">-{formatCurrency((() => {
                          const valorAluguel = contratoSelecionado?.valor_aluguel || 0;
                          const descontoPontualidade = contratoSelecionado?.bonificacao || 0;
                          const baseCalculo = valorAluguel - descontoPontualidade;
                          const percentualAdmin = contratoSelecionado?.taxa_administracao || configuracaoRetencoes.percentual_admin;
                          return baseCalculo * (percentualAdmin / 100);
                        })())}</span>
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
                          <span className="text-xs font-medium text-red-600">-{formatCurrency(obterValoresRetidos().valor_condominio)}</span>
                        </div>
                      )}
                      {contratoSelecionado?.retido_fci && contratoSelecionado?.valor_fci > 0 && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">FCI (Retido):</span>
                          <span className="text-xs font-medium text-red-600">-{formatCurrency(obterValoresRetidos().valor_fci)}</span>
                        </div>
                      )}
                      {contratoSelecionado?.retido_seguro_fianca && contratoSelecionado?.valor_seguro_fianca > 0 && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Seguro Fiança (Retido):</span>
                          <span className="text-xs font-medium text-red-600">-{formatCurrency(obterValoresRetidos().valor_seguro_fianca)}</span>
                        </div>
                      )}
                      {contratoSelecionado?.retido_seguro_incendio && contratoSelecionado?.valor_seguro_incendio > 0 && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Seguro Incêndio (Retido):</span>
                          <span className="text-xs font-medium text-red-600">-{formatCurrency(obterValoresRetidos().valor_seguro_incendio)}</span>
                        </div>
                      )}
                      {contratoSelecionado?.retido_iptu && contratoSelecionado?.valor_iptu > 0 && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">IPTU (Retido):</span>
                          <span className="text-xs font-medium text-red-600">-{formatCurrency(obterValoresRetidos().valor_iptu)}</span>
                        </div>
                      )}
                      
                      {/* Taxas de Antecipação */}
                      {contratoSelecionado?.antecipa_condominio && contratoSelecionado?.valor_condominio > 0 && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Taxa Condomínio Antecipado (5%):</span>
                          <span className="text-xs font-medium text-red-600">-{formatCurrency(obterValoresRetidos().valor_condominio * 0.05)}</span>
                        </div>
                      )}
                      {contratoSelecionado?.antecipa_seguro_fianca && contratoSelecionado?.valor_seguro_fianca > 0 && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Taxa Seguro Fiança Antecipado (5%):</span>
                          <span className="text-xs font-medium text-red-600">-{formatCurrency(obterValoresRetidos().valor_seguro_fianca * 0.05)}</span>
                        </div>
                      )}
                      {contratoSelecionado?.antecipa_seguro_incendio && contratoSelecionado?.valor_seguro_incendio > 0 && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Taxa Seguro Incêndio Antecipado (5%):</span>
                          <span className="text-xs font-medium text-red-600">-{formatCurrency(obterValoresRetidos().valor_seguro_incendio * 0.05)}</span>
                        </div>
                      )}
                      
                      {/* Retidos Extras apenas se houver */}
                      {retidosExtras.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Valores Extras:</span>
                          <span className="text-xs font-medium text-red-600">-{formatCurrency(retidosExtras.reduce((sum, retido) => sum + retido.valor, 0))}</span>
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
                      {isNovaPrestacao && contratoSelecionado && (
                        <p className="text-xs text-muted-foreground">
                          {contratoSelecionado.numero} - {contratoSelecionado.locatario_nome}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {faturaParaLancamento ? 'Editando fatura existente' : 'Nova prestação de contas'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          ) : null}

          {/* Botões de Ação */}
          {(isNovaPrestacao && contratoSelecionado) || (!isNovaPrestacao && faturaParaLancamento) ? (
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
          ) : null}
        </motion.div>
      </div>
    </div>
  );
};

export default PrestacaoContasLancamento;