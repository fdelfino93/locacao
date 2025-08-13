import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Input } from '../ui/input';
import { InputMask } from '../ui/input-mask';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, type RadioOption } from '../ui/radio-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
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
  ChefHat
} from 'lucide-react';
import type { Imovel, Endereco, InformacoesIPTU, DadosGeraisImovel } from '../../types';
import { apiService } from '../../services/api';

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
    dados_imovel: '',
    info_iptu: '',
    observacoes_condominio: '',
    copel_unidade_consumidora: '',
    sanepar_matricula: '',
    tem_gas: false,
    info_gas: '',
    boleto_condominio: false
  });

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

  const validateCEP = (cep: string): boolean => {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.length === 8;
  };

  const validateForm = (): string | null => {
    if (!formData.id_cliente || !formData.id_inquilino) {
      return 'Selecione um cliente e um inquilino.';
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className={`p-4 rounded-xl mb-6 border ${
                message.type === 'success' 
                  ? 'status-success' 
                  : 'status-error'
              }`}>
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            {!loadingData && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <Tabs defaultValue="responsaveis" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="responsaveis">Responsáveis</TabsTrigger>
                    <TabsTrigger value="endereco">Endereço</TabsTrigger>
                    <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                    <TabsTrigger value="valores">Valores</TabsTrigger>
                  </TabsList>

                  {/* Aba 1: Responsáveis */}
                  <TabsContent value="responsaveis" className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Responsáveis pelo Imóvel
                      </h2>
                  
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="id_cliente">Clientes Proprietários *</Label>
                          <Select onValueChange={(value) => {
                            const clienteId = parseInt(value);
                            if (!clientesSelecionados.includes(clienteId)) {
                              const novosClientes = [...clientesSelecionados, clienteId];
                              setClientesSelecionados(novosClientes);
                              // Definir o primeiro cliente como principal para compatibilidade
                              if (novosClientes.length === 1) {
                                handleFormDataChange('id_cliente', clienteId);
                              }
                            }
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder={clientes.length > 0 ? "Selecione clientes..." : "Nenhum cliente disponível"} />
                            </SelectTrigger>
                            <SelectContent>
                              {clientes
                                .filter(cliente => !clientesSelecionados.includes(cliente.id))
                                .map((cliente) => (
                                <SelectItem key={cliente.id} value={cliente.id.toString()}>
                                  {cliente.nome} - {cliente.cpf_cnpj}
                                </SelectItem>
                              ))}
                              {clientes.filter(c => !clientesSelecionados.includes(c.id)).length === 0 && (
                                <SelectItem value="0" disabled>
                                  {clientes.length === 0 ? "Cadastre um cliente primeiro" : "Todos os clientes já foram selecionados"}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          
                          {/* Lista de clientes selecionados */}
                          {clientesSelecionados.length > 0 && (
                            <div className="space-y-2 mt-4">
                              <Label className="text-sm font-medium">Clientes Selecionados:</Label>
                              <div className="space-y-2">
                                {clientesSelecionados.map((clienteId, index) => {
                                  const cliente = clientes.find(c => c.id === clienteId);
                                  if (!cliente) return null;
                                  return (
                                    <div key={clienteId} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                      <div className="flex-1">
                                        <p className="font-medium text-blue-800 dark:text-blue-200">
                                          {cliente.nome} {index === 0 && <span className="text-xs">(Principal)</span>}
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">{cliente.cpf_cnpj}</p>
                                      </div>
                                      <Button
                                        type="button"
                                        onClick={() => {
                                          const novosClientes = clientesSelecionados.filter(id => id !== clienteId);
                                          setClientesSelecionados(novosClientes);
                                          // Se remover o principal, definir o próximo como principal
                                          if (index === 0 && novosClientes.length > 0) {
                                            handleFormDataChange('id_cliente', novosClientes[0]);
                                          } else if (novosClientes.length === 0) {
                                            handleFormDataChange('id_cliente', 0);
                                          }
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="id_inquilino">Inquilino Responsável *</Label>
                          <Select onValueChange={(value) => handleFormDataChange('id_inquilino', parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue placeholder={inquilinos.length > 0 ? "Selecione um inquilino..." : "Nenhum inquilino disponível"} />
                            </SelectTrigger>
                            <SelectContent>
                              {inquilinos.map((inquilino) => (
                                <SelectItem key={inquilino.id} value={inquilino.id.toString()}>
                                  {inquilino.nome}
                                </SelectItem>
                              ))}
                              {inquilinos.length === 0 && (
                                <SelectItem value="0" disabled>
                                  Cadastre um inquilino primeiro
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Aba 2: Endereço */}
                  <TabsContent value="endereco" className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Endereço Completo
                      </h2>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="rua">Rua/Logradouro *</Label>
                            <InputWithIcon
                              id="rua"
                              icon={MapPin}
                              value={endereco.rua}
                              onChange={(e) => handleEnderecoChange('rua', e.target.value)}
                              placeholder="Nome da rua, avenida, travessa..."
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="numero">Número *</Label>
                            <Input
                              id="numero"
                              value={endereco.numero}
                              onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                              placeholder="123, S/N, KM 15..."
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="complemento">Complemento</Label>
                            <Input
                              id="complemento"
                              value={endereco.complemento}
                              onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                              placeholder="Apto 101, Bloco A, Casa 2..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bairro">Bairro *</Label>
                            <Input
                              id="bairro"
                              value={endereco.bairro}
                              onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                              placeholder="Nome do bairro"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cep">CEP *</Label>
                            <InputMask
                              id="cep"
                              mask="#####-###"
                              value={endereco.cep}
                              onValueChange={(value) => handleEnderecoChange('cep', value)}
                              placeholder="12345-678"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cidade">Cidade *</Label>
                            <Input
                              id="cidade"
                              value={endereco.cidade}
                              onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                              placeholder="Nome da cidade"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="estado">Estado *</Label>
                            <Select value={endereco.estado} onValueChange={(value) => handleEnderecoChange('estado', value)}>
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
                        </div>

                        {/* Informações do IPTU */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-blue-600" />
                            Informações do IPTU
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="titular_iptu">Titular do IPTU</Label>
                              <InputWithIcon
                                id="titular_iptu"
                                icon={Users}
                                value={informacoesIPTU.titular}
                                onChange={(e) => handleIPTUChange('titular', e.target.value)}
                                placeholder="Nome do titular do IPTU"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="inscricao_imobiliaria">Inscrição Imobiliária</Label>
                                <InputWithIcon
                                  id="inscricao_imobiliaria"
                                  icon={Hash}
                                  value={informacoesIPTU.inscricao_imobiliaria}
                                  onChange={(e) => handleIPTUChange('inscricao_imobiliaria', e.target.value)}
                                  placeholder="000123456789"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="indicacao_fiscal">Indicação Fiscal</Label>
                                <InputWithIcon
                                  id="indicacao_fiscal"
                                  icon={Hash}
                                  value={informacoesIPTU.indicacao_fiscal}
                                  onChange={(e) => handleIPTUChange('indicacao_fiscal', e.target.value)}
                                  placeholder="000987654321"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Aba 3: Detalhes */}
                  <TabsContent value="detalhes" className="space-y-8">
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Home className="w-5 h-5 text-blue-600" />
                        Detalhes do Imóvel
                      </h2>

                      {/* Informações Básicas */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          Informações Básicas
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo do Imóvel *</Label>
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

                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
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

                          <div className="space-y-2">
                            <Label htmlFor="matricula_imovel">Matrícula do Imóvel</Label>
                            <InputWithIcon
                              id="matricula_imovel"
                              icon={FileText}
                              value={formData.matricula_imovel}
                              onChange={(e) => handleFormDataChange('matricula_imovel', e.target.value)}
                              placeholder="Número da matrícula"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="area_imovel">Área do Imóvel</Label>
                            <InputWithIcon
                              id="area_imovel"
                              icon={Home}
                              value={formData.area_imovel}
                              onChange={(e) => handleFormDataChange('area_imovel', e.target.value)}
                              placeholder="Ex: 80m² total / 65m² privativa"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dados Gerais do Imóvel */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-foreground">Quantidade de Cômodos</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center space-x-2 text-foreground">
                              <Bed className="w-4 h-4" />
                              <span>Quartos</span>
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={dadosGerais.quartos}
                              onChange={(e) => handleDadosGeraisChange('quartos', parseInt(e.target.value) || 0)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center space-x-2 text-foreground">
                              <Bed className="w-4 h-4" />
                              <span>Suítes</span>
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={dadosGerais.suites}
                              onChange={(e) => handleDadosGeraisChange('suites', parseInt(e.target.value) || 0)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center space-x-2 text-foreground">
                              <Bath className="w-4 h-4" />
                              <span>Banheiros</span>
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={dadosGerais.banheiros}
                              onChange={(e) => handleDadosGeraisChange('banheiros', parseInt(e.target.value) || 0)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center space-x-2 text-foreground">
                              <Sofa className="w-4 h-4" />
                              <span>Salas</span>
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={dadosGerais.salas}
                              onChange={(e) => handleDadosGeraisChange('salas', parseInt(e.target.value) || 0)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center space-x-2 text-foreground">
                              <ChefHat className="w-4 h-4" />
                              <span>Cozinha</span>
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={dadosGerais.cozinha}
                              onChange={(e) => handleDadosGeraisChange('cozinha', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Garagem */}
                      <div className="space-y-4">
                        <Label>Possui Vagas de Garagem?</Label>
                        <RadioGroup
                          name="tem_garagem"
                          value={dadosGerais.tem_garagem.toString()}
                          options={simNaoOptions}
                          onChange={(value) => handleDadosGeraisChange('tem_garagem', value === 'true')}
                        />
                        
                        <AnimatePresence>
                          {dadosGerais.tem_garagem && (
                            <div className="space-y-2">
                              <Label className="flex items-center space-x-2 text-foreground">
                                <Car className="w-4 h-4" />
                                <span>Quantidade de Vagas</span>
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                value={dadosGerais.qtd_garagem || 1}
                                onChange={(e) => handleDadosGeraisChange('qtd_garagem', parseInt(e.target.value) || 1)}
                                className="max-w-xs"
                              />
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Sacada */}
                      <div className="space-y-4">
                        <Label>Possui Sacada?</Label>
                        <RadioGroup
                          name="tem_sacada"
                          value={dadosGerais.tem_sacada.toString()}
                          options={simNaoOptions}
                          onChange={(value) => handleDadosGeraisChange('tem_sacada', value === 'true')}
                        />
                        
                        <AnimatePresence>
                          {dadosGerais.tem_sacada && (
                            <div className="space-y-2">
                              <Label className="text-foreground">Quantidade de Sacadas</Label>
                              <Input
                                type="number"
                                min="1"
                                value={dadosGerais.qtd_sacada || 1}
                                onChange={(e) => handleDadosGeraisChange('qtd_sacada', parseInt(e.target.value) || 1)}
                                className="max-w-xs"
                              />
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Churrasqueira */}
                      <div className="space-y-4">
                        <Label>Possui Churrasqueira?</Label>
                        <RadioGroup
                          name="tem_churrasqueira"
                          value={dadosGerais.tem_churrasqueira.toString()}
                          options={simNaoOptions}
                          onChange={(value) => handleDadosGeraisChange('tem_churrasqueira', value === 'true')}
                        />
                        
                        <AnimatePresence>
                          {dadosGerais.tem_churrasqueira && (
                            <div className="space-y-2">
                              <Label className="flex items-center space-x-2 text-foreground">
                                <Flame className="w-4 h-4" />
                                <span>Quantidade de Churrasqueiras</span>
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                value={dadosGerais.qtd_churrasqueira || 1}
                                onChange={(e) => handleDadosGeraisChange('qtd_churrasqueira', parseInt(e.target.value) || 1)}
                                className="max-w-xs"
                              />
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Mobiliado */}
                      <div className="space-y-4">
                        <Label>Mobiliado?</Label>
                        <RadioGroup
                          name="mobiliado"
                          value={dadosGerais.mobiliado}
                          options={mobiliadoOptions}
                          onChange={(value) => handleDadosGeraisChange('mobiliado', value as 'sim' | 'nao' | 'parcialmente')}
                        />
                      </div>

                      {/* Permite Pets */}
                      <div className="space-y-4">
                        <Label className="text-foreground font-semibold flex items-center space-x-2">
                          <PawPrint className="w-5 h-5" />
                          <span>Permite Pets?</span>
                        </Label>
                        <RadioGroup
                          name="permite_pets"
                          value={dadosGerais.permite_pets.toString()}
                          options={simNaoOptions}
                          onChange={(value) => handleDadosGeraisChange('permite_pets', value === 'true')}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Aba 4: Valores */}
                  <TabsContent value="valores" className="space-y-8">
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        Valores
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="valor_aluguel">Valor do Aluguel *</Label>
                          <InputWithIcon
                            id="valor_aluguel"
                            type="number"
                            step="0.01"
                            min="0"
                            icon={DollarSign}
                            value={formData.valor_aluguel}
                            onChange={(e) => handleFormDataChange('valor_aluguel', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="iptu">Valor do IPTU</Label>
                          <InputWithIcon
                            id="iptu"
                            type="number"
                            step="0.01"
                            min="0"
                            icon={DollarSign}
                            value={formData.iptu}
                            onChange={(e) => handleFormDataChange('iptu', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="condominio">Valor do Condomínio</Label>
                          <InputWithIcon
                            id="condominio"
                            type="number"
                            step="0.01"
                            min="0"
                            icon={DollarSign}
                            value={formData.condominio}
                            onChange={(e) => handleFormDataChange('condominio', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="taxa_incendio">Taxa de Incêndio</Label>
                          <InputWithIcon
                            id="taxa_incendio"
                            type="number"
                            step="0.01"
                            min="0"
                            icon={DollarSign}
                            value={formData.taxa_incendio}
                            onChange={(e) => handleFormDataChange('taxa_incendio', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Submit Button */}
                <div className="pt-8">
                  <Button 
                    type="submit" 
                    disabled={loading || clientes.length === 0 || inquilinos.length === 0}
                    className="w-full btn-gradient py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Cadastrando Imóvel...</span>
                      </div>
                    ) : clientes.length === 0 || inquilinos.length === 0 ? (
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-6 h-6" />
                        <span>Cadastre clientes e inquilinos primeiro</span>
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