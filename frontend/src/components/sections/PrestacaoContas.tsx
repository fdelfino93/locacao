import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Calendar,
  FileText,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  User,
  Building,
  Phone,
  AlertCircle,
  CheckCircle,
  Eye,
  Plus,
  Minus,
  MessageSquare
} from 'lucide-react';
import { apiService } from '../../services/api';
import { ObservacaoForm } from '../forms/ObservacaoForm';
import { LancamentoForm } from '../forms/LancamentoForm';

interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
  total_contratos: number;
}

interface PrestacaoContas {
  cliente: {
    id: number;
    nome: string;
    cpf_cnpj: string;
    telefone: string;
    email: string;
    tipo_recebimento: string;
    conta_bancaria: string;
  };
  mes: number;
  ano: number;
  contratos: Contrato[];
  resumo: {
    total_contratos: number;
    total_bruto_geral: number;
    total_liquido_geral: number;
    diferenca: number;
  };
}

interface Contrato {
  contrato_id: number;
  endereco_imovel: string;
  tipo_imovel: string;
  nome_inquilino: string;
  cpf_inquilino: string;
  telefone_inquilino: string;
  valor_aluguel: number;
  valor_iptu: number;
  valor_condominio: number;
  taxa_administracao: number;
  fundo_conservacao: number;
  pagamentos: Pagamento[];
  lancamentos_liquidos: LancamentoLiquido[];
  descontos_deducoes: DescontoDeducao[];
  total_bruto: number;
  total_liquido: number;
  status_pagamento: string;
}

interface Pagamento {
  id: number;
  data_vencimento: string;
  data_pagamento: string;
  valor_aluguel: number;
  valor_pago: number;
  multa: number;
  juros: number;
  fci_pago: number;
  status: string;
  total_bruto: number;
  total_liquido: number;
  observacao: string;
  pagamento_atrasado: boolean;
}

interface LancamentoLiquido {
  tipo: string;
  valor: number;
}

interface DescontoDeducao {
  tipo: string;
  valor: number;
}

export const PrestacaoContas: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());
  const [prestacaoContas, setPrestacaoContas] = useState<PrestacaoContas | null>(null);
  const [contratoExpanded, setContratoExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Estados para formulários de ajustes
  const [observacaoForm, setObservacaoForm] = useState<{
    isOpen: boolean;
    pagamentoId: number | null;
    observacaoAtual: string;
  }>({ isOpen: false, pagamentoId: null, observacaoAtual: '' });
  
  const [lancamentoForm, setLancamentoForm] = useState<{
    isOpen: boolean;
    pagamentoId: number | null;
    tipoOperacao: 'lancamento' | 'desconto';
  }>({ isOpen: false, pagamentoId: null, tipoOperacao: 'lancamento' });

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const anos = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const response = await apiService.get('/prestacao-contas/clientes');
      if (response.success) {
        setClientes(response.data);
      } else {
        setMessage({ type: 'error', text: 'Erro ao carregar clientes' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar clientes' });
    }
  };

  const buscarPrestacaoContas = async () => {
    if (!clienteSelecionado) {
      setMessage({ type: 'error', text: 'Selecione um cliente' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await apiService.get(`/prestacao-contas/${clienteSelecionado}/${anoSelecionado}/${mesSelecionado}`);
      if (response.success) {
        setPrestacaoContas(response.data);
        setMessage({ type: 'success', text: 'Prestação de contas carregada com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao carregar prestação de contas' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao carregar prestação de contas';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
      case 'em dia':
        return 'text-green-600';
      case 'atrasado':
        return 'text-red-600';
      case 'pendente':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
      case 'em dia':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'atrasado':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const toggleContratoExpanded = (contratoId: number) => {
    setContratoExpanded(contratoExpanded === contratoId ? null : contratoId);
  };

  const gerarRelatorio = async (formato: 'pdf' | 'excel') => {
    if (!prestacaoContas) return;

    try {
      const { cliente, mes, ano } = prestacaoContas;
      const url = `http://localhost:8000/api/prestacao-contas/${cliente.id}/${ano}/${mes}/relatorio/${formato}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao gerar relatório');
      }

      const blob = await response.blob();
      const fileName = `prestacao_contas_${cliente.nome.replace(/\s+/g, '_')}_${mes}_${ano}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
      
      // Criar link para download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setMessage({ type: 'success', text: `Relatório ${formato.toUpperCase()} gerado com sucesso!` });
    } catch (error) {
      setMessage({ type: 'error', text: `Erro ao gerar relatório ${formato.toUpperCase()}` });
    }
  };

  const abrirObservacaoForm = (pagamentoId: number, observacaoAtual: string = '') => {
    setObservacaoForm({
      isOpen: true,
      pagamentoId,
      observacaoAtual
    });
  };

  const salvarObservacao = async (observacao: string) => {
    if (!observacaoForm.pagamentoId || !prestacaoContas) return;

    try {
      await apiService.put('/prestacao-contas/pagamento-detalhes', {
        id_pagamento: observacaoForm.pagamentoId,
        mes_referencia: prestacaoContas.mes,
        ano_referencia: prestacaoContas.ano,
        total_bruto: 0, // Seria necessário buscar os valores atuais
        total_liquido: 0,
        observacao,
        pagamento_atrasado: false
      });

      setMessage({ type: 'success', text: 'Observação salva com sucesso!' });
      
      // Recarregar dados
      await buscarPrestacaoContas();
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar observação' });
    }
  };

  const abrirLancamentoForm = (pagamentoId: number, tipoOperacao: 'lancamento' | 'desconto') => {
    setLancamentoForm({
      isOpen: true,
      pagamentoId,
      tipoOperacao
    });
  };

  const salvarLancamento = async (tipoOperacao: 'lancamento' | 'desconto', dados: { tipo: string; valor: number }) => {
    if (!lancamentoForm.pagamentoId) return;

    try {
      const endpoint = tipoOperacao === 'lancamento' 
        ? '/prestacao-contas/lancamentos' 
        : '/prestacao-contas/descontos';

      await apiService.post(endpoint, {
        id_pagamento: lancamentoForm.pagamentoId,
        tipo: dados.tipo,
        valor: dados.valor
      });

      setMessage({ 
        type: 'success', 
        text: `${tipoOperacao === 'lancamento' ? 'Lançamento' : 'Desconto'} adicionado com sucesso!` 
      });
      
      // Recarregar dados
      await buscarPrestacaoContas();
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Erro ao adicionar ${tipoOperacao === 'lancamento' ? 'lançamento' : 'desconto'}` 
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Prestação de Contas Mensal
            </h1>
            <p className="text-gray-600">
              Consulte e gerencie a prestação de contas dos seus clientes
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Select onValueChange={(value) => setClienteSelecionado(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id.toString()}>
                    {cliente.nome} - {cliente.total_contratos} contrato(s)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mes">Mês</Label>
            <Select value={mesSelecionado.toString()} onValueChange={(value) => setMesSelecionado(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value.toString()}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ano">Ano</Label>
            <Select value={anoSelecionado.toString()} onValueChange={(value) => setAnoSelecionado(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anos.map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={buscarPrestacaoContas}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Consultar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mensagens */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Resultados */}
        {prestacaoContas && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Cabeçalho do Cliente */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      {prestacaoContas.cliente.nome}
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-1">
                    <strong>CPF/CNPJ:</strong> {prestacaoContas.cliente.cpf_cnpj}
                  </p>
                  <p className="text-gray-600">
                    <strong>Período:</strong> {meses.find(m => m.value === prestacaoContas.mes)?.label} / {prestacaoContas.ano}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => gerarRelatorio('pdf')} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={() => gerarRelatorio('excel')} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Bruto</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatarMoeda(prestacaoContas.resumo.total_bruto_geral)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Líquido</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatarMoeda(prestacaoContas.resumo.total_liquido_geral)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Descontos</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatarMoeda(prestacaoContas.resumo.diferenca)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Contratos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Contratos ({prestacaoContas.contratos.length})
              </h3>

              {prestacaoContas.contratos.map((contrato) => (
                <div key={contrato.contrato_id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleContratoExpanded(contrato.contrato_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-gray-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {contrato.endereco_imovel}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Inquilino: {contrato.nome_inquilino}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatarMoeda(contrato.total_liquido)}
                          </p>
                          <div className={`flex items-center gap-1 ${getStatusColor(contrato.status_pagamento)}`}>
                            {getStatusIcon(contrato.status_pagamento)}
                            <span className="text-sm">{contrato.status_pagamento}</span>
                          </div>
                        </div>
                        {contratoExpanded === contrato.contrato_id ? (
                          <Minus className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Plus className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {contratoExpanded === contrato.contrato_id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 p-4 bg-gray-50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Informações do Inquilino */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Dados do Inquilino
                          </h5>
                          <div className="space-y-2 text-sm">
                            <p><strong>Nome:</strong> {contrato.nome_inquilino}</p>
                            <p><strong>CPF/CNPJ:</strong> {contrato.cpf_inquilino}</p>
                            <p><strong>Telefone:</strong> {contrato.telefone_inquilino}</p>
                          </div>
                        </div>

                        {/* Valores do Contrato */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Valores Contratuais
                          </h5>
                          <div className="space-y-2 text-sm">
                            <p><strong>Aluguel:</strong> {formatarMoeda(contrato.valor_aluguel)}</p>
                            <p><strong>IPTU:</strong> {formatarMoeda(contrato.valor_iptu)}</p>
                            <p><strong>Condomínio:</strong> {formatarMoeda(contrato.valor_condominio)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Pagamentos */}
                      {contrato.pagamentos.length > 0 && (
                        <div className="mt-6">
                          <h5 className="font-medium text-gray-900 mb-3">Pagamentos</h5>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vencimento
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pagamento
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor Pago
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {contrato.pagamentos.map((pagamento) => (
                                  <tr key={pagamento.id}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {formatarData(pagamento.data_vencimento)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {formatarData(pagamento.data_pagamento)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {formatarMoeda(pagamento.valor_pago)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <div className={`flex items-center gap-1 ${getStatusColor(pagamento.status)}`}>
                                        {getStatusIcon(pagamento.status)}
                                        <span>{pagamento.status}</span>
                                      </div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <div className="flex gap-1">
                                        <Button
                                          onClick={() => abrirObservacaoForm(pagamento.id, pagamento.observacao)}
                                          size="sm"
                                          variant="outline"
                                          className="p-1 h-6 w-6"
                                          title="Observações"
                                        >
                                          <MessageSquare className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          onClick={() => abrirLancamentoForm(pagamento.id, 'lancamento')}
                                          size="sm"
                                          variant="outline"
                                          className="p-1 h-6 w-6 text-green-600"
                                          title="Adicionar Lançamento"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          onClick={() => abrirLancamentoForm(pagamento.id, 'desconto')}
                                          size="sm"
                                          variant="outline"
                                          className="p-1 h-6 w-6 text-red-600"
                                          title="Adicionar Desconto"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Lançamentos e Descontos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {/* Lançamentos Líquidos */}
                        {contrato.lancamentos_liquidos.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3 text-green-600">
                              Lançamentos Líquidos
                            </h5>
                            <div className="space-y-2">
                              {contrato.lancamentos_liquidos.map((lancamento, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{lancamento.tipo}</span>
                                  <span className="text-green-600 font-medium">
                                    + {formatarMoeda(lancamento.valor)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Descontos e Deduções */}
                        {contrato.descontos_deducoes.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3 text-red-600">
                              Descontos e Deduções
                            </h5>
                            <div className="space-y-2">
                              {contrato.descontos_deducoes.map((desconto, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{desconto.tipo}</span>
                                  <span className="text-red-600 font-medium">
                                    - {formatarMoeda(desconto.valor)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Formulários de Ajustes */}
        <ObservacaoForm
          isOpen={observacaoForm.isOpen}
          onClose={() => setObservacaoForm({ isOpen: false, pagamentoId: null, observacaoAtual: '' })}
          onSave={salvarObservacao}
          observacaoAtual={observacaoForm.observacaoAtual}
          titulo="Observação do Pagamento"
        />

        <LancamentoForm
          isOpen={lancamentoForm.isOpen}
          onClose={() => setLancamentoForm({ isOpen: false, pagamentoId: null, tipoOperacao: 'lancamento' })}
          onSave={salvarLancamento}
          tipoOperacao={lancamentoForm.tipoOperacao}
          pagamentoId={lancamentoForm.pagamentoId || 0}
        />
      </div>
    </div>
  );
};