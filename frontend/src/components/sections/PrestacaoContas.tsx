"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/services/api";
import type { Cliente, PrestacaoContas, LancamentoPrestacao } from "@/types";
import ExportarExcelButton from "@/components/ExportarExcelButton";
import ExportarPdfButton from "@/components/ExportarPdfButton";
import toast from "react-hot-toast";

function PrestacaoContasPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
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
        const response = await apiService.listarClientes();
        setClientes(response.data || []);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        toast.error("Erro ao buscar clientes");
      }
    };
    fetchClientes();
  }, []);

  const buscarPrestacao = async () => {
    if (!clienteSelecionado || !mes || !ano) {
      toast.error("Selecione cliente, mês e ano!");
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.requestPublic(`/prestacao-contas/${clienteSelecionado.id}/${mes}/${ano}`);
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
    if (!clienteSelecionado || !mes || !ano) {
      toast.error("Selecione cliente, mês e ano!");
      return;
    }

    const totalBruto = valorPago + valorVencido + encargos;
    const totalLiquido = totalBruto - deducoes;

    const dadosPrestacao: Partial<PrestacaoContas> = {
      cliente_id: clienteSelecionado.id,
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
    if (!clienteSelecionado || !mes || !ano) {
      toast.error("Selecione cliente, mês e ano!");
      return;
    }
    
    try {
      const response = await apiService.requestPublic(`/prestacao-contas/export/excel/${clienteSelecionado.id}/${mes}/${ano}`, {
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
    if (!clienteSelecionado || !mes || !ano) {
      toast.error("Selecione cliente, mês e ano!");
      return;
    }
    
    try {
      const response = await apiService.requestPublic(`/prestacao-contas/export/pdf/${clienteSelecionado.id}/${mes}/${ano}`, {
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Prestação de Contas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Cliente</Label>
          <Select
            onValueChange={(value) => {
              const cliente = clientes.find((c) => c.id?.toString() === value);
              setClienteSelecionado(cliente || null);
            }}
            value={clienteSelecionado?.id?.toString() || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id?.toString() || ''}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Mês</Label>
          <Select onValueChange={setMes} value={mes}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const m = (i + 1).toString().padStart(2, "0");
                return (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Ano</Label>
          <Select onValueChange={setAno} value={ano}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025].map((a) => (
                <SelectItem key={a} value={a.toString()}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={buscarPrestacao} className="mt-4">
        Buscar Prestação
      </Button>

      {loading && <div className="mt-4 text-sm text-muted-foreground">Carregando dados da prestação de contas...</div>}

      {(prestacao || (clienteSelecionado && mes && ano)) && (
        <div className="mt-6 space-y-6">
          {/* Inputs dos Valores */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Financeiros</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="valorPago">Valor Pago (R$)</Label>
                <Input
                  id="valorPago"
                  type="number"
                  step="0.01"
                  value={valorPago}
                  onChange={(e) => setValorPago(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="valorVencido">Valor Vencido (R$)</Label>
                <Input
                  id="valorVencido"
                  type="number"
                  step="0.01"
                  value={valorVencido}
                  onChange={(e) => setValorVencido(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="encargos">Encargos (R$)</Label>
                <Input
                  id="encargos"
                  type="number"
                  step="0.01"
                  value={encargos}
                  onChange={(e) => setEncargos(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="deducoes">Deduções (R$)</Label>
                <Input
                  id="deducoes"
                  type="number"
                  step="0.01"
                  value={deducoes}
                  onChange={(e) => setDeducoes(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Totais Calculados */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-700">Total Bruto</p>
                  <p className="text-2xl font-bold text-blue-900">R$ {(valorPago + valorVencido + encargos).toFixed(2)}</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-700">Total Líquido</p>
                  <p className="text-2xl font-bold text-green-900">R$ {(valorPago + valorVencido + encargos - deducoes).toFixed(2)}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700">Status</p>
                  <p className={`text-lg font-semibold ${
                    status === 'pago' ? 'text-green-600' :
                    status === 'pendente' ? 'text-yellow-600' :
                    status === 'atrasado' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lançamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Lançamentos</span>
                <Button onClick={adicionarLancamento} size="sm">+ Adicionar</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lancamentos.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum lançamento adicionado</p>
              ) : (
                <div className="space-y-4">
                  {lancamentos.map((lancamento, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label>Tipo</Label>
                        <Select 
                          value={lancamento.tipo} 
                          onValueChange={(value: any) => atualizarLancamento(index, 'tipo', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="receita">Receita</SelectItem>
                            <SelectItem value="despesa">Despesa</SelectItem>
                            <SelectItem value="taxa">Taxa</SelectItem>
                            <SelectItem value="desconto">Desconto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Descrição</Label>
                        <Input
                          value={lancamento.descricao}
                          onChange={(e) => atualizarLancamento(index, 'descricao', e.target.value)}
                          placeholder="Descrição"
                        />
                      </div>
                      
                      <div>
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={lancamento.valor}
                          onChange={(e) => atualizarLancamento(index, 'valor', Number(e.target.value))}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div>
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={lancamento.data_lancamento || ''}
                          onChange={(e) => atualizarLancamento(index, 'data_lancamento', e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <Button 
                          onClick={() => removerLancamento(index)} 
                          variant="destructive"
                          size="sm"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações Manuais</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações ou ajustes manuais..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={salvarPrestacao} className="bg-green-600 hover:bg-green-700">
              Salvar Prestação de Contas
            </Button>
            <ExportarExcelButton onClick={exportarExcel} />
            <ExportarPdfButton onClick={exportarPdf} />
          </div>
        </div>
      )}
    </div>
  );
}

export default PrestacaoContasPage;
export { PrestacaoContasPage as PrestacaoContas };
