import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { CurrencyInput } from '../ui/currency-input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { 
  FileText, 
  User, 
  Users, 
  Building, 
  Calendar,
  DollarSign,
  Shield,
  Settings,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Percent,
  Heart,
  Banknote,
  Clock,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Upload,
  File,
  Download,
  X,
  Palette,
  TreePine,
  Sparkles,
  Wrench,
  Eye,
  ArrowLeft
} from 'lucide-react';
import type { Contrato, ContratoLocador, ContratoLocatario } from '../../types';
import { apiService } from '../../services/api';
import { useFormSectionsData } from '../../hooks/useFormData';
import { ContractLandlordsForm } from './ContractLandlordsForm';
import { ContractTenantsForm } from './ContractTenantsForm';
import { ContractPropertyForm } from './ContractPropertyForm';

interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
}

interface Inquilino {
  id: number;
  nome: string;
  cpf_cnpj: string;
}

interface Imovel {
  id: number;
  endereco: string;
}

interface ModernContratoFormProps {
  onBack?: () => void;
  isViewing?: boolean;
  isEditing?: boolean;
}

export const ModernContratoForm: React.FC<ModernContratoFormProps> = ({ 
  onBack, 
  isViewing = false, 
  isEditing = false 
}) => {
  // Se for modo visualizar/editar, implementar carregamento de dados
  if (isViewing || isEditing) {
    const [loadingData, setLoadingData] = useState(true);
    const [contratoData, setContratoData] = useState<any>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
      const loadContrato = async () => {
        try {
          setLoadingData(true);
          setApiError(null);
          
          // Extrair ID da URL
          const path = window.location.pathname;
          const contratoIdMatch = path.match(/\/contrato\/(visualizar|editar)\/(\d+)/);
          
          if (contratoIdMatch) {
            const contratoId = parseInt(contratoIdMatch[2]);
            console.log('Carregando contrato ID:', contratoId);
            
            const response = await fetch(`http://localhost:8000/api/contratos/${contratoId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                setContratoData(data.data);
                console.log('Dados carregados:', data.data);
              } else {
                setApiError('Contrato não encontrado');
              }
            } else {
              setApiError('Erro ao carregar contrato');
            }
          } else {
            setApiError('ID do contrato não encontrado na URL');
          }
        } catch (error) {
          console.error('Erro:', error);
          setApiError('Erro de conexão');
        } finally {
          setLoadingData(false);
        }
      };

      loadContrato();
    }, []);


    // Função para atualizar dados do contrato no modo editar
    const handleContratoInputChange = (field: string, value: any) => {
      setContratoData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    // Função para atualizar dados bancários do corretor
    const handleBancarioCorretor = (field: string, value: any) => {
      setContratoData(prev => ({
        ...prev,
        dados_bancarios_corretor: {
          ...prev.dados_bancarios_corretor,
          [field]: value
        }
      }));
    };

    // Função para atualizar dados da caução
    const handleCaucao = (field: string, value: any) => {
      setContratoData(prev => ({
        ...prev,
        caucao: {
          ...prev.caucao,
          [field]: value
        }
      }));
    };

    // Função simples para salvar (apenas para modo editar)
    const handleSaveContract = async () => {
      if (!isEditing || !contratoData?.id) return;
      
      try {
        const response = await fetch(`http://localhost:8000/api/contratos/${contratoData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contratoData),
        });
        
        if (response.ok) {
          alert('Contrato atualizado com sucesso!');
        } else {
          alert('Erro ao atualizar contrato');
        }
      } catch (error) {
        alert('Erro de conexão');
      }
    };

    // Tela de carregamento
    if (loadingData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card-glass rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
                <h1 className="text-2xl font-bold text-primary-foreground">
                  Carregando Contrato...
                </h1>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-foreground">Carregando dados...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Tela de erro
    if (apiError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card-glass rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-destructive to-destructive/90 px-8 py-6">
                <h1 className="text-2xl font-bold text-destructive-foreground">
                  Erro ao Carregar
                </h1>
              </div>
              <div className="p-8">
                <p className="text-foreground mb-4">{apiError}</p>
                {onBack && (
                  <Button onClick={onBack}>
                    Voltar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Tela principal com dados carregados
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-glass rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-primary-foreground">
                    {isViewing ? 'Visualizar Contrato' : 'Editar Contrato'}
                  </h1>
                  {contratoData && (
                    <p className="text-primary-foreground/80">
                      Contrato #{contratoData.numero_contrato || contratoData.id}
                    </p>
                  )}
                </div>
                
                {onBack && (
                  <Button 
                    variant="outline" 
                    onClick={onBack}
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                )}
              </div>
            </div>
            <div className="p-8">
              {/* Status do contrato */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${contratoData?.ativo !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">
                    Status: {contratoData?.ativo !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {contratoData?.data_fim && (
                  <span className="text-muted-foreground">
                    Válido até: {contratoData.data_fim}
                  </span>
                )}
              </div>

              {contratoData && (
                <form className="space-y-8">
                  <Tabs defaultValue="partes" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="partes">Partes</TabsTrigger>
                      <TabsTrigger value="datas">Datas e Reajustes</TabsTrigger>
                      <TabsTrigger value="valores">Valores e Encargos</TabsTrigger>
                      <TabsTrigger value="garantias">Garantias</TabsTrigger>
                      <TabsTrigger value="plano">Plano</TabsTrigger>
                      <TabsTrigger value="clausulas">Cláusulas</TabsTrigger>
                    </TabsList>

                    {/* Aba 1: Partes do Contrato */}
                    <TabsContent value="partes" className="space-y-8">
                      {/* Header da Seção */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center space-y-4"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <Users className="w-6 h-6 text-white" />
                          </motion.div>
                          <div>
                            <h2 className="text-2xl font-bold text-foreground">
                              ✅ Etapa 4: Estrutura idêntica ao cadastro
                            </h2>
                            <p className="text-muted-foreground">
                              Definir as partes envolvidas no contrato
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Campos básicos para teste */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Número do Contrato</Label>
                          <InputWithIcon
                            value={contratoData.numero_contrato || ''}
                            icon={FileText}
                            disabled={isViewing}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Data de Início</Label>
                          <InputWithIcon
                            type="date"
                            value={contratoData.data_inicio || ''}
                            icon={Calendar}
                            disabled={isViewing}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Imóvel e Locatário */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Imóvel</Label>
                          <InputWithIcon
                            value={contratoData.imovel_endereco || 'N/A'}
                            icon={Building}
                            disabled={true}
                            className="w-full bg-muted"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Locatário</Label>
                          <InputWithIcon
                            value={contratoData.locatario_nome || 'N/A'}
                            icon={User}
                            disabled={true}
                            className="w-full bg-muted"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Outras abas - implementar nas próximas etapas */}
                    <TabsContent value="datas" className="space-y-8">
                      {/* Datas do Contrato - EXATO COMO NO CADASTRO */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <Calendar className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Datas do Contrato
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Configure as datas importantes do contrato, incluindo período de vigência e cálculo automático.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="data_assinatura">Data de Assinatura *</Label>
                            <InputWithIcon
                              id="data_assinatura"
                              type="date"
                              icon={Calendar}
                              value={contratoData.data_assinatura || ''}
                              disabled={isViewing}
                            />
                            <p className="text-xs text-muted-foreground">Não pode ser uma data futura</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="data_entrega_chaves">Data de Entrega das Chaves</Label>
                            <InputWithIcon
                              id="data_entrega_chaves"
                              type="date"
                              icon={Calendar}
                              value={contratoData.data_entrega_chaves || ''}
                              disabled={isViewing}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="vencimento_dia">Dia do Vencimento do Aluguel</Label>
                            <InputWithIcon
                              id="vencimento_dia"
                              type="number"
                              min="1"
                              max="31"
                              icon={Calendar}
                              value={contratoData.vencimento_dia || ''}
                              disabled={isViewing}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="data_inicio">Data de Início do Contrato *</Label>
                            <InputWithIcon
                              id="data_inicio"
                              type="date"
                              icon={Calendar}
                              value={contratoData.data_inicio || ''}
                              disabled={isViewing}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="periodo_contrato">Período do Contrato (meses)</Label>
                            <Select disabled={isViewing}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={contratoData.periodo_contrato ? `${contratoData.periodo_contrato} meses` : "12 meses"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="6">6 meses</SelectItem>
                                <SelectItem value="12">12 meses</SelectItem>
                                <SelectItem value="24">24 meses</SelectItem>
                                <SelectItem value="36">36 meses</SelectItem>
                                <SelectItem value="48">48 meses</SelectItem>
                                <SelectItem value="60">60 meses</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="data_fim">Data de Fim do Contrato</Label>
                            <InputWithIcon
                              id="data_fim"
                              type="date"
                              icon={Calendar}
                              value={contratoData.data_fim || ''}
                              disabled={true}
                              className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Seção de Reajustes - FALTAVA ESTA SEÇÃO */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-red-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowUp className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Reajustes e Renovação
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Configure periodicidade e índices de reajuste
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="tempo_renovacao">Período de Renovação (meses)</Label>
                            <Select disabled={isViewing}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={contratoData.tempo_renovacao ? `${contratoData.tempo_renovacao} meses` : "12 meses"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12">12 meses</SelectItem>
                                <SelectItem value="24">24 meses</SelectItem>
                                <SelectItem value="36">36 meses</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tempo_reajuste">Período de Reajuste (meses)</Label>
                            <Select disabled={isViewing}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={contratoData.tempo_reajuste ? `${contratoData.tempo_reajuste} meses` : "12 meses"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12">12 meses</SelectItem>
                                <SelectItem value="6">6 meses</SelectItem>
                                <SelectItem value="24">24 meses</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="indice_reajuste">Índice de Reajuste</Label>
                            <Select disabled={isViewing}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={contratoData.indice_reajuste || "IPCA"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IPCA">IPCA</SelectItem>
                                <SelectItem value="IGPM">IGP-M</SelectItem>
                                <SelectItem value="INPC">INPC</SelectItem>
                                <SelectItem value="IPC">IPC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="percentual_reajuste">Percentual de Reajuste (%)</Label>
                            <InputWithIcon
                              id="percentual_reajuste"
                              type="number"
                              step="0.01"
                              min="0"
                              icon={Percent}
                              value={contratoData.percentual_reajuste || ''}
                              disabled={isViewing}
                            />
                            <p className="text-xs text-muted-foreground">Percentual aplicado no reajuste</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ultimo_reajuste">Data do Último Reajuste</Label>
                            <InputWithIcon
                              id="ultimo_reajuste"
                              type="date"
                              icon={Calendar}
                              value={contratoData.ultimo_reajuste || ''}
                              disabled={isViewing}
                            />
                            <p className="text-xs text-muted-foreground">Último reajuste aplicado ao contrato</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="proximo_reajuste">Próximo Reajuste</Label>
                            <InputWithIcon
                              id="proximo_reajuste"
                              type="date"
                              icon={Calendar}
                              value={contratoData.proximo_reajuste || ''}
                              disabled={true}
                              className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground text-blue-600">
                              ✓ Calculado automaticamente: Data de Início + Período de Reajuste
                            </p>
                          </div>
                        </div>

                        {/* Checkboxes de Renovação */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="renovacao_automatica"
                              checked={contratoData.renovacao_automatica || false}
                              disabled={isViewing}
                            />
                            <Label htmlFor="renovacao_automatica" className="flex items-center gap-2">
                              <ArrowUp className="w-4 h-4" />
                              Renovação Automática
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="proximo_reajuste_automatico"
                              checked={contratoData.proximo_reajuste_automatico || false}
                              disabled={isViewing}
                            />
                            <Label htmlFor="proximo_reajuste_automatico" className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Reajuste Automático
                            </Label>
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="valores" className="space-y-8">
                      {/* Valores e Encargos - EXATO COMO NO CADASTRO */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Valores e Encargos
                          </h2>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Configure todos os valores financeiros do contrato, incluindo seguros, taxas e parcelamentos.
                        </p>

                        {/* Valores Principais */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <motion.div 
                              className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-green-500 to-emerald-500"
                              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 0.3 }}
                            >
                              <CreditCard className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                Valores Mensais
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Valores recorrentes mensais do contrato
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="valor_aluguel">Aluguel *</Label>
                              <CurrencyInput
                                id="valor_aluguel"
                                value={contratoData.valor_aluguel || 0}
                                disabled={isViewing}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="valor_condominio">Condomínio</Label>
                              <CurrencyInput
                                id="valor_condominio"
                                value={contratoData.valor_condominio || 0}
                                disabled={isViewing}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="valor_fci">FCI</Label>
                              <CurrencyInput
                                id="valor_fci"
                                value={contratoData.valor_fci || 0}
                                disabled={isViewing}
                              />
                              <p className="text-xs text-muted-foreground">Fundo de Conservação de Imóveis</p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="taxa_administracao">Taxa de Administração (%)</Label>
                              <InputWithIcon
                                id="taxa_administracao"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                icon={Percent}
                                value={contratoData.taxa_administracao || ''}
                                disabled={isViewing}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="bonificacao">Bonificação</Label>
                              <CurrencyInput
                                id="bonificacao"
                                value={contratoData.bonificacao || 0}
                                disabled={isViewing}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="multa_atraso">Multa por Atraso (%)</Label>
                              <InputWithIcon
                                id="multa_atraso"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                icon={Percent}
                                value={contratoData.multa_atraso || ''}
                                disabled={isViewing}
                              />
                              <p className="text-xs text-muted-foreground">Percentual aplicado sobre o valor em atraso</p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Seção de Seguros - FALTAVA ESTA SEÇÃO */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <motion.div 
                              className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500"
                              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 0.3 }}
                            >
                              <Shield className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                Seguros e IPTU
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Configure valores, datas e parcelamentos
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Seguro Fiança */}
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow duration-300"
                            >
                              <div className="flex items-center gap-2 pb-2 border-b border-blue-200 dark:border-blue-700">
                                <Shield className="w-4 h-4 text-blue-600" />
                                <h4 className="text-sm font-semibold text-foreground">Seguro Fiança</h4>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor="valor_seguro_fianca">Valor Total</Label>
                                  <CurrencyInput
                                    id="valor_seguro_fianca"
                                    value={contratoData.valor_seguro_fianca || 0}
                                    disabled={isViewing}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="data_inicio_seguro_fianca">Data Início</Label>
                                  <InputWithIcon
                                    id="data_inicio_seguro_fianca"
                                    type="date"
                                    value={contratoData.data_inicio_seguro_fianca || ''}
                                    disabled={isViewing}
                                    icon={Calendar}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="data_fim_seguro_fianca">Data Fim</Label>
                                  <InputWithIcon
                                    id="data_fim_seguro_fianca"
                                    type="date"
                                    value={contratoData.data_fim_seguro_fianca || ''}
                                    disabled={true}
                                    icon={Calendar}
                                    className="bg-muted/30"
                                  />
                                  <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="parcelas_seguro_fianca">Parcelas (meses)</Label>
                                  <InputWithIcon
                                    id="parcelas_seguro_fianca"
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={contratoData.parcelas_seguro_fianca || ''}
                                    disabled={isViewing}
                                    icon={CreditCard}
                                  />
                                  <p className="text-xs text-muted-foreground">Cada parcela = 1 mês de cobertura</p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Seguro Incêndio */}
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.3 }}
                              className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow duration-300"
                            >
                              <div className="flex items-center gap-2 pb-2 border-b border-orange-200 dark:border-orange-700">
                                <Shield className="w-4 h-4 text-orange-600" />
                                <h4 className="text-sm font-semibold text-foreground">Seguro Incêndio</h4>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor="valor_seguro_incendio">Valor Total</Label>
                                  <CurrencyInput
                                    id="valor_seguro_incendio"
                                    value={contratoData.valor_seguro_incendio || 0}
                                    disabled={isViewing}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="data_inicio_seguro_incendio">Data Início</Label>
                                  <InputWithIcon
                                    id="data_inicio_seguro_incendio"
                                    type="date"
                                    value={contratoData.data_inicio_seguro_incendio || ''}
                                    disabled={isViewing}
                                    icon={Calendar}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="data_fim_seguro_incendio">Data Fim</Label>
                                  <InputWithIcon
                                    id="data_fim_seguro_incendio"
                                    type="date"
                                    value={contratoData.data_fim_seguro_incendio || ''}
                                    disabled={true}
                                    icon={Calendar}
                                    className="bg-muted/30"
                                  />
                                  <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="parcelas_seguro_incendio">Parcelas (meses)</Label>
                                  <InputWithIcon
                                    id="parcelas_seguro_incendio"
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={contratoData.parcelas_seguro_incendio || ''}
                                    disabled={isViewing}
                                    icon={CreditCard}
                                  />
                                  <p className="text-xs text-muted-foreground">Cada parcela = 1 mês de cobertura</p>
                                </div>
                              </div>
                            </motion.div>

                            {/* IPTU */}
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.4 }}
                              className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow duration-300"
                            >
                              <div className="flex items-center gap-2 pb-2 border-b border-green-200 dark:border-green-700">
                                <Building className="w-4 h-4 text-green-600" />
                                <h4 className="text-sm font-semibold text-foreground">IPTU</h4>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor="valor_iptu">Valor Total</Label>
                                  <CurrencyInput
                                    id="valor_iptu"
                                    value={contratoData.valor_iptu || 0}
                                    disabled={isViewing}
                                  />
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="space-y-2">
                                    <Label htmlFor="data_inicio_iptu">Data Início</Label>
                                    <InputWithIcon
                                      id="data_inicio_iptu"
                                      type="date"
                                      value={contratoData.data_inicio_iptu || ''}
                                      disabled={isViewing}
                                      icon={Calendar}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="data_fim_iptu">Data Fim</Label>
                                    <InputWithIcon
                                      id="data_fim_iptu"
                                      type="date"
                                      value={contratoData.data_fim_iptu || ''}
                                      disabled={true}
                                      icon={Calendar}
                                      className="bg-muted/30"
                                    />
                                    <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="parcelas_iptu">Parcelas (meses)</Label>
                                  <InputWithIcon
                                    id="parcelas_iptu"
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={contratoData.parcelas_iptu || ''}
                                    disabled={isViewing}
                                    icon={CreditCard}
                                  />
                                  <p className="text-xs text-muted-foreground">Cada parcela = 1 mês de cobertura</p>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>

                        {/* Seção Retidos e Antecipação - FALTAVA */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <motion.div 
                              className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-amber-500"
                              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 0.3 }}
                            >
                              <Clock className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                Retidos e Antecipação
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Configure quais valores serão retidos ou antecipados
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Valores Retidos */}
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.4 }}
                              className="space-y-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:shadow-md transition-shadow duration-300"
                            >
                              <div className="flex items-center gap-2 pb-2 border-b border-red-200 dark:border-red-700">
                                <ArrowDown className="w-4 h-4 text-red-600" />
                                <h4 className="text-sm font-semibold text-foreground">Valores Retidos</h4>
                              </div>
                              <p className="text-xs text-muted-foreground mb-4">
                                Valores descontados do aluguel do proprietário
                              </p>
                              
                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="retido_fci"
                                    checked={contratoData.retido_fci || false}
                                    disabled={isViewing}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <DollarSign className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium flex-1">FCI</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="retido_iptu"
                                    checked={contratoData.retido_iptu || false}
                                    disabled={isViewing}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Building className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium flex-1">IPTU</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="retido_condominio"
                                    checked={contratoData.retido_condominio || false}
                                    disabled={isViewing}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Building className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium flex-1">Condomínio</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="retido_seguro_fianca"
                                    checked={contratoData.retido_seguro_fianca || false}
                                    disabled={isViewing}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Shield className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium flex-1">Seguro Fiança</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="retido_seguro_incendio"
                                    checked={contratoData.retido_seguro_incendio || false}
                                    disabled={isViewing}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Shield className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium flex-1">Seguro Incêndio</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>

                            {/* Valores Antecipados */}
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.5 }}
                              className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow duration-300"
                            >
                              <div className="flex items-center gap-2 pb-2 border-b border-green-200 dark:border-green-700">
                                <ArrowUp className="w-4 h-4 text-green-600" />
                                <h4 className="text-sm font-semibold text-foreground">Valores Antecipados</h4>
                              </div>
                              <p className="text-xs text-muted-foreground mb-4">
                                Valores pagos antecipadamente pelo inquilino
                              </p>
                              
                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="antecipa_condominio"
                                    checked={contratoData.antecipa_condominio || false}
                                    disabled={isViewing}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Building className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium flex-1">Condomínio</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="antecipa_seguro_fianca"
                                    checked={contratoData.antecipa_seguro_fianca || false}
                                    disabled={isViewing}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Shield className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium flex-1">Seguro Fiança</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="antecipa_seguro_incendio"
                                    checked={contratoData.antecipa_seguro_incendio || false}
                                    disabled={isViewing}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Shield className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium flex-1">Seguro Incêndio</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </TabsContent>

                    <TabsContent value="garantias" className="space-y-8">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            Garantias do Contrato
                          </h2>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Configure o tipo de garantia e forneça as informações necessárias conforme a modalidade escolhida.
                        </p>

                        {/* Seleção do Tipo de Garantia */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <motion.div 
                              className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500"
                              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 0.3 }}
                            >
                              <Shield className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                Tipo de Garantia
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Selecione a modalidade de garantia
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Tipo de Garantia *</Label>
                            <Select 
                              value={contratoData.tipo_garantia || ''}
                              disabled={isViewing}
                              onValueChange={!isViewing ? (value) => handleContratoInputChange('tipo_garantia', value) : undefined}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de garantia..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Fiador">Fiador</SelectItem>
                                <SelectItem value="Caução">Caução</SelectItem>
                                <SelectItem value="Seguro-fiança">Seguro Fiança</SelectItem>
                                <SelectItem value="Título de Capitalização">Título de Capitalização</SelectItem>
                                <SelectItem value="Sem garantia">Sem Garantia</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </motion.div>

                        {/* Formulários dinâmicos baseados no tipo de garantia */}
                        {contratoData.tipo_garantia === 'Fiador' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <motion.div 
                                className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-green-500 to-emerald-500"
                                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <User className="w-5 h-5 text-white" />
                              </motion.div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  Fiadores
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Informações dos fiadores do contrato
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-6">
                              {/* Dados básicos do fiador */}
                              {isViewing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Nome do Fiador</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                      <User className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">{contratoData.fiador_nome || 'Não informado'}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">CPF/CNPJ</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                      <IdCard className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">{contratoData.fiador_cpf || 'Não informado'}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                      <Phone className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">{contratoData.fiador_telefone || 'Não informado'}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                      <Mail className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">{contratoData.fiador_email || 'Não informado'}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="fiador_nome">Nome do Fiador</Label>
                                    <InputWithIcon
                                      id="fiador_nome"
                                      type="text"
                                      value={contratoData.fiador_nome || ''}
                                      onChange={(e) => handleContratoInputChange('fiador_nome', e.target.value)}
                                      placeholder="Nome completo do fiador"
                                      icon={User}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="fiador_cpf">CPF/CNPJ</Label>
                                    <InputWithIcon
                                      id="fiador_cpf"
                                      type="text"
                                      value={contratoData.fiador_cpf || ''}
                                      onChange={(e) => handleContratoInputChange('fiador_cpf', e.target.value)}
                                      placeholder="000.000.000-00"
                                      icon={IdCard}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="fiador_telefone">Telefone</Label>
                                    <InputWithIcon
                                      id="fiador_telefone"
                                      type="text"
                                      value={contratoData.fiador_telefone || ''}
                                      onChange={(e) => handleContratoInputChange('fiador_telefone', e.target.value)}
                                      placeholder="(00) 00000-0000"
                                      icon={Phone}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="fiador_email">E-mail</Label>
                                    <InputWithIcon
                                      id="fiador_email"
                                      type="email"
                                      value={contratoData.fiador_email || ''}
                                      onChange={(e) => handleContratoInputChange('fiador_email', e.target.value)}
                                      placeholder="email@exemplo.com"
                                      icon={Mail}
                                    />
                                  </div>
                                </div>
                              )}

                              {isViewing ? (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-muted-foreground">Endereço Completo</Label>
                                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                                    <span className="text-sm text-foreground">{contratoData.fiador_endereco || 'Não informado'}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Label htmlFor="fiador_endereco">Endereço Completo</Label>
                                  <Textarea
                                    id="fiador_endereco"
                                    value={contratoData.fiador_endereco || ''}
                                    onChange={(e) => handleContratoInputChange('fiador_endereco', e.target.value)}
                                    placeholder="Endereço completo do fiador..."
                                    rows={3}
                                  />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {contratoData.tipo_garantia === 'Caução' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <motion.div 
                                className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500"
                                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <Banknote className="w-5 h-5 text-white" />
                              </motion.div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  Caução
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Informações sobre a caução
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="caucao_tipo">Tipo de Caução</Label>
                                  <Select 
                                    value={contratoData.caucao_tipo || ''}
                                    disabled={isViewing}
                                    onValueChange={!isViewing ? (value) => handleContratoInputChange('caucao_tipo', value) : undefined}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                      <SelectItem value="titulo">Título/Aplicação</SelectItem>
                                      <SelectItem value="imovel">Imóvel</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="caucao_valor">Valor da Caução</Label>
                                  <CurrencyInput
                                    id="caucao_valor"
                                    value={contratoData.caucao_valor || 0}
                                    disabled={isViewing}
                                    onChange={!isViewing ? (value) => handleContratoInputChange('caucao_valor', value) : undefined}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="caucao_descricao">Descrição</Label>
                                <Textarea
                                  id="caucao_descricao"
                                  value={contratoData.caucao_descricao || ''}
                                  disabled={isViewing}
                                  onChange={!isViewing ? (e) => handleContratoInputChange('caucao_descricao', e.target.value) : undefined}
                                  placeholder="Detalhes sobre a caução..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {contratoData.tipo_garantia === 'Seguro-fiança' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <motion.div 
                                className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-pink-500"
                                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <Shield className="w-5 h-5 text-white" />
                              </motion.div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  Seguro Fiança
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Informações sobre o seguro fiança
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="seguro_seguradora">Seguradora</Label>
                                  <InputWithIcon
                                    id="seguro_seguradora"
                                    type="text"
                                    value={contratoData.seguro_seguradora || ''}
                                    disabled={isViewing}
                                    onChange={!isViewing ? (e) => handleContratoInputChange('seguro_seguradora', e.target.value) : undefined}
                                    placeholder="Nome da seguradora"
                                    icon={Building}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="seguro_apolice">Número da Apólice</Label>
                                  <InputWithIcon
                                    id="seguro_apolice"
                                    type="text"
                                    value={contratoData.seguro_apolice || ''}
                                    disabled={isViewing}
                                    onChange={!isViewing ? (e) => handleContratoInputChange('seguro_apolice', e.target.value) : undefined}
                                    placeholder="Número da apólice"
                                    icon={FileText}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="seguro_valor_cobertura">Valor da Cobertura</Label>
                                  <CurrencyInput
                                    id="seguro_valor_cobertura"
                                    value={contratoData.seguro_valor_cobertura || 0}
                                    disabled={isViewing}
                                    onChange={!isViewing ? (value) => handleContratoInputChange('seguro_valor_cobertura', value) : undefined}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="seguro_vigencia">Vigência</Label>
                                  <InputWithIcon
                                    id="seguro_vigencia"
                                    type="date"
                                    value={contratoData.seguro_vigencia || ''}
                                    disabled={isViewing}
                                    onChange={!isViewing ? (e) => handleContratoInputChange('seguro_vigencia', e.target.value) : undefined}
                                    icon={Calendar}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {contratoData.tipo_garantia === 'Título de Capitalização' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <motion.div 
                                className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-indigo-500 to-blue-500"
                                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <CreditCard className="w-5 h-5 text-white" />
                              </motion.div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  Título de Capitalização
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Informações sobre o título de capitalização
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="titulo_empresa">Empresa Emissora</Label>
                                  <InputWithIcon
                                    id="titulo_empresa"
                                    type="text"
                                    value={contratoData.titulo_empresa || ''}
                                    disabled={isViewing}
                                    onChange={!isViewing ? (e) => handleContratoInputChange('titulo_empresa', e.target.value) : undefined}
                                    placeholder="Nome da empresa"
                                    icon={Building}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="titulo_numero">Número do Título</Label>
                                  <InputWithIcon
                                    id="titulo_numero"
                                    type="text"
                                    value={contratoData.titulo_numero || ''}
                                    disabled={isViewing}
                                    onChange={!isViewing ? (e) => handleContratoInputChange('titulo_numero', e.target.value) : undefined}
                                    placeholder="Número do título"
                                    icon={FileText}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="titulo_valor">Valor do Título</Label>
                                  <CurrencyInput
                                    id="titulo_valor"
                                    value={contratoData.titulo_valor || 0}
                                    disabled={isViewing}
                                    onChange={!isViewing ? (value) => handleContratoInputChange('titulo_valor', value) : undefined}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="titulo_vencimento">Data de Vencimento</Label>
                                  <InputWithIcon
                                    id="titulo_vencimento"
                                    type="date"
                                    value={contratoData.titulo_vencimento || ''}
                                    disabled={isViewing}
                                    onChange={!isViewing ? (e) => handleContratoInputChange('titulo_vencimento', e.target.value) : undefined}
                                    icon={Calendar}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                      </div>
                    </TabsContent>

                    <TabsContent value="plano" className="space-y-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <FileText className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Plano de Locação
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Escolha o plano de administração e taxas aplicáveis ao contrato
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label>Tipo de Plano</Label>
                            <Select 
                              value={contratoData.tipo_plano_locacao || ''}
                              disabled={isViewing}
                              onValueChange={!isViewing ? (value) => handleContratoInputChange('tipo_plano_locacao', value) : undefined}
                            >
                              <SelectTrigger className="bg-muted/50 border-border text-foreground">
                                <SelectValue placeholder="Selecione o plano de locação..." />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                <SelectItem value="completo_opcao1" className="text-foreground hover:bg-accent">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Locação Completo - Opção 1</span>
                                    <span className="text-xs text-muted-foreground">100% (1º aluguel) + 10% (demais)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="completo_opcao2" className="text-foreground hover:bg-accent">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Locação Completo - Opção 2</span>
                                    <span className="text-xs text-muted-foreground">16% (todos os aluguéis)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="basico_opcao1" className="text-foreground hover:bg-accent">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Locação Básico - Opção 1</span>
                                    <span className="text-xs text-muted-foreground">50% (1º aluguel) + 5% (demais)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="basico_opcao2" className="text-foreground hover:bg-accent">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Locação Básico - Opção 2</span>
                                    <span className="text-xs text-muted-foreground">8% (todos os aluguéis)</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                            
                          {contratoData.tipo_plano_locacao && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800"
                            >
                              <div className="text-sm text-emerald-800 dark:text-emerald-200">
                                {contratoData.tipo_plano_locacao === 'completo_opcao1' && (
                                  <div>
                                    <p className="font-semibold mb-3 text-lg text-emerald-900 dark:text-emerald-100">
                                      📋 Locação Completo (Administração + Corretor) - Opção 1
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-3">
                                        <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Taxa de Locação</p>
                                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">100%</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">do primeiro aluguel</p>
                                      </div>
                                      <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-3">
                                        <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Taxa de Administração</p>
                                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">10%</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">dos demais aluguéis</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {contratoData.tipo_plano_locacao === 'completo_opcao2' && (
                                  <div>
                                    <p className="font-semibold mb-3 text-lg text-emerald-900 dark:text-emerald-100">
                                      📋 Locação Completo (Administração + Corretor) - Opção 2
                                    </p>
                                    <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-4">
                                      <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Taxa Unificada</p>
                                      <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">16%</p>
                                      <p className="text-sm text-emerald-600 dark:text-emerald-400">sobre todos os aluguéis (administração + locação)</p>
                                    </div>
                                  </div>
                                )}
                                {contratoData.tipo_plano_locacao === 'basico_opcao1' && (
                                  <div>
                                    <p className="font-semibold mb-3 text-lg text-emerald-900 dark:text-emerald-100">
                                      📋 Locação Básico (Administração) - Opção 1
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-3">
                                        <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Taxa de Locação</p>
                                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">50%</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">do primeiro aluguel</p>
                                      </div>
                                      <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-3">
                                        <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Taxa de Administração</p>
                                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">5%</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">dos demais aluguéis</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {contratoData.tipo_plano_locacao === 'basico_opcao2' && (
                                  <div>
                                    <p className="font-semibold mb-3 text-lg text-emerald-900 dark:text-emerald-100">
                                      📋 Locação Básico (Administração) - Opção 2
                                    </p>
                                    <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-4">
                                      <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Taxa Unificada</p>
                                      <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">8%</p>
                                      <p className="text-sm text-emerald-600 dark:text-emerald-400">sobre todos os aluguéis (locação + administração)</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}

                          {/* Dados do Corretor - Aparece apenas para planos "Completo" */}
                          {(contratoData.tipo_plano_locacao === 'completo_opcao1' || contratoData.tipo_plano_locacao === 'completo_opcao2') && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                              className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                            >
                              <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-foreground">
                                    Dados do Corretor
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Informações do corretor responsável pela locação
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-4 rounded-xl bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700">
                                  <Checkbox
                                    id="tem_corretor"
                                    checked={contratoData.tem_corretor || false}
                                    disabled={isViewing}
                                    onCheckedChange={!isViewing ? (checked) => handleContratoInputChange('tem_corretor', !!checked) : undefined}
                                  />
                                  <Label htmlFor="tem_corretor" className="cursor-pointer text-foreground font-medium">
                                    Há corretor nesta locação
                                  </Label>
                                </div>

                                {contratoData.tem_corretor && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="corretor_nome">Nome do Corretor</Label>
                                        <InputWithIcon
                                          id="corretor_nome"
                                          type="text"
                                          value={contratoData.corretor_nome || ''}
                                          disabled={isViewing}
                                          onChange={!isViewing ? (e) => handleContratoInputChange('corretor_nome', e.target.value) : undefined}
                                          placeholder="Nome completo do corretor"
                                          icon={User}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="corretor_creci">CRECI</Label>
                                        <InputWithIcon
                                          id="corretor_creci"
                                          type="text"
                                          value={contratoData.corretor_creci || ''}
                                          disabled={isViewing}
                                          onChange={!isViewing ? (e) => handleContratoInputChange('corretor_creci', e.target.value) : undefined}
                                          placeholder="Número do CRECI"
                                          icon={IdCard}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="corretor_cpf">CPF</Label>
                                        <InputWithIcon
                                          id="corretor_cpf"
                                          type="text"
                                          value={contratoData.corretor_cpf || ''}
                                          disabled={isViewing}
                                          onChange={!isViewing ? (e) => handleContratoInputChange('corretor_cpf', e.target.value) : undefined}
                                          placeholder="000.000.000-00"
                                          icon={IdCard}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="corretor_telefone">Telefone</Label>
                                        <InputWithIcon
                                          id="corretor_telefone"
                                          type="text"
                                          value={contratoData.corretor_telefone || ''}
                                          disabled={isViewing}
                                          onChange={!isViewing ? (e) => handleContratoInputChange('corretor_telefone', e.target.value) : undefined}
                                          placeholder="(00) 00000-0000"
                                          icon={Phone}
                                        />
                                      </div>

                                      <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="corretor_email">Email</Label>
                                        <InputWithIcon
                                          id="corretor_email"
                                          type="email"
                                          value={contratoData.corretor_email || ''}
                                          disabled={isViewing}
                                          onChange={!isViewing ? (e) => handleContratoInputChange('corretor_email', e.target.value) : undefined}
                                          placeholder="corretor@exemplo.com"
                                          icon={Mail}
                                        />
                                      </div>
                                    </div>

                                    {/* Dados Bancários do Corretor */}
                                    <div className="bg-white/60 dark:bg-blue-950/40 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                                      <h5 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-blue-600" />
                                        Dados Bancários para Recebimento
                                      </h5>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="corretor_banco">Banco</Label>
                                          <InputWithIcon
                                            id="corretor_banco"
                                            type="text"
                                            value={contratoData.dados_bancarios_corretor?.banco || ''}
                                            disabled={isViewing}
                                            onChange={!isViewing ? (e) => handleBancarioCorretor('banco', e.target.value) : undefined}
                                            placeholder="Nome do banco"
                                            icon={CreditCard}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor="corretor_agencia">Agência</Label>
                                          <InputWithIcon
                                            id="corretor_agencia"
                                            type="text"
                                            value={contratoData.dados_bancarios_corretor?.agencia || ''}
                                            disabled={isViewing}
                                            onChange={!isViewing ? (e) => handleBancarioCorretor('agencia', e.target.value) : undefined}
                                            placeholder="Agência"
                                            icon={CreditCard}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor="corretor_conta">Conta</Label>
                                          <InputWithIcon
                                            id="corretor_conta"
                                            type="text"
                                            value={contratoData.dados_bancarios_corretor?.conta || ''}
                                            disabled={isViewing}
                                            onChange={!isViewing ? (e) => handleBancarioCorretor('conta', e.target.value) : undefined}
                                            placeholder="Número da conta"
                                            icon={CreditCard}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor="corretor_tipo_conta">Tipo de Conta</Label>
                                          <Select 
                                            value={contratoData.dados_bancarios_corretor?.tipo_conta || ''}
                                            disabled={isViewing}
                                            onValueChange={!isViewing ? (value) => handleBancarioCorretor('tipo_conta', value) : undefined}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Tipo da conta" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="corrente">Conta Corrente</SelectItem>
                                              <SelectItem value="poupanca">Poupança</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                          <Label htmlFor="corretor_chave_pix">Chave PIX (Opcional)</Label>
                                          <InputWithIcon
                                            id="corretor_chave_pix"
                                            type="text"
                                            value={contratoData.dados_bancarios_corretor?.chave_pix || ''}
                                            disabled={isViewing}
                                            onChange={!isViewing ? (e) => handleBancarioCorretor('chave_pix', e.target.value) : undefined}
                                            placeholder="CPF, email, telefone ou chave aleatória"
                                            icon={CreditCard}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="clausulas" className="space-y-8">
                      {/* Obrigações Adicionais */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-red-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <CheckCircle className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Obrigações Adicionais
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Responsabilidades específicas do inquilino durante a locação
                            </p>
                          </div>
                        </div>

                        {isViewing ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {[
                                { key: 'obrigacao_manutencao', label: 'Manutenção Predial', icon: Settings },
                                { key: 'obrigacao_pintura', label: 'Pintura do Imóvel', icon: Palette },
                                { key: 'obrigacao_jardim', label: 'Cuidados com Jardim', icon: TreePine },
                                { key: 'obrigacao_limpeza', label: 'Limpeza Profunda', icon: Sparkles },
                                { key: 'obrigacao_pequenos_reparos', label: 'Pequenos Reparos', icon: Wrench },
                                { key: 'obrigacao_vistoria', label: 'Vistoria Periódica', icon: Eye }
                              ].map(({ key, label, icon: Icon }) => (
                                <div key={key} className={`flex items-center gap-3 p-3 rounded-lg ${contratoData[key] ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800' : 'bg-muted/30'}`}>
                                  <Icon className={`w-4 h-4 ${contratoData[key] ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
                                  <span className={`text-sm font-medium ${contratoData[key] ? 'text-green-900 dark:text-green-100' : 'text-muted-foreground'}`}>
                                    {label}
                                  </span>
                                  <div className={`ml-auto w-3 h-3 rounded-full ${contratoData[key] ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                              <Checkbox
                                id="obrigacao_manutencao"
                                checked={contratoData.obrigacao_manutencao || false}
                                onCheckedChange={(checked) => handleContratoInputChange('obrigacao_manutencao', !!checked)}
                              />
                              <Label htmlFor="obrigacao_manutencao" className="cursor-pointer text-foreground">
                                Manutenção Predial
                              </Label>
                            </div>

                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                              <Checkbox
                                id="obrigacao_pintura"
                                checked={contratoData.obrigacao_pintura || false}
                                onCheckedChange={(checked) => handleContratoInputChange('obrigacao_pintura', !!checked)}
                              />
                              <Label htmlFor="obrigacao_pintura" className="cursor-pointer text-foreground">
                                Pintura do Imóvel
                              </Label>
                            </div>

                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                              <Checkbox
                                id="obrigacao_jardim"
                                checked={contratoData.obrigacao_jardim || false}
                                onCheckedChange={(checked) => handleContratoInputChange('obrigacao_jardim', !!checked)}
                              />
                              <Label htmlFor="obrigacao_jardim" className="cursor-pointer text-foreground">
                                Cuidados com Jardim
                              </Label>
                            </div>

                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                              <Checkbox
                                id="obrigacao_limpeza"
                                checked={contratoData.obrigacao_limpeza || false}
                                onCheckedChange={(checked) => handleContratoInputChange('obrigacao_limpeza', !!checked)}
                              />
                              <Label htmlFor="obrigacao_limpeza" className="cursor-pointer text-foreground">
                                Limpeza Profunda
                              </Label>
                            </div>

                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                              <Checkbox
                                id="obrigacao_pequenos_reparos"
                                checked={contratoData.obrigacao_pequenos_reparos || false}
                                onCheckedChange={(checked) => handleContratoInputChange('obrigacao_pequenos_reparos', !!checked)}
                              />
                              <Label htmlFor="obrigacao_pequenos_reparos" className="cursor-pointer text-foreground">
                                Pequenos Reparos
                              </Label>
                            </div>

                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                              <Checkbox
                                id="obrigacao_vistoria"
                                checked={contratoData.obrigacao_vistoria || false}
                                onCheckedChange={(checked) => handleContratoInputChange('obrigacao_vistoria', !!checked)}
                              />
                              <Label htmlFor="obrigacao_vistoria" className="cursor-pointer text-foreground">
                                Vistoria Periódica
                              </Label>
                            </div>
                          </div>
                        )}
                      </motion.div>

                      {/* Multa por Quebra de Contrato */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-red-500 to-pink-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <AlertCircle className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Multa por Quebra de Contrato
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Penalidades aplicáveis em caso de rescisão antecipada
                            </p>
                          </div>
                        </div>

                        {isViewing ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-muted-foreground">Multa para o Locador</Label>
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                <Percent className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">
                                  {contratoData.multa_locador ? `${contratoData.multa_locador}%` : 'Não informado'}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Percentual sobre o valor total do contrato
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-muted-foreground">Multa para o Locatário</Label>
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                <Percent className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">
                                  {contratoData.multa_locatario ? `${contratoData.multa_locatario}%` : 'Não informado'}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Percentual sobre o valor total do contrato
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="multa_locador">Multa para o Locador (%)</Label>
                              <InputWithIcon
                                id="multa_locador"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={contratoData.multa_locador || ''}
                                onChange={(e) => handleContratoInputChange('multa_locador', parseFloat(e.target.value) || 0)}
                                placeholder="0.0"
                                icon={Percent}
                              />
                              <p className="text-xs text-muted-foreground">
                                Percentual sobre o valor total do contrato
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="multa_locatario">Multa para o Locatário (%)</Label>
                              <InputWithIcon
                                id="multa_locatario"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={contratoData.multa_locatario || ''}
                                onChange={(e) => handleContratoInputChange('multa_locatario', parseFloat(e.target.value) || 0)}
                                placeholder="0.0"
                                icon={Percent}
                              />
                              <p className="text-xs text-muted-foreground">
                                Percentual sobre o valor total do contrato
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>

                      {/* Animais de Estimação */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-pink-500 to-purple-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <Heart className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Animais de Estimação
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Registro de pets permitidos no imóvel
                            </p>
                          </div>
                        </div>

                        {isViewing ? (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-muted-foreground">Quantidade de Pets Permitidos</Label>
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                <Heart className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">
                                  {contratoData.quantidade_pets || 0} {contratoData.quantidade_pets === 1 ? 'pet' : 'pets'}
                                </span>
                              </div>
                            </div>

                            {(contratoData.quantidade_pets > 0) && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 border border-border rounded-xl bg-muted/20 space-y-4"
                              >
                                <h4 className="text-lg font-semibold text-foreground">Informações dos Pets</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Raças dos Animais</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                      <Heart className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">
                                        {contratoData.pets_racas || 'Não informado'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Tamanhos dos Animais</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                      <Heart className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">
                                        {contratoData.pets_tamanhos || 'Não informado'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label>Quantidade de Pets</Label>
                              <InputWithIcon
                                type="number"
                                min="0"
                                max="10"
                                value={contratoData.quantidade_pets || 0}
                                onChange={(e) => handleContratoInputChange('quantidade_pets', parseInt(e.target.value) || 0)}
                                icon={Heart}
                              />
                            </div>

                            {/* Informações dos Pets (simplificada para view/edit) */}
                            {(contratoData.quantidade_pets > 0) && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 border border-border rounded-xl bg-muted/20 space-y-4"
                              >
                                <h4 className="text-lg font-semibold text-foreground">Informações dos Pets</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Raças dos Animais</Label>
                                    <InputWithIcon
                                      type="text"
                                      value={contratoData.pets_racas || ''}
                                      onChange={(e) => handleContratoInputChange('pets_racas', e.target.value)}
                                      placeholder="Ex: Labrador, SRD, Persa"
                                      icon={Heart}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Tamanhos dos Animais</Label>
                                    <InputWithIcon
                                      type="text"
                                      value={contratoData.pets_tamanhos || ''}
                                      onChange={(e) => handleContratoInputChange('pets_tamanhos', e.target.value)}
                                      placeholder="Ex: Grande, Médio, Pequeno"
                                      icon={Heart}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </motion.div>

                      {/* Informações Adicionais */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <FileText className="w-6 h-6 text-white" />
                          </motion.div>
                          <h2 className="text-xl font-semibold text-foreground">
                            Informações Adicionais
                          </h2>
                        </div>

                        {isViewing ? (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Cláusulas Adicionais</Label>
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                              <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                              <span className="text-sm text-foreground">
                                {contratoData.clausulas_adicionais || 'Nenhuma cláusula adicional definida'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Cláusulas Adicionais</Label>
                            <Textarea
                              value={contratoData.clausulas_adicionais || ''}
                              onChange={(e) => handleContratoInputChange('clausulas_adicionais', e.target.value)}
                              placeholder="Cláusulas especiais do contrato..."
                              rows={4}
                            />
                          </div>
                        )}
                      </motion.div>
                    </TabsContent>
                  </Tabs>

                  {/* Botão Salvar Alterações (apenas em modo editar) */}
                  {isEditing && (
                    <div className="pt-6 border-t">
                      <Button className="w-full">
                        Salvar Alterações
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Modo cadastro normal (versão original completa)
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clientesSelecionados, setClientesSelecionados] = useState<Cliente[]>([]);
  const [inquilinoSelecionado, setInquilinoSelecionado] = useState<Inquilino | null>(null);
  
  // Estados para animais de estimação
  const [pets, setPets] = useState<Array<{
    nome: string;
    tipo: string;
    raca?: string;
    idade?: number;
    vacinacao_em_dia: boolean;
  }>>([]);
  
  // Estados para locadores e locatários do contrato
  const [locadores, setLocadores] = useState<ContratoLocador[]>([]);
  const [locatarios, setLocatarios] = useState<ContratoLocatario[]>([]);

  const [formData, setFormData] = useState<Contrato>({
    id_imovel: 0,
    id_inquilino: 0,
    data_inicio: '',
    data_fim: '',
    data_entrega_chaves: '',
    periodo_contrato: 12,
    taxa_administracao: 0,
    fundo_conservacao: 0,
    tipo_reajuste: '',
    percentual_reajuste: 0,
    vencimento_dia: 1,
    renovacao_automatica: false,
    seguro_obrigatorio: false,
    clausulas_adicionais: '',
    tipo_plano_locacao: '',
    valores_contrato: '',
    data_vigencia_segfianca: '',
    data_vigencia_segincendio: '',
    data_assinatura: '',
    ultimo_reajuste: '',
    proximo_reajuste: '',
    antecipacao_encargos: false,
    aluguel_garantido: false,
    mes_de_referencia: '',
    tipo_garantia: '',
    bonificacao: 0,
    retidos: '',
    info_garantias: '',
    deseja_fci: 'Não',
    deseja_seguro_fianca: 'Não',
    deseja_seguro_incendio: 'Não',
    // Novos campos
    valor_aluguel: 0,
    valor_iptu: 0,
    valor_condominio: 0,
    valor_fci: 0,
    valor_seguro_fianca: 0,
    valor_seguro_incendio: 0,
    tempo_renovacao: 12,
    tempo_reajuste: 12,
    indice_reajuste: 'IPCA',
    proximo_reajuste_automatico: false,
    tem_corretor: false,
    dados_bancarios_corretor: {
      banco: '',
      agencia: '',
      conta: '',
      tipo_conta: '',
      chave_pix: ''
    },
    retido_fci: false,
    retido_iptu: false,
    retido_condominio: false,
    retido_seguro_fianca: false,
    retido_seguro_incendio: false,
    antecipa_condominio: false,
    antecipa_seguro_fianca: false,
    antecipa_seguro_incendio: false,
    seguro_fianca_inicio: '',
    seguro_fianca_fim: '',
    seguro_incendio_inicio: '',
    seguro_incendio_fim: '',
    quantidade_pets: 0,
    pets: [],
    
    // Garantias
    fiadores: [],
    caucao: null,
    titulo_capitalizacao: null,
    apolice_seguro_fianca: null
  });

  // ✅ Hook para detectar dados preenchidos em cada seção
  const sectionsData = useFormSectionsData({...formData, locadores, locatarios}, {
    partes: ['id_imovel', 'locadores', 'locatarios'],
    datas: ['data_assinatura', 'data_inicio', 'data_fim', 'data_entrega_chaves', 'vencimento_dia', 'renovacao_automatica', 'tempo_renovacao', 'tempo_reajuste'],
    valores: ['valor_aluguel', 'valor_iptu', 'valor_condominio', 'taxa_administracao', 'fundo_conservacao'],
    garantias: ['tipo_garantia', 'fiadores', 'caucao', 'titulo_capitalizacao', 'apolice_seguro_fianca'],
    plano: ['tipo_plano_locacao', 'tem_corretor', 'corretor_nome', 'corretor_creci', 'dados_bancarios_corretor'],
    clausulas: ['clausulas_adicionais', 'obrigacao_manutencao', 'obrigacao_pintura', 'multa_locador', 'multa_locatario', 'quantidade_pets', 'pets']
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [locadoresRes, locatariosRes, imoveisRes] = await Promise.all([
          apiService.listarLocadores(),
          apiService.listarLocatarios(),
          apiService.listarImoveis()
        ]);

        if (locadoresRes.success && locadoresRes.data) {
          setClientes(locadoresRes.data);
        }
        if (locatariosRes.success && locatariosRes.data) {
          setInquilinos(locatariosRes.data);
        }
        if (imoveisRes.success && imoveisRes.data) {
          setImoveis(imoveisRes.data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setMessage({type: 'error', text: 'Erro ao carregar dados necessários.'});
      }
    };

    carregarDados();
  }, []);

  const handleInputChange = (field: keyof Contrato, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para calcular data fim baseada no período
  const calcularDataFim = (dataInicio: string, periodoMeses: number): string => {
    if (!dataInicio || !periodoMeses) return '';
    const inicio = new Date(dataInicio);
    const fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + periodoMeses);
    return fim.toISOString().split('T')[0];
  };

  // Funções para gerenciar fiadores
  const adicionarFiador = () => {
    const novoFiador = {
      nome: '',
      cpf_cnpj: '',
      telefone: '',
      email: '',
      endereco: {
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: ''
      },
      renda: 0,
      profissao: '',
      estado_civil: ''
    };
    
    const novosfiadores = [...(formData.fiadores || []), novoFiador];
    handleInputChange('fiadores', novosfiadores);
  };

  const removerFiador = (index: number) => {
    const novosfiadores = (formData.fiadores || []).filter((_, i) => i !== index);
    handleInputChange('fiadores', novosfiadores);
  };

  const atualizarFiador = (index: number, campo: string, valor: any) => {
    const novosfiadores = [...(formData.fiadores || [])];
    novosfiadores[index] = {
      ...novosfiadores[index],
      [campo]: valor
    };
    handleInputChange('fiadores', novosfiadores);
  };

  const atualizarEnderecoFiador = (index: number, campoEndereco: string, valor: string) => {
    const novosfiadores = [...(formData.fiadores || [])];
    novosfiadores[index] = {
      ...novosfiadores[index],
      endereco: {
        ...novosfiadores[index].endereco,
        [campoEndereco]: valor
      }
    };
    handleInputChange('fiadores', novosfiadores);
  };

  // Funções para gerenciar seguro fiança
  const inicializarSeguroFianca = () => {
    if (!formData.apolice_seguro_fianca) {
      const novaApolice = {
        seguradora: '',
        numero_apolice: '',
        valor_cobertura: 0,
        data_inicio: '',
        data_fim: '',
        premio: 0,
        contrato_arquivo: null
      };
      handleInputChange('apolice_seguro_fianca', novaApolice);
    }
  };

  const atualizarSeguroFianca = (campo: string, valor: any) => {
    const novaApolice = {
      ...formData.apolice_seguro_fianca,
      [campo]: valor
    };
    handleInputChange('apolice_seguro_fianca', novaApolice);
  };

  // Funções para gerenciar upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo (PDF, DOC, DOCX, JPG, PNG)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de arquivo não permitido. Use PDF, DOC, DOCX, JPG ou PNG.');
        return;
      }

      // Validar tamanho (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande. Tamanho máximo: 10MB.');
        return;
      }

      const contratoArquivo = {
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
        data_upload: new Date().toISOString()
      };

      atualizarSeguroFianca('contrato_arquivo', contratoArquivo);
    }
  };

  const removerArquivo = () => {
    atualizarSeguroFianca('contrato_arquivo', null);
  };

  const formatarTamanhoArquivo = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Funções para gerenciar caução
  const inicializarCaucao = () => {
    if (!formData.caucao) {
      const novaCaucao = {
        valor: 0,
        tipo: 'dinheiro' as const,
        descricao: '',
        banco: '',
        agencia: '',
        conta: '',
        data_deposito: '',
        comprovante_arquivo: null
      };
      handleInputChange('caucao', novaCaucao);
    }
  };

  const atualizarCaucao = (campo: string, valor: any) => {
    const novaCaucao = {
      ...formData.caucao,
      [campo]: valor
    };
    handleInputChange('caucao', novaCaucao);
  };

  // Funções para gerenciar título de capitalização
  const inicializarTituloCapitalizacao = () => {
    if (!formData.titulo_capitalizacao) {
      const novoTitulo = {
        seguradora: '',
        numero_titulo: '',
        valor_nominal: 0,
        valor_resgate: 0,
        data_inicio: '',
        data_vencimento: '',
        numero_sorteios: 0,
        titulo_arquivo: null
      };
      handleInputChange('titulo_capitalizacao', novoTitulo);
    }
  };

  const atualizarTituloCapitalizacao = (campo: string, valor: any) => {
    const novoTitulo = {
      ...formData.titulo_capitalizacao,
      [campo]: valor
    };
    handleInputChange('titulo_capitalizacao', novoTitulo);
  };

  // Inicializar dados de garantia quando tipo for selecionado
  useEffect(() => {
    if (formData.tipo_garantia === 'Seguro-fiança') {
      inicializarSeguroFianca();
    } else if (formData.tipo_garantia === 'Caução') {
      inicializarCaucao();
    } else if (formData.tipo_garantia === 'Título de Capitalização') {
      inicializarTituloCapitalizacao();
    }
  }, [formData.tipo_garantia]);


  // Função para calcular próximo reajuste (sempre retorna próxima data futura)
  const calcularProximoReajuste = (dataInicio: string, tempoReajuste: number): string => {
    if (!dataInicio || !tempoReajuste) return '';
    
    const inicio = new Date(dataInicio);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horário para comparação apenas de data
    
    // Calcular o primeiro reajuste
    let proximoReajuste = new Date(inicio);
    proximoReajuste.setMonth(proximoReajuste.getMonth() + tempoReajuste);
    
    // Se a data já passou, continuar adicionando períodos até encontrar uma data futura
    while (proximoReajuste <= hoje) {
      proximoReajuste.setMonth(proximoReajuste.getMonth() + tempoReajuste);
    }
    
    return proximoReajuste.toISOString().split('T')[0];
  };

  const handleClienteChange = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === parseInt(clienteId));
    if (cliente && !clientesSelecionados.some(c => c.id === cliente.id)) {
      const novosClientes = [...clientesSelecionados, cliente];
      setClientesSelecionados(novosClientes);
      // Definir o primeiro como principal para compatibilidade
      if (novosClientes.length === 1) {
        setClienteSelecionado(cliente);
      }
    }
  };
  
  const removerCliente = (clienteId: number) => {
    const novosClientes = clientesSelecionados.filter(c => c.id !== clienteId);
    setClientesSelecionados(novosClientes);
    // Se remover o principal, definir o próximo como principal
    if (clienteSelecionado?.id === clienteId) {
      setClienteSelecionado(novosClientes.length > 0 ? novosClientes[0] : null);
    }
  };

  const handleInquilinoChange = (inquilinoId: string) => {
    const inquilino = inquilinos.find(i => i.id === parseInt(inquilinoId));
    setInquilinoSelecionado(inquilino || null);
    setFormData(prev => ({
      ...prev,
      id_inquilino: parseInt(inquilinoId)
    }));
  };



  const atualizarPet = (index: number, campo: string, valor: any) => {
    const novosPets = [...pets];
    novosPets[index] = { ...novosPets[index], [campo]: valor };
    setPets(novosPets);
    setFormData(prev => ({
      ...prev,
      pets: novosPets
    }));
  };

  const validarDataAssinatura = (data: string): boolean => {
    if (!data) return true; // Campo pode ser vazio
    const dataAssinatura = new Date(data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horário para comparação apenas de data
    return dataAssinatura <= hoje;
  };

  const validarVigenciaSeguros = (): boolean => {
    const { seguro_fianca_inicio, seguro_fianca_fim, seguro_incendio_inicio, seguro_incendio_fim } = formData;
    
    // Validar seguro fiança
    if (seguro_fianca_inicio && seguro_fianca_fim) {
      if (new Date(seguro_fianca_inicio) >= new Date(seguro_fianca_fim)) {
        return false;
      }
    }
    
    // Validar seguro incêndio
    if (seguro_incendio_inicio && seguro_incendio_fim) {
      if (new Date(seguro_incendio_inicio) >= new Date(seguro_incendio_fim)) {
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validações básicas
    if (imoveis.length === 0) {
      setMessage({type: 'error', text: 'Você precisa ter pelo menos 1 imóvel cadastrado.'});
      setLoading(false);
      return;
    }

    if (locadores.length === 0) {
      setMessage({type: 'error', text: 'É obrigatório adicionar pelo menos um locador (proprietário).'});
      setLoading(false);
      return;
    }

    if (locatarios.length === 0) {
      setMessage({type: 'error', text: 'É obrigatório adicionar pelo menos um locatário.'});
      setLoading(false);
      return;
    }

    // Validar se todos os locatários estão selecionados
    const temLocatariosVazios = locatarios.some(l => l.locatario_id === 0);
    if (temLocatariosVazios) {
      setMessage({type: 'error', text: 'Selecione todos os locatários do contrato.'});
      setLoading(false);
      return;
    }

    // Validar se tem responsável principal
    const temResponsavelPrincipal = locatarios.some(l => l.responsabilidade_principal);
    if (!temResponsavelPrincipal) {
      setMessage({type: 'error', text: 'Defina um locatário como responsável principal.'});
      setLoading(false);
      return;
    }

    // Validar data de assinatura
    if (formData.data_assinatura && !validarDataAssinatura(formData.data_assinatura)) {
      setMessage({type: 'error', text: 'A data de assinatura não pode ser futura.'});
      setLoading(false);
      return;
    }

    // Validar vigência dos seguros
    if (!validarVigenciaSeguros()) {
      setMessage({type: 'error', text: 'A data de fim dos seguros deve ser posterior à data de início.'});
      setLoading(false);
      return;
    }

    try {
      const contratoCompleto = {
        ...formData,
        locadores,
        locatarios
      };
      const response = await apiService.criarContrato(contratoCompleto);
      if (response.success) {
        setMessage({type: 'success', text: response.message || 'Contrato salvo com sucesso!'});
        // Reset form
        setFormData({
          id_imovel: 0,
          id_inquilino: 0,
          data_inicio: '',
          data_fim: '',
          data_entrega_chaves: '',
          periodo_contrato: 12,
          taxa_administracao: 0,
          fundo_conservacao: 0,
          tipo_reajuste: '',
          percentual_reajuste: 0,
          vencimento_dia: 1,
          renovacao_automatica: false,
          seguro_obrigatorio: false,
          clausulas_adicionais: '',
          tipo_plano_locacao: '',
          valores_contrato: '',
          data_vigencia_segfianca: '',
          data_vigencia_segincendio: '',
          data_assinatura: '',
          ultimo_reajuste: '',
          proximo_reajuste: '',
          antecipacao_encargos: false,
          aluguel_garantido: false,
          mes_de_referencia: '',
          tipo_garantia: '',
          bonificacao: 0,
          retidos: '',
          info_garantias: '',
          deseja_fci: 'Não',
          deseja_seguro_fianca: 'Não',
          deseja_seguro_incendio: 'Não',
          // Novos campos
          valor_aluguel: 0,
          valor_iptu: 0,
          valor_condominio: 0,
          valor_fci: 0,
          valor_seguro_fianca: 0,
          valor_seguro_incendio: 0,
          tempo_renovacao: 12,
          tempo_reajuste: 12,
          indice_reajuste: 'IPCA',
          proximo_reajuste_automatico: false,
          tem_corretor: false,
          dados_bancarios_corretor: {
            banco: '',
            agencia: '',
            conta: '',
            tipo_conta: '',
            chave_pix: ''
          },
          retido_fci: false,
          retido_iptu: false,
          retido_condominio: false,
          retido_seguro_fianca: false,
          retido_seguro_incendio: false,
          antecipa_condominio: false,
          antecipa_seguro_fianca: false,
          antecipa_seguro_incendio: false,
          seguro_fianca_inicio: '',
          seguro_fianca_fim: '',
          seguro_incendio_inicio: '',
          seguro_incendio_fim: '',
          quantidade_pets: 0,
          pets: [],
          
          // Garantias
          fiadores: [],
          caucao: null,
          titulo_capitalizacao: null,
          apolice_seguro_fianca: null
        });
        setClienteSelecionado(null);
        setClientesSelecionados([]);
        setInquilinoSelecionado(null);
        setPets([]);
        setLocadores([]);
        setLocatarios([]);
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Erro ao salvar contrato. Tente novamente.'});
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          data-initial={{ opacity: 0, y: 30 }}
          data-animate={{ opacity: 1, y: 0 }}
          data-transition={{ duration: 0.6 }}
          className="card-glass rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-foreground/20 rounded-xl">
                  <FileText className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-primary-foreground">Cadastro de Contrato</h1>
              </div>
              
              {onBack && (
                <Button 
                  variant="outline" 
                  onClick={onBack}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
            </div>
          </div>

          <div className="p-8">
            {message && (
              <div
                data-initial={{ opacity: 0, scale: 0.95 }}
                data-animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl mb-6 border ${
                  message.type === 'success' 
                    ? 'status-success' 
                    : 'status-error'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <Tabs defaultValue="partes" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="partes" hasData={sectionsData.partes}>Partes</TabsTrigger>
                  <TabsTrigger value="datas" hasData={sectionsData.datas}>Datas e Reajustes</TabsTrigger>
                  <TabsTrigger value="valores" hasData={sectionsData.valores}>Valores e Encargos</TabsTrigger>
                  <TabsTrigger value="garantias" hasData={sectionsData.garantias}>Garantias</TabsTrigger>
                  <TabsTrigger value="plano" hasData={sectionsData.plano}>Plano</TabsTrigger>
                  <TabsTrigger value="clausulas" hasData={sectionsData.clausulas}>Cláusulas</TabsTrigger>
                </TabsList>

                {/* Aba 1: Partes do Contrato */}
                <TabsContent value="partes" className="space-y-8">
                  {/* Header da Seção */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <motion.div 
                        className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <Users className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          Partes do Contrato
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Defina proprietários, inquilinos e imóvel do contrato
                        </p>
                      </div>
                    </div>
                  </motion.div>
                    
                  {/* Seção de Locadores (Proprietários) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <ContractLandlordsForm 
                      locadores={locadores}
                      onChange={setLocadores}
                    />
                  </motion.div>
                  
                  {/* Seção de Locatários */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <ContractTenantsForm 
                      locatarios={locatarios}
                      onChange={setLocatarios}
                    />
                  </motion.div>
                  
                  {/* Seleção de Imóvel */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <ContractPropertyForm 
                      imovelId={formData.id_imovel}
                      utilizacaoImovel={formData.utilizacao_imovel}
                      onChange={(imovelId) => handleInputChange('id_imovel', imovelId)}
                      onUtilizacaoChange={(utilizacao) => handleInputChange('utilizacao_imovel', utilizacao)}
                      locadoresSelecionados={locadores.map(l => l.locador_id).filter(id => id > 0)}
                    />
                  </motion.div>

                </TabsContent>

                {/* Aba 2: Datas e Reajustes */}
                <TabsContent value="datas" className="space-y-8">
                  {/* Datas do Contrato */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div 
                        className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <Calendar className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Datas do Contrato
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Configure as datas importantes do contrato, incluindo período de vigência e cálculo automático.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="data_assinatura">Data de Assinatura *</Label>
                        <InputWithIcon
                          id="data_assinatura"
                          type="date"
                          icon={Calendar}
                          value={formData.data_assinatura}
                          onChange={(e) => handleInputChange('data_assinatura', e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Não pode ser uma data futura</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data_entrega_chaves">Data de Entrega das Chaves</Label>
                        <InputWithIcon
                          id="data_entrega_chaves"
                          type="date"
                          icon={Calendar}
                          value={formData.data_entrega_chaves || ''}
                          onChange={(e) => handleInputChange('data_entrega_chaves', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vencimento_dia">Dia do Vencimento do Aluguel</Label>
                        <InputWithIcon
                          id="vencimento_dia"
                          type="number"
                          min="1"
                          max="31"
                          icon={Calendar}
                          value={formData.vencimento_dia}
                          onChange={(e) => handleInputChange('vencimento_dia', parseInt(e.target.value))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data_inicio">Data de Início do Contrato *</Label>
                        <InputWithIcon
                          id="data_inicio"
                          type="date"
                          icon={Calendar}
                          value={formData.data_inicio}
                          onChange={(e) => {
                            const novaDataInicio = e.target.value;
                            handleInputChange('data_inicio', novaDataInicio);
                            
                            // Calcular automaticamente data fim se houver período definido
                            if (novaDataInicio && formData.periodo_contrato) {
                              const dataFimCalculada = calcularDataFim(novaDataInicio, formData.periodo_contrato);
                              handleInputChange('data_fim', dataFimCalculada);
                            }
                            
                            // Calcular automaticamente próximo reajuste se houver período de reajuste
                            if (novaDataInicio && formData.tempo_reajuste) {
                              const proximoReajuste = calcularProximoReajuste(novaDataInicio, formData.tempo_reajuste);
                              handleInputChange('proximo_reajuste', proximoReajuste);
                            }
                          }}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="periodo_contrato">Período do Contrato (meses)</Label>
                        <Select 
                          value={formData.periodo_contrato?.toString() || '12'} 
                          onValueChange={(value) => {
                            const periodo = parseInt(value);
                            handleInputChange('periodo_contrato', periodo);
                            
                            // Recalcular data fim se houver data início
                            if (formData.data_inicio && periodo) {
                              const dataFimCalculada = calcularDataFim(formData.data_inicio, periodo);
                              handleInputChange('data_fim', dataFimCalculada);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6 meses</SelectItem>
                            <SelectItem value="12">12 meses</SelectItem>
                            <SelectItem value="18">18 meses</SelectItem>
                            <SelectItem value="24">24 meses</SelectItem>
                            <SelectItem value="30">30 meses</SelectItem>
                            <SelectItem value="36">36 meses</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Calculará automaticamente a data de fim</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data_fim">Data de Fim do Contrato *</Label>
                        <InputWithIcon
                          id="data_fim"
                          type="date"
                          icon={Calendar}
                          value={formData.data_fim}
                          onChange={(e) => handleInputChange('data_fim', e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Calculada automaticamente baseada no período</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Renovação e Reajuste */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div 
                        className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <Settings className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Renovação e Reajuste
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Configure as opções de renovação automática e periodicidade dos reajustes de valor.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="renovacao_automatica">Renovação Automática</Label>
                        <div className="flex items-center space-x-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                          <Checkbox
                            id="renovacao_automatica"
                            checked={formData.renovacao_automatica}
                            onCheckedChange={(checked) => handleInputChange('renovacao_automatica', !!checked)}
                          />
                          <Label htmlFor="renovacao_automatica" className="cursor-pointer">Ativar renovação automática</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">Contrato será renovado automaticamente</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Tempo de Renovação (meses)</Label>
                        <Select 
                          value={formData.tempo_renovacao?.toString() || '12'} 
                          onValueChange={(value) => handleInputChange('tempo_renovacao', parseInt(value))}
                          disabled={!formData.renovacao_automatica}
                        >
                          <SelectTrigger className={!formData.renovacao_automatica ? 'opacity-50' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12 meses</SelectItem>
                            <SelectItem value="24">24 meses</SelectItem>
                            <SelectItem value="36">36 meses</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Período entre cada renovação</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Período de Reajuste (meses)</Label>
                        <Select 
                          value={formData.tempo_reajuste?.toString() || '12'} 
                          onValueChange={(value) => {
                            const tempoReajuste = parseInt(value);
                            handleInputChange('tempo_reajuste', tempoReajuste);
                            
                            // Calcular próximo reajuste automaticamente se houver data início
                            if (formData.data_inicio && tempoReajuste) {
                              const proximoReajuste = calcularProximoReajuste(formData.data_inicio, tempoReajuste);
                              handleInputChange('proximo_reajuste', proximoReajuste);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 meses</SelectItem>
                            <SelectItem value="6">6 meses</SelectItem>
                            <SelectItem value="9">9 meses</SelectItem>
                            <SelectItem value="12">12 meses</SelectItem>
                            <SelectItem value="18">18 meses</SelectItem>
                            <SelectItem value="24">24 meses</SelectItem>
                            <SelectItem value="36">36 meses</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Intervalo entre reajustes de valor</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Índice de Reajuste</Label>
                        <Select 
                          value={formData.indice_reajuste || 'IPCA'} 
                          onValueChange={(value) => handleInputChange('indice_reajuste', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IPCA">IPCA</SelectItem>
                            <SelectItem value="IGPM">IGPM</SelectItem>
                            <SelectItem value="INPC">INPC</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Índice econômico para calcular reajustes</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ultimo_reajuste">Data do Último Reajuste</Label>
                        <InputWithIcon
                          id="ultimo_reajuste"
                          type="date"
                          icon={Calendar}
                          value={formData.ultimo_reajuste}
                          onChange={(e) => handleInputChange('ultimo_reajuste', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Último reajuste aplicado ao contrato</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="proximo_reajuste">Próximo Reajuste</Label>
                        <InputWithIcon
                          id="proximo_reajuste"
                          type="date"
                          icon={Calendar}
                          value={formData.proximo_reajuste}
                          onChange={(e) => handleInputChange('proximo_reajuste', e.target.value)}
                          readOnly
                          className="bg-muted/50 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground text-blue-600">
                          ✓ Calculado automaticamente: Data de Início + Período de Reajuste
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Aba 3: Valores */}
                <TabsContent value="valores" className="space-y-8">
                  {/* Valores e Encargos */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Valores e Encargos
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Configure todos os valores financeiros do contrato, incluindo seguros, taxas e parcelamentos.
                    </p>

                    {/* Valores Principais */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-green-500 to-emerald-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <CreditCard className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Valores Mensais
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Valores recorrentes mensais do contrato
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="valor_aluguel">Aluguel *</Label>
                          <CurrencyInput
                            id="valor_aluguel"
                            value={formData.valor_aluguel || 0}
                            onChange={(value) => handleInputChange('valor_aluguel', value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="valor_condominio">Condomínio</Label>
                          <CurrencyInput
                            id="valor_condominio"
                            value={formData.valor_condominio || 0}
                            onChange={(value) => handleInputChange('valor_condominio', value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="valor_fci">FCI</Label>
                          <CurrencyInput
                            id="valor_fci"
                            value={formData.valor_fci || 0}
                            onChange={(value) => handleInputChange('valor_fci', value)}
                          />
                          <p className="text-xs text-muted-foreground">Fundo de Conservação de Imóveis</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="taxa_administracao">Taxa de Administração (%)</Label>
                          <InputWithIcon
                            id="taxa_administracao"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            icon={Percent}
                            value={formData.taxa_administracao}
                            onChange={(e) => handleInputChange('taxa_administracao', parseFloat(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bonificacao">Bonificação</Label>
                          <CurrencyInput
                            id="bonificacao"
                            value={formData.bonificacao || 0}
                            onChange={(value) => handleInputChange('bonificacao', value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="multa_atraso">Multa por Atraso (%)</Label>
                          <InputWithIcon
                            id="multa_atraso"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            icon={Percent}
                            value={formData.multa_atraso || ''}
                            onChange={(e) => handleInputChange('multa_atraso', parseFloat(e.target.value) || 0)}
                            placeholder=""
                          />
                          <p className="text-xs text-muted-foreground">Percentual aplicado sobre o valor em atraso</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Seguros */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <Shield className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Seguros e IPTU
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Configure valores, datas e parcelamentos
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow duration-300"
                        >
                          <div className="flex items-center gap-2 pb-2 border-b border-blue-200 dark:border-blue-700">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <h4 className="text-sm font-semibold text-foreground">Seguro Fiança</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="valor_seguro_fianca">Valor Total</Label>
                              <CurrencyInput
                                id="valor_seguro_fianca"
                                value={formData.valor_seguro_fianca || 0}
                                onChange={(value) => handleInputChange('valor_seguro_fianca', value)}
                              />
                            </div>
                            
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor="data_inicio_seguro_fianca">Data Início</Label>
                                <InputWithIcon
                                  id="data_inicio_seguro_fianca"
                                  type="date"
                                  value={formData.data_inicio_seguro_fianca || ''}
                                  onChange={(e) => {
                                    const novaDataInicio = e.target.value;
                                    handleInputChange('data_inicio_seguro_fianca', novaDataInicio);
                                    
                                    // Calcular automaticamente data fim se houver parcelas definidas
                                    if (novaDataInicio && formData.parcelas_seguro_fianca) {
                                      const dataFimCalculada = calcularDataFim(novaDataInicio, formData.parcelas_seguro_fianca);
                                      handleInputChange('data_fim_seguro_fianca', dataFimCalculada);
                                    }
                                  }}
                                  icon={Calendar}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="data_fim_seguro_fianca">Data Fim</Label>
                                <InputWithIcon
                                  id="data_fim_seguro_fianca"
                                  type="date"
                                  value={formData.data_fim_seguro_fianca || ''}
                                  onChange={(e) => handleInputChange('data_fim_seguro_fianca', e.target.value)}
                                  icon={Calendar}
                                  className="bg-muted/30"
                                  readOnly
                                />
                                <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="parcelas_seguro_fianca">Parcelas (meses)</Label>
                              <InputWithIcon
                                id="parcelas_seguro_fianca"
                                type="number"
                                min="0"
                                max="60"
                                value={formData.parcelas_seguro_fianca || ''}
                                onChange={(e) => {
                                  const novasParcelas = parseInt(e.target.value) || 0;
                                  handleInputChange('parcelas_seguro_fianca', novasParcelas);
                                  
                                  // Recalcular data fim se houver data início
                                  if (formData.data_inicio_seguro_fianca && novasParcelas) {
                                    const dataFimCalculada = calcularDataFim(formData.data_inicio_seguro_fianca, novasParcelas);
                                    handleInputChange('data_fim_seguro_fianca', dataFimCalculada);
                                  }
                                }}
                                placeholder=""
                                icon={CreditCard}
                              />
                              <p className="text-xs text-muted-foreground">Cada parcela = 1 mês de cobertura</p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                          className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow duration-300"
                        >
                          <div className="flex items-center gap-2 pb-2 border-b border-orange-200 dark:border-orange-700">
                            <Shield className="w-4 h-4 text-orange-600" />
                            <h4 className="text-sm font-semibold text-foreground">Seguro Incêndio</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="valor_seguro_incendio">Valor Total</Label>
                              <CurrencyInput
                                id="valor_seguro_incendio"
                                value={formData.valor_seguro_incendio || 0}
                                onChange={(value) => handleInputChange('valor_seguro_incendio', value)}
                              />
                            </div>
                            
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor="data_inicio_seguro_incendio">Data Início</Label>
                                <InputWithIcon
                                  id="data_inicio_seguro_incendio"
                                  type="date"
                                  value={formData.data_inicio_seguro_incendio || ''}
                                  onChange={(e) => {
                                    const novaDataInicio = e.target.value;
                                    handleInputChange('data_inicio_seguro_incendio', novaDataInicio);
                                    
                                    // Calcular automaticamente data fim se houver parcelas definidas
                                    if (novaDataInicio && formData.parcelas_seguro_incendio) {
                                      const dataFimCalculada = calcularDataFim(novaDataInicio, formData.parcelas_seguro_incendio);
                                      handleInputChange('data_fim_seguro_incendio', dataFimCalculada);
                                    }
                                  }}
                                  icon={Calendar}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="data_fim_seguro_incendio">Data Fim</Label>
                                <InputWithIcon
                                  id="data_fim_seguro_incendio"
                                  type="date"
                                  value={formData.data_fim_seguro_incendio || ''}
                                  onChange={(e) => handleInputChange('data_fim_seguro_incendio', e.target.value)}
                                  icon={Calendar}
                                  className="bg-muted/30"
                                  readOnly
                                />
                                <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="parcelas_seguro_incendio">Parcelas (meses)</Label>
                              <InputWithIcon
                                id="parcelas_seguro_incendio"
                                type="number"
                                min="0"
                                max="60"
                                value={formData.parcelas_seguro_incendio || ''}
                                onChange={(e) => {
                                  const novasParcelas = parseInt(e.target.value) || 0;
                                  handleInputChange('parcelas_seguro_incendio', novasParcelas);
                                  
                                  // Recalcular data fim se houver data início
                                  if (formData.data_inicio_seguro_incendio && novasParcelas) {
                                    const dataFimCalculada = calcularDataFim(formData.data_inicio_seguro_incendio, novasParcelas);
                                    handleInputChange('data_fim_seguro_incendio', dataFimCalculada);
                                  }
                                }}
                                placeholder=""
                                icon={CreditCard}
                              />
                              <p className="text-xs text-muted-foreground">Cada parcela = 1 mês de cobertura</p>
                            </div>
                          </div>
                        </motion.div>

                        {/* IPTU Card */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                          className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow duration-300"
                        >
                          <div className="flex items-center gap-2 pb-2 border-b border-purple-200 dark:border-purple-700">
                            <Building className="w-4 h-4 text-purple-600" />
                            <h4 className="text-sm font-semibold text-foreground">IPTU</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="valor_iptu">Valor Total</Label>
                              <CurrencyInput
                                id="valor_iptu"
                                value={formData.valor_iptu || 0}
                                onChange={(value) => handleInputChange('valor_iptu', value)}
                              />
                            </div>
                            
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor="data_inicio_iptu">Data Início</Label>
                                <InputWithIcon
                                  id="data_inicio_iptu"
                                  type="date"
                                  value={formData.data_inicio_iptu || ''}
                                  onChange={(e) => {
                                    const novaDataInicio = e.target.value;
                                    handleInputChange('data_inicio_iptu', novaDataInicio);
                                    
                                    // Calcular automaticamente data fim se houver parcelas definidas
                                    if (novaDataInicio && formData.parcelas_iptu) {
                                      const dataFimCalculada = calcularDataFim(novaDataInicio, formData.parcelas_iptu);
                                      handleInputChange('data_fim_iptu', dataFimCalculada);
                                    }
                                  }}
                                  icon={Calendar}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="data_fim_iptu">Data Fim</Label>
                                <InputWithIcon
                                  id="data_fim_iptu"
                                  type="date"
                                  value={formData.data_fim_iptu || ''}
                                  onChange={(e) => handleInputChange('data_fim_iptu', e.target.value)}
                                  icon={Calendar}
                                  className="bg-muted/30"
                                  readOnly
                                />
                                <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="parcelas_iptu">Parcelas (meses)</Label>
                              <InputWithIcon
                                id="parcelas_iptu"
                                type="number"
                                min="0"
                                max="60"
                                value={formData.parcelas_iptu || ''}
                                onChange={(e) => {
                                  const novasParcelas = parseInt(e.target.value) || 0;
                                  handleInputChange('parcelas_iptu', novasParcelas);
                                  
                                  // Recalcular data fim se houver data início
                                  if (formData.data_inicio_iptu && novasParcelas) {
                                    const dataFimCalculada = calcularDataFim(formData.data_inicio_iptu, novasParcelas);
                                    handleInputChange('data_fim_iptu', dataFimCalculada);
                                  }
                                }}
                                placeholder=""
                                icon={CreditCard}
                              />
                              <p className="text-xs text-muted-foreground">Cada parcela = 1 mês de cobertura</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Retidos e Antecipação */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-amber-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <Clock className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Retidos e Antecipação
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Configure quais valores serão retidos ou antecipados
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Retidos */}
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                          className="space-y-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:shadow-md transition-shadow duration-300"
                        >
                          <div className="flex items-center gap-2 pb-2 border-b border-red-200 dark:border-red-700">
                            <ArrowDown className="w-4 h-4 text-red-600" />
                            <h4 className="text-sm font-semibold text-foreground">Valores Retidos</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-4">
                            Valores descontados do aluguel do proprietário
                          </p>
                          
                          <div className="grid grid-cols-1 gap-2">
                            <motion.label 
                              htmlFor="retido_fci"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: 0.5 }}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                formData.retido_fci 
                                  ? 'bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-600' 
                                  : 'bg-white border-red-200 dark:bg-red-900/10 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
                              }`}
                            >
                              <Checkbox
                                id="retido_fci"
                                checked={formData.retido_fci || false}
                                onCheckedChange={(checked) => handleInputChange('retido_fci', checked)}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <DollarSign className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium flex-1">FCI</span>
                              </div>
                            </motion.label>

                            <motion.label 
                              htmlFor="retido_iptu"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: 0.6 }}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                formData.retido_iptu 
                                  ? 'bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-600' 
                                  : 'bg-white border-red-200 dark:bg-red-900/10 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
                              }`}
                            >
                              <Checkbox
                                id="retido_iptu"
                                checked={formData.retido_iptu || false}
                                onCheckedChange={(checked) => handleInputChange('retido_iptu', checked)}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <Building className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium flex-1">IPTU</span>
                              </div>
                            </motion.label>

                            <motion.label 
                              htmlFor="retido_condominio"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: 0.7 }}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                formData.retido_condominio 
                                  ? 'bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-600' 
                                  : 'bg-white border-red-200 dark:bg-red-900/10 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
                              }`}
                            >
                              <Checkbox
                                id="retido_condominio"
                                checked={formData.retido_condominio || false}
                                onCheckedChange={(checked) => handleInputChange('retido_condominio', checked)}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <Building className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium flex-1">Condomínio</span>
                              </div>
                            </motion.label>

                            <motion.label 
                              htmlFor="retido_seguro_fianca"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: 0.8 }}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                formData.retido_seguro_fianca 
                                  ? 'bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-600' 
                                  : 'bg-white border-red-200 dark:bg-red-900/10 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
                              }`}
                            >
                              <Checkbox
                                id="retido_seguro_fianca"
                                checked={formData.retido_seguro_fianca || false}
                                onCheckedChange={(checked) => handleInputChange('retido_seguro_fianca', checked)}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <Shield className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium flex-1">Seguro Fiança</span>
                              </div>
                            </motion.label>

                            <motion.label 
                              htmlFor="retido_seguro_incendio"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: 0.9 }}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                formData.retido_seguro_incendio 
                                  ? 'bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-600' 
                                  : 'bg-white border-red-200 dark:bg-red-900/10 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
                              }`}
                            >
                              <Checkbox
                                id="retido_seguro_incendio"
                                checked={formData.retido_seguro_incendio || false}
                                onCheckedChange={(checked) => handleInputChange('retido_seguro_incendio', checked)}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <Shield className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium flex-1">Seguro Incêndio</span>
                              </div>
                            </motion.label>
                          </div>
                        </motion.div>

                        {/* Antecipação */}
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 }}
                          className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow duration-300"
                        >
                          <div className="flex items-center gap-2 pb-2 border-b border-green-200 dark:border-green-700">
                            <ArrowUp className="w-4 h-4 text-green-600" />
                            <h4 className="text-sm font-semibold text-foreground">Valores Antecipados</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-4">
                            Valores pagos antecipadamente pelo inquilino
                          </p>
                          
                          <div className="grid grid-cols-1 gap-2">
                            <motion.label 
                              htmlFor="antecipa_condominio"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: 0.6 }}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                formData.antecipa_condominio 
                                  ? 'bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-600' 
                                  : 'bg-white border-green-200 dark:bg-green-900/10 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                            >
                              <Checkbox
                                id="antecipa_condominio"
                                checked={formData.antecipa_condominio || false}
                                onCheckedChange={(checked) => handleInputChange('antecipa_condominio', checked)}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <Building className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium flex-1">Condomínio</span>
                              </div>
                            </motion.label>

                            <motion.label 
                              htmlFor="antecipa_seguro_fianca"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: 0.7 }}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                formData.antecipa_seguro_fianca 
                                  ? 'bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-600' 
                                  : 'bg-white border-green-200 dark:bg-green-900/10 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                            >
                              <Checkbox
                                id="antecipa_seguro_fianca"
                                checked={formData.antecipa_seguro_fianca || false}
                                onCheckedChange={(checked) => handleInputChange('antecipa_seguro_fianca', checked)}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <Shield className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium flex-1">Seguro Fiança</span>
                              </div>
                            </motion.label>

                            <motion.label 
                              htmlFor="antecipa_seguro_incendio"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: 0.8 }}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                formData.antecipa_seguro_incendio 
                                  ? 'bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-600' 
                                  : 'bg-white border-green-200 dark:bg-green-900/10 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                            >
                              <Checkbox
                                id="antecipa_seguro_incendio"
                                checked={formData.antecipa_seguro_incendio || false}
                                onCheckedChange={(checked) => handleInputChange('antecipa_seguro_incendio', checked)}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <Shield className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium flex-1">Seguro Incêndio</span>
                              </div>
                            </motion.label>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </TabsContent>

                {/* Aba 4: Garantias */}
                <TabsContent value="garantias" className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Garantias do Contrato
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Configure o tipo de garantia e forneça as informações necessárias conforme a modalidade escolhida.
                    </p>

                    {/* Seleção do Tipo de Garantia */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <Shield className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Tipo de Garantia
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Selecione a modalidade de garantia
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo de Garantia *</Label>
                        <Select 
                          value={formData.tipo_garantia || undefined}
                          onValueChange={(value) => handleInputChange('tipo_garantia', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de garantia..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fiador">Fiador</SelectItem>
                            <SelectItem value="Caução">Caução</SelectItem>
                            <SelectItem value="Seguro-fiança">Seguro Fiança</SelectItem>
                            <SelectItem value="Título de Capitalização">Título de Capitalização</SelectItem>
                            <SelectItem value="Sem garantia">Sem Garantia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>

                    {/* Formulários dinâmicos baseados no tipo de garantia */}
                    {formData.tipo_garantia === 'Fiador' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-green-500 to-emerald-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <User className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Fiadores
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Adicione as informações dos fiadores
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          {/* Botão para adicionar fiador */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-foreground">Lista de Fiadores</h4>
                              <p className="text-xs text-muted-foreground">
                                Adicione um ou mais fiadores para garantir o contrato
                              </p>
                            </div>
                            <Button 
                              type="button"
                              onClick={adicionarFiador}
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Adicionar Fiador
                            </Button>
                          </div>

                          {/* Lista de fiadores */}
                          {(!formData.fiadores || formData.fiadores.length === 0) ? (
                            <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20">
                              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <h4 className="text-lg font-medium text-muted-foreground mb-2">
                                Nenhum fiador adicionado
                              </h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Clique em "Adicionar Fiador" para começar
                              </p>
                              <Button 
                                type="button"
                                onClick={adicionarFiador} 
                                size="sm"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Primeiro Fiador
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {formData.fiadores.map((fiador, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow duration-200"
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <User className="w-4 h-4 text-green-600" />
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-semibold text-foreground">
                                          Fiador {index + 1}
                                        </h3>
                                        {fiador.nome && (
                                          <p className="text-sm text-muted-foreground">
                                            {fiador.nome}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      onClick={() => removerFiador(index)}
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  <div className="space-y-6">
                                    {/* Dados Pessoais */}
                                    <div>
                                      <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4 text-green-600" />
                                        Dados Pessoais
                                      </h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_nome_${index}`}>Nome Completo *</Label>
                                          <InputWithIcon
                                            id={`fiador_nome_${index}`}
                                            value={fiador.nome}
                                            onChange={(e) => atualizarFiador(index, 'nome', e.target.value)}
                                            placeholder="Nome completo do fiador"
                                            icon={User}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_cpf_${index}`}>CPF/CNPJ *</Label>
                                          <InputWithIcon
                                            id={`fiador_cpf_${index}`}
                                            value={fiador.cpf_cnpj}
                                            onChange={(e) => atualizarFiador(index, 'cpf_cnpj', e.target.value)}
                                            placeholder="000.000.000-00"
                                            icon={IdCard}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_telefone_${index}`}>Telefone</Label>
                                          <InputWithIcon
                                            id={`fiador_telefone_${index}`}
                                            value={fiador.telefone}
                                            onChange={(e) => atualizarFiador(index, 'telefone', e.target.value)}
                                            placeholder="(00) 00000-0000"
                                            icon={Phone}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_email_${index}`}>E-mail</Label>
                                          <InputWithIcon
                                            id={`fiador_email_${index}`}
                                            value={fiador.email}
                                            onChange={(e) => atualizarFiador(index, 'email', e.target.value)}
                                            placeholder="email@exemplo.com"
                                            icon={Mail}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_profissao_${index}`}>Profissão</Label>
                                          <InputWithIcon
                                            id={`fiador_profissao_${index}`}
                                            value={fiador.profissao}
                                            onChange={(e) => atualizarFiador(index, 'profissao', e.target.value)}
                                            placeholder="Profissão"
                                            icon={User}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_estado_civil_${index}`}>Estado Civil</Label>
                                          <Select 
                                            value={fiador.estado_civil}
                                            onValueChange={(value) => atualizarFiador(index, 'estado_civil', value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                                              <SelectItem value="casado">Casado(a)</SelectItem>
                                              <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                                              <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                                              <SelectItem value="uniao_estavel">União Estável</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Endereço */}
                                    <div>
                                      <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        Endereço
                                      </h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="space-y-2 lg:col-span-2">
                                          <Label htmlFor={`fiador_rua_${index}`}>Rua/Logradouro</Label>
                                          <InputWithIcon
                                            id={`fiador_rua_${index}`}
                                            value={fiador.endereco?.rua || ''}
                                            onChange={(e) => atualizarEnderecoFiador(index, 'rua', e.target.value)}
                                            placeholder="Nome da rua"
                                            icon={MapPin}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_numero_${index}`}>Número</Label>
                                          <InputWithIcon
                                            id={`fiador_numero_${index}`}
                                            value={fiador.endereco?.numero || ''}
                                            onChange={(e) => atualizarEnderecoFiador(index, 'numero', e.target.value)}
                                            placeholder="Nº"
                                            icon={MapPin}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_complemento_${index}`}>Complemento</Label>
                                          <InputWithIcon
                                            id={`fiador_complemento_${index}`}
                                            value={fiador.endereco?.complemento || ''}
                                            onChange={(e) => atualizarEnderecoFiador(index, 'complemento', e.target.value)}
                                            placeholder="Apto, bloco"
                                            icon={MapPin}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_bairro_${index}`}>Bairro</Label>
                                          <InputWithIcon
                                            id={`fiador_bairro_${index}`}
                                            value={fiador.endereco?.bairro || ''}
                                            onChange={(e) => atualizarEnderecoFiador(index, 'bairro', e.target.value)}
                                            placeholder="Bairro"
                                            icon={MapPin}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_cidade_${index}`}>Cidade</Label>
                                          <InputWithIcon
                                            id={`fiador_cidade_${index}`}
                                            value={fiador.endereco?.cidade || ''}
                                            onChange={(e) => atualizarEnderecoFiador(index, 'cidade', e.target.value)}
                                            placeholder="Cidade"
                                            icon={MapPin}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_uf_${index}`}>UF</Label>
                                          <Select 
                                            value={fiador.endereco?.uf || ''}
                                            onValueChange={(value) => atualizarEnderecoFiador(index, 'uf', value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="UF" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="AC">AC</SelectItem>
                                              <SelectItem value="AL">AL</SelectItem>
                                              <SelectItem value="AP">AP</SelectItem>
                                              <SelectItem value="AM">AM</SelectItem>
                                              <SelectItem value="BA">BA</SelectItem>
                                              <SelectItem value="CE">CE</SelectItem>
                                              <SelectItem value="DF">DF</SelectItem>
                                              <SelectItem value="ES">ES</SelectItem>
                                              <SelectItem value="GO">GO</SelectItem>
                                              <SelectItem value="MA">MA</SelectItem>
                                              <SelectItem value="MT">MT</SelectItem>
                                              <SelectItem value="MS">MS</SelectItem>
                                              <SelectItem value="MG">MG</SelectItem>
                                              <SelectItem value="PA">PA</SelectItem>
                                              <SelectItem value="PB">PB</SelectItem>
                                              <SelectItem value="PR">PR</SelectItem>
                                              <SelectItem value="PE">PE</SelectItem>
                                              <SelectItem value="PI">PI</SelectItem>
                                              <SelectItem value="RJ">RJ</SelectItem>
                                              <SelectItem value="RN">RN</SelectItem>
                                              <SelectItem value="RS">RS</SelectItem>
                                              <SelectItem value="RO">RO</SelectItem>
                                              <SelectItem value="RR">RR</SelectItem>
                                              <SelectItem value="SC">SC</SelectItem>
                                              <SelectItem value="SP">SP</SelectItem>
                                              <SelectItem value="SE">SE</SelectItem>
                                              <SelectItem value="TO">TO</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_cep_${index}`}>CEP</Label>
                                          <InputWithIcon
                                            id={`fiador_cep_${index}`}
                                            value={fiador.endereco?.cep || ''}
                                            onChange={(e) => atualizarEnderecoFiador(index, 'cep', e.target.value)}
                                            placeholder="00000-000"
                                            icon={MapPin}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Informações Financeiras */}
                                    <div>
                                      <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        Informações Financeiras
                                      </h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor={`fiador_renda_${index}`}>Renda Mensal</Label>
                                          <CurrencyInput
                                            id={`fiador_renda_${index}`}
                                            value={fiador.renda || 0}
                                            onChange={(value) => atualizarFiador(index, 'renda', value)}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Documentos */}
                                    <div>
                                      <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-purple-600" />
                                        Documentos
                                      </h6>
                                      
                                      {!fiador.documentos_arquivo ? (
                                        <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 hover:border-muted-foreground/40 transition-colors">
                                          <div className="text-center">
                                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                                            <h5 className="font-medium text-foreground mb-2">
                                              Anexar Documentos do Fiador
                                            </h5>
                                            <p className="text-sm text-muted-foreground mb-3">
                                              RG, CPF, comprovante de renda e documentos pessoais
                                            </p>
                                            <label className="inline-flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 cursor-pointer transition-colors text-sm">
                                              <Upload className="w-4 h-4" />
                                              Selecionar Arquivo
                                              <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    if (file.size > 10 * 1024 * 1024) {
                                                      alert('Arquivo muito grande. Tamanho máximo: 10MB.');
                                                      return;
                                                    }
                                                    const documento = {
                                                      nome: file.name,
                                                      tipo: file.type,
                                                      tamanho: file.size,
                                                      data_upload: new Date().toISOString()
                                                    };
                                                    atualizarFiador(index, 'documentos_arquivo', documento);
                                                  }
                                                }}
                                              />
                                            </label>
                                          </div>
                                        </div>
                                      ) : (
                                        <motion.div
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className="p-2 rounded-lg bg-green-200 dark:bg-green-800">
                                                <File className="w-4 h-4 text-green-700 dark:text-green-300" />
                                              </div>
                                              <div>
                                                <p className="font-medium text-green-800 dark:text-green-200">
                                                  {fiador.documentos_arquivo.nome}
                                                </p>
                                                <p className="text-xs text-green-600 dark:text-green-400">
                                                  {formatarTamanhoArquivo(fiador.documentos_arquivo.tamanho)} • 
                                                  Enviado em {new Date(fiador.documentos_arquivo.data_upload || '').toLocaleDateString('pt-BR')}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {fiador.documentos_arquivo.url && (
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => window.open(fiador.documentos_arquivo?.url, '_blank')}
                                                >
                                                  <Download className="w-4 h-4" />
                                                </Button>
                                              )}
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => atualizarFiador(index, 'documentos_arquivo', null)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                              >
                                                <X className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          </div>
                                          
                                          {/* Opção para trocar arquivo */}
                                          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                                            <label className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 cursor-pointer">
                                              <Upload className="w-4 h-4" />
                                              Substituir arquivo
                                              <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    if (file.size > 10 * 1024 * 1024) {
                                                      alert('Arquivo muito grande. Tamanho máximo: 10MB.');
                                                      return;
                                                    }
                                                    const documento = {
                                                      nome: file.name,
                                                      tipo: file.type,
                                                      tamanho: file.size,
                                                      data_upload: new Date().toISOString()
                                                    };
                                                    atualizarFiador(index, 'documentos_arquivo', documento);
                                                  }
                                                }}
                                              />
                                            </label>
                                          </div>
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {formData.tipo_garantia === 'Caução' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <Banknote className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Caução
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Informações sobre a caução
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-3">
                              Informações da Caução
                            </h4>
                            <p className="text-xs text-muted-foreground mb-4">
                              Configure os dados da caução oferecida como garantia
                            </p>
                          </div>

                          <div className="space-y-6">
                            {/* Tipo e Valor da Caução */}
                            <div>
                              <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-yellow-600" />
                                Tipo e Valor
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="tipo_caucao">Tipo de Caução *</Label>
                                  <Select 
                                    value={formData.caucao?.tipo || ''}
                                    onValueChange={(value) => atualizarCaucao('tipo', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                      <SelectItem value="titulo">Título/Aplicação</SelectItem>
                                      <SelectItem value="imovel">Imóvel</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="valor_caucao">Valor da Caução *</Label>
                                  <CurrencyInput
                                    id="valor_caucao"
                                    value={formData.caucao?.valor || 0}
                                    onChange={(value) => atualizarCaucao('valor', value)}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Dados Bancários (para dinheiro/título) */}
                            {(formData.caucao?.tipo === 'dinheiro' || formData.caucao?.tipo === 'titulo') && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                  <Building className="w-4 h-4 text-blue-600" />
                                  Dados Bancários
                                </h6>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="banco_caucao">Banco</Label>
                                    <InputWithIcon
                                      id="banco_caucao"
                                      value={formData.caucao?.banco || ''}
                                      onChange={(e) => atualizarCaucao('banco', e.target.value)}
                                      placeholder="Nome do banco"
                                      icon={Building}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="agencia_caucao">Agência</Label>
                                    <InputWithIcon
                                      id="agencia_caucao"
                                      value={formData.caucao?.agencia || ''}
                                      onChange={(e) => atualizarCaucao('agencia', e.target.value)}
                                      placeholder="Número da agência"
                                      icon={Building}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="conta_caucao">Conta</Label>
                                    <InputWithIcon
                                      id="conta_caucao"
                                      value={formData.caucao?.conta || ''}
                                      onChange={(e) => atualizarCaucao('conta', e.target.value)}
                                      placeholder="Número da conta"
                                      icon={Building}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Descrição e Data */}
                            <div>
                              <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-600" />
                                Detalhes Adicionais
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="descricao_caucao">Descrição</Label>
                                  <Textarea
                                    id="descricao_caucao"
                                    value={formData.caucao?.descricao || ''}
                                    onChange={(e) => atualizarCaucao('descricao', e.target.value)}
                                    placeholder="Detalhes sobre a caução..."
                                    rows={3}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="data_deposito">Data do Depósito</Label>
                                  <InputWithIcon
                                    id="data_deposito"
                                    type="date"
                                    value={formData.caucao?.data_deposito || ''}
                                    onChange={(e) => atualizarCaucao('data_deposito', e.target.value)}
                                    icon={Calendar}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Upload de Comprovante */}
                            <div>
                              <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-orange-600" />
                                Comprovante
                              </h6>
                              
                              {!formData.caucao?.comprovante_arquivo ? (
                                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 hover:border-muted-foreground/40 transition-colors">
                                  <div className="text-center">
                                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                                    <h5 className="font-medium text-foreground mb-2">
                                      Anexar Comprovante da Caução
                                    </h5>
                                    <p className="text-sm text-muted-foreground mb-3">
                                      Comprovante de depósito, extrato ou documento da caução
                                    </p>
                                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 cursor-pointer transition-colors text-sm">
                                      <Upload className="w-4 h-4" />
                                      Selecionar Arquivo
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const comprovante = {
                                              nome: file.name,
                                              tipo: file.type,
                                              tamanho: file.size,
                                              data_upload: new Date().toISOString()
                                            };
                                            atualizarCaucao('comprovante_arquivo', comprovante);
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <File className="w-4 h-4 text-green-600" />
                                      <span className="text-sm font-medium text-foreground">
                                        {formData.caucao.comprovante_arquivo.nome}
                                      </span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => atualizarCaucao('comprovante_arquivo', null)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {formData.tipo_garantia === 'Seguro-fiança' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <Shield className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Seguro Fiança
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Informações da apólice de seguro fiança
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-3">
                              Informações da Apólice de Seguro Fiança
                            </h4>
                            <p className="text-xs text-muted-foreground mb-4">
                              Preencha os dados da apólice de seguro fiança contratada
                            </p>
                          </div>

                          <div className="space-y-6">
                            {/* Dados da Seguradora */}
                            <div>
                              <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-purple-600" />
                                Dados da Seguradora
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="seguradora">Seguradora *</Label>
                                  <InputWithIcon
                                    id="seguradora"
                                    value={formData.apolice_seguro_fianca?.seguradora || ''}
                                    onChange={(e) => atualizarSeguroFianca('seguradora', e.target.value)}
                                    placeholder="Nome da seguradora"
                                    icon={Shield}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="numero_apolice">Número da Apólice *</Label>
                                  <InputWithIcon
                                    id="numero_apolice"
                                    value={formData.apolice_seguro_fianca?.numero_apolice || ''}
                                    onChange={(e) => atualizarSeguroFianca('numero_apolice', e.target.value)}
                                    placeholder="Número da apólice"
                                    icon={FileText}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Valores e Cobertura */}
                            <div>
                              <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                Valores e Cobertura
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="valor_cobertura">Valor da Cobertura *</Label>
                                  <CurrencyInput
                                    id="valor_cobertura"
                                    value={formData.apolice_seguro_fianca?.valor_cobertura || 0}
                                    onChange={(value) => atualizarSeguroFianca('valor_cobertura', value)}
                                  />
                                  <p className="text-xs text-muted-foreground">Valor máximo coberto pela apólice</p>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="premio">Prêmio (Valor Pago) *</Label>
                                  <CurrencyInput
                                    id="premio"
                                    value={formData.apolice_seguro_fianca?.premio || 0}
                                    onChange={(value) => atualizarSeguroFianca('premio', value)}
                                  />
                                  <p className="text-xs text-muted-foreground">Valor pago pela apólice</p>
                                </div>
                              </div>
                            </div>

                            {/* Vigência */}
                            <div>
                              <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                Período de Vigência
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="data_inicio_seguro">Data de Início *</Label>
                                  <InputWithIcon
                                    id="data_inicio_seguro"
                                    type="date"
                                    value={formData.apolice_seguro_fianca?.data_inicio || ''}
                                    onChange={(e) => atualizarSeguroFianca('data_inicio', e.target.value)}
                                    icon={Calendar}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="data_fim_seguro">Data de Término *</Label>
                                  <InputWithIcon
                                    id="data_fim_seguro"
                                    type="date"
                                    value={formData.apolice_seguro_fianca?.data_fim || ''}
                                    onChange={(e) => atualizarSeguroFianca('data_fim', e.target.value)}
                                    icon={Calendar}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Upload do Contrato */}
                            <div>
                              <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-orange-600" />
                                Contrato da Apólice
                              </h6>
                              
                              {!formData.apolice_seguro_fianca?.contrato_arquivo ? (
                                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 hover:border-muted-foreground/40 transition-colors">
                                  <div className="text-center">
                                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-foreground mb-2">
                                      Anexar Contrato de Seguro Fiança
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      Faça upload do contrato da apólice de seguro fiança (PDF, DOC, DOCX, JPG, PNG - máx 10MB)
                                    </p>
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer transition-colors">
                                      <Upload className="w-4 h-4" />
                                      Selecionar Arquivo
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={handleFileUpload}
                                      />
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <File className="w-5 h-5 text-green-600" />
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-foreground">
                                          {formData.apolice_seguro_fianca.contrato_arquivo.nome}
                                        </h5>
                                        <p className="text-sm text-muted-foreground">
                                          {formatarTamanhoArquivo(formData.apolice_seguro_fianca.contrato_arquivo.tamanho)} • 
                                          Enviado em {new Date(formData.apolice_seguro_fianca.contrato_arquivo.data_upload || '').toLocaleDateString('pt-BR')}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {formData.apolice_seguro_fianca.contrato_arquivo.url && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(formData.apolice_seguro_fianca?.contrato_arquivo?.url, '_blank')}
                                        >
                                          <Download className="w-4 h-4" />
                                        </Button>
                                      )}
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={removerArquivo}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Opção para trocar arquivo */}
                                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                                    <label className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 cursor-pointer">
                                      <Upload className="w-4 h-4" />
                                      Substituir arquivo
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={handleFileUpload}
                                      />
                                    </label>
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            {/* Resumo Visual */}
                            {formData.apolice_seguro_fianca?.seguradora && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                              >
                                <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  Resumo da Apólice
                                </h6>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground block">Seguradora:</span>
                                    <span className="font-semibold text-foreground">
                                      {formData.apolice_seguro_fianca.seguradora}
                                    </span>
                                  </div>
                                  {formData.apolice_seguro_fianca.numero_apolice && (
                                    <div>
                                      <span className="text-muted-foreground block">Apólice:</span>
                                      <span className="font-semibold text-foreground">
                                        {formData.apolice_seguro_fianca.numero_apolice}
                                      </span>
                                    </div>
                                  )}
                                  {formData.apolice_seguro_fianca.valor_cobertura > 0 && (
                                    <div>
                                      <span className="text-muted-foreground block">Cobertura:</span>
                                      <span className="font-semibold text-foreground">
                                        R$ {formData.apolice_seguro_fianca.valor_cobertura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                  )}
                                  {formData.apolice_seguro_fianca.contrato_arquivo && (
                                    <div>
                                      <span className="text-muted-foreground block">Contrato:</span>
                                      <span className="font-semibold text-foreground flex items-center gap-1">
                                        <File className="w-3 h-3 text-green-600" />
                                        Anexado
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {formData.tipo_garantia === 'Título de Capitalização' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-teal-500 to-cyan-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <CreditCard className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Título de Capitalização
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Informações do título de capitalização
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-3">
                              Dados do Título de Capitalização
                            </h4>
                            <p className="text-xs text-muted-foreground mb-4">
                              Configure as informações do título oferecido como garantia
                            </p>
                          </div>

                          <div className="space-y-6">
                            {/* Dados da Seguradora e Título */}
                            <div>
                              <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-teal-600" />
                                Dados do Título
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="seguradora_titulo">Seguradora/Instituição *</Label>
                                  <InputWithIcon
                                    id="seguradora_titulo"
                                    value={formData.titulo_capitalizacao?.seguradora || ''}
                                    onChange={(e) => atualizarTituloCapitalizacao('seguradora', e.target.value)}
                                    placeholder="Nome da seguradora"
                                    icon={Shield}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="numero_titulo">Número do Título *</Label>
                                  <InputWithIcon
                                    id="numero_titulo"
                                    value={formData.titulo_capitalizacao?.numero_titulo || ''}
                                    onChange={(e) => atualizarTituloCapitalizacao('numero_titulo', e.target.value)}
                                    placeholder="Número do título"
                                    icon={CreditCard}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Valores */}
                            <div>
                              <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                Valores
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="valor_nominal">Valor Nominal *</Label>
                                  <CurrencyInput
                                    id="valor_nominal"
                                    value={formData.titulo_capitalizacao?.valor_nominal || 0}
                                    onChange={(value) => atualizarTituloCapitalizacao('valor_nominal', value)}
                                  />
                                  <p className="text-xs text-muted-foreground">Valor de face do título</p>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="valor_resgate">Valor de Resgate *</Label>
                                  <CurrencyInput
                                    id="valor_resgate"
                                    value={formData.titulo_capitalizacao?.valor_resgate || 0}
                                    onChange={(value) => atualizarTituloCapitalizacao('valor_resgate', value)}
                                  />
                                  <p className="text-xs text-muted-foreground">Valor atual de resgate</p>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="numero_sorteios">Número de Sorteios</Label>
                                  <InputWithIcon
                                    id="numero_sorteios"
                                    type="number"
                                    min="0"
                                    value={formData.titulo_capitalizacao?.numero_sorteios || 0}
                                    onChange={(e) => atualizarTituloCapitalizacao('numero_sorteios', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    icon={CreditCard}
                                  />
                                  <p className="text-xs text-muted-foreground">Quantidade de sorteios</p>
                                </div>
                              </div>
                            </div>

                            {/* Datas */}
                            <div>
                              <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                Período de Vigência
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="data_inicio_titulo">Data de Início *</Label>
                                  <InputWithIcon
                                    id="data_inicio_titulo"
                                    type="date"
                                    value={formData.titulo_capitalizacao?.data_inicio || ''}
                                    onChange={(e) => atualizarTituloCapitalizacao('data_inicio', e.target.value)}
                                    icon={Calendar}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="data_vencimento_titulo">Data de Vencimento *</Label>
                                  <InputWithIcon
                                    id="data_vencimento_titulo"
                                    type="date"
                                    value={formData.titulo_capitalizacao?.data_vencimento || ''}
                                    onChange={(e) => atualizarTituloCapitalizacao('data_vencimento', e.target.value)}
                                    icon={Calendar}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Upload do Título */}
                            <div>
                              <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-orange-600" />
                                Documento do Título
                              </h6>
                              
                              {!formData.titulo_capitalizacao?.titulo_arquivo ? (
                                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 hover:border-muted-foreground/40 transition-colors">
                                  <div className="text-center">
                                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                                    <h5 className="font-medium text-foreground mb-2">
                                      Anexar Título de Capitalização
                                    </h5>
                                    <p className="text-sm text-muted-foreground mb-3">
                                      Documento ou comprovante do título de capitalização
                                    </p>
                                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer transition-colors text-sm">
                                      <Upload className="w-4 h-4" />
                                      Selecionar Arquivo
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const titulo = {
                                              nome: file.name,
                                              tipo: file.type,
                                              tamanho: file.size,
                                              data_upload: new Date().toISOString()
                                            };
                                            atualizarTituloCapitalizacao('titulo_arquivo', titulo);
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <File className="w-4 h-4 text-green-600" />
                                      <span className="text-sm font-medium text-foreground">
                                        {formData.titulo_capitalizacao.titulo_arquivo.nome}
                                      </span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => atualizarTituloCapitalizacao('titulo_arquivo', null)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            {/* Resumo */}
                            {formData.titulo_capitalizacao?.seguradora && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg border border-teal-200 dark:border-teal-800"
                              >
                                <h6 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  Resumo do Título
                                </h6>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground block">Seguradora:</span>
                                    <span className="font-semibold text-foreground">
                                      {formData.titulo_capitalizacao.seguradora}
                                    </span>
                                  </div>
                                  {formData.titulo_capitalizacao.numero_titulo && (
                                    <div>
                                      <span className="text-muted-foreground block">Número:</span>
                                      <span className="font-semibold text-foreground">
                                        {formData.titulo_capitalizacao.numero_titulo}
                                      </span>
                                    </div>
                                  )}
                                  {formData.titulo_capitalizacao.valor_resgate > 0 && (
                                    <div>
                                      <span className="text-muted-foreground block">Valor Resgate:</span>
                                      <span className="font-semibold text-foreground">
                                        R$ {formData.titulo_capitalizacao.valor_resgate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </TabsContent>

                {/* Aba 5: Plano de Locação */}
                <TabsContent value="plano" className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div 
                        className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <FileText className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Plano de Locação
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Escolha o plano de administração e taxas aplicáveis ao contrato
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Tipo de Plano</Label>
                        <Select 
                          value={formData.tipo_plano_locacao || ''}
                          onValueChange={(value) => handleInputChange('tipo_plano_locacao', value)}
                        >
                          <SelectTrigger className="bg-muted/50 border-border text-foreground">
                            <SelectValue placeholder="Selecione o plano de locação..." />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="completo_opcao1" className="text-foreground hover:bg-accent">
                              <div className="flex flex-col">
                                <span className="font-medium">Locação Completo - Opção 1</span>
                                <span className="text-xs text-muted-foreground">100% (1º aluguel) + 10% (demais)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="completo_opcao2" className="text-foreground hover:bg-accent">
                              <div className="flex flex-col">
                                <span className="font-medium">Locação Completo - Opção 2</span>
                                <span className="text-xs text-muted-foreground">16% (todos os aluguéis)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="basico_opcao1" className="text-foreground hover:bg-accent">
                              <div className="flex flex-col">
                                <span className="font-medium">Locação Básico - Opção 1</span>
                                <span className="text-xs text-muted-foreground">50% (1º aluguel) + 5% (demais)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="basico_opcao2" className="text-foreground hover:bg-accent">
                              <div className="flex flex-col">
                                <span className="font-medium">Locação Básico - Opção 2</span>
                                <span className="text-xs text-muted-foreground">8% (todos os aluguéis)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                        
                      {formData.tipo_plano_locacao && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800"
                        >
                          <div className="text-sm text-emerald-800 dark:text-emerald-200">
                            {formData.tipo_plano_locacao === 'completo_opcao1' && (
                              <div>
                                <p className="font-semibold mb-3 text-lg text-emerald-900 dark:text-emerald-100">
                                  📋 Locação Completo (Administração + Corretor) - Opção 1
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-3">
                                    <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Taxa de Locação</p>
                                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">100%</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">do primeiro aluguel</p>
                                  </div>
                                  <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-3">
                                    <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Taxa de Administração</p>
                                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">10%</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">dos demais aluguéis</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {formData.tipo_plano_locacao === 'completo_opcao2' && (
                              <div>
                                <p className="font-semibold mb-3 text-lg text-emerald-900 dark:text-emerald-100">
                                  📋 Locação Completo (Administração + Corretor) - Opção 2
                                </p>
                                <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-4">
                                  <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Taxa Unificada</p>
                                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">16%</p>
                                  <p className="text-sm text-emerald-600 dark:text-emerald-400">sobre todos os aluguéis (administração + locação)</p>
                                </div>
                              </div>
                            )}
                            {formData.tipo_plano_locacao === 'basico_opcao1' && (
                              <div>
                                <p className="font-semibold mb-3 text-lg text-emerald-900 dark:text-emerald-100">
                                  📋 Locação Básico (Administração) - Opção 1
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-3">
                                    <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Taxa de Locação</p>
                                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">50%</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">do primeiro aluguel</p>
                                  </div>
                                  <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-3">
                                    <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Taxa de Administração</p>
                                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">5%</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">dos demais aluguéis</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {formData.tipo_plano_locacao === 'basico_opcao2' && (
                              <div>
                                <p className="font-semibold mb-3 text-lg text-emerald-900 dark:text-emerald-100">
                                  📋 Locação Básico (Administração) - Opção 2
                                </p>
                                <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-4">
                                  <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Taxa Unificada</p>
                                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">8%</p>
                                  <p className="text-sm text-emerald-600 dark:text-emerald-400">sobre todos os aluguéis (locação + administração)</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Dados do Corretor - Aparece apenas para planos "Completo" */}
                      {(formData.tipo_plano_locacao === 'completo_opcao1' || formData.tipo_plano_locacao === 'completo_opcao2') && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-foreground">
                                Dados do Corretor
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Informações do corretor responsável pela locação
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700">
                              <Checkbox
                                id="tem_corretor"
                                checked={formData.tem_corretor}
                                onCheckedChange={(checked) => handleInputChange('tem_corretor', !!checked)}
                              />
                              <Label htmlFor="tem_corretor" className="cursor-pointer text-foreground font-medium">
                                Há corretor nesta locação
                              </Label>
                            </div>

                            {formData.tem_corretor && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="corretor_nome">Nome do Corretor</Label>
                                    <InputWithIcon
                                      id="corretor_nome"
                                      type="text"
                                      value={formData.corretor_nome || ''}
                                      onChange={(e) => handleInputChange('corretor_nome', e.target.value)}
                                      placeholder="Nome completo do corretor"
                                      icon={User}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="corretor_creci">CRECI</Label>
                                    <InputWithIcon
                                      id="corretor_creci"
                                      type="text"
                                      value={formData.corretor_creci || ''}
                                      onChange={(e) => handleInputChange('corretor_creci', e.target.value)}
                                      placeholder="Número do CRECI"
                                      icon={IdCard}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="corretor_cpf">CPF</Label>
                                    <InputWithIcon
                                      id="corretor_cpf"
                                      type="text"
                                      value={formData.corretor_cpf || ''}
                                      onChange={(e) => handleInputChange('corretor_cpf', e.target.value)}
                                      placeholder="000.000.000-00"
                                      icon={IdCard}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="corretor_telefone">Telefone</Label>
                                    <InputWithIcon
                                      id="corretor_telefone"
                                      type="text"
                                      value={formData.corretor_telefone || ''}
                                      onChange={(e) => handleInputChange('corretor_telefone', e.target.value)}
                                      placeholder="(00) 00000-0000"
                                      icon={Phone}
                                    />
                                  </div>

                                  <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="corretor_email">Email</Label>
                                    <InputWithIcon
                                      id="corretor_email"
                                      type="email"
                                      value={formData.corretor_email || ''}
                                      onChange={(e) => handleInputChange('corretor_email', e.target.value)}
                                      placeholder="corretor@exemplo.com"
                                      icon={Mail}
                                    />
                                  </div>
                                </div>

                                {/* Dados Bancários do Corretor */}
                                <div className="bg-white/60 dark:bg-blue-950/40 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                                  <h5 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-blue-600" />
                                    Dados Bancários para Recebimento
                                  </h5>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="corretor_banco">Banco</Label>
                                      <InputWithIcon
                                        id="corretor_banco"
                                        type="text"
                                        value={formData.dados_bancarios_corretor?.banco || ''}
                                        onChange={(e) => {
                                          handleInputChange('dados_bancarios_corretor', {
                                            ...formData.dados_bancarios_corretor,
                                            banco: e.target.value
                                          });
                                        }}
                                        placeholder="Nome do banco"
                                        icon={CreditCard}
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="corretor_agencia">Agência</Label>
                                      <InputWithIcon
                                        id="corretor_agencia"
                                        type="text"
                                        value={formData.dados_bancarios_corretor?.agencia || ''}
                                        onChange={(e) => {
                                          handleInputChange('dados_bancarios_corretor', {
                                            ...formData.dados_bancarios_corretor,
                                            agencia: e.target.value
                                          });
                                        }}
                                        placeholder="Agência"
                                        icon={CreditCard}
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="corretor_conta">Conta</Label>
                                      <InputWithIcon
                                        id="corretor_conta"
                                        type="text"
                                        value={formData.dados_bancarios_corretor?.conta || ''}
                                        onChange={(e) => {
                                          handleInputChange('dados_bancarios_corretor', {
                                            ...formData.dados_bancarios_corretor,
                                            conta: e.target.value
                                          });
                                        }}
                                        placeholder="Número da conta"
                                        icon={CreditCard}
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="corretor_tipo_conta">Tipo de Conta</Label>
                                      <Select 
                                        value={formData.dados_bancarios_corretor?.tipo_conta || ''}
                                        onValueChange={(value) => {
                                          handleInputChange('dados_bancarios_corretor', {
                                            ...formData.dados_bancarios_corretor,
                                            tipo_conta: value
                                          });
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Tipo da conta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="corrente">Conta Corrente</SelectItem>
                                          <SelectItem value="poupanca">Poupança</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                      <Label htmlFor="corretor_chave_pix">Chave PIX (Opcional)</Label>
                                      <InputWithIcon
                                        id="corretor_chave_pix"
                                        type="text"
                                        value={formData.dados_bancarios_corretor?.chave_pix || ''}
                                        onChange={(e) => {
                                          handleInputChange('dados_bancarios_corretor', {
                                            ...formData.dados_bancarios_corretor,
                                            chave_pix: e.target.value
                                          });
                                        }}
                                        placeholder="CPF, email, telefone ou chave aleatória"
                                        icon={CreditCard}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Aba 6: Cláusulas */}
                <TabsContent value="clausulas" className="space-y-8">
                  {/* Obrigações Adicionais */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div 
                        className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-red-500"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Obrigações Adicionais
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Responsabilidades específicas do inquilino durante a locação
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                        <Checkbox
                          id="obrigacao_manutencao"
                          checked={formData.obrigacao_manutencao || false}
                          onCheckedChange={(checked) => handleInputChange('obrigacao_manutencao', !!checked)}
                        />
                        <Label htmlFor="obrigacao_manutencao" className="cursor-pointer text-foreground">
                          Manutenção Predial
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                        <Checkbox
                          id="obrigacao_pintura"
                          checked={formData.obrigacao_pintura || false}
                          onCheckedChange={(checked) => handleInputChange('obrigacao_pintura', !!checked)}
                        />
                        <Label htmlFor="obrigacao_pintura" className="cursor-pointer text-foreground">
                          Pintura do Imóvel
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                        <Checkbox
                          id="obrigacao_jardim"
                          checked={formData.obrigacao_jardim || false}
                          onCheckedChange={(checked) => handleInputChange('obrigacao_jardim', !!checked)}
                        />
                        <Label htmlFor="obrigacao_jardim" className="cursor-pointer text-foreground">
                          Cuidados com Jardim
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                        <Checkbox
                          id="obrigacao_limpeza"
                          checked={formData.obrigacao_limpeza || false}
                          onCheckedChange={(checked) => handleInputChange('obrigacao_limpeza', !!checked)}
                        />
                        <Label htmlFor="obrigacao_limpeza" className="cursor-pointer text-foreground">
                          Limpeza Profunda
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                        <Checkbox
                          id="obrigacao_pequenos_reparos"
                          checked={formData.obrigacao_pequenos_reparos || false}
                          onCheckedChange={(checked) => handleInputChange('obrigacao_pequenos_reparos', !!checked)}
                        />
                        <Label htmlFor="obrigacao_pequenos_reparos" className="cursor-pointer text-foreground">
                          Pequenos Reparos
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                        <Checkbox
                          id="obrigacao_vistoria"
                          checked={formData.obrigacao_vistoria || false}
                          onCheckedChange={(checked) => handleInputChange('obrigacao_vistoria', !!checked)}
                        />
                        <Label htmlFor="obrigacao_vistoria" className="cursor-pointer text-foreground">
                          Vistoria Periódica
                        </Label>
                      </div>
                    </div>
                  </motion.div>

                  {/* Multa por Quebra de Contrato */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div 
                        className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-red-500 to-pink-500"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertCircle className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Multa por Quebra de Contrato
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Penalidades aplicáveis em caso de rescisão antecipada
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="multa_locador">Multa para o Locador (%)</Label>
                        <InputWithIcon
                          id="multa_locador"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.multa_locador || ''}
                          onChange={(e) => handleInputChange('multa_locador', parseFloat(e.target.value) || 0)}
                          placeholder="0.0"
                          icon={Percent}
                        />
                        <p className="text-xs text-muted-foreground">
                          Percentual sobre o valor total do contrato
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="multa_locatario">Multa para o Locatário (%)</Label>
                        <InputWithIcon
                          id="multa_locatario"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.multa_locatario || ''}
                          onChange={(e) => handleInputChange('multa_locatario', parseFloat(e.target.value) || 0)}
                          placeholder="0.0"
                          icon={Percent}
                        />
                        <p className="text-xs text-muted-foreground">
                          Percentual sobre o valor total do contrato
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Animais de Estimação */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div 
                        className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-pink-500 to-purple-500"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <Heart className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Animais de Estimação
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Registro de pets permitidos no imóvel
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Quantidade de Pets</Label>
                        <InputWithIcon
                          type="number"
                          min="0"
                          max="10"
                          value={formData.quantidade_pets || 0}
                          onChange={(e) => {
                            const qtd = parseInt(e.target.value) || 0;
                            handleInputChange('quantidade_pets', qtd);
                            
                            // Ajustar array de pets
                            const novosPets = Array(qtd).fill(null).map((_, index) => 
                              pets[index] || {
                                raca: '',
                                tamanho: ''
                              }
                            );
                            setPets(novosPets);
                            setFormData(prev => ({
                              ...prev,
                              pets: novosPets
                            }));
                          }}
                          icon={Heart}
                        />
                      </div>

                      {pets.map((pet, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="p-4 border border-border rounded-xl bg-muted/20 space-y-4"
                        >
                          <h3 className="text-lg font-semibold text-foreground">Animal {index + 1}</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Raça</Label>
                              <InputWithIcon
                                type="text"
                                value={pet.raca || ''}
                                onChange={(e) => atualizarPet(index, 'raca', e.target.value)}
                                placeholder="Raça do animal"
                                icon={Heart}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Tamanho</Label>
                              <Select
                                value={pet.tamanho}
                                onValueChange={(value) => atualizarPet(index, 'tamanho', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tamanho" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pequeno">Pequeno (até 10kg)</SelectItem>
                                  <SelectItem value="Médio">Médio (10kg a 25kg)</SelectItem>
                                  <SelectItem value="Grande">Grande (25kg a 45kg)</SelectItem>
                                  <SelectItem value="Gigante">Gigante (acima de 45kg)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Informações Adicionais */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div 
                        className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <FileText className="w-6 h-6 text-white" />
                      </motion.div>
                      <h2 className="text-xl font-semibold text-foreground">
                        Informações Adicionais
                      </h2>
                    </div>

                    <div className="space-y-2">
                      <Label>Cláusulas Adicionais</Label>
                      <Textarea
                        value={formData.clausulas_adicionais}
                        onChange={(e) => handleInputChange('clausulas_adicionais', e.target.value)}
                        placeholder="Cláusulas especiais do contrato..."
                        rows={4}
                      />
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>

              {/* Submit Button */}
              <div
                data-initial={{ opacity: 0, y: 20 }}
                data-animate={{ opacity: 1, y: 0 }}
                data-transition={{ duration: 0.6, delay: 0.7 }}
                className="pt-6"
              >
                <div
                  data-hover={{ scale: 1.02 }}
                  data-tap={{ scale: 0.98 }}
                >
{isEditing ? (
                  <Button 
                    type="button"
                    onClick={handleSaveContract}
                    disabled={loading}
                    className="w-full btn-gradient py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Salvando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Salvar Alterações</span>
                      </div>
                    )}
                  </Button>
                ) : isViewing ? (
                  <Button 
                    type="button"
                    onClick={onBack}
                    className="w-full btn-gradient py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-primary/25 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-2">
                      <X className="w-5 h-5" />
                      <span>Fechar</span>
                    </div>
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full btn-gradient py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Salvando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span>Salvar Contrato</span>
                      </div>
                    )}
                  </Button>
                )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
    </div>
  );
};