import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { 
  Calculator, 
  FileText, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  Download,
  Mail,
  Loader2,
  Plus,
  Eye,
  Settings
} from 'lucide-react';
import { boletosApiService } from '../../services/boletosApi';
import { apiService } from '../../services/api';
import type { Boleto, GerarBoletoRequest } from '../../types';
import toast from 'react-hot-toast';

interface Contrato {
  id: number;
  locatario_nome: string;
  imovel_endereco: string;
  valor_aluguel: number;
  vencimento_dia: number;
  status: string;
}

export const GeradorBoletos: React.FC = () => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [contratosSelecionados, setContratosSelecionados] = useState<number[]>([]);
  const [mesReferencia, setMesReferencia] = useState(new Date().getMonth() + 1);
  const [anoReferencia, setAnoReferencia] = useState(new Date().getFullYear());
  const [diaVencimento, setDiaVencimento] = useState(10);
  const [loading, setLoading] = useState(false);
  const [carregandoContratos, setCarregandoContratos] = useState(true);
  const [modoGeracao, setModoGeracao] = useState<'individual' | 'lote'>('lote');
  const [contratoIndividual, setContratoIndividual] = useState<number | null>(null);

  // Estados para resultados
  const [boletosGerados, setBoletosGerados] = useState<{
    sucessos: number;
    erros: string[];
    detalhes: any[];
  }>({
    sucessos: 0,
    erros: [],
    detalhes: []
  });

  useEffect(() => {
    carregarContratos();
  }, []);

  const carregarContratos = async () => {
    try {
      setCarregandoContratos(true);
      const response = await apiService.listarContratos();
      
      if (response.success && response.data) {
        // Filtrar apenas contratos ativos
        const contratosAtivos = response.data
          .filter((c: any) => c.status === 'ATIVO' || c.status === 'ativo')
          .map((c: any) => ({
            id: c.id,
            locatario_nome: c.locatario_nome || 'Nome não informado',
            imovel_endereco: c.imovel_endereco || 'Endereço não informado',
            valor_aluguel: c.valor_aluguel || 0,
            vencimento_dia: c.vencimento_dia || 10,
            status: c.status
          }));
        
        setContratos(contratosAtivos);
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      toast.error('Erro ao carregar contratos');
    } finally {
      setCarregandoContratos(false);
    }
  };

  const handleGerarBoletos = async () => {
    if (modoGeracao === 'lote' && contratosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um contrato');
      return;
    }

    if (modoGeracao === 'individual' && !contratoIndividual) {
      toast.error('Selecione um contrato');
      return;
    }

    setLoading(true);
    
    try {
      if (modoGeracao === 'individual' && contratoIndividual) {
        // Gerar boleto individual
        const dataVencimento = boletosApiService.calcularProximaDataVencimento(
          diaVencimento, 
          mesReferencia, 
          anoReferencia
        );

        const dados: GerarBoletoRequest = {
          contrato_id: contratoIndividual,
          mes_referencia: mesReferencia,
          ano_referencia: anoReferencia,
          data_vencimento: dataVencimento
        };

        const response = await boletosApiService.gerarBoleto(dados);
        
        if (response.success) {
          setBoletosGerados({
            sucessos: 1,
            erros: [],
            detalhes: [response.data]
          });
          toast.success('Boleto gerado com sucesso!');
        }
      } else {
        // Gerar boletos em lote
        const resultado = await boletosApiService.gerarLoteBoletos(
          contratosSelecionados,
          mesReferencia,
          anoReferencia,
          diaVencimento
        );

        setBoletosGerados({
          sucessos: resultado.sucessos,
          erros: resultado.erros,
          detalhes: []
        });

        if (resultado.sucessos > 0) {
          toast.success(`${resultado.sucessos} boleto(s) gerado(s) com sucesso!`);
        }

        if (resultado.erros.length > 0) {
          toast.error(`${resultado.erros.length} erro(s) encontrado(s)`);
        }
      }
    } catch (error) {
      console.error('Erro ao gerar boletos:', error);
      toast.error('Erro ao gerar boletos');
    } finally {
      setLoading(false);
    }
  };

  const toggleContratoSelecionado = (contratoId: number) => {
    setContratosSelecionados(prev => 
      prev.includes(contratoId)
        ? prev.filter(id => id !== contratoId)
        : [...prev, contratoId]
    );
  };

  const selecionarTodosContratos = () => {
    if (contratosSelecionados.length === contratos.length) {
      setContratosSelecionados([]);
    } else {
      setContratosSelecionados(contratos.map(c => c.id));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <span>Gerador de Boletos</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Sistema avançado de geração de boletos para locatários
            </p>
          </div>
        </div>

        {/* Configurações de Geração */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-500" />
              <span>Configurações de Geração</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Modo de Geração */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Modo de Geração</Label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="modoGeracao"
                    value="lote"
                    checked={modoGeracao === 'lote'}
                    onChange={(e) => setModoGeracao(e.target.value as 'lote')}
                    className="text-blue-500"
                  />
                  <span>Geração em Lote</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="modoGeracao"
                    value="individual"
                    checked={modoGeracao === 'individual'}
                    onChange={(e) => setModoGeracao(e.target.value as 'individual')}
                    className="text-blue-500"
                  />
                  <span>Boleto Individual</span>
                </label>
              </div>
            </div>

            {/* Configurações do Período */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Mês de Referência</Label>
                <Select value={mesReferencia.toString()} onValueChange={(value) => setMesReferencia(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map(mes => (
                      <SelectItem key={mes.valor} value={mes.valor.toString()}>
                        {mes.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ano de Referência</Label>
                <Input
                  type="number"
                  value={anoReferencia}
                  onChange={(e) => setAnoReferencia(Number(e.target.value))}
                  min={2020}
                  max={2030}
                />
              </div>

              <div className="space-y-2">
                <Label>Dia de Vencimento</Label>
                <Input
                  type="number"
                  value={diaVencimento}
                  onChange={(e) => setDiaVencimento(Number(e.target.value))}
                  min={1}
                  max={31}
                />
              </div>
            </div>

            {/* Seleção de Contrato Individual */}
            {modoGeracao === 'individual' && (
              <div className="space-y-2">
                <Label>Selecionar Contrato</Label>
                <Select value={contratoIndividual?.toString() || ''} onValueChange={(value) => setContratoIndividual(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    {contratos.map(contrato => (
                      <SelectItem key={contrato.id} value={contrato.id.toString()}>
                        {contrato.locatario_nome} - {contrato.imovel_endereco} ({formatCurrency(contrato.valor_aluguel)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Contratos (modo lote) */}
        {modoGeracao === 'lote' && (
          <Card className="card-glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span>Contratos Disponíveis</span>
                  <Badge variant="secondary">
                    {contratosSelecionados.length} de {contratos.length} selecionados
                  </Badge>
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={selecionarTodosContratos}
                  disabled={carregandoContratos}
                >
                  {contratosSelecionados.length === contratos.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {carregandoContratos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span>Carregando contratos...</span>
                  </div>
                </div>
              ) : contratos.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum contrato ativo encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {contratos.map(contrato => (
                    <motion.div
                      key={contrato.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer transition-all duration-200 ${
                        contratosSelecionados.includes(contrato.id)
                          ? 'ring-2 ring-blue-500 shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                    >
                      <Card
                        className={`${
                          contratosSelecionados.includes(contrato.id)
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200'
                            : 'border-gray-200'
                        }`}
                        onClick={() => toggleContratoSelecionado(contrato.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={contratosSelecionados.includes(contrato.id)}
                                readOnly
                              />
                              <Badge variant="outline">CTR-{contrato.id}</Badge>
                            </div>
                            <Badge variant={contrato.status === 'ATIVO' ? 'default' : 'secondary'}>
                              {contrato.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {contrato.locatario_nome}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              {contrato.imovel_endereco}
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="text-sm text-gray-500">Valor:</span>
                              <span className="font-bold text-green-600">
                                {formatCurrency(contrato.valor_aluguel)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botão de Geração */}
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Gerar Boletos</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {modoGeracao === 'individual' 
                    ? 'Clique para gerar o boleto individual'
                    : `${contratosSelecionados.length} contrato(s) selecionado(s) para ${meses.find(m => m.valor === mesReferencia)?.nome}/${anoReferencia}`
                  }
                </p>
              </div>
              
              <Button
                onClick={handleGerarBoletos}
                disabled={loading || (modoGeracao === 'lote' && contratosSelecionados.length === 0) || (modoGeracao === 'individual' && !contratoIndividual)}
                size="lg"
                className="px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Gerar Boletos
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {(boletosGerados.sucessos > 0 || boletosGerados.erros.length > 0) && (
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Resultados da Geração</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {boletosGerados.sucessos > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      {boletosGerados.sucessos} boleto(s) gerado(s) com sucesso!
                    </span>
                  </div>
                </div>
              )}

              {boletosGerados.erros.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="space-y-2">
                      <span className="font-medium text-red-800 dark:text-red-200">
                        {boletosGerados.erros.length} erro(s) encontrado(s):
                      </span>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                        {boletosGerados.erros.map((erro, index) => (
                          <li key={index}>• {erro}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default GeradorBoletos;