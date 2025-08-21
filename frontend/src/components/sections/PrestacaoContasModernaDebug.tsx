"use client";

import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Removido temporariamente para debug
import { Badge } from "@/components/ui/badge";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, FileText, DollarSign, CheckCircle, AlertCircle, Search, Loader2, Eye, Receipt, MoreVertical, ArrowUpDown, ArrowUp, ArrowDown, X, Edit, XCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import type { Fatura, FaturaStats, FaturasResponse } from "@/types";
import toast from "react-hot-toast";
import { DetalhamentoBoleto } from "@/components/boletos/DetalhamentoBoleto";

export const PrestacaoContasModernaDebug: React.FC = () => {
  const [debugMessage, setDebugMessage] = useState("Componente carregado");
  const [activeTab, setActiveTab] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState('data_vencimento');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [stats, setStats] = useState<FaturaStats>({
    todas: 0, abertas: 0, pendentes: 0, pagas: 0, em_atraso: 0, canceladas: 0,
    valor_total_aberto: 0, valor_total_recebido: 0, valor_total_atrasado: 0
  });

  // Estados para área de lançamento
  const [faturaParaLancamento, setFaturaParaLancamento] = useState<Fatura | null>(null);
  const [showLancamento, setShowLancamento] = useState(false);
  const [showNovaPrestacao, setShowNovaPrestacao] = useState(false);
  
  // Estados para visualização de boleto
  const [faturaParaDetalhes, setFaturaParaDetalhes] = useState<Fatura | null>(null);
  const [showDetalheBoleto, setShowDetalheBoleto] = useState(false);
  
  // Estados para menu de ações
  const [menuAbertoId, setMenuAbertoId] = useState<number | null>(null);
  
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

  // Função para buscar faturas da API
  const buscarFaturas = async () => {
    console.log('🚀 buscarFaturas iniciada');
    setLoading(true);
    try {
      console.log('🔍 Buscando faturas da API...');
      console.log('📊 Aba ativa:', activeTab);
      
      const params = new URLSearchParams();
      
      // Aplicar filtro de status baseado na aba ativa
      if (activeTab !== 'todas') {
        params.append('status', activeTab);
        console.log('🏷️ Filtro de status aplicado:', activeTab);
      }
      
      if (mesSelecionado) {
        params.append('mes', mesSelecionado);
        console.log('📅 Filtro de mês aplicado:', mesSelecionado);
      }
      
      if (anoSelecionado) {
        params.append('ano', anoSelecionado);
        console.log('📅 Filtro de ano aplicado:', anoSelecionado);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
        console.log('🔍 Filtro de busca aplicado:', searchTerm);
      }
      
      params.append('order_by', sortField);
      params.append('order_dir', sortDirection);

      const url = `/api/faturas?${params.toString()}`;
      console.log('🌐 URL completa da API:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json() as FaturasResponse;
      console.log('✅ Dados recebidos:', data);
      console.log('📊 Quantidade de faturas:', data.data?.length || 0);
      console.log('📈 Stats recebidas:', data.stats);
      
      if (data.data) {
        console.log('🏷️ Status das faturas retornadas:');
        data.data.forEach((fatura, index) => {
          console.log(`  ${index + 1}. ${fatura.numero_fatura}: status="${fatura.status}"`);
        });
      }
      
      setFaturas(data.data || []);
      setStats(data.stats || stats);
      setDebugMessage(`${data.data?.length || 0} faturas carregadas | Aba: ${activeTab} | Status aplicado: ${activeTab !== 'todas' ? activeTab : 'todos'}`);
      
    } catch (error) {
      console.error('❌ Erro ao buscar faturas:', error);
      toast.error("Erro ao carregar faturas");
      setFaturas([]);
      setDebugMessage(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na montagem do componente
  useEffect(() => {
    console.log('🚀 Componente montado - carregando dados iniciais');
    buscarFaturas();
  }, []);

  // Recarregar IMEDIATAMENTE quando aba ou ordenação mudam (sem debounce)
  useEffect(() => {
    console.log('🔄 Mudança na aba/ordenação - recarregando imediatamente');
    console.log('📊 Aba ativa:', activeTab);
    console.log('🔀 Campo ordenação:', sortField, 'Direção:', sortDirection);
    buscarFaturas();
  }, [activeTab, sortField, sortDirection]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuAbertoId && !(event.target as Element).closest('.relative')) {
        setMenuAbertoId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuAbertoId]);

  // Debounce APENAS para search e filtros de formulário (não para aba)
  useEffect(() => {
    console.log('⏱️ Debounce iniciado para filtros de texto');
    const timer = setTimeout(() => {
      console.log('✅ Debounce finalizado - aplicando filtros');
      buscarFaturas();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, mesSelecionado, anoSelecionado]);

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

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'ASC' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortDirection('DESC');
    }
  };

  // Funções para área de lançamento - Redirecionamento para página inteira
  const abrirLancamentoFatura = (fatura: Fatura) => {
    console.log('🎯 Redirecionando para lançamento de fatura:', fatura.numero_fatura);
    
    // Salvar dados da fatura no localStorage para a página de lançamento
    const dadosFatura = {
      fatura: fatura,
      tipo: 'fatura_existente',
      timestamp: Date.now()
    };
    
    localStorage.setItem('prestacao_dados_temp', JSON.stringify(dadosFatura));
    
    // Redirecionar para a página de prestação (assumindo que existe uma rota)
    window.location.href = '/prestacao-contas/lancamento';
  };

  const fecharLancamento = () => {
    setShowLancamento(false);
    setShowNovaPrestacao(false);
    setFaturaParaLancamento(null);
    limparFormulario();
  };

  const limparFormulario = () => {
    setValorPago(0);
    setValorVencido(0);
    setEncargos(0);
    setDeducoes(0);
    setStatusLancamento('pendente');
    setObservacoesLancamento('');
    setLancamentos([]);
  };

  const buscarContratos = async () => {
    setLoadingContratos(true);
    try {
      console.log('🔍 Buscando contratos disponíveis...');
      const response = await fetch('/api/contratos');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Contratos carregados:', data.data?.length || 0);
      setContratos(data.data || []);
      
    } catch (error) {
      console.error('❌ Erro ao buscar contratos:', error);
      toast.error("Erro ao carregar contratos");
      setContratos([]);
    } finally {
      setLoadingContratos(false);
    }
  };

  const abrirDetalheBoleto = (fatura: Fatura) => {
    console.log('👁️ Abrindo detalhes do boleto:', fatura.numero_fatura);
    setFaturaParaDetalhes(fatura);
    setShowDetalheBoleto(true);
  };

  const fecharDetalheBoleto = () => {
    setShowDetalheBoleto(false);
    setFaturaParaDetalhes(null);
  };

  const editarFatura = (fatura: Fatura) => {
    console.log('📝 Editando fatura:', fatura.numero_fatura);
    setMenuAbertoId(null);
    // TODO: Implementar edição de fatura
    toast.success("Função de edição será implementada em breve");
  };

  const cancelarFatura = async (fatura: Fatura) => {
    console.log('❌ Cancelando fatura:', fatura.numero_fatura);
    setMenuAbertoId(null);
    
    if (!confirm(`Tem certeza que deseja cancelar a fatura ${fatura.numero_fatura}?`)) {
      return;
    }
    
    try {
      // TODO: Implementar API call para cancelar fatura
      toast.success(`Fatura ${fatura.numero_fatura} cancelada com sucesso!`);
      buscarFaturas(); // Recarregar lista
    } catch (error) {
      console.error('❌ Erro ao cancelar fatura:', error);
      toast.error("Erro ao cancelar fatura");
    }
  };

  const toggleMenu = (faturaId: number) => {
    setMenuAbertoId(menuAbertoId === faturaId ? null : faturaId);
  };

  const abrirNovaPrestacao = () => {
    console.log('🆕 Redirecionando para nova prestação de contas');
    
    // Salvar indicador de nova prestação no localStorage
    const dadosNovaPrestacao = {
      tipo: 'nova_prestacao',
      timestamp: Date.now()
    };
    
    localStorage.setItem('prestacao_dados_temp', JSON.stringify(dadosNovaPrestacao));
    
    // Redirecionar para a página de prestação
    window.location.href = '/prestacao-contas/lancamento';
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
    const totalBruto = valorPago + valorVencido + encargos;
    const totalLiquido = totalBruto - deducoes;
    return { totalBruto, totalLiquido };
  };

  const salvarLancamento = async () => {
    try {
      // Validações para nova prestação
      if (showNovaPrestacao) {
        if (!tipoLancamento) {
          toast.error("Selecione o tipo de lançamento");
          return;
        }
        if (!contratoSelecionado) {
          toast.error("Selecione um contrato");
          return;
        }
      }

      const { totalBruto, totalLiquido } = calcularTotais();
      
      const dadosLancamento = {
        // Dados existentes
        fatura_id: faturaParaLancamento?.id,
        valor_pago: valorPago,
        valor_vencido: valorVencido,
        encargos,
        deducoes,
        total_bruto: totalBruto,
        total_liquido: totalLiquido,
        status: statusLancamento,
        observacoes_manuais: observacoesLancamento,
        lancamentos,
        
        // Novos dados para prestação
        tipo_lancamento: showNovaPrestacao ? tipoLancamento : null,
        contrato_id: showNovaPrestacao ? contratoSelecionado?.id : faturaParaLancamento?.contrato_id,
        contrato_dados: showNovaPrestacao ? contratoSelecionado : null,
        
        // Dados do contexto
        is_nova_prestacao: showNovaPrestacao,
        is_fatura_existente: !showNovaPrestacao
      };

      console.log('💾 Salvando lançamento:', dadosLancamento);
      console.log('🏷️ Tipo:', tipoLancamento);
      console.log('📄 Contrato:', contratoSelecionado?.id);
      
      // TODO: Implementar API call para salvar
      const tipoMsg = showNovaPrestacao 
        ? `${tipoLancamento === 'entrada' ? 'Entrada' : tipoLancamento === 'mensal' ? 'Cobrança mensal' : 'Rescisão'}`
        : 'Lançamento de fatura';
        
      toast.success(`${tipoMsg} salva com sucesso!`);
      fecharLancamento();
      buscarFaturas(); // Recarregar lista
      
    } catch (error) {
      console.error('❌ Erro ao salvar lançamento:', error);
      toast.error("Erro ao salvar lançamento");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Prestação de Contas - Debug</h1>
                  <p className="text-muted-foreground">Testando componente: {debugMessage}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={abrirNovaPrestacao}
                  className="btn-gradient"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Nova Prestação
                </Button>
              </div>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Aberto</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.valor_total_aberto)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recebido</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.valor_total_recebido)}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Em Atraso</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.valor_total_atrasado)}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Faturas</p>
                    <p className="text-2xl font-bold text-foreground">{stats.todas}</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sistema de Abas */}
          <Card className="card-glass">
            <CardContent className="p-8">
              {/* Tabs Customizadas - Removendo shadcn/ui Tabs para debug */}
              <div className="w-full">
                <div className="grid w-full grid-cols-6 gap-2 mb-8 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setActiveTab('todas')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'todas' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>TODAS</span>
                    <Badge variant="secondary" className="ml-2">{stats.todas}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('aberta')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'aberta' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>ABERTAS</span>
                    <Badge variant="secondary" className="ml-2">{stats.abertas}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('pendente')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'pendente' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>PENDENTES</span>
                    <Badge variant="secondary" className="ml-2">{stats.pendentes}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('paga')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'paga' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>PAGAS</span>
                    <Badge variant="secondary" className="ml-2">{stats.pagas}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('em_atraso')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'em_atraso' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>EM ATRASO</span>
                    <Badge variant="secondary" className="ml-2">{stats.em_atraso}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('cancelada')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      activeTab === 'cancelada' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <span>CANCELADAS</span>
                    <Badge variant="secondary" className="ml-2">{stats.canceladas}</Badge>
                  </button>
                </div>

                {/* Filtros - padrão visual dos locatários */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Busca */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Buscar Faturas</Label>
                      <InputWithIcon
                        icon={Search}
                        placeholder="Buscar por número da fatura, cliente, imóvel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Filtro Mês */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Mês</Label>
                      <div className="relative">
                        <select 
                          value={mesSelecionado} 
                          onChange={(e) => setMesSelecionado(e.target.value)}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer text-foreground"
                          style={{
                            colorScheme: 'dark'
                          }}
                        >
                          <option value="" className="bg-background text-muted-foreground">Selecione o mês</option>
                          <option value="01" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Janeiro</option>
                          <option value="02" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Fevereiro</option>
                          <option value="03" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Março</option>
                          <option value="04" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Abril</option>
                          <option value="05" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Maio</option>
                          <option value="06" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Junho</option>
                          <option value="07" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Julho</option>
                          <option value="08" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Agosto</option>
                          <option value="09" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Setembro</option>
                          <option value="10" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Outubro</option>
                          <option value="11" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Novembro</option>
                          <option value="12" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Dezembro</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Filtro Ano */}
                    <div>
                      <Label className="text-sm font-medium text-foreground">Ano</Label>
                      <div className="relative">
                        <select 
                          value={anoSelecionado} 
                          onChange={(e) => setAnoSelecionado(e.target.value)}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer text-foreground"
                          style={{
                            colorScheme: 'dark'
                          }}
                        >
                          <option value="" className="bg-background text-muted-foreground">Selecione o ano</option>
                          <option value="2024" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">2024</option>
                          <option value="2023" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">2023</option>
                          <option value="2022" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">2022</option>
                          <option value="2021" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">2021</option>
                          <option value="2020" className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">2020</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conteúdo das Abas - Tabela de Faturas */}
                <div className="mt-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center space-x-2 text-foreground">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Carregando faturas...</span>
                      </div>
                    </div>
                  ) : faturas.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma fatura encontrada</h3>
                      <p className="text-muted-foreground">
                        {activeTab === 'todas' ? 'Não há faturas cadastradas' : `Não há faturas com status "${activeTab}"`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Filtros: {searchTerm ? `Busca: "${searchTerm}"` : ''} 
                        {mesSelecionado ? ` | Mês: ${mesSelecionado}` : ''} 
                        {anoSelecionado ? ` | Ano: ${anoSelecionado}` : ''}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-3 text-left">
                                <button 
                                  onClick={() => handleSort('numero_fatura')}
                                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary"
                                >
                                  <span>Nº Fatura</span>
                                  {getSortIcon('numero_fatura')}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="font-medium text-foreground">Imóvel/Contrato</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="font-medium text-foreground">Cliente</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <button 
                                  onClick={() => handleSort('mes_referencia')}
                                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary"
                                >
                                  <span>Referência</span>
                                  {getSortIcon('mes_referencia')}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <button 
                                  onClick={() => handleSort('data_vencimento')}
                                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary"
                                >
                                  <span>Vencimento</span>
                                  {getSortIcon('data_vencimento')}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="font-medium text-foreground">Status</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <button 
                                  onClick={() => handleSort('valor_total')}
                                  className="flex items-center space-x-2 font-medium text-foreground hover:text-primary"
                                >
                                  <span>Total</span>
                                  {getSortIcon('valor_total')}
                                </button>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="font-medium text-foreground">Ações</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {faturas.map((fatura, index) => (
                              <motion.tr
                                key={fatura.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="border-t border-border hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-4 py-3">
                                  <span className="font-mono text-sm font-medium text-foreground">
                                    {fatura.numero_fatura || `#${fatura.id}`}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="space-y-1">
                                    <p className="font-medium text-foreground text-sm">
                                      {fatura.imovel_endereco || 'Endereço não informado'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Contrato #{fatura.contrato_numero}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="space-y-1">
                                    <p className="font-medium text-foreground text-sm">
                                      {fatura.locatario_nome || 'Nome não informado'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {fatura.locatario_cpf || 'CPF não informado'}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-foreground">
                                    {fatura.referencia_display || fatura.mes_referencia}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-foreground">
                                    {formatDate(fatura.data_vencimento)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {getStatusBadge(fatura.status)}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-semibold text-foreground">
                                    {formatCurrency(fatura.valor_total || 0)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      size="sm" 
                                      className="btn-gradient"
                                      onClick={() => abrirDetalheBoleto(fatura)}
                                      title="Ver Detalhes e Lançar"
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      Detalhes
                                    </Button>
                                    <div className="relative">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="btn-outline" 
                                        onClick={() => toggleMenu(fatura.id)}
                                        title="Mais Opções"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                      
                                      {/* Menu Dropdown */}
                                      {menuAbertoId === fatura.id && (
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                                          <div className="py-1">
                                            <button
                                              onClick={() => editarFatura(fatura)}
                                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                            >
                                              <Edit className="w-4 h-4" />
                                              <span>Editar</span>
                                            </button>
                                            <button
                                              onClick={() => cancelarFatura(fatura)}
                                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                            >
                                              <XCircle className="w-4 h-4" />
                                              <span>Cancelar</span>
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Info de debug no rodapé */}
                      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                        {debugMessage} | Aba: {activeTab} | Total: {faturas.length}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal de Detalhamento do Boleto */}
      {showDetalheBoleto && faturaParaDetalhes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header do Modal */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Detalhamento do Boleto</h2>
                  <p className="text-sm text-muted-foreground">
                    {faturaParaDetalhes.numero_fatura || `#${faturaParaDetalhes.id}`} - {faturaParaDetalhes.locatario_nome}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fecharDetalheBoleto}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto flex-1">
              <DetalhamentoBoleto 
                boleto={{
                  numero_boleto: faturaParaDetalhes.numero_fatura,
                  valores_base: {
                    aluguel: faturaParaDetalhes.valor_aluguel || 0,
                    iptu: faturaParaDetalhes.valor_iptu || 0,
                    seguro_fianca: faturaParaDetalhes.valor_seguro_fianca || 0,
                    seguro_incendio: faturaParaDetalhes.valor_seguro_incendio || 0,
                    condominio: faturaParaDetalhes.valor_condominio || 0,
                    energia_eletrica: faturaParaDetalhes.valor_energia || 0,
                    gas: faturaParaDetalhes.valor_gas || 0,
                    fci: faturaParaDetalhes.valor_fci || 0,
                  },
                  acrescimos: {
                    valor_total: faturaParaDetalhes.valor_acrescimos || 0,
                    dias_atraso: faturaParaDetalhes.dias_atraso || 0,
                  },
                  descontos: {
                    desconto_pontualidade: faturaParaDetalhes.desconto_pontualidade || 0,
                    desconto_benfeitoria_1: faturaParaDetalhes.desconto_benfeitoria_1 || 0,
                    desconto_benfeitoria_2: faturaParaDetalhes.desconto_benfeitoria_2 || 0,
                    desconto_benfeitoria_3: faturaParaDetalhes.desconto_benfeitoria_3 || 0,
                    reembolso_fundo_obras: faturaParaDetalhes.reembolso_fundo_obras || 0,
                    fundo_reserva: faturaParaDetalhes.fundo_reserva || 0,
                    fundo_iptu: faturaParaDetalhes.fundo_iptu || 0,
                    fundo_outros: faturaParaDetalhes.fundo_outros || 0,
                    honorario_advogados: faturaParaDetalhes.honorario_advogados || 0,
                    boleto_advogados: faturaParaDetalhes.boleto_advogados || 0,
                  },
                  valor_total: faturaParaDetalhes.valor_total || 0,
                  contrato: {
                    locatario_nome: faturaParaDetalhes.locatario_nome || 'Nome não informado',
                    imovel_endereco: faturaParaDetalhes.imovel_endereco || 'Endereço não informado',
                    locatario_telefone: faturaParaDetalhes.locatario_telefone,
                    locatario_email: faturaParaDetalhes.locatario_email,
                    proprietario_nome: faturaParaDetalhes.proprietario_nome,
                    proprietario_telefone: faturaParaDetalhes.proprietario_telefone,
                    proprietario_email: faturaParaDetalhes.proprietario_email,
                  },
                  periodo: {
                    mes: parseInt(faturaParaDetalhes.mes_referencia?.toString().split('/')[0] || '1'),
                    ano: parseInt(faturaParaDetalhes.mes_referencia?.toString().split('/')[1] || new Date().getFullYear().toString()),
                    data_vencimento: faturaParaDetalhes.data_vencimento || new Date().toISOString(),
                    data_pagamento: faturaParaDetalhes.data_pagamento,
                  },
                }}
              />
            </div>

            {/* Footer do Modal */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t px-6 py-4">
              <div className="flex items-center justify-end">
                <Button 
                  onClick={() => abrirLancamentoFatura(faturaParaDetalhes)}
                  className="btn-gradient"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Lançar Prestação
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PrestacaoContasModernaDebug;