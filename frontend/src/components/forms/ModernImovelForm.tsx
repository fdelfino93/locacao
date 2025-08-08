import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
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
  Loader2
} from 'lucide-react';
import type { Imovel } from '../../types';
import { apiService } from '../../services/api';

export const ModernImovelForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [inquilinos, setInquilinos] = useState<any[]>([]);
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-gray-900 to-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Cadastro de Imóvel</h2>
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
                <div className="flex items-center space-x-2 text-white">
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
                className="p-4 rounded-xl mb-6 border bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
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
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
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
                {/* Seleção de Cliente e Inquilino */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Responsáveis</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="id_cliente" className="text-gray-300">Cliente Responsável</Label>
                      <Select onValueChange={(value) => handleInputChange('id_cliente', parseInt(value))}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder={clientes.length > 0 ? "Selecione um cliente..." : "Nenhum cliente disponível"} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id.toString()} className="text-white hover:bg-gray-700">
                              {cliente.nome} - {cliente.cpf_cnpj}
                            </SelectItem>
                          ))}
                          {clientes.length === 0 && (
                            <SelectItem value="0" disabled className="text-gray-500">
                              Cadastre um cliente primeiro
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="id_inquilino" className="text-gray-300">Inquilino Responsável</Label>
                      <Select onValueChange={(value) => handleInputChange('id_inquilino', parseInt(value))}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder={inquilinos.length > 0 ? "Selecione um inquilino..." : "Nenhum inquilino disponível"} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {inquilinos.map((inquilino) => (
                            <SelectItem key={inquilino.id} value={inquilino.id.toString()} className="text-white hover:bg-gray-700">
                              {inquilino.nome}
                            </SelectItem>
                          ))}
                          {inquilinos.length === 0 && (
                            <SelectItem value="0" disabled className="text-gray-500">
                              Cadastre um inquilino primeiro
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>

                {/* Dados Básicos do Imóvel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <Home className="w-5 h-5" />
                    <span>Dados do Imóvel</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tipo" className="text-gray-300">Tipo do Imóvel</Label>
                      <Select onValueChange={(value) => handleInputChange('tipo', value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="Apartamento" className="text-white hover:bg-gray-700">Apartamento</SelectItem>
                          <SelectItem value="Casa" className="text-white hover:bg-gray-700">Casa</SelectItem>
                          <SelectItem value="Sala Comercial" className="text-white hover:bg-gray-700">Sala Comercial</SelectItem>
                          <SelectItem value="Galpão" className="text-white hover:bg-gray-700">Galpão</SelectItem>
                          <SelectItem value="Outro" className="text-white hover:bg-gray-700">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-gray-300">Status</Label>
                      <Select onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="Disponível" className="text-white hover:bg-gray-700">Disponível</SelectItem>
                          <SelectItem value="Ocupado" className="text-white hover:bg-gray-700">Ocupado</SelectItem>
                          <SelectItem value="Em manutenção" className="text-white hover:bg-gray-700">Em manutenção</SelectItem>
                          <SelectItem value="Inativo" className="text-white hover:bg-gray-700">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="matricula_imovel" className="text-gray-300">Matrícula do Imóvel</Label>
                      <InputWithIcon
                        id="matricula_imovel"
                        icon={FileText}
                        value={formData.matricula_imovel}
                        onChange={(e) => handleInputChange('matricula_imovel', e.target.value)}
                        placeholder="Número da matrícula"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area_imovel" className="text-gray-300">Área do Imóvel</Label>
                      <InputWithIcon
                        id="area_imovel"
                        icon={Home}
                        value={formData.area_imovel}
                        onChange={(e) => handleInputChange('area_imovel', e.target.value)}
                        placeholder="Ex: 80m² total / 65m² privativa"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco" className="text-gray-300">Endereço</Label>
                    <InputWithIcon
                      id="endereco"
                      icon={MapPin}
                      value={formData.endereco}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      placeholder="Rua, número, bairro, cidade - CEP"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Checkbox
                      id="permite_pets"
                      checked={formData.permite_pets}
                      onCheckedChange={(checked) => handleInputChange('permite_pets', !!checked)}
                      className="border-white/20"
                    />
                    <Label htmlFor="permite_pets" className="text-gray-300 cursor-pointer">Permite Animais de Estimação?</Label>
                  </div>
                </motion.div>

                {/* Valores */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Valores</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="valor_aluguel" className="text-gray-300">Valor do Aluguel</Label>
                      <InputWithIcon
                        id="valor_aluguel"
                        type="number"
                        step="0.01"
                        icon={DollarSign}
                        value={formData.valor_aluguel}
                        onChange={(e) => handleInputChange('valor_aluguel', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="iptu" className="text-gray-300">Valor do IPTU</Label>
                      <InputWithIcon
                        id="iptu"
                        type="number"
                        step="0.01"
                        icon={DollarSign}
                        value={formData.iptu}
                        onChange={(e) => handleInputChange('iptu', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condominio" className="text-gray-300">Valor do Condomínio</Label>
                      <InputWithIcon
                        id="condominio"
                        type="number"
                        step="0.01"
                        icon={DollarSign}
                        value={formData.condominio}
                        onChange={(e) => handleInputChange('condominio', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxa_incendio" className="text-gray-300">Taxa de Incêndio</Label>
                      <InputWithIcon
                        id="taxa_incendio"
                        type="number"
                        step="0.01"
                        icon={DollarSign}
                        value={formData.taxa_incendio}
                        onChange={(e) => handleInputChange('taxa_incendio', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Informações Adicionais */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Informações Adicionais</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dados_imovel" className="text-gray-300">Descrição do Imóvel</Label>
                      <Textarea
                        id="dados_imovel"
                        value={formData.dados_imovel}
                        onChange={(e) => handleInputChange('dados_imovel', e.target.value)}
                        placeholder="Ex: 2 dormitórios, 1 suíte, copa, cozinha, área de serviço..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="info_iptu" className="text-gray-300">Informações sobre IPTU</Label>
                        <Textarea
                          id="info_iptu"
                          value={formData.info_iptu}
                          onChange={(e) => handleInputChange('info_iptu', e.target.value)}
                          placeholder="Detalhes sobre pagamento do IPTU"
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="observacoes_condominio" className="text-gray-300">Observações do Condomínio</Label>
                        <Textarea
                          id="observacoes_condominio"
                          value={formData.observacoes_condominio}
                          onChange={(e) => handleInputChange('observacoes_condominio', e.target.value)}
                          placeholder="Regras, horários, observações"
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Utilidades */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Utilidades</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="copel_unidade_consumidora" className="text-gray-300">Copel - Unidade Consumidora</Label>
                      <InputWithIcon
                        id="copel_unidade_consumidora"
                        icon={Zap}
                        value={formData.copel_unidade_consumidora}
                        onChange={(e) => handleInputChange('copel_unidade_consumidora', e.target.value)}
                        placeholder="Número da unidade"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sanepar_matricula" className="text-gray-300">Sanepar - Matrícula</Label>
                      <InputWithIcon
                        id="sanepar_matricula"
                        icon={Droplets}
                        value={formData.sanepar_matricula}
                        onChange={(e) => handleInputChange('sanepar_matricula', e.target.value)}
                        placeholder="Matrícula da água"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
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
                      <Label htmlFor="tem_gas" className="text-gray-300 cursor-pointer">Tem Gás Encanado?</Label>
                    </div>

                    {formData.tem_gas && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="info_gas" className="text-gray-300">Informações sobre Gás</Label>
                        <div className="relative">
                          <Flame className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Textarea
                            id="info_gas"
                            value={formData.info_gas}
                            onChange={(e) => handleInputChange('info_gas', e.target.value)}
                            placeholder="Detalhes sobre instalação de gás"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 pl-10"
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
                      <Label htmlFor="boleto_condominio" className="text-gray-300 cursor-pointer">Boleto do Condomínio Incluso?</Label>
                    </div>
                  </div>
                </motion.div>

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
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};