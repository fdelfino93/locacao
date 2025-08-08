import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { 
  User, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Calendar,
  Shield,
  Heart,
  FileText,
  Users,
  Briefcase,
  Globe,
  UserCheck
} from 'lucide-react';
import type { Locador } from '../../types';
import { apiService } from '../../services/api';

export const ModernLocadorForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showConjuge, setShowConjuge] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<Locador>({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    tipo_recebimento: '',
    conta_bancaria: '',
    deseja_fci: 'Não',
    deseja_seguro_fianca: 'Não',
    deseja_seguro_incendio: 'Não',
    rg: '',
    dados_empresa: '',
    representante: '',
    nacionalidade: '',
    estado_civil: '',
    profissao: '',
    existe_conjuge: null,
    nome_conjuge: '',
    cpf_conjuge: '',
    rg_conjuge: '',
    endereco_conjuge: '',
    telefone_conjuge: '',
    tipo_locador: '',
    tipo_pessoa: 'PF',
    data_nascimento: ''
  });

  const handleInputChange = (field: keyof Locador, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: keyof Locador, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked ? 'Sim' : 'Não'
    }));
  };

  const handleConjugeChange = (value: string) => {
    const hasConjuge = value === 'Sim';
    setShowConjuge(hasConjuge);
    setFormData(prev => ({
      ...prev,
      existe_conjuge: hasConjuge ? 1 : 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await apiService.criarLocador(formData);
      if (response.success) {
        setMessage({type: 'success', text: response.message || 'Locador cadastrado com sucesso!'});
        // Reset form
        setFormData({
          nome: '',
          cpf_cnpj: '',
          telefone: '',
          email: '',
          endereco: '',
          tipo_recebimento: '',
          conta_bancaria: '',
          deseja_fci: 'Não',
          deseja_seguro_fianca: 'Não',
          deseja_seguro_incendio: 'Não',
          rg: '',
          dados_empresa: '',
          representante: '',
          nacionalidade: '',
          estado_civil: '',
          profissao: '',
          existe_conjuge: null,
          nome_conjuge: '',
          cpf_conjuge: '',
          rg_conjuge: '',
          endereco_conjuge: '',
          telefone_conjuge: '',
          tipo_locador: '',
          tipo_pessoa: 'PF',
          data_nascimento: ''
        });
        setShowConjuge(false);
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Erro ao cadastrar locador. Tente novamente.'});
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Cadastro de Locador</h2>
            </div>
          </div>

          <div className="p-8">
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
                    <FileText className="w-5 h-5" />
                  )}
                  <span>{message.text}</span>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Pessoais */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Dados Pessoais</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-gray-300">Nome Completo</Label>
                    <InputWithIcon
                      id="nome"
                      icon={User}
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Digite o nome completo"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf_cnpj" className="text-gray-300">CPF/CNPJ</Label>
                    <InputWithIcon
                      id="cpf_cnpj"
                      icon={CreditCard}
                      value={formData.cpf_cnpj}
                      onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
                      placeholder="000.000.000-00"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rg" className="text-gray-300">RG</Label>
                    <InputWithIcon
                      id="rg"
                      icon={CreditCard}
                      value={formData.rg}
                      onChange={(e) => handleInputChange('rg', e.target.value)}
                      placeholder="00.000.000-0"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_nascimento" className="text-gray-300">Data de Nascimento</Label>
                    <InputWithIcon
                      id="data_nascimento"
                      type="date"
                      icon={Calendar}
                      value={formData.data_nascimento}
                      onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nacionalidade" className="text-gray-300">Nacionalidade</Label>
                    <InputWithIcon
                      id="nacionalidade"
                      icon={Globe}
                      value={formData.nacionalidade}
                      onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                      placeholder="Brasileira"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado_civil" className="text-gray-300">Estado Civil</Label>
                    <InputWithIcon
                      id="estado_civil"
                      icon={Heart}
                      value={formData.estado_civil}
                      onChange={(e) => handleInputChange('estado_civil', e.target.value)}
                      placeholder="Solteiro(a)"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profissao" className="text-gray-300">Profissão</Label>
                    <InputWithIcon
                      id="profissao"
                      icon={Briefcase}
                      value={formData.profissao}
                      onChange={(e) => handleInputChange('profissao', e.target.value)}
                      placeholder="Engenheiro"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_locador" className="text-gray-300">Tipo de Locador</Label>
                    <Select onValueChange={(value) => handleInputChange('tipo_locador', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Residencial" className="text-white hover:bg-gray-700">Residencial</SelectItem>
                        <SelectItem value="Comercial" className="text-white hover:bg-gray-700">Comercial</SelectItem>
                        <SelectItem value="Industrial" className="text-white hover:bg-gray-700">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>

              {/* Contato */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>Informações de Contato</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-gray-300">Telefone</Label>
                    <InputWithIcon
                      id="telefone"
                      icon={Phone}
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <InputWithIcon
                      id="email"
                      type="email"
                      icon={Mail}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="cliente@email.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco" className="text-gray-300">Endereço</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      placeholder="Rua, número, bairro, cidade - CEP"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 pl-10 min-h-[80px]"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Dados Financeiros */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Dados Financeiros</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_recebimento" className="text-gray-300">Forma de Recebimento</Label>
                    <Select onValueChange={(value) => handleInputChange('tipo_recebimento', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione a forma" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="PIX" className="text-white hover:bg-gray-700">PIX</SelectItem>
                        <SelectItem value="TED" className="text-white hover:bg-gray-700">TED</SelectItem>
                        <SelectItem value="Boleto" className="text-white hover:bg-gray-700">Boleto</SelectItem>
                        <SelectItem value="Depósito" className="text-white hover:bg-gray-700">Depósito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conta_bancaria" className="text-gray-300">Conta Bancária</Label>
                    <InputWithIcon
                      id="conta_bancaria"
                      icon={Building}
                      value={formData.conta_bancaria}
                      onChange={(e) => handleInputChange('conta_bancaria', e.target.value)}
                      placeholder="Banco - Agência - Conta"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dados_empresa" className="text-gray-300">Dados da Empresa</Label>
                  <Textarea
                    id="dados_empresa"
                    value={formData.dados_empresa}
                    onChange={(e) => handleInputChange('dados_empresa', e.target.value)}
                    placeholder="Informações sobre a empresa (se aplicável)"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="representante" className="text-gray-300">Representante Legal</Label>
                  <InputWithIcon
                    id="representante"
                    icon={UserCheck}
                    value={formData.representante}
                    onChange={(e) => handleInputChange('representante', e.target.value)}
                    placeholder="Nome do representante"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
              </motion.div>

              {/* Preferências */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Preferências de Seguro</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Checkbox
                      id="deseja_fci"
                      checked={formData.deseja_fci === 'Sim'}
                      onCheckedChange={(checked) => handleCheckboxChange('deseja_fci', !!checked)}
                      className="border-white/20"
                    />
                    <Label htmlFor="deseja_fci" className="text-gray-300 cursor-pointer">Deseja FCI?</Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Checkbox
                      id="deseja_seguro_fianca"
                      checked={formData.deseja_seguro_fianca === 'Sim'}
                      onCheckedChange={(checked) => handleCheckboxChange('deseja_seguro_fianca', !!checked)}
                      className="border-white/20"
                    />
                    <Label htmlFor="deseja_seguro_fianca" className="text-gray-300 cursor-pointer">Seguro Fiança?</Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Checkbox
                      id="deseja_seguro_incendio"
                      checked={formData.deseja_seguro_incendio === 'Sim'}
                      onCheckedChange={(checked) => handleCheckboxChange('deseja_seguro_incendio', !!checked)}
                      className="border-white/20"
                    />
                    <Label htmlFor="deseja_seguro_incendio" className="text-gray-300 cursor-pointer">Seguro Incêndio?</Label>
                  </div>
                </div>
              </motion.div>

              {/* Cônjuge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Informações do Cônjuge</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Possui cônjuge?</Label>
                    <Select onValueChange={handleConjugeChange}>
                      <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Sim" className="text-white hover:bg-gray-700">Sim</SelectItem>
                        <SelectItem value="Não" className="text-white hover:bg-gray-700">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showConjuge && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 p-6 bg-white/5 rounded-2xl border border-white/10"
                    >
                      <h4 className="text-lg font-medium text-white">Dados do Cônjuge</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome_conjuge" className="text-gray-300">Nome do Cônjuge</Label>
                          <InputWithIcon
                            id="nome_conjuge"
                            icon={User}
                            value={formData.nome_conjuge || ''}
                            onChange={(e) => handleInputChange('nome_conjuge', e.target.value)}
                            placeholder="Nome completo"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cpf_conjuge" className="text-gray-300">CPF do Cônjuge</Label>
                          <InputWithIcon
                            id="cpf_conjuge"
                            icon={CreditCard}
                            value={formData.cpf_conjuge || ''}
                            onChange={(e) => handleInputChange('cpf_conjuge', e.target.value)}
                            placeholder="000.000.000-00"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rg_conjuge" className="text-gray-300">RG do Cônjuge</Label>
                          <InputWithIcon
                            id="rg_conjuge"
                            icon={CreditCard}
                            value={formData.rg_conjuge || ''}
                            onChange={(e) => handleInputChange('rg_conjuge', e.target.value)}
                            placeholder="00.000.000-0"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="telefone_conjuge" className="text-gray-300">Telefone do Cônjuge</Label>
                          <InputWithIcon
                            id="telefone_conjuge"
                            icon={Phone}
                            value={formData.telefone_conjuge || ''}
                            onChange={(e) => handleInputChange('telefone_conjuge', e.target.value)}
                            placeholder="(11) 99999-9999"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="endereco_conjuge" className="text-gray-300">Endereço do Cônjuge</Label>
                          <InputWithIcon
                            id="endereco_conjuge"
                            icon={MapPin}
                            value={formData.endereco_conjuge || ''}
                            onChange={(e) => handleInputChange('endereco_conjuge', e.target.value)}
                            placeholder="Endereço completo"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
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
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Cadastrando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-5 h-5" />
                        <span>Cadastrar Locador</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};