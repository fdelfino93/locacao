import React, { useState, useEffect } from 'react';
import '../../styles/imoveis-override.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Input } from '../ui/input';
import { InputMask } from '../ui/input-mask';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, type RadioOption } from '../ui/radio-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { FileUpload } from '../ui/file-upload';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  FileText,
  UserCheck,
  Home,
  Users,
  Car,
  Flame,
  PawPrint,
  Hash,
  AlertCircle,
  CheckCircle,
  Loader2,
  Receipt,
  Bed,
  Bath,
  Sofa,
  ChefHat,
  Building,
  Plus,
  Trash2,
  Mail,
  Phone,
  CreditCard
} from 'lucide-react';
import type { Imovel, Endereco, InformacoesIPTU, DadosGeraisImovel } from '../../types';
import { apiService } from '../../services/api';
import { useFormSectionsData } from '../../hooks/useFormData';

const estadosBrasil = [
  { value: 'AC', label: 'AC' }, { value: 'AL', label: 'AL' }, { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' }, { value: 'BA', label: 'BA' }, { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' }, { value: 'ES', label: 'ES' }, { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' }, { value: 'MT', label: 'MT' }, { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' }, { value: 'PA', label: 'PA' }, { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' }, { value: 'PE', label: 'PE' }, { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' }, { value: 'RN', label: 'RN' }, { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' }, { value: 'RR', label: 'RR' }, { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' }, { value: 'SE', label: 'SE' }, { value: 'TO', label: 'TO' }
];

const mobiliadoOptions: RadioOption[] = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'parcialmente', label: 'Parcialmente' }
];

const simNaoOptions: RadioOption[] = [
  { value: 'true', label: 'Sim' },
  { value: 'false', label: 'Não' }
];

export const ModernImovelFormV2: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [inquilinos, setInquilinos] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Estados separados para melhor organização
  const [endereco, setEndereco] = useState<Endereco>({
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'PR',
    cep: ''
  });

  const [informacoesIPTU, setInformacoesIPTU] = useState<InformacoesIPTU>({
    titular: '',
    inscricao_imobiliaria: '',
    indicacao_fiscal: ''
  });

  const [dadosGerais, setDadosGerais] = useState<DadosGeraisImovel>({
    quartos: 0,
    suites: 0,
    banheiros: 0,
    salas: 0,
    cozinha: 0,
    tem_garagem: false,
    qtd_garagem: undefined,
    tem_sacada: false,
    qtd_sacada: undefined,
    tem_churrasqueira: false,
    qtd_churrasqueira: undefined,
    mobiliado: 'nao',
    permite_pets: false
  });
  
  // Estado para proprietários com responsabilidade principal
  const [proprietarios, setProprietarios] = useState<Array<{
    cliente_id: number;
    responsabilidade_principal: boolean;
  }>>([]);
  
  const [clientesSelecionados, setClientesSelecionados] = useState<number[]>([]);
  
  const [formData, setFormData] = useState<Omit<Imovel, 'endereco' | 'informacoes_iptu' | 'dados_gerais'>>({
    id_cliente: 0,
    id_inquilino: 0,
    tipo: '',
    valor_aluguel: 0,
    iptu: 0,
    condominio: 0,
    taxa_incendio: 0,
    status: '',
    matricula_imovel: '',
    area_imovel: '',
    area_total: '',
    area_privativa: '',
    dados_imovel: '',
    info_iptu: '',
    observacoes_condominio: '',
    copel_unidade_consumidora: '',
    sanepar_matricula: '',
    tem_gas: false,
    info_gas: '',
    boleto_condominio: false
  });

  // Estado separado para controlar se tem condomínio
  const [temCondominio, setTemCondominio] = useState(false);

  // Sincronizar estado do condomínio com os dados existentes
  useEffect(() => {
    setTemCondominio(formData.condominio > 0 || formData.observacoes_condominio !== '' || formData.boleto_condominio);
  }, [formData.condominio, formData.observacoes_condominio, formData.boleto_condominio]);

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      setApiError(null);
      
      try {
        await apiService.healthCheck();
        
        const [locadoresResponse, locatariosResponse] = await Promise.all([
          apiService.listarLocadores().catch(() => ({ success: false, data: [] })),
          apiService.listarLocatarios().catch(() => ({ success: false, data: [] }))
        ]);

        if (locadoresResponse.success && locadoresResponse.data) {
          setClientes(locadoresResponse.data);
        }

        if (locatariosResponse.success && locatariosResponse.data) {
          setInquilinos(locatariosResponse.data);
        }

        if ((!locadoresResponse.success || !locadoresResponse.data) && 
            (!locatariosResponse.success || !locatariosResponse.data)) {
          setApiError('Alguns dados podem não estar disponíveis.');
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setApiError('API não está disponível. Inicie o backend.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleEnderecoChange = (field: keyof Endereco, value: string) => {
    setEndereco(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIPTUChange = (field: keyof InformacoesIPTU, value: string) => {
    setInformacoesIPTU(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDadosGeraisChange = (field: keyof DadosGeraisImovel, value: any) => {
    setDadosGerais(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormDataChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funções para gerenciar proprietários
  const adicionarProprietario = (clienteId: number) => {
    if (!proprietarios.some(p => p.cliente_id === clienteId)) {
      const novosProprietarios = [...proprietarios, {
        cliente_id: clienteId,
        responsabilidade_principal: proprietarios.length === 0 // Primeiro é sempre principal
      }];
      setProprietarios(novosProprietarios);
      setClientesSelecionados(novosProprietarios.map(p => p.cliente_id));
      
      // Definir o primeiro como principal para compatibilidade
      if (novosProprietarios.length === 1) {
        handleFormDataChange('id_cliente', clienteId);
      }
    }
  };

  const removerProprietario = (clienteId: number) => {
    const novosProprietarios = proprietarios.filter(p => p.cliente_id !== clienteId);
    
    // Se removeu o principal e ainda há proprietários, torna o primeiro como principal
    if (novosProprietarios.length > 0) {
      const temPrincipal = novosProprietarios.some(p => p.responsabilidade_principal);
      if (!temPrincipal) {
        novosProprietarios[0].responsabilidade_principal = true;
      }
      // Atualizar o cliente principal
      const principal = novosProprietarios.find(p => p.responsabilidade_principal);
      if (principal) {
        handleFormDataChange('id_cliente', principal.cliente_id);
      }
    } else {
      handleFormDataChange('id_cliente', 0);
    }
    
    setProprietarios(novosProprietarios);
    setClientesSelecionados(novosProprietarios.map(p => p.cliente_id));
  };

  const definirResponsavelPrincipal = (clienteId: number) => {
    const novosProprietarios = proprietarios.map(p => ({
      ...p,
      responsabilidade_principal: p.cliente_id === clienteId
    }));
    setProprietarios(novosProprietarios);
    handleFormDataChange('id_cliente', clienteId);
  };

  const validateCEP = (cep: string): boolean => {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.length === 8;
  };

  // ✅ Hook para detectar dados preenchidos em cada seção
  const sectionsData = useFormSectionsData({...formData, endereco, informacoesIPTU, dadosGerais}, {
    responsaveis: ['id_cliente'],
    endereco: ['endereco', 'rua', 'numero', 'bairro', 'cidade', 'uf', 'cep', 'tipo', 'status', 'area_imovel', 'matricula_imovel', 'dados_imovel'],
    encargos: ['iptu', 'condominio', 'taxa_incendio', 'titular', 'inscricao_imobiliaria', 'indicacao_fiscal'],
    valores: ['valor_aluguel']
  });

  const validateForm = (): string | null => {
    if (proprietarios.length === 0) {
      return 'É obrigatório ter pelo menos um proprietário.';
    }
    
    const temPrincipal = proprietarios.some(p => p.responsabilidade_principal);
    if (!temPrincipal) {
      return 'Defina um proprietário como responsável principal.';
    }
    
    if (!formData.tipo) {
      return 'Selecione o tipo do imóvel.';
    }

    if (!endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cidade) {
      return 'Preencha todos os campos obrigatórios do endereço.';
    }

    if (!validateCEP(endereco.cep)) {
      return 'CEP deve ter formato válido (12345-678).';
    }

    if (formData.valor_aluguel <= 0) {
      return 'Valor do aluguel deve ser maior que zero.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setMessage({type: 'error', text: validationError});
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const imovelData: Imovel = {
        ...formData,
        endereco,
        informacoes_iptu: informacoesIPTU,
        dados_gerais: dadosGerais
      };

      const response = await apiService.criarImovel(imovelData);
      if (response.success) {
        setMessage({type: 'success', text: response.message || 'Imóvel cadastrado com sucesso!'});
        // Reset form
        resetForm();
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Erro ao cadastrar imóvel.'});
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id_cliente: 0,
      id_inquilino: 0,
      tipo: '',
      valor_aluguel: 0,
      iptu: 0,
      condominio: 0,
      taxa_incendio: 0,
      status: '',
      matricula_imovel: '',
      area_imovel: '',
      area_total: '',
      area_privativa: '',
      dados_imovel: '',
      info_iptu: '',
      observacoes_condominio: '',
      copel_unidade_consumidora: '',
      sanepar_matricula: '',
      tem_gas: false,
      info_gas: '',
      boleto_condominio: false
    });
    setEndereco({
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: 'PR',
      cep: ''
    });
    setInformacoesIPTU({
      titular: '',
      inscricao_imobiliaria: '',
      indicacao_fiscal: ''
    });
    setDadosGerais({
      quartos: 0,
      suites: 0,
      banheiros: 0,
      salas: 0,
      cozinha: 0,
      tem_garagem: false,
      qtd_garagem: undefined,
      tem_sacada: false,
      qtd_sacada: undefined,
      tem_churrasqueira: false,
      qtd_churrasqueira: undefined,
      mobiliado: 'nao',
      permite_pets: false
    });
    setTemCondominio(false);
  };

  return (
    <div className="imoveis-page min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-glass rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-foreground/20 rounded-xl">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">Cadastro de Imóvel</h1>
            </div>
          </div>

          <div className="p-8">
            {/* Loading State */}
            {loadingData && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2 text-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Carregando dados...</span>
                </div>
              </div>
            )}

            {/* API Error */}
            {apiError && (
              <div className="p-4 rounded-xl mb-6 border status-warning">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{apiError}</span>
                </div>
              </div>
            )}

            {/* Success/Error Messages */}
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
                    <CheckCircle className="w-5 h-5 text-foreground" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-foreground" />
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            {!loadingData && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <Tabs defaultValue="responsaveis" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="responsaveis" hasData={sectionsData.responsaveis}>Responsáveis</TabsTrigger>
                    <TabsTrigger value="endereco" hasData={sectionsData.endereco}>Endereço</TabsTrigger>
                    <TabsTrigger value="encargos" hasData={sectionsData.encargos}>Encargos</TabsTrigger>
                    <TabsTrigger value="valores" hasData={sectionsData.valores}>Valores</TabsTrigger>
                    <TabsTrigger value="documentos" hasData={false}>Documentos</TabsTrigger>
                  </TabsList>

                  {/* Aba 1: Responsáveis */}
                  <TabsContent value="responsaveis" className="space-y-8">
                    {/* Header da Seção */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center space-y-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            Responsáveis do Imóvel
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Defina os proprietários responsáveis pelo imóvel
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Seção de Proprietários */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <Users className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Proprietários do Imóvel
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Adicione os proprietários responsáveis pelo imóvel
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            O primeiro proprietário será automaticamente definido como responsável principal.
                          </p>
                          <Button 
                            onClick={() => {
                              // Simular um clique no select para adicionar
                              document.getElementById('proprietario-select')?.click();
                            }}
                            size="sm"
                            className="btn-outline"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Proprietário
                          </Button>
                        </div>


                        {/* Indicador de Status */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`card-glass rounded-xl p-4 border ${
                            proprietarios.length > 0 && proprietarios.some(p => p.responsabilidade_principal)
                              ? 'border-border bg-card text-card-foreground' 
                              : proprietarios.length > 0 && !proprietarios.some(p => p.responsabilidade_principal)
                              ? 'border-border bg-card text-card-foreground'
                              : 'border-border bg-card text-card-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {proprietarios.length > 0 && proprietarios.some(p => p.responsabilidade_principal) ? (
                                <CheckCircle className="w-5 h-5 text-foreground" />
                              ) : proprietarios.length > 0 && !proprietarios.some(p => p.responsabilidade_principal) ? (
                                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                              )}
                              <span className="font-medium text-foreground">
                                {proprietarios.length === 0 
                                  ? 'É obrigatório ter pelo menos um proprietário'
                                  : !proprietarios.some(p => p.responsabilidade_principal)
                                  ? 'Defina um proprietário como responsável principal'
                                  : 'Configuração de proprietários válida!'
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-lg font-bold text-foreground">
                                {proprietarios.length}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                proprietário{proprietarios.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      {/* Lista de Proprietários */}
                      <div className="space-y-6">
                          {proprietarios.length === 0 ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20"
                            >
                              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                Nenhum proprietário adicionado
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Selecione um proprietário da lista abaixo para começar
                              </p>
                              <div className="max-w-xs mx-auto">
                                <Label htmlFor="proprietario-select">Selecionar Proprietário *</Label>
                                <Select 
                                  onValueChange={(value) => {
                                    const clienteId = parseInt(value);
                                    adicionarProprietario(clienteId);
                                  }}
                                >
                                  <SelectTrigger id="proprietario-select" className="bg-muted/50 border-border text-foreground">
                                    <SelectValue placeholder={clientes.length > 0 ? "Selecione um proprietário..." : "Nenhum cliente disponível"} />
                                  </SelectTrigger>
                                  <SelectContent className="bg-card border-border">
                                    {clientes
                                      .filter(cliente => !proprietarios.some(p => p.cliente_id === cliente.id))
                                      .map((cliente) => (
                                      <SelectItem key={cliente.id} value={cliente.id.toString()} className="text-foreground hover:bg-accent">
                                        {cliente.nome} - {cliente.cpf_cnpj}
                                      </SelectItem>
                                    ))}
                                    {clientes.filter(c => !proprietarios.some(p => p.cliente_id === c.id)).length === 0 && (
                                      <SelectItem value="0" disabled>
                                        {clientes.length === 0 ? "Cadastre um cliente primeiro" : "Todos os clientes já foram selecionados"}
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </motion.div>
                          ) : (
                            <AnimatePresence>
                              {proprietarios.map((proprietario, index) => {
                                const cliente = clientes.find(c => c.id === proprietario.cliente_id);
                                if (!cliente) return null;
                                
                                return (
                                  <motion.div
                                    key={proprietario.cliente_id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                                  >
                                    <div className="flex items-center justify-between mb-6">
                                      <div className="flex items-center gap-3">
                                        <motion.div 
                                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500"
                                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                                          transition={{ duration: 0.3 }}
                                        >
                                          <Users className="w-5 h-5 text-white" />
                                        </motion.div>
                                        <div>
                                          <h3 className="text-lg font-semibold text-foreground">
                                            Proprietário {index + 1}
                                            {proprietario.responsabilidade_principal && (
                                              <UserCheck className="w-4 h-4 text-foreground inline ml-2" title="Responsável Principal" />
                                            )}
                                          </h3>
                                          <p className="text-sm text-muted-foreground">
                                            {cliente.nome} - {cliente.cpf_cnpj}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <Button 
                                          onClick={() => removerProprietario(proprietario.cliente_id)}
                                          variant="outline"
                                          size="sm"
                                          className="text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </motion.div>
                                    </div>

                                    {/* Campos adicionais */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <Label>Nome</Label>
                                        <input 
                                          type="text" 
                                          value={cliente.nome} 
                                          disabled 
                                          className="w-full p-2 border rounded bg-muted/50 border-border text-foreground"
                                        />
                                      </div>
                                      <div>
                                        <Label>CPF/CNPJ</Label>
                                        <input 
                                          type="text" 
                                          value={cliente.cpf_cnpj} 
                                          disabled 
                                          className="w-full p-2 border rounded bg-muted/50 border-border text-foreground"
                                        />
                                      </div>

                                      {/* Campo de Responsabilidade */}
                                      <div>
                                        <Label>Responsabilidade</Label>
                                        <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md">
                                          <input
                                            type="checkbox"
                                            id={`principal_${proprietario.cliente_id}`}
                                            checked={proprietario.responsabilidade_principal || false}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                definirResponsavelPrincipal(proprietario.cliente_id);
                                              }
                                            }}
                                            className="rounded border-gray-300"
                                          />
                                          <Label htmlFor={`principal_${proprietario.cliente_id}`} className="text-sm font-normal cursor-pointer">
                                            Responsável Principal
                                          </Label>
                                        </div>
                                      </div>

                                      {/* Status */}
                                      <div className="md:col-span-3">
                                        <Label>Status</Label>
                                        <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted/30">
                                          <span className="text-sm text-muted-foreground">
                                            {proprietario.responsabilidade_principal ? 'Principal' : 'Adicional'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          )}

                          {/* Botão para adicionar mais proprietários (quando já há alguns) */}
                          {proprietarios.length > 0 && clientes.filter(c => !proprietarios.some(p => p.cliente_id === c.id)).length > 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex justify-center"
                            >
                              <div className="max-w-xs w-full">
                                <Label htmlFor="add-proprietario">Adicionar Outro Proprietário</Label>
                                <Select 
                                  onValueChange={(value) => {
                                    const clienteId = parseInt(value);
                                    adicionarProprietario(clienteId);
                                  }}
                                >
                                  <SelectTrigger id="add-proprietario" className="bg-muted/50 border-border text-foreground">
                                    <SelectValue placeholder="Selecione mais um proprietário..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-card border-border">
                                    {clientes
                                      .filter(cliente => !proprietarios.some(p => p.cliente_id === cliente.id))
                                      .map((cliente) => (
                                      <SelectItem key={cliente.id} value={cliente.id.toString()} className="text-foreground hover:bg-accent">
                                        {cliente.nome} - {cliente.cpf_cnpj}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </motion.div>
                          )}
                      </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Aba 2: Endereço */}
                  <TabsContent value="endereco" className="space-y-8">
                    {/* Header da Seção */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center space-y-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            Localização e Endereço
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Informações de endereço e localização do imóvel
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Seção de Endereço */}
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
                          <MapPin className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Endereço do Imóvel
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Localização completa e detalhada do imóvel
                          </p>
                        </div>
                      </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <Label htmlFor="rua" className="text-sm font-medium text-foreground">Rua/Logradouro *</Label>
                        <InputWithIcon
                          id="rua"
                          type="text"
                          value={endereco.rua}
                          onChange={(e) => handleEnderecoChange('rua', e.target.value)}
                          placeholder="Rua das Flores"
                          icon={MapPin}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="numero" className="text-sm font-medium text-foreground">Número *</Label>
                        <InputWithIcon
                          id="numero"
                          type="text"
                          value={endereco.numero}
                          onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                          placeholder="123"
                          icon={Home}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="complemento" className="text-sm font-medium text-foreground">Complemento</Label>
                        <InputWithIcon
                          id="complemento"
                          type="text"
                          value={endereco.complemento}
                          onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                          placeholder="Apto 45"
                          icon={Building}
                        />
                      </div>

                      <div>
                        <Label htmlFor="bairro" className="text-sm font-medium text-foreground">Bairro *</Label>
                        <InputWithIcon
                          id="bairro"
                          type="text"
                          value={endereco.bairro}
                          onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                          placeholder="Centro"
                          icon={MapPin}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="cidade" className="text-sm font-medium text-foreground">Cidade *</Label>
                        <InputWithIcon
                          id="cidade"
                          type="text"
                          value={endereco.cidade}
                          onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                          placeholder="Curitiba"
                          icon={Building2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="estado" className="text-sm font-medium text-foreground">Estado *</Label>
                        <Select 
                          value={endereco.estado} 
                          onValueChange={(value) => handleEnderecoChange('estado', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {estadosBrasil.map((estado) => (
                              <SelectItem key={estado.value} value={estado.value}>
                                {estado.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cep" className="text-sm font-medium text-foreground">CEP *</Label>
                        <InputWithIcon
                          id="cep"
                          type="text"
                          value={endereco.cep}
                          onChange={(e) => handleEnderecoChange('cep', e.target.value)}
                          placeholder="00000-000"
                          icon={MapPin}
                          maxLength={9}
                          required
                        />
                      </div>
                    </div>
                    </motion.div>

                    {/* Seção de Informações Básicas */}
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
                          <Building2 className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Informações Básicas
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Tipo, status e dados fundamentais do imóvel
                          </p>
                        </div>
                      </div>
                        
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="tipo" className="text-sm font-medium text-foreground">Tipo do Imóvel *</Label>
                            <Select onValueChange={(value) => handleFormDataChange('tipo', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Apartamento">Apartamento</SelectItem>
                                <SelectItem value="Casa">Casa</SelectItem>
                                <SelectItem value="Sala Comercial">Sala Comercial</SelectItem>
                                <SelectItem value="Galpão">Galpão</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="status" className="text-sm font-medium text-foreground">Status</Label>
                            <Select onValueChange={(value) => handleFormDataChange('status', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Disponível">Disponível</SelectItem>
                                <SelectItem value="Ocupado">Ocupado</SelectItem>
                                <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                                <SelectItem value="Inativo">Inativo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="matricula_imovel" className="text-sm font-medium text-foreground">Matrícula do Imóvel</Label>
                            <InputWithIcon
                              id="matricula_imovel"
                              type="text"
                              icon={FileText}
                              value={formData.matricula_imovel}
                              onChange={(e) => handleFormDataChange('matricula_imovel', e.target.value)}
                              placeholder="000123456789"
                            />
                          </div>

                          <div>
                            <Label htmlFor="area_total" className="text-sm font-medium text-foreground">Área Total</Label>
                            <InputWithIcon
                              id="area_total"
                              type="text"
                              icon={Home}
                              value={formData.area_total}
                              onChange={(e) => handleFormDataChange('area_total', e.target.value)}
                              placeholder="80m²"
                            />
                          </div>

                          <div>
                            <Label htmlFor="area_privativa" className="text-sm font-medium text-foreground">Área Privativa</Label>
                            <InputWithIcon
                              id="area_privativa"
                              type="text"
                              icon={Home}
                              value={formData.area_privativa}
                              onChange={(e) => handleFormDataChange('area_privativa', e.target.value)}
                              placeholder="65m²"
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor="quartos" className="text-sm font-medium text-foreground">Quartos</Label>
                              <InputWithIcon
                                id="quartos"
                                type="number"
                                min="0"
                                placeholder="3"
                                icon={Bed}
                              />
                            </div>

                            <div>
                              <Label htmlFor="banheiros" className="text-sm font-medium text-foreground">Banheiros</Label>
                              <InputWithIcon
                                id="banheiros"
                                type="number"
                                min="0"
                                placeholder="2"
                                icon={Bath}
                              />
                            </div>

                            <div>
                              <Label htmlFor="salas" className="text-sm font-medium text-foreground">Salas</Label>
                              <InputWithIcon
                                id="salas"
                                type="number"
                                min="0"
                                placeholder="1"
                                icon={Sofa}
                              />
                            </div>

                            <div>
                              <Label htmlFor="vagas_garagem" className="text-sm font-medium text-foreground">Vagas Garagem</Label>
                              <InputWithIcon
                                id="vagas_garagem"
                                type="number"
                                min="0"
                                placeholder="2"
                                icon={Car}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-foreground">Permite Animais</Label>
                                <Select 
                                  value={dadosGerais.permite_pets ? 'Sim' : 'Não'} 
                                  onValueChange={(value) => handleDadosGeraisChange('permite_pets', value === 'Sim')}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Sim">Sim</SelectItem>
                                    <SelectItem value="Não">Não</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground">Mobiliado</Label>
                                <Select 
                                  value={dadosGerais.mobiliado} 
                                  onValueChange={(value) => handleDadosGeraisChange('mobiliado', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="nao">Não</SelectItem>
                                    <SelectItem value="sim">Sim</SelectItem>
                                    <SelectItem value="parcial">Parcialmente</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground">Tem Garagem</Label>
                                <Select 
                                  value={dadosGerais.tem_garagem ? 'Sim' : 'Não'} 
                                  onValueChange={(value) => handleDadosGeraisChange('tem_garagem', value === 'Sim')}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Sim">Sim</SelectItem>
                                    <SelectItem value="Não">Não</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="caracteristicas" className="text-sm font-medium text-foreground">Características Gerais</Label>
                              <Textarea
                                id="caracteristicas"
                                placeholder="Ex: cozinha americana, área de serviço, sacada..."
                                rows={6}
                                className="resize-none"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Descreva as principais características do imóvel
                              </p>
                            </div>

                            <div>
                              <Label htmlFor="observacoes_gerais" className="text-sm font-medium text-foreground">Observações Gerais</Label>
                              <Textarea
                                id="observacoes_gerais"
                                value={formData.dados_imovel}
                                onChange={(e) => handleFormDataChange('dados_imovel', e.target.value)}
                                placeholder="Informações adicionais, estado de conservação, etc..."
                                rows={6}
                                className="resize-none"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Informações complementares sobre o imóvel
                              </p>
                            </div>
                          </div>
                        </div>
                    </motion.div>
                  </TabsContent>

                  {/* Aba 3: Encargos */}
                  <TabsContent value="encargos" className="space-y-8">
                    {/* Header da Seção */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center space-y-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-green-500 to-emerald-500">
                          <Receipt className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            Encargos e Impostos
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Informações sobre IPTU e outros encargos
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Informações do IPTU */}
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
                          <Receipt className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Informações do IPTU
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Dados fiscais e de registro imobiliário
                          </p>
                        </div>
                      </div>
                          
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-3">
                              <Label htmlFor="titular_iptu" className="text-sm font-medium text-foreground">Titular do IPTU</Label>
                              <InputWithIcon
                                id="titular_iptu"
                                type="text"
                                icon={Users}
                                value={informacoesIPTU.titular}
                                onChange={(e) => handleIPTUChange('titular', e.target.value)}
                                placeholder="João Silva"
                              />
                            </div>

                              <div>
                                <Label htmlFor="inscricao_imobiliaria" className="text-sm font-medium text-foreground">Inscrição Imobiliária</Label>
                                <InputWithIcon
                                  id="inscricao_imobiliaria"
                                  type="text"
                                  icon={Hash}
                                  value={informacoesIPTU.inscricao_imobiliaria}
                                  onChange={(e) => handleIPTUChange('inscricao_imobiliaria', e.target.value)}
                                  placeholder="000123456789"
                                />
                              </div>

                              <div>
                                <Label htmlFor="indicacao_fiscal" className="text-sm font-medium text-foreground">Indicação Fiscal</Label>
                                <InputWithIcon
                                  id="indicacao_fiscal"
                                  type="text"
                                  icon={Hash}
                                  value={informacoesIPTU.indicacao_fiscal}
                                  onChange={(e) => handleIPTUChange('indicacao_fiscal', e.target.value)}
                                  placeholder="000987654321"
                                />
                              </div>

                            <div className="lg:col-span-3">
                              <Label htmlFor="info_iptu" className="text-sm font-medium text-foreground">Informações sobre IPTU</Label>
                              <Textarea
                                id="info_iptu"
                                value={formData.info_iptu}
                                onChange={(e) => handleFormDataChange('info_iptu', e.target.value)}
                                placeholder="Detalhes sobre pagamento do IPTU, parcelamento, etc."
                                rows={4}
                                className="resize-none"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Informações adicionais sobre o IPTU do imóvel
                              </p>
                            </div>
                          </div>
                    </motion.div>


                    {/* Informações do Condomínio */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-pink-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <Building2 className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Informações do Condomínio
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Configure se o imóvel faz parte de um condomínio
                          </p>
                        </div>
                      </div>
                        
                      <div className="space-y-6">
                        {/* Pergunta se tem condomínio */}
                        <div>
                          <Label className="text-sm font-medium text-foreground">O imóvel faz parte de um condomínio?</Label>
                          <Select 
                            value={temCondominio ? 'Sim' : 'Não'} 
                            onValueChange={(value) => {
                              const hasCondominio = value === 'Sim';
                              setTemCondominio(hasCondominio);
                              if (!hasCondominio) {
                                handleFormDataChange('condominio', 0);
                                handleFormDataChange('observacoes_condominio', '');
                                handleFormDataChange('boleto_condominio', false);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sim">Sim</SelectItem>
                              <SelectItem value="Não">Não</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Campos condicionais se tem condomínio */}
                        {temCondominio && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-6 p-4 bg-muted/20 rounded-lg border border-muted-foreground/20"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="lg:col-span-2">
                                <Label htmlFor="nome_condominio" className="text-sm font-medium text-foreground">Nome do Condomínio</Label>
                                <InputWithIcon
                                  id="nome_condominio"
                                  type="text"
                                  placeholder="Condomínio Residencial Flores"
                                  icon={Building}
                                />
                              </div>

                              <div>
                                <Label htmlFor="sindico" className="text-sm font-medium text-foreground">Síndico</Label>
                                <InputWithIcon
                                  id="sindico"
                                  type="text"
                                  placeholder="João Silva"
                                  icon={Users}
                                />
                              </div>

                              <div>
                                <Label htmlFor="cnpj_condominio" className="text-sm font-medium text-foreground">CNPJ do Condomínio</Label>
                                <InputWithIcon
                                  id="cnpj_condominio"
                                  type="text"
                                  placeholder="00.000.000/0000-00"
                                  icon={CreditCard}
                                />
                              </div>

                              <div>
                                <Label htmlFor="email_condominio" className="text-sm font-medium text-foreground">Email</Label>
                                <InputWithIcon
                                  id="email_condominio"
                                  type="email"
                                  placeholder="contato@condominio.com.br"
                                  icon={Mail}
                                />
                              </div>

                              <div>
                                <Label htmlFor="telefone_condominio" className="text-sm font-medium text-foreground">Telefone</Label>
                                <InputWithIcon
                                  id="telefone_condominio"
                                  type="tel"
                                  placeholder="(41) 99999-9999"
                                  icon={Phone}
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="observacoes_condominio" className="text-sm font-medium text-foreground">Observações do Condomínio</Label>
                              <Textarea
                                id="observacoes_condominio"
                                value={formData.observacoes_condominio}
                                onChange={(e) => handleFormDataChange('observacoes_condominio', e.target.value)}
                                placeholder="Regras do condomínio, horários, observações..."
                                rows={4}
                                className="resize-none"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Regras e informações específicas do condomínio
                              </p>
                            </div>

                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-muted/30 border border-muted-foreground/20">
                              <input
                                type="checkbox"
                                id="boleto_condominio"
                                checked={formData.boleto_condominio}
                                onChange={(e) => handleFormDataChange('boleto_condominio', e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor="boleto_condominio" className="cursor-pointer text-foreground font-medium">
                                Boleto do Condomínio Incluso na Gestão
                              </Label>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    {/* Utilidades Públicas */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <Flame className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Utilidades Públicas
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Registros de energia elétrica, água e gás
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="copel_unidade" className="text-sm font-medium text-foreground">Copel - Unidade Consumidora</Label>
                          <InputWithIcon
                            id="copel_unidade"
                            type="text"
                            icon={Hash}
                            value={formData.copel_unidade_consumidora}
                            onChange={(e) => handleFormDataChange('copel_unidade_consumidora', e.target.value)}
                            placeholder="123456789"
                          />
                        </div>

                        <div>
                          <Label htmlFor="sanepar_matricula" className="text-sm font-medium text-foreground">Sanepar - Matrícula</Label>
                          <InputWithIcon
                            id="sanepar_matricula"
                            type="text"
                            icon={Hash}
                            value={formData.sanepar_matricula}
                            onChange={(e) => handleFormDataChange('sanepar_matricula', e.target.value)}
                            placeholder="987654321"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-foreground">Possui Gás Natural/GLP</Label>
                          <Select 
                            value={formData.tem_gas ? 'Sim' : 'Não'} 
                            onValueChange={(value) => handleFormDataChange('tem_gas', value === 'Sim')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sim">Sim</SelectItem>
                              <SelectItem value="Não">Não</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {formData.tem_gas && (
                          <div className="lg:col-span-3">
                            <Label htmlFor="info_gas" className="text-sm font-medium text-foreground">Informações sobre Gás</Label>
                            <InputWithIcon
                              id="info_gas"
                              type="text"
                              value={formData.info_gas}
                              onChange={(e) => handleFormDataChange('info_gas', e.target.value)}
                              placeholder="Número do medidor, tipo de gás, etc."
                              icon={Flame}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Aba 4: Valores */}
                  <TabsContent value="valores" className="space-y-8">
                    {/* Valores e Características */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-amber-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <DollarSign className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Valores e Características
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Valores de locação e características do imóvel
                          </p>
                        </div>
                      </div>
                    
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="valor_aluguel" className="text-sm font-medium text-foreground">Valor do Aluguel *</Label>
                          <InputWithIcon
                            id="valor_aluguel"
                            type="number"
                            step="0.01"
                            min="0"
                            icon={DollarSign}
                            value={formData.valor_aluguel}
                            onChange={(e) => handleFormDataChange('valor_aluguel', parseFloat(e.target.value) || 0)}
                            placeholder="1500.00"
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Valor mensal base
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="iptu" className="text-sm font-medium text-foreground">Valor do IPTU</Label>
                          <InputWithIcon
                            id="iptu"
                            type="number"
                            step="0.01"
                            min="0"
                            icon={DollarSign}
                            value={formData.iptu}
                            onChange={(e) => handleFormDataChange('iptu', parseFloat(e.target.value) || 0)}
                            placeholder="200.00"
                          />
                        </div>

                        <div>
                          <Label htmlFor="condominio" className="text-sm font-medium text-foreground">Valor do Condomínio</Label>
                          <InputWithIcon
                            id="condominio"
                            type="number"
                            step="0.01"
                            min="0"
                            icon={DollarSign}
                            value={formData.condominio}
                            onChange={(e) => handleFormDataChange('condominio', parseFloat(e.target.value) || 0)}
                            placeholder="350.00"
                          />
                        </div>

                        <div>
                          <Label htmlFor="taxa_incendio" className="text-sm font-medium text-foreground">Taxa de Incêndio</Label>
                          <InputWithIcon
                            id="taxa_incendio"
                            type="number"
                            step="0.01"
                            min="0"
                            icon={DollarSign}
                            value={formData.taxa_incendio}
                            onChange={(e) => handleFormDataChange('taxa_incendio', parseFloat(e.target.value) || 0)}
                            placeholder="15.00"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Aba 5: Documentos */}
                  <TabsContent value="documentos" className="space-y-8">
                    {/* Header da Seção */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center space-y-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-amber-500">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            Documentos do Imóvel
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Faça upload dos documentos referentes ao imóvel. Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Documentos Obrigatórios */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-amber-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <FileText className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Documentos Obrigatórios
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Documentos essenciais para o cadastro do imóvel
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUpload
                          label="Matrícula do Imóvel"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('Matrícula:', file)}
                          required
                        />

                        <FileUpload
                          label="Escritura ou Contrato de Compra"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('Escritura:', file)}
                          required
                        />

                        <FileUpload
                          label="Carnê do IPTU"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('IPTU:', file)}
                          required
                        />

                        <FileUpload
                          label="Certidão Negativa de Débitos"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('Certidão:', file)}
                        />
                      </div>
                    </motion.div>

                    {/* Documentos Opcionais */}
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
                          <FileText className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Documentos Opcionais
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Documentos complementares que podem ser úteis
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUpload
                          label="Laudo de Avaliação"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('Laudo:', file)}
                        />

                        <FileUpload
                          label="Planta do Imóvel"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('Planta:', file)}
                        />

                        <FileUpload
                          label="Fotos do Imóvel"
                          accept=".jpg,.jpeg,.png"
                          maxSize={10}
                          onFileSelect={(file) => console.log('Fotos:', file)}
                        />

                        <FileUpload
                          label="Outros Documentos"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('Outros:', file)}
                        />
                      </div>
                    </motion.div>
                  </TabsContent>
                </Tabs>

                {/* Submit Button */}
                <div className="pt-8">
                  <Button 
                    type="submit" 
                    disabled={loading || clientes.length === 0 || proprietarios.length === 0}
                    className="w-full btn-gradient py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Cadastrando Imóvel...</span>
                      </div>
                    ) : clientes.length === 0 ? (
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-6 h-6" />
                        <span>Cadastre clientes primeiro</span>
                      </div>
                    ) : proprietarios.length === 0 ? (
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-6 h-6" />
                        <span>Adicione pelo menos um proprietário</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-6 h-6" />
                        <span>Cadastrar Imóvel Completo</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};