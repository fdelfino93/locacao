import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { 
  Users, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Shield,
  Heart,
  FileText,
  User,
  Briefcase,
  Globe,
  UserCheck,
  Baby,
  Dog
} from 'lucide-react';
import type { Inquilino } from '../../types';
import { apiService } from '../../services/api';

export const ModernInquilinoForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showConjuge, setShowConjuge] = useState<boolean>(false);
  const [hasDependentes, setHasDependentes] = useState<boolean>(false);
  const [hasPets, setHasPets] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<Inquilino>({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    tipo_garantia: '',
    responsavel_pgto_agua: '',
    responsavel_pgto_luz: '',
    responsavel_pgto_gas: '',
    rg: '',
    dados_empresa: '',
    representante: '',
    nacionalidade: '',
    estado_civil: '',
    profissao: '',
    dados_moradores: '',
    Endereco_inq: '',
    responsavel_inq: null,
    dependentes_inq: null,
    qtd_dependentes_inq: 0,
    pet_inquilino: null,
    qtd_pet_inquilino: 0,
    porte_pet: '',
    nome_conjuge: '',
    cpf_conjuge: '',
    rg_conjuge: '',
    endereco_conjuge: '',
    telefone_conjuge: ''
  });

  const handleInputChange = (field: keyof Inquilino, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResponsavelChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      responsavel_inq: value === 'Sim' ? 1 : 0
    }));
  };

  const handleDependentesChange = (value: string) => {
    const hasDep = value === 'Sim';
    setHasDependentes(hasDep);
    setFormData(prev => ({
      ...prev,
      dependentes_inq: hasDep ? 1 : 0,
      qtd_dependentes_inq: hasDep ? prev.qtd_dependentes_inq : 0
    }));
  };

  const handlePetsChange = (value: string) => {
    const hasPet = value === 'Sim';
    setHasPets(hasPet);
    setFormData(prev => ({
      ...prev,
      pet_inquilino: hasPet ? 1 : 0,
      qtd_pet_inquilino: hasPet ? prev.qtd_pet_inquilino : 0,
      porte_pet: hasPet ? prev.porte_pet : ''
    }));
  };

  const handleConjugeChange = (value: string) => {
    const hasConjuge = value === 'Sim';
    setShowConjuge(hasConjuge);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await apiService.criarInquilino(formData);
      if (response.success) {
        setMessage({type: 'success', text: response.message || 'Inquilino cadastrado com sucesso!'});
        // Reset form
        setFormData({
          nome: '',
          cpf_cnpj: '',
          telefone: '',
          email: '',
          tipo_garantia: '',
          responsavel_pgto_agua: '',
          responsavel_pgto_luz: '',
          responsavel_pgto_gas: '',
          rg: '',
          dados_empresa: '',
          representante: '',
          nacionalidade: '',
          estado_civil: '',
          profissao: '',
          dados_moradores: '',
          Endereco_inq: '',
          responsavel_inq: null,
          dependentes_inq: null,
          qtd_dependentes_inq: 0,
          pet_inquilino: null,
          qtd_pet_inquilino: 0,
          porte_pet: '',
          nome_conjuge: '',
          cpf_conjuge: '',
          rg_conjuge: '',
          endereco_conjuge: '',
          telefone_conjuge: ''
        });
        setShowConjuge(false);
        setHasDependentes(false);
        setHasPets(false);
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Erro ao cadastrar inquilino. Tente novamente.'});
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
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Cadastro de Inquilino</h1>
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
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Dados Pessoais</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-gray-300">Nome do Inquilino</Label>
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
                </div>
              </motion.div>

              {/* Contato */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>Informações de Contato</span>
                </h2>
                
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
                      placeholder="inquilino@email.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Endereco_inq" className="text-gray-300">Endereço Responsável</Label>
                  <InputWithIcon
                    id="Endereco_inq"
                    icon={MapPin}
                    value={formData.Endereco_inq}
                    onChange={(e) => handleInputChange('Endereco_inq', e.target.value)}
                    placeholder="Rua, número, bairro, cidade - CEP"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
              </motion.div>

              {/* Garantia e Responsabilidades */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Garantia e Responsabilidades</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_garantia" className="text-gray-300">Tipo de Garantia</Label>
                    <Select onValueChange={(value) => handleInputChange('tipo_garantia', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione o tipo de garantia" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Fiador" className="text-white hover:bg-gray-700">Fiador</SelectItem>
                        <SelectItem value="Caução" className="text-white hover:bg-gray-700">Caução</SelectItem>
                        <SelectItem value="Seguro-fiança" className="text-white hover:bg-gray-700">Seguro-fiança</SelectItem>
                        <SelectItem value="Título de Capitalização" className="text-white hover:bg-gray-700">Título de Capitalização</SelectItem>
                        <SelectItem value="Sem garantia" className="text-white hover:bg-gray-700">Sem garantia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="responsavel_pgto_agua" className="text-gray-300">Responsável Água</Label>
                      <InputWithIcon
                        id="responsavel_pgto_agua"
                        icon={Building}
                        value={formData.responsavel_pgto_agua}
                        onChange={(e) => handleInputChange('responsavel_pgto_agua', e.target.value)}
                        placeholder="Nome responsável"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="responsavel_pgto_luz" className="text-gray-300">Responsável Luz</Label>
                      <InputWithIcon
                        id="responsavel_pgto_luz"
                        icon={Building}
                        value={formData.responsavel_pgto_luz}
                        onChange={(e) => handleInputChange('responsavel_pgto_luz', e.target.value)}
                        placeholder="Nome responsável"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="responsavel_pgto_gas" className="text-gray-300">Responsável Gás</Label>
                      <InputWithIcon
                        id="responsavel_pgto_gas"
                        icon={Building}
                        value={formData.responsavel_pgto_gas}
                        onChange={(e) => handleInputChange('responsavel_pgto_gas', e.target.value)}
                        placeholder="Nome responsável"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">É o responsável pela locação?</Label>
                    <Select onValueChange={handleResponsavelChange}>
                      <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Sim" className="text-white hover:bg-gray-700">Sim</SelectItem>
                        <SelectItem value="Não" className="text-white hover:bg-gray-700">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>

              {/* Dados Adicionais */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Dados Adicionais</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dados_empresa" className="text-gray-300">Dados da Empresa</Label>
                    <Textarea
                      id="dados_empresa"
                      value={formData.dados_empresa}
                      onChange={(e) => handleInputChange('dados_empresa', e.target.value)}
                      placeholder="Informações sobre a empresa"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dados_moradores" className="text-gray-300">Dados dos Moradores</Label>
                    <Textarea
                      id="dados_moradores"
                      value={formData.dados_moradores}
                      onChange={(e) => handleInputChange('dados_moradores', e.target.value)}
                      placeholder="Informações sobre os moradores"
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
                </div>
              </motion.div>

              {/* Dependentes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Baby className="w-5 h-5" />
                  <span>Dependentes</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Possui dependentes?</Label>
                    <Select onValueChange={handleDependentesChange}>
                      <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Sim" className="text-white hover:bg-gray-700">Sim</SelectItem>
                        <SelectItem value="Não" className="text-white hover:bg-gray-700">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hasDependentes && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="qtd_dependentes_inq" className="text-gray-300">Quantidade de Dependentes</Label>
                      <InputWithIcon
                        id="qtd_dependentes_inq"
                        type="number"
                        icon={Baby}
                        min="0"
                        value={formData.qtd_dependentes_inq}
                        onChange={(e) => handleInputChange('qtd_dependentes_inq', parseInt(e.target.value) || 0)}
                        className="bg-white/5 border-white/10 text-white w-32"
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Pets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Dog className="w-5 h-5" />
                  <span>Animais de Estimação</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Possui pets?</Label>
                    <Select onValueChange={handlePetsChange}>
                      <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Sim" className="text-white hover:bg-gray-700">Sim</SelectItem>
                        <SelectItem value="Não" className="text-white hover:bg-gray-700">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hasPets && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="qtd_pet_inquilino" className="text-gray-300">Quantidade de Pets</Label>
                        <InputWithIcon
                          id="qtd_pet_inquilino"
                          type="number"
                          icon={Dog}
                          min="0"
                          value={formData.qtd_pet_inquilino}
                          onChange={(e) => handleInputChange('qtd_pet_inquilino', parseInt(e.target.value) || 0)}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="porte_pet" className="text-gray-300">Porte do Pet</Label>
                        <Select onValueChange={(value) => handleInputChange('porte_pet', value)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="Pequeno" className="text-white hover:bg-gray-700">Pequeno</SelectItem>
                            <SelectItem value="Grande" className="text-white hover:bg-gray-700">Grande</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Cônjuge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Informações do Cônjuge</span>
                </h2>
                
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
                      <h3 className="text-lg font-semibold text-white">Dados do Cônjuge</h3>
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
                transition={{ duration: 0.6, delay: 0.8 }}
                className="pt-6"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Cadastrando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Cadastrar Inquilino</span>
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