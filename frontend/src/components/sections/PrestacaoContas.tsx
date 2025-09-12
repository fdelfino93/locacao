"use client";

import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  User, 
  DollarSign, 
  Calendar,
  AlertCircle,
  Loader2,
  UserCheck,
  Download,
  Plus,
  Trash2,
  Calculator
} from 'lucide-react';
import { apiService } from "@/services/api";
import type { Cliente, PrestacaoContas, LancamentoPrestacao } from "@/types";
import ExportarExcelButton from "@/components/ExportarExcelButton";
import ExportarPdfButton from "@/components/ExportarPdfButton";
import toast from "react-hot-toast";

function PrestacaoContasPage() {
  const [proprietarios, setProprietarios] = useState<Cliente[]>([]);
  const [proprietarioSelecionado, setProprietarioSelecionado] = useState<Cliente | null>(null);
  const [contratos, setContratos] = useState<any[]>([]);
  const [contratoSelecionado, setContratoSelecionado] = useState<any>(null);
  const [mes, setMes] = useState<string>("");
  const [ano, setAno] = useState<string>("");
  const [prestacao, setPrestacao] = useState<PrestacaoContas | null>(null);
  const [observacoes, setObservacoes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  // Novos estados para inputs de prestação
  const [valorPago, setValorPago] = useState<number>(0);
  const [valorVencido, setValorVencido] = useState<number>(0);
  const [encargos, setEncargos] = useState<number>(0);
  const [deducoes, setDeducoes] = useState<number>(0);
  const [status, setStatus] = useState<'pago' | 'pendente' | 'atrasado' | 'vencido'>('pendente');
  const [lancamentos, setLancamentos] = useState<LancamentoPrestacao[]>([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await apiService.listarLocadores();
        setProprietarios(response.data || []);
      } catch (error) {
        console.error('Erro ao buscar proprietários:', error);
        toast.error("Erro ao buscar proprietários");
      }
    };
    fetchClientes();
  }, []);

  const buscarContratos = async () => {
    try {
      const response = await apiService.requestPublic('/api/contratos');
      setContratos(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      toast.error("Erro ao buscar contratos");
    }
  };

  useEffect(() => {
    buscarContratos();
  }, []);

  const buscarPrestacao = async () => {
    if (!proprietarioSelecionado || !mes || !ano) {
      toast.error("Selecione proprietário, mês e ano!");
      return;
    }
    
    if (!contratoSelecionado) {
      toast.error("Selecione um termo para realizar a prestação de contas!");
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.requestPublic(`/prestacao-contas/${proprietarioSelecionado.id}/${mes}/${ano}`);
      const data = response.data as PrestacaoContas;
      setPrestacao(data);
      
      // Carregar dados nos inputs
      if (data) {
        setValorPago(data.valor_pago || 0);
        setValorVencido(data.valor_vencido || 0);
        setEncargos(data.encargos || 0);
        setDeducoes(data.deducoes || 0);
        setStatus(data.status || 'pendente');
        setObservacoes(data.observacoes_manuais || '');
        setLancamentos(data.lancamentos || []);
      }
    } catch (error) {
      console.error('Erro ao buscar prestação:', error);
      toast.error("Erro ao buscar prestação de contas");
      setPrestacao(null);
    } finally {
      setLoading(false);
    }
  };

  const salvarPrestacao = async () => {
    if (!proprietarioSelecionado || !mes || !ano) {
      toast.error("Selecione proprietário, mês e ano!");
      return;
    }
    
    if (!contratoSelecionado) {
      toast.error("Selecione um termo para realizar a prestação de contas!");
      return;
    }

    const totalBruto = valorPago + valorVencido + encargos;
    const totalLiquido = totalBruto - deducoes;

    const dadosPrestacao: Partial<PrestacaoContas> = {
      cliente_id: proprietarioSelecionado.id,
      contrato_id: contratoSelecionado.id,
      mes,
      ano,
      referencia: `${mes}/${ano}`,
      valor_pago: valorPago,
      valor_vencido: valorVencido,
      encargos,
      deducoes,
      total_bruto: totalBruto,
      total_liquido: totalLiquido,
      status,
      observacoes_manuais: observacoes,
      pagamento_atrasado: status === 'atrasado' || status === 'vencido',
      lancamentos
    };

    try {
      let response;
      if (prestacao?.id) {
        response = await apiService.requestPublic(`/prestacao-contas/${prestacao.id}`, {
          method: 'PUT',
          body: JSON.stringify(dadosPrestacao)
        });
      } else {
        response = await apiService.requestPublic('/prestacao-contas', {
          method: 'POST',
          body: JSON.stringify(dadosPrestacao)
        });
      }
      
      toast.success("Prestação de contas salva com sucesso!");
      // Recarregar dados
      buscarPrestacao();
    } catch (error) {
      console.error('Erro ao salvar prestação:', error);
      toast.error("Erro ao salvar prestação de contas.");
    }
  };

  const adicionarLancamento = () => {
    const novoLancamento: LancamentoPrestacao = {
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

  const atualizarLancamento = (index: number, campo: keyof LancamentoPrestacao, valor: any) => {
    const novosLancamentos = [...lancamentos];
    novosLancamentos[index] = {
      ...novosLancamentos[index],
      [campo]: valor
    };
    setLancamentos(novosLancamentos);
  };

  const exportarExcel = async () => {
    if (!proprietarioSelecionado || !mes || !ano) {
      toast.error("Selecione proprietário, mês e ano!");
      return;
    }
    
    if (!contratoSelecionado) {
      toast.error("Selecione um termo!");
      return;
    }
    
    try {
      const response = await apiService.requestPublic(`/prestacao-contas/export/excel/${proprietarioSelecionado.id}/${mes}/${ano}`, {
        method: 'GET'
      });
      
      // Handle file download
      toast.success("Excel exportado com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error("Erro ao exportar Excel");
    }
  };

  const exportarPdf = async () => {
    if (!proprietarioSelecionado || !mes || !ano) {
      toast.error("Selecione proprietário, mês e ano!");
      return;
    }
    
    if (!contratoSelecionado) {
      toast.error("Selecione um termo!");
      return;
    }
    
    try {
      const response = await apiService.requestPublic(`/prestacao-contas/export/pdf/${proprietarioSelecionado.id}/${mes}/${ano}`, {
        method: 'GET'
      });
      
      // Handle file download
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error("Erro ao exportar PDF");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glass rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-foreground/20 rounded-xl">
                <Calculator className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">Prestação de Contas</h1>
            </div>
          </div>

          <div className="p-8">
            {/* Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-12"
              >
                <div className="flex items-center space-x-2 text-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Carregando dados da prestação de contas...</span>
                </div>
              </motion.div>
            )}

            <form className="space-y-8">
              {/* Seleção de Parâmetros */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Filtros</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Cliente</Label>
                    <Select
                      onValueChange={(value) => {
                        const cliente = clientes.find((c) => c.id?.toString() === value);
                        setClienteSelecionado(cliente || null);
                        setContratoSelecionado(null);
                      }}
                      value={proprietarioSelecionado?.id?.toString() || ""}
                    >
                      <SelectTrigger className="bg-muted/50 border-border text-foreground">
                        <SelectValue placeholder="Selecione o proprietário" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {proprietarios.map((proprietario) => (
                          <SelectItem key={proprietario.id} value={proprietario.id?.toString() || ''} className="text-foreground hover:bg-accent">
                            {proprietario.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Contrato</Label>
                    <Select
                      onValueChange={(value) => {
                        const contrato = contratos.find((c) => c.id?.toString() === value);
                        setContratoSelecionado(contrato || null);
                        if (contrato) {
                          const locador = proprietarios.find(cl => cl.id === contrato.id_locador);
                          if (locador) setProprietarioSelecionado(locador);
                        }
                      }}
                      value={contratoSelecionado?.id?.toString() || ""}
                      disabled={!contratos.length}
                    >
                      <SelectTrigger className="bg-muted/50 border-border text-foreground">
                        <SelectValue placeholder="Selecione o contrato" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {contratos
                          .filter(contrato => !proprietarioSelecionado || contrato.id_locador === proprietarioSelecionado.id)
                          .map((contrato) => (
                          <SelectItem key={contrato.id} value={contrato.id?.toString() || ''} className="text-foreground hover:bg-accent">
                            {contrato.imovel_endereco ? `${contrato.imovel_endereco.substring(0, 30)}...` : `Contrato #${contrato.id}`}
                            {contrato.locador_nome && ` - ${contrato.locador_nome}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Mês</Label>
                    <Select onValueChange={setMes} value={mes}>
                      <SelectTrigger className="bg-muted/50 border-border text-foreground">
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {Array.from({ length: 12 }, (_, i) => {
                          const m = (i + 1).toString().padStart(2, "0");
                          return (
                            <SelectItem key={m} value={m} className="text-foreground hover:bg-accent">
                              {m}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Ano</Label>
                    <Select onValueChange={setAno} value={ano}>
                      <SelectTrigger className="bg-muted/50 border-border text-foreground">
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {[2023, 2024, 2025].map((a) => (
                          <SelectItem key={a} value={a.toString()} className="text-foreground hover:bg-accent">
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="button" 
                    onClick={buscarPrestacao} 
                    className="btn-gradient"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Buscar Prestação
                  </Button>
                </motion.div>
              </motion.div>

              {(prestacao || (proprietarioSelecionado && contratoSelecionado && mes && ano)) && (
                <>
                  {/* Dados Financeiros */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Dados Financeiros</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="valorPago" className="text-muted-foreground">Valor Pago (R$)</Label>
                        <InputWithIcon
                          id="valorPago"
                          type="number"
                          step="0.01"
                          icon={DollarSign}
                          value={valorPago}
                          onChange={(e) => setValorPago(Number(e.target.value))}
                          placeholder="0.00"
                          className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="valorVencido" className="text-muted-foreground">Valor Vencido (R$)</Label>
                        <InputWithIcon
                          id="valorVencido"
                          type="number"
                          step="0.01"
                          icon={DollarSign}
                          value={valorVencido}
                          onChange={(e) => setValorVencido(Number(e.target.value))}
                          placeholder="0.00"
                          className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="encargos" className="text-muted-foreground">Encargos (R$)</Label>
                        <InputWithIcon
                          id="encargos"
                          type="number"
                          step="0.01"
                          icon={DollarSign}
                          value={encargos}
                          onChange={(e) => setEncargos(Number(e.target.value))}
                          placeholder="0.00"
                          className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deducoes" className="text-muted-foreground">Deduções (R$)</Label>
                        <InputWithIcon
                          id="deducoes"
                          type="number"
                          step="0.01"
                          icon={DollarSign}
                          value={deducoes}
                          onChange={(e) => setDeducoes(Number(e.target.value))}
                          placeholder="0.00"
                          className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-muted-foreground">Status</Label>
                      <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                        <SelectTrigger className="bg-muted/50 border-border text-foreground">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="pago" className="text-foreground hover:bg-accent">Pago</SelectItem>
                          <SelectItem value="pendente" className="text-foreground hover:bg-accent">Pendente</SelectItem>
                          <SelectItem value="atrasado" className="text-foreground hover:bg-accent">Atrasado</SelectItem>
                          <SelectItem value="vencido" className="text-foreground hover:bg-accent">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>

                  {/* Resumo Financeiro */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                      <Calculator className="w-5 h-5" />
                      <span>Resumo Financeiro</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-primary/10 rounded-xl border border-primary/20">
                        <p className="font-medium text-primary">Total Bruto</p>
                        <p className="text-2xl font-bold text-foreground">R$ {(valorPago + valorVencido + encargos).toFixed(2)}</p>
                      </div>
                      
                      <div className="p-6 bg-secondary/10 rounded-xl border border-secondary/20">
                        <p className="font-medium text-secondary">Total Líquido</p>
                        <p className="text-2xl font-bold text-foreground">R$ {(valorPago + valorVencido + encargos - deducoes).toFixed(2)}</p>
                      </div>
                      
                      <div className="p-6 bg-muted/50 rounded-xl border border-border">
                        <p className="font-medium text-muted-foreground">Status</p>
                        <p className={`text-lg font-semibold ${
                          status === 'pago' ? 'text-green-500 dark:text-green-400' :
                          status === 'pendente' ? 'text-yellow-500 dark:text-yellow-400' :
                          status === 'atrasado' ? 'text-orange-500 dark:text-orange-400' :
                          'text-red-500 dark:text-red-400'
                        }`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Lançamentos */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Lançamentos</span>
                      </h2>
                      <Button 
                        type="button" 
                        onClick={adicionarLancamento} 
                        size="sm" 
                        variant="outline" 
                        className="btn-outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                    
                    {lancamentos.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground bg-muted/50 rounded-xl border border-border">
                        Nenhum lançamento adicionado
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {lancamentos.map((lancamento, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 bg-white/5 rounded-xl border border-white/10"
                          >
                            <div className="space-y-2">
                              <Label className="text-muted-foreground">Tipo</Label>
                              <Select 
                                value={lancamento.tipo} 
                                onValueChange={(value: any) => atualizarLancamento(index, 'tipo', value)}
                              >
                                <SelectTrigger className="bg-muted/50 border-border text-foreground">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                  <SelectItem value="receita" className="text-foreground hover:bg-accent">Receita</SelectItem>
                                  <SelectItem value="despesa" className="text-foreground hover:bg-accent">Despesa</SelectItem>
                                  <SelectItem value="taxa" className="text-foreground hover:bg-accent">Taxa</SelectItem>
                                  <SelectItem value="desconto" className="text-foreground hover:bg-accent">Desconto</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-muted-foreground">Descrição</Label>
                              <InputWithIcon
                                icon={FileText}
                                value={lancamento.descricao}
                                onChange={(e) => atualizarLancamento(index, 'descricao', e.target.value)}
                                placeholder="Descrição"
                                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-muted-foreground">Valor (R$)</Label>
                              <InputWithIcon
                                icon={DollarSign}
                                type="number"
                                step="0.01"
                                value={lancamento.valor}
                                onChange={(e) => atualizarLancamento(index, 'valor', Number(e.target.value))}
                                placeholder="0.00"
                                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-muted-foreground">Data</Label>
                              <InputWithIcon
                                icon={Calendar}
                                type="date"
                                value={lancamento.data_lancamento || ''}
                                onChange={(e) => atualizarLancamento(index, 'data_lancamento', e.target.value)}
                                className="bg-muted/50 border-border text-foreground"
                              />
                            </div>
                            
                            <div className="flex items-end">
                              <Button 
                                type="button"
                                onClick={() => removerLancamento(index)} 
                                variant="destructive"
                                size="sm"
                                className="btn bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Observações */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Observações Manuais</span>
                    </h2>
                    
                    <div className="space-y-2">
                      <Textarea
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Adicione observações ou ajustes manuais..."
                        rows={4}
                        className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </motion.div>

                  {/* Submit Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="pt-6"
                  >
                    <div className="flex flex-wrap gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="button"
                          onClick={salvarPrestacao}
                          className="btn-gradient py-6 px-8 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-primary/25 transition-all duration-300"
                        >
                          <Calculator className="w-5 h-5 mr-2" />
                          Salvar Prestação de Contas
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          onClick={exportarExcel}
                          variant="outline"
                          className="btn-outline py-6 px-8 text-lg font-semibold rounded-xl"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Excel
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          onClick={exportarPdf}
                          variant="outline"
                          className="btn-outline py-6 px-8 text-lg font-semibold rounded-xl"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          PDF
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PrestacaoContasPage;
export { PrestacaoContasPage as PrestacaoContas };
