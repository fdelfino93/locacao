"use client";

import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Removido temporariamente para debug
import { Badge } from "@/components/ui/badge";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, FileText, DollarSign, CheckCircle, AlertCircle, Search, Loader2, Eye, Receipt, MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import type { Fatura, FaturaStats, FaturasResponse } from "@/types";
import toast from "react-hot-toast";

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
  
  // Estados do formulário de lançamento
  const [valorPago, setValorPago] = useState<number>(0);
  const [valorVencido, setValorVencido] = useState<number>(0);
  const [encargos, setEncargos] = useState<number>(0);
  const [deducoes, setDeducoes] = useState<number>(0);
  const [statusLancamento, setStatusLancamento] = useState<'pago' | 'pendente' | 'atrasado' | 'vencido'>('pendente');
  const [observacoesLancamento, setObservacoesLancamento] = useState<string>('');
  const [lancamentos, setLancamentos] = useState<any[]>([]);

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

  // Funções para área de lançamento
  const abrirLancamentoFatura = (fatura: Fatura) => {
    console.log('🎯 Abrindo lançamento para fatura:', fatura.numero_fatura);
    setFaturaParaLancamento(fatura);
    
    // Pré-preencher dados baseados na fatura
    setValorPago(fatura.status === 'paga' ? fatura.valor_total : 0);
    setValorVencido(fatura.status !== 'paga' ? fatura.valor_total : 0);
    setEncargos(0);
    setDeducoes(0);
    
    // Definir status baseado na fatura
    if (fatura.status === 'paga') {
      setStatusLancamento('pago');
    } else if (fatura.status === 'em_atraso') {
      setStatusLancamento('atrasado');
    } else {
      setStatusLancamento('pendente');
    }
    
    setObservacoesLancamento(fatura.observacoes || '');
    setLancamentos([]);
    setShowLancamento(true);
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

  const abrirNovaPrestacao = () => {
    console.log('🆕 Abrindo nova prestação de contas');
    setFaturaParaLancamento(null);
    limparFormulario();
    setShowNovaPrestacao(true);
    setShowLancamento(true);
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
      const { totalBruto, totalLiquido } = calcularTotais();
      
      const dadosLancamento = {
        fatura_id: faturaParaLancamento?.id,
        valor_pago: valorPago,
        valor_vencido: valorVencido,
        encargos,
        deducoes,
        total_bruto: totalBruto,
        total_liquido: totalLiquido,
        status: statusLancamento,
        observacoes_manuais: observacoesLancamento,
        lancamentos
      };

      console.log('💾 Salvando lançamento:', dadosLancamento);
      
      // TODO: Implementar API call para salvar
      toast.success("Lançamento salvo com sucesso!");
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
                                      variant="outline" 
                                      className="btn-outline"
                                      onClick={() => abrirLancamentoFatura(fatura)}
                                      title="Lançar Prestação de Contas"
                                    >
                                      <Receipt className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="btn-outline" title="Ver Detalhes">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="btn-outline" title="Mais Opções">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
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

      {/* Modal Centralizado da Área de Lançamento */}
      {showLancamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={fecharLancamento}
          />
          
          {/* Modal Centralizado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-background rounded-3xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Header com Gradiente */}
            <div className="bg-gradient-to-r from-primary to-secondary p-8 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary-foreground/20 rounded-2xl backdrop-blur-sm">
                    <Receipt className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">
                      {faturaParaLancamento ? 'Lançamento de Fatura' : 'Nova Prestação de Contas'}
                    </h1>
                    {faturaParaLancamento && (
                      <p className="text-primary-foreground/80 text-lg">
                        {faturaParaLancamento.numero_fatura} • {faturaParaLancamento.locatario_nome}
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={fecharLancamento}
                  className="text-primary-foreground hover:bg-primary-foreground/20 rounded-xl"
                >
                  <MoreVertical className="w-6 h-6 rotate-45" />
                </Button>
              </div>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-8 space-y-8">

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

                {/* Layout Principal em Duas Colunas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Coluna Esquerda: Dados Financeiros */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <Card className="card-glass border-green-200 dark:border-green-800">
                      <CardContent className="p-8">
                        <div className="flex items-center space-x-3 mb-8">
                          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">Dados Financeiros</h3>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                                💰 Valor Pago (R$)
                              </Label>
                              <InputWithIcon
                                type="number"
                                step="0.01"
                                icon={DollarSign}
                                value={valorPago}
                                onChange={(e) => setValorPago(Number(e.target.value) || 0)}
                                placeholder="0,00"
                                className="text-lg font-semibold h-12"
                              />
                            </div>
                            
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">
                                ⏰ Valor Vencido (R$)
                              </Label>
                              <InputWithIcon
                                type="number"
                                step="0.01"
                                icon={DollarSign}
                                value={valorVencido}
                                onChange={(e) => setValorVencido(Number(e.target.value) || 0)}
                                placeholder="0,00"
                                className="text-lg font-semibold h-12"
                              />
                            </div>
                            
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                                📈 Encargos (R$)
                              </Label>
                              <InputWithIcon
                                type="number"
                                step="0.01"
                                icon={DollarSign}
                                value={encargos}
                                onChange={(e) => setEncargos(Number(e.target.value) || 0)}
                                placeholder="0,00"
                                className="text-lg font-semibold h-12"
                              />
                            </div>
                            
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">
                                📉 Deduções (R$)
                              </Label>
                              <InputWithIcon
                                type="number"
                                step="0.01"
                                icon={DollarSign}
                                value={deducoes}
                                onChange={(e) => setDeducoes(Number(e.target.value) || 0)}
                                placeholder="0,00"
                                className="text-lg font-semibold h-12"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                              📊 Status do Lançamento
                            </Label>
                            <div className="relative">
                              <select 
                                value={statusLancamento} 
                                onChange={(e) => setStatusLancamento(e.target.value as any)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-4 py-3 text-lg font-semibold ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer text-foreground"
                              >
                                <option value="pago">✅ Pago</option>
                                <option value="pendente">⏳ Pendente</option>
                                <option value="atrasado">⚠️ Atrasado</option>
                                <option value="vencido">❌ Vencido</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <ArrowDown className="w-5 h-5 text-muted-foreground" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Coluna Direita: Resumo Financeiro */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <Card className="card-glass border-blue-200 dark:border-blue-800">
                      <CardContent className="p-8">
                        <div className="flex items-center space-x-3 mb-8">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                            <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">Resumo Financeiro</h3>
                        </div>
                        
                        <div className="space-y-6">
                          <motion.div 
                            className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20 shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-bold text-primary text-lg">💰 Total Bruto</p>
                              <div className="p-2 bg-primary/20 rounded-lg">
                                <DollarSign className="w-5 h-5 text-primary" />
                              </div>
                            </div>
                            <p className="text-4xl font-black text-foreground">
                              {formatCurrency(calcularTotais().totalBruto)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Valor pago + vencido + encargos
                            </p>
                          </motion.div>
                          
                          <motion.div 
                            className="p-8 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl border-2 border-secondary/20 shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-bold text-secondary text-lg">💎 Total Líquido</p>
                              <div className="p-2 bg-secondary/20 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-secondary" />
                              </div>
                            </div>
                            <p className="text-4xl font-black text-foreground">
                              {formatCurrency(calcularTotais().totalLiquido)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Total bruto - deduções
                            </p>
                          </motion.div>
                          
                          <div className="p-6 bg-muted/50 rounded-2xl border border-border">
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-bold text-muted-foreground text-lg">📊 Status Atual</p>
                              <div className="p-2 bg-muted rounded-lg">
                                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                              </div>
                            </div>
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
                              <span className={`text-xl font-semibold ${
                                statusLancamento === 'pago' ? 'text-green-500' :
                                statusLancamento === 'pendente' ? 'text-yellow-500' :
                                statusLancamento === 'atrasado' ? 'text-orange-500' :
                                'text-red-500'
                              }`}>
                                {statusLancamento.charAt(0).toUpperCase() + statusLancamento.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>


                {/* Lançamentos Detalhados */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Card className="card-glass border-purple-200 dark:border-purple-800">
                    <CardContent className="p-8">
                      <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">Lançamentos Extras</h3>
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
                                  <select 
                                    value={lancamento.tipo} 
                                    onChange={(e) => atualizarLancamento(index, 'tipo', e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-purple-500"
                                  >
                                    <option value="receita">💰 Receita</option>
                                    <option value="despesa">💸 Despesa</option>
                                    <option value="taxa">📋 Taxa</option>
                                    <option value="desconto">🎯 Desconto</option>
                                  </select>
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

                {/* Observações */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <Card className="card-glass border-slate-200 dark:border-slate-800">
                    <CardContent className="p-8">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-slate-100 dark:bg-slate-900/30 rounded-2xl">
                          <FileText className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">Observações e Ajustes</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          📝 Observações Gerais
                        </Label>
                        <textarea
                          value={observacoesLancamento}
                          onChange={(e) => setObservacoesLancamento(e.target.value)}
                          placeholder="Ex: Pagamento realizado com atraso de 3 dias, aplicado desconto de pontualidade, taxa extra de manutenção..."
                          rows={5}
                          className="flex w-full rounded-2xl border border-input bg-background px-6 py-4 text-lg ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 resize-none"
                        />
                        <p className="text-sm text-muted-foreground">
                          💡 Adicione detalhes importantes sobre este lançamento que possam ser úteis para futuras consultas
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Botões de Ação com Design Melhorado */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border p-6 -mx-8 -mb-8"
                >
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">
                          {faturaParaLancamento ? '📄 Editando fatura existente' : '🆕 Criando nova prestação'}
                        </p>
                        <p>Total: <span className="font-bold text-foreground">{formatCurrency(calcularTotais().totalLiquido)}</span></p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={fecharLancamento}
                          variant="outline"
                          size="lg"
                          className="btn-outline px-8 py-4 text-lg font-semibold rounded-2xl"
                        >
                          ❌ Cancelar
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          onClick={salvarLancamento}
                          size="lg"
                          className="btn-gradient px-10 py-4 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-primary/25 transition-all duration-300"
                        >
                          <Calculator className="w-6 h-6 mr-3" />
                          💾 Salvar Lançamento
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PrestacaoContasModernaDebug;