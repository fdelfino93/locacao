import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, Trash2, Calculator, FileText, User, Building, Calendar, DollarSign, Loader2, X, Eye, Receipt, Hash } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Fatura } from "@/types";
import toast from "react-hot-toast";

// Utilitários
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

const EdicaoFatura: React.FC = () => {
  // Extrair ID da fatura da URL
  const getFaturaIdFromURL = () => {
    const path = window.location.pathname;
    const match = path.match(/\/prestacao-contas\/editar\/(\d+)/);
    return match ? match[1] : null;
  };
  
  const faturaId = getFaturaIdFromURL();
  
  const navigateToPage = (page: string) => {
    window.history.pushState({}, '', page);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [novoLancamento, setNovoLancamento] = useState({
    tipo: 'receita',
    descricao: '',
    valor: 0
  });
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);

  // Buscar dados da fatura
  useEffect(() => {
    const buscarFatura = async () => {
      if (!faturaId) {
        toast.error('ID da fatura não encontrado');
        navigateToPage('/prestacao-contas');
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Buscando fatura ID:', faturaId);
        
        // Para desenvolvimento, usar dados mock
        // Em produção, substituir por chamada real da API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
        
        const faturaData = {
          id: parseInt(faturaId),
          numero_fatura: `FAT-${faturaId.padStart(4, '0')}`,
          valor_total: 1850.00,
          status: 'aberta',
          data_vencimento: '2024-02-15',
          data_emissao: '2024-01-15',
          mes_referencia: '2024-02',
          referencia_display: 'Fevereiro/2024',
          // Dados do locatário
          locatario_nome: 'João Silva Santos',
          locatario_email: 'joao.silva@email.com',
          locatario_telefone: '(11) 99999-1111',
          // Dados do proprietário
          proprietario_nome: 'Maria Oliveira Lima',
          proprietario_email: 'maria.oliveira@email.com',
          proprietario_telefone: '(11) 98765-4321',
          // Dados do imóvel
          imovel_endereco: 'Rua das Flores, 123 - Centro',
          imovel_tipo: 'Apartamento',
          // Lançamentos
          lancamentos: [
            { id: 1, tipo: 'receita', descricao: 'Aluguel', valor: 1500.00 },
            { id: 2, tipo: 'receita', descricao: 'Condomínio', valor: 280.00 },
            { id: 3, tipo: 'receita', descricao: 'IPTU', valor: 150.00 },
            { id: 4, tipo: 'despesa', descricao: 'Taxa Administração (10%)', valor: 150.00 },
            { id: 5, tipo: 'despesa', descricao: 'Taxa Boleto', valor: 2.50 }
          ]
        };
        
        setFatura(faturaData);
        setLancamentos(faturaData.lancamentos || []);
        
      } catch (error) {
        console.error('Erro ao buscar fatura:', error);
        toast.error('Erro ao carregar fatura');
      } finally {
        setLoading(false);
      }
    };

    buscarFatura();
  }, [faturaId]);

  const adicionarLancamento = () => {
    if (!novoLancamento.descricao || novoLancamento.valor <= 0) {
      toast.error('Preencha todos os campos do lançamento');
      return;
    }

    const novoId = Date.now();
    const lancamento = {
      id: novoId,
      ...novoLancamento
    };

    setLancamentos([...lancamentos, lancamento]);
    setNovoLancamento({ tipo: 'receita', descricao: '', valor: 0 });
    setMostrandoFormulario(false);
    toast.success('Lançamento adicionado!');
  };

  const removerLancamento = (id: number) => {
    setLancamentos(lancamentos.filter(l => l.id !== id));
    toast.success('Lançamento removido!');
  };

  const calcularTotal = () => {
    const receitas = lancamentos.filter(l => l.tipo === 'receita').reduce((sum, l) => sum + l.valor, 0);
    const despesas = lancamentos.filter(l => l.tipo === 'despesa').reduce((sum, l) => sum + l.valor, 0);
    return receitas - despesas;
  };

  const salvarFatura = async () => {
    try {
      setSaving(true);
      console.log('💾 Salvando fatura:', { fatura, lancamentos });
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Fatura salva com sucesso!');
      navigateToPage('/prestacao-contas');
      
    } catch (error) {
      console.error('Erro ao salvar fatura:', error);
      toast.error('Erro ao salvar fatura');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="flex items-center space-x-3 text-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xl font-medium">Carregando dados da fatura...</span>
        </div>
      </div>
    );
  }

  if (!fatura) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-muted/50 rounded-xl w-fit mx-auto mb-6">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-3">Fatura não encontrada</h3>
          <p className="text-sm text-muted-foreground mb-6">
            A fatura solicitada não foi encontrada ou não existe.
          </p>
          <Button 
            onClick={() => navigateToPage('/prestacao-contas')}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Lista
          </Button>
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
                  onClick={() => navigateToPage('/prestacao-contas')}
                  variant="outline"
                  size="lg"
                  className="btn-outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Edição de Fatura
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {fatura.numero_fatura} - {formatDate(fatura.data_vencimento)}
                  </p>
                </div>
              </div>
              <Button 
                onClick={salvarFatura}
                disabled={saving}
                size="lg"
                className="btn-gradient"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>

          {/* 1. Informações da Fatura */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="card-glass mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        1. Informações da Fatura
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Dados principais da prestação de contas
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(fatura.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Número da Fatura</Label>
                      </div>
                      <p className="text-lg font-bold text-foreground">{fatura.numero_fatura}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Referência</Label>
                      </div>
                      <p className="text-lg font-bold text-foreground">{fatura.referencia_display}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Locatário</Label>
                      </div>
                      <p className="text-lg font-bold text-foreground">{fatura.locatario_nome}</p>
                      <p className="text-sm text-muted-foreground">{fatura.locatario_email}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Imóvel</Label>
                      </div>
                      <p className="text-lg font-bold text-foreground">{fatura.imovel_endereco}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Vencimento</Label>
                      </div>
                      <p className="text-lg font-bold text-foreground">{formatDate(fatura.data_vencimento)}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Valor Total</Label>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(calcularTotal())}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2. Lançamentos da Fatura */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="card-glass mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calculator className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        2. Lançamentos da Fatura
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Receitas e despesas da prestação
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {lancamentos.length} lançamentos
                    </Badge>
                    <Button
                      onClick={() => setMostrandoFormulario(!mostrandoFormulario)}
                      size="sm"
                      className="btn-gradient"
                    >
                      {mostrandoFormulario ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Formulário para Novo Lançamento */}
                {mostrandoFormulario && (
                  <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30 mb-6">
                    <h4 className="font-medium text-foreground mb-4">Novo Lançamento</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Tipo</Label>
                        <Select 
                          value={novoLancamento.tipo}
                          onValueChange={(value) => setNovoLancamento({...novoLancamento, tipo: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="receita">Receita</SelectItem>
                            <SelectItem value="despesa">Despesa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">Descrição</Label>
                        <input 
                          type="text"
                          placeholder="Ex: Aluguel, Taxa administrativa..."
                          value={novoLancamento.descricao}
                          onChange={(e) => setNovoLancamento({...novoLancamento, descricao: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Valor</Label>
                        <input 
                          type="number"
                          placeholder="0,00"
                          step="0.01"
                          value={novoLancamento.valor}
                          onChange={(e) => setNovoLancamento({...novoLancamento, valor: parseFloat(e.target.value) || 0})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button onClick={adicionarLancamento} className="btn-gradient">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Lançamento
                      </Button>
                    </div>
                  </div>
                )}

                {/* Lista de Lançamentos */}
                <div className="space-y-3">
                  {lancamentos.length > 0 ? (
                    lancamentos.map((lancamento) => (
                      <motion.div 
                        key={lancamento.id}
                        className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
                        whileHover={{ scale: 1.01 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`px-2 py-1 text-xs rounded-full font-medium ${
                            lancamento.tipo === 'receita' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {lancamento.tipo}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{lancamento.descricao}</p>
                            <p className="text-xs text-muted-foreground">
                              {lancamento.tipo === 'receita' ? 'Entrada' : 'Saída'} de recursos
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`font-bold text-lg ${
                            lancamento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {lancamento.tipo === 'receita' ? '+' : '-'} {formatCurrency(lancamento.valor)}
                          </span>
                          <Button 
                            onClick={() => removerLancamento(lancamento.id)}
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
                      <div className="p-4 bg-muted/50 rounded-xl w-fit mx-auto mb-6">
                        <Calculator className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-base font-bold text-foreground mb-3">Nenhum lançamento</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Esta fatura ainda não possui lançamentos registrados
                      </p>
                      <Button 
                        onClick={() => setMostrandoFormulario(true)}
                        className="btn-gradient"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Lançamento
                      </Button>
                    </div>
                  )}
                </div>

                {/* Totais */}
                {lancamentos.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <Label className="text-sm font-medium text-green-800 dark:text-green-300">Receitas</Label>
                        </div>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(lancamentos.filter(l => l.tipo === 'receita').reduce((sum, l) => sum + l.valor, 0))}
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <Label className="text-sm font-medium text-red-800 dark:text-red-300">Despesas</Label>
                        </div>
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(lancamentos.filter(l => l.tipo === 'despesa').reduce((sum, l) => sum + l.valor, 0))}
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calculator className="w-4 h-4 text-primary" />
                          <Label className="text-sm font-medium text-primary">Total Líquido</Label>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(calcularTotal())}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default EdicaoFatura;