import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  FileText,
  UserCheck,
  Home,
  Users,
  Zap,
  Droplets,
  Flame,
  AlertCircle,
  Loader2,
  CheckCircle,
  Star
} from 'lucide-react';
import type { Imovel } from '../../types';
import { apiService } from '../../services/api';
import { useFormSectionsData } from '../../hooks/useFormData';

export const ModernImovelForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [inquilinos, setInquilinos] = useState<any[]>([]);
  const [clientesSelecionados, setClientesSelecionados] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Imovel>({
    id_cliente: 0,
    id_inquilino: 0,
    tipo: '',
    endereco: '',
    valor_aluguel: 0,
    iptu: 0,
    condominio: 0,
    taxa_incendio: 0,
    status: '',
    matricula_imovel: '',
    area_imovel: '',
    dados_imovel: '',
    permite_pets: false,
    info_iptu: '',
    observacoes_condominio: '',
    copel_unidade_consumidora: '',
    sanepar_matricula: '',
    tem_gas: false,
    info_gas: '',
    boleto_condominio: false
  });

  // Hook para controlar dados das seções
  const sectionsData = useFormSectionsData({
    responsaveis: clientesSelecionados.length > 0,
    endereco: !!formData.endereco && !!formData.tipo,
    detalhes: !!formData.dados_imovel || !!formData.area_imovel,
    valores: formData.valor_aluguel > 0
  });

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      setApiError(null);
      
      try {
        // Primeiro, verificar se a API está online
        await apiService.healthCheck();
        
        // Carregar dados em paralelo
        const [locadoresResponse, locatariosResponse] = await Promise.all([
          apiService.listarLocadores().catch(() => ({ success: false, data: [] })),
          apiService.listarLocatarios().catch(() => ({ success: false, data: [] }))
        ]);

        if (locadoresResponse.success && locadoresResponse.data) {
          setClientes(locadoresResponse.data);
        } else {
          console.warn('Não foi possível carregar locadores');
        }

        if (locatariosResponse.success && locatariosResponse.data) {
          setInquilinos(locatariosResponse.data);
        } else {
          console.warn('Não foi possível carregar locatários');
        }

        // Se não conseguiu carregar nenhum dos dois
        if ((!locadoresResponse.success || !locadoresResponse.data) && 
            (!locatariosResponse.success || !locatariosResponse.data)) {
          setApiError('Alguns dados podem não estar disponíveis. Verifique se a API está rodando.');
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setApiError('API não está disponível. Inicie o backend com: uvicorn main:app --reload');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: keyof Imovel, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.id_cliente || !formData.id_inquilino) {
      setMessage({type: 'error', text: 'Selecione um cliente e um inquilino.'});
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.criarImovel(formData);
      if (response.success) {
        setMessage({type: 'success', text: response.message || 'Imóvel cadastrado com sucesso!'});
        // Reset form
        setFormData({
          id_cliente: 0,
          id_inquilino: 0,
          tipo: '',
          endereco: '',
          valor_aluguel: 0,
          iptu: 0,
          condominio: 0,
          taxa_incendio: 0,
          status: '',
          matricula_imovel: '',
          area_imovel: '',
          dados_imovel: '',
          permite_pets: false,
          info_iptu: '',
          observacoes_condominio: '',
          copel_unidade_consumidora: '',
          sanepar_matricula: '',
          tem_gas: false,
          info_gas: '',
          boleto_condominio: false
        });
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Erro ao cadastrar imóvel. Verifique se a API está rodando.'});
      console.error('Erro:', error);
    } finally {
      setLoading(false);
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
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">Cadastro de Imóvel</h1>
            </div>
          </div>

          <div className="p-8">
            {/* Loading State */}
            {loadingData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-12"
              >
                <div className="flex items-center space-x-2 text-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Carregando dados...</span>
                </div>
              </motion.div>
            )}

            {/* API Error */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl mb-6 border status-warning"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{apiError}</span>
                </div>
              </motion.div>
            )}

            {/* Success/Error Messages */}
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl mb-6 border ${
                  message.type === 'success' 
                    ? 'status-success' 
                    : 'status-error'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? (
                    <UserCheck className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message.text}</span>
                </div>
              </motion.div>
            )}

            {!loadingData && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <Tabs defaultValue="responsaveis" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="responsaveis" hasData={sectionsData.responsaveis}>Responsáveis</TabsTrigger>
                    <TabsTrigger value="endereco" hasData={sectionsData.endereco}>Endereço</TabsTrigger>
                    <TabsTrigger value="detalhes" hasData={sectionsData.detalhes}>Detalhes</TabsTrigger>
                    <TabsTrigger value="valores" hasData={sectionsData.valores}>Valores</TabsTrigger>
                  </TabsList>

                  {/* Aba 1: Responsáveis */}
                  <TabsContent value="responsaveis" className="space-y-8">
                    {/* Header da Seção */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
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
                          <h2 className="text-xl font-semibold text-foreground">
                            Responsáveis pelo Imóvel
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Defina os proprietários e inquilino responsável
                          </p>
                        </div>
                      </div>
                  
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="id_cliente" className="text-muted-foreground">Clientes Proprietários</Label>
                          <Select onValueChange={(value) => {
                            const clienteId = parseInt(value);
                            const cliente = clientes.find(c => c.id === clienteId);
                            if (cliente && !clientesSelecionados.some(c => c.id === clienteId)) {
                              const novosClientes = [...clientesSelecionados, cliente];
                              setClientesSelecionados(novosClientes);
                              // Definir o primeiro cliente como principal para compatibilidade
                              if (novosClientes.length === 1) {
                                handleInputChange('id_cliente', clienteId);
                              }
                            }
                          }}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground">
                              <SelectValue placeholder={clientes.length > 0 ? "Selecione clientes..." : "Nenhum cliente disponível"} />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {clientes
                                .filter(cliente => !clientesSelecionados.some(c => c.id === cliente.id))
                                .map((cliente) => (
                                <SelectItem key={cliente.id} value={cliente.id.toString()} className="text-foreground hover:bg-accent">
                                  {cliente.nome} - {cliente.cpf_cnpj}
                                </SelectItem>
                              ))}
                              {clientes.filter(c => !clientesSelecionados.some(cs => cs.id === c.id)).length === 0 && (
                                <SelectItem value="0" disabled className="text-muted-foreground">
                                  {clientes.length === 0 ? "Cadastre um cliente primeiro" : "Todos os clientes já foram selecionados"}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          
                          {/* Lista de clientes selecionados */}
                          {clientesSelecionados.length > 0 && (
                            <div className="space-y-2 mt-4">
                              <Label className="text-sm font-medium text-muted-foreground">Clientes Selecionados:</Label>
                              <div className="space-y-2">
                                {clientesSelecionados.map((cliente, index) => (
                                  <div key={cliente.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex-1">
                                      <p className="font-medium text-blue-800 dark:text-blue-200">
                                        {cliente.nome} {index === 0 && <span className="text-xs">(Principal)</span>}
                                      </p>
                                      <p className="text-sm text-blue-600 dark:text-blue-400">{cliente.cpf_cnpj}</p>
                                    </div>
                                    <Button
                                      type="button"
                                      onClick={() => {
                                        const novosClientes = clientesSelecionados.filter(c => c.id !== cliente.id);
                                        setClientesSelecionados(novosClientes);
                                        // Se remover o principal, definir o próximo como principal
                                        if (index === 0 && novosClientes.length > 0) {
                                          handleInputChange('id_cliente', novosClientes[0].id);
                                        } else if (novosClientes.length === 0) {
                                          handleInputChange('id_cliente', 0);
                                        }
                                      }}
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                    >
                                      ×
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="id_inquilino" className="text-muted-foreground">Inquilino Responsável</Label>
                          <Select onValueChange={(value) => handleInputChange('id_inquilino', parseInt(value))}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground">
                              <SelectValue placeholder={inquilinos.length > 0 ? "Selecione um inquilino..." : "Nenhum inquilino disponível"} />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {inquilinos.map((inquilino) => (
                                <SelectItem key={inquilino.id} value={inquilino.id.toString()} className="text-foreground hover:bg-accent">
                                  {inquilino.nome}
                                </SelectItem>
                              ))}
                              {inquilinos.length === 0 && (
                                <SelectItem value="0" disabled className="text-muted-foreground">
                                  Cadastre um inquilino primeiro
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Aba 2: Endereço */}
                  <TabsContent value="endereco" className="space-y-8">
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
                          <MapPin className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">
                            Endereço Completo
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Localização e dados básicos do imóvel
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="endereco" className="text-muted-foreground">Endereço Completo</Label>
                          <InputWithIcon
                            id="endereco"
                            icon={MapPin}
                            value={formData.endereco}
                            onChange={(e) => handleInputChange('endereco', e.target.value)}
                            placeholder="Rua, número, bairro, cidade - CEP"
                            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tipo" className="text-muted-foreground">Tipo do Imóvel</Label>
                            <Select onValueChange={(value) => handleInputChange('tipo', value)}>
                              <SelectTrigger className="bg-muted/50 border-border text-foreground">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                <SelectItem value="Apartamento" className="text-foreground hover:bg-accent">Apartamento</SelectItem>
                                <SelectItem value="Casa" className="text-foreground hover:bg-accent">Casa</SelectItem>
                                <SelectItem value="Sala Comercial" className="text-foreground hover:bg-accent">Sala Comercial</SelectItem>
                                <SelectItem value="Galpão" className="text-foreground hover:bg-accent">Galpão</SelectItem>
                                <SelectItem value="Outro" className="text-foreground hover:bg-accent">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="status" className="text-muted-foreground">Status</Label>
                            <Select onValueChange={(value) => handleInputChange('status', value)}>
                              <SelectTrigger className="bg-muted/50 border-border text-foreground">
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                <SelectItem value="Disponível" className="text-foreground hover:bg-accent">Disponível</SelectItem>
                                <SelectItem value="Ocupado" className="text-foreground hover:bg-accent">Ocupado</SelectItem>
                                <SelectItem value="Em manutenção" className="text-foreground hover:bg-accent">Em manutenção</SelectItem>
                                <SelectItem value="Inativo" className="text-foreground hover:bg-accent">Inativo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                          <Checkbox
                            id="permite_pets"
                            checked={formData.permite_pets}
                            onCheckedChange={(checked) => handleInputChange('permite_pets', !!checked)}
                            className="border-white/20"
                          />
                          <Label htmlFor="permite_pets" className="text-muted-foreground cursor-pointer">Permite Animais de Estimação?</Label>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Aba 3: Detalhes */}
                  <TabsContent value="detalhes" className="space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-pink-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <Home className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">
                            Detalhes do Imóvel
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Características e informações específicas
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="matricula_imovel" className="text-muted-foreground">Matrícula do Imóvel</Label>
                            <InputWithIcon
                              id="matricula_imovel"
                              icon={FileText}
                              value={formData.matricula_imovel}
                              onChange={(e) => handleInputChange('matricula_imovel', e.target.value)}
                              placeholder="Número da matrícula"
                              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="area_imovel" className="text-muted-foreground">Área do Imóvel</Label>
                            <InputWithIcon
                              id="area_imovel"
                              icon={Home}
                              value={formData.area_imovel}
                              onChange={(e) => handleInputChange('area_imovel', e.target.value)}
                              placeholder="Ex: 80m² total / 65m² privativa"
                              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dados_imovel" className="text-muted-foreground">Descrição do Imóvel</Label>
                          <Textarea
                            id="dados_imovel"
                            value={formData.dados_imovel}
                            onChange={(e) => handleInputChange('dados_imovel', e.target.value)}
                            placeholder="Ex: 2 dormitórios, 1 suíte, copa, cozinha, área de serviço..."
                            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                          />
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-foreground">Utilidades</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="copel_unidade_consumidora" className="text-muted-foreground">Copel - Unidade Consumidora</Label>
                              <InputWithIcon
                                id="copel_unidade_consumidora"
                                icon={Zap}
                                value={formData.copel_unidade_consumidora}
                                onChange={(e) => handleInputChange('copel_unidade_consumidora', e.target.value)}
                                placeholder="Número da unidade"
                                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="sanepar_matricula" className="text-muted-foreground">Sanepar - Matrícula</Label>
                              <InputWithIcon
                                id="sanepar_matricula"
                                icon={Droplets}
                                value={formData.sanepar_matricula}
                                onChange={(e) => handleInputChange('sanepar_matricula', e.target.value)}
                                placeholder="Matrícula da água"
                                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                              <Checkbox
                                id="tem_gas"
                                checked={formData.tem_gas}
                                onCheckedChange={(checked) => handleInputChange('tem_gas', !!checked)}
                                className="border-white/20"
                              />
                              <Label htmlFor="tem_gas" className="text-muted-foreground cursor-pointer">Tem Gás Encanado?</Label>
                            </div>

                            {formData.tem_gas && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-2"
                              >
                                <Label htmlFor="info_gas" className="text-muted-foreground">Informações sobre Gás</Label>
                                <div className="relative">
                                  <Flame className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Textarea
                                    id="info_gas"
                                    value={formData.info_gas}
                                    onChange={(e) => handleInputChange('info_gas', e.target.value)}
                                    placeholder="Detalhes sobre instalação de gás"
                                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pl-10"
                                  />
                                </div>
                              </motion.div>
                            )}

                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                              <Checkbox
                                id="boleto_condominio"
                                checked={formData.boleto_condominio}
                                onCheckedChange={(checked) => handleInputChange('boleto_condominio', !!checked)}
                                className="border-white/20"
                              />
                              <Label htmlFor="boleto_condominio" className="text-muted-foreground cursor-pointer">Boleto do Condomínio Incluso?</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Aba 4: Valores */}
                  <TabsContent value="valores" className="space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <DollarSign className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">
                            Valores e Taxas
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Informações financeiras do imóvel
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="valor_aluguel" className="text-muted-foreground">Valor do Aluguel</Label>
                            <InputWithIcon
                              id="valor_aluguel"
                              type="number"
                              step="0.01"
                              icon={DollarSign}
                              value={formData.valor_aluguel}
                              onChange={(e) => handleInputChange('valor_aluguel', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="iptu" className="text-muted-foreground">Valor do IPTU</Label>
                            <InputWithIcon
                              id="iptu"
                              type="number"
                              step="0.01"
                              icon={DollarSign}
                              value={formData.iptu}
                              onChange={(e) => handleInputChange('iptu', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="condominio" className="text-muted-foreground">Valor do Condomínio</Label>
                            <InputWithIcon
                              id="condominio"
                              type="number"
                              step="0.01"
                              icon={DollarSign}
                              value={formData.condominio}
                              onChange={(e) => handleInputChange('condominio', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="taxa_incendio" className="text-muted-foreground">Taxa de Incêndio</Label>
                            <InputWithIcon
                              id="taxa_incendio"
                              type="number"
                              step="0.01"
                              icon={DollarSign}
                              value={formData.taxa_incendio}
                              onChange={(e) => handleInputChange('taxa_incendio', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="info_iptu" className="text-muted-foreground">Informações sobre IPTU</Label>
                            <Textarea
                              id="info_iptu"
                              value={formData.info_iptu}
                              onChange={(e) => handleInputChange('info_iptu', e.target.value)}
                              placeholder="Detalhes sobre pagamento do IPTU"
                              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="observacoes_condominio" className="text-muted-foreground">Observações do Condomínio</Label>
                            <Textarea
                              id="observacoes_condominio"
                              value={formData.observacoes_condominio}
                              onChange={(e) => handleInputChange('observacoes_condominio', e.target.value)}
                              placeholder="Regras, horários, observações"
                              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="pt-6"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        disabled={loading || clientes.length === 0 || inquilinos.length === 0}
                        className="w-full btn-gradient py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            <span>Cadastrando...</span>
                          </div>
                        ) : clientes.length === 0 || inquilinos.length === 0 ? (
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5" />
                            <span>Cadastre clientes e inquilinos primeiro</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-5 h-5" />
                            <span>Cadastrar Imóvel</span>
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>

                </Tabs>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};