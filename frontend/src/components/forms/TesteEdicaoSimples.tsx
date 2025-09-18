import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, DollarSign, CreditCard, Check } from 'lucide-react';
import { getApiUrl } from '../../config/api';

interface Fatura {
  id: number;
  numero_fatura: string;
  valor_total: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: string;
  mes_referencia: string;
  locatario_nome: string;
  imovel_endereco: string;
  contrato_numero: string;
}

interface DadosPagamento {
  data_pagamento: string;
  valor_pago: number;
  forma_pagamento: string;
  observacoes: string;
}

export const TesteEdicaoSimples: React.FC = () => {
  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [dadosPagamento, setDadosPagamento] = useState<DadosPagamento>({
    data_pagamento: new Date().toISOString().split('T')[0], // Data de hoje por padrão
    valor_pago: 0,
    forma_pagamento: '',
    observacoes: ''
  });

  // Obter ID da fatura da URL
  const obterIdFaturaDaURL = () => {
    const path = window.location.pathname;
    const match = path.match(/\/prestacao-contas\/editar\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  // Buscar dados da fatura
  const buscarFatura = async () => {
    const faturaId = obterIdFaturaDaURL();

    if (!faturaId) {
      toast.error('ID da fatura não encontrado na URL');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`/faturas?id=${faturaId}`));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const faturaEncontrada = data.data.find((f: Fatura) => f.id === faturaId);

        if (faturaEncontrada) {
          setFatura(faturaEncontrada);
          setDadosPagamento(prev => ({
            ...prev,
            valor_pago: faturaEncontrada.valor_total
          }));
        } else {
          toast.error('Fatura não encontrada');
        }
      } else {
        toast.error('Erro ao carregar dados da fatura');
      }
    } catch (error) {
      console.error('Erro ao buscar fatura:', error);
      toast.error('Erro ao carregar fatura');
    } finally {
      setLoading(false);
    }
  };

  // Registrar pagamento
  const registrarPagamento = async () => {
    if (!fatura) return;

    // Validações
    if (!dadosPagamento.data_pagamento) {
      toast.error('Data de pagamento é obrigatória');
      return;
    }

    if (dadosPagamento.valor_pago <= 0) {
      toast.error('Valor pago deve ser maior que zero');
      return;
    }

    if (!dadosPagamento.forma_pagamento) {
      toast.error('Forma de pagamento é obrigatória');
      return;
    }

    try {
      setSalvando(true);

      // Atualizar fatura para status "paga" e definir data de pagamento
      const response = await fetch(getApiUrl(`/faturas/${fatura.id}/pagamento`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data_pagamento: dadosPagamento.data_pagamento,
          valor_pago: dadosPagamento.valor_pago,
          forma_pagamento: dadosPagamento.forma_pagamento,
          observacoes: dadosPagamento.observacoes
        })
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          toast.success(`Pagamento registrado com sucesso! Fatura ${fatura.numero_fatura} marcada como paga.`);

          // Voltar para a lista de prestação de contas
          setTimeout(() => {
            window.location.href = '/prestacao-contas';
          }, 1500);
        } else {
          throw new Error(result.message || 'Erro ao registrar pagamento');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
    } finally {
      setSalvando(false);
    }
  };

  useEffect(() => {
    buscarFatura();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'aberta': { label: 'Aberta', color: 'bg-blue-100 text-blue-800' },
      'paga': { label: 'Paga', color: 'bg-green-100 text-green-800' },
      'pendente': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      'em_atraso': { label: 'Em Atraso', color: 'bg-red-100 text-red-800' },
      'cancelada': { label: 'Cancelada', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;

    return (
      <Badge className={`${config.color} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados da fatura...</p>
        </div>
      </div>
    );
  }

  if (!fatura) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-lg text-muted-foreground">Fatura não encontrada</p>
          <Button
            onClick={() => window.location.href = '/prestacao-contas'}
            className="mt-4"
          >
            Voltar para Prestação de Contas
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.location.href = '/prestacao-contas'}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Registrar Pagamento
              </h1>
              <p className="text-muted-foreground">
                Fatura {fatura.numero_fatura} - {fatura.mes_referencia}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Detalhes da Fatura */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Detalhes da Fatura
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Número</Label>
                    <p className="font-medium">{fatura.numero_fatura}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(fatura.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Locatário</Label>
                  <p className="font-medium">{fatura.locatario_nome}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Endereço</Label>
                  <p className="font-medium">{fatura.imovel_endereco}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Valor Total</Label>
                    <p className="font-semibold text-lg text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(fatura.valor_total)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Data Vencimento</Label>
                    <p className="font-medium">
                      {new Date(fatura.data_vencimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Formulário de Pagamento */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Check className="w-5 h-5 mr-2" />
                Dados do Pagamento
              </h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="data_pagamento" className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Data do Pagamento
                  </Label>
                  <Input
                    id="data_pagamento"
                    type="date"
                    value={dadosPagamento.data_pagamento}
                    onChange={(e) => setDadosPagamento(prev => ({
                      ...prev,
                      data_pagamento: e.target.value
                    }))}
                    max={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="valor_pago" className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Valor Pago
                  </Label>
                  <Input
                    id="valor_pago"
                    type="number"
                    step="0.01"
                    value={dadosPagamento.valor_pago}
                    onChange={(e) => setDadosPagamento(prev => ({
                      ...prev,
                      valor_pago: parseFloat(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                  <Select
                    value={dadosPagamento.forma_pagamento}
                    onValueChange={(value) => setDadosPagamento(prev => ({
                      ...prev,
                      forma_pagamento: value
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto Bancário</SelectItem>
                      <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                      <SelectItem value="deposito">Depósito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Textarea
                    id="observacoes"
                    value={dadosPagamento.observacoes}
                    onChange={(e) => setDadosPagamento(prev => ({
                      ...prev,
                      observacoes: e.target.value
                    }))}
                    placeholder="Informações adicionais sobre o pagamento..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={registrarPagamento}
                  disabled={salvando}
                  className="w-full"
                  size="lg"
                >
                  {salvando ? 'Salvando...' : 'Registrar Pagamento'}
                </Button>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TesteEdicaoSimples;