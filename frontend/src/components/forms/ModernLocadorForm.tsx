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
  CheckCircle,
  AlertCircle,
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
  const [showDadosBancarios, setShowDadosBancarios] = useState<boolean>(false);
  
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
    regime_bens: '',
    tipo_conta: '',
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

  const handleFormaRecebimentoChange = (value: string) => {
    setShowDadosBancarios(value === 'TED');
    setFormData(prev => ({
      ...prev,
      tipo_recebimento: value
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
          regime_bens: '',
          tipo_conta: '',
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
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-primary-foreground">Cadastro de Locador</h2>
            </div>
          </div>

          <div className="p-8">
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
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-blue-600" />
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
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Dados Pessoais</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome" >Nome Completo</Label>
                    <InputWithIcon
                      id="nome"
                      icon={User}
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Digite o nome completo"
                                            required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf_cnpj" >CPF/CNPJ</Label>
                    <InputWithIcon
                      id="cpf_cnpj"
                      icon={CreditCard}
                      value={formData.cpf_cnpj}
                      onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
                      placeholder="000.000.000-00"
                                            required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rg" >RG</Label>
                    <InputWithIcon
                      id="rg"
                      icon={CreditCard}
                      value={formData.rg}
                      onChange={(e) => handleInputChange('rg', e.target.value)}
                      placeholder="00.000.000-0"
                                          />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_nascimento" >Data de Nascimento</Label>
                    <InputWithIcon
                      id="data_nascimento"
                      type="date"
                      icon={Calendar}
                      value={formData.data_nascimento}
                      onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                      className="bg-muted/50 border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nacionalidade" >Nacionalidade</Label>
                    <InputWithIcon
                      id="nacionalidade"
                      icon={Globe}
                      value={formData.nacionalidade}
                      onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                      placeholder="Brasileira"
                                          />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado_civil" >Estado Civil</Label>
                    <InputWithIcon
                      id="estado_civil"
                      icon={Heart}
                      value={formData.estado_civil}
                      onChange={(e) => handleInputChange('estado_civil', e.target.value)}
                      placeholder="Solteiro(a)"
                                          />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profissao" >Profissão</Label>
                    <InputWithIcon
                      id="profissao"
                      icon={Briefcase}
                      value={formData.profissao}
                      onChange={(e) => handleInputChange('profissao', e.target.value)}
                      placeholder="Engenheiro"
                                          />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_locador" >Tipo de Locador</Label>
                    <Select onValueChange={(value) => handleInputChange('tipo_locador', value)}>
                      <SelectTrigger className="bg-muted/50 border-border text-foreground">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Residencial" className="text-foreground hover:bg-gray-700">Residencial</SelectItem>
                        <SelectItem value="Comercial" className="text-foreground hover:bg-gray-700">Comercial</SelectItem>
                        <SelectItem value="Industrial" className="text-foreground hover:bg-gray-700">Industrial</SelectItem>
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
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span>Informações de Contato</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="telefone" >Telefone</Label>
                    <InputWithIcon
                      id="telefone"
                      icon={Phone}
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                                            required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" >Email</Label>
                    <InputWithIcon
                      id="email"
                      type="email"
                      icon={Mail}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="cliente@email.com"
                                            required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco" >Endereço</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      placeholder="Rua, número, bairro, cidade - CEP"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pl-10 min-h-[80px]"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Dados da Empresa */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span>Dados da Empresa</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dados_empresa" >Dados da Empresa</Label>
                    <Textarea
                      id="dados_empresa"
                      value={formData.dados_empresa}
                      onChange={(e) => handleInputChange('dados_empresa', e.target.value)}
                      placeholder="Informações sobre a empresa (se aplicável)"
                                          />
                  </div>

                  {/* Seção Separada para Representante Legal e Documentos */}
                  <div className="border-t border-white/10 pt-6 mt-6">
                    <h4 className="text-lg font-medium text-foreground mb-4 flex items-center space-x-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Representante Legal e Documentos</span>
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="representante" >Representante Legal</Label>
                        <InputWithIcon
                          id="representante"
                          icon={UserCheck}
                          value={formData.representante}
                          onChange={(e) => handleInputChange('representante', e.target.value)}
                          placeholder="Nome do representante"
                                                  />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Forma de Recebimento */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Forma de Recebimento</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_recebimento" >Forma de Recebimento</Label>
                    <Select onValueChange={handleFormaRecebimentoChange}>
                      <SelectTrigger className="bg-muted/50 border-border text-foreground">
                        <SelectValue placeholder="Selecione a forma" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="PIX" className="text-foreground hover:bg-gray-700">PIX</SelectItem>
                        <SelectItem value="TED" className="text-foreground hover:bg-gray-700">TED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showDadosBancarios && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 p-6 bg-white/5 rounded-2xl border border-white/10"
                    >
                      <h4 className="text-lg font-medium text-foreground">Dados Bancários</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="conta_bancaria" >Banco</Label>
                          <InputWithIcon
                            id="conta_bancaria"
                            icon={Building}
                            value={formData.conta_bancaria}
                            onChange={(e) => handleInputChange('conta_bancaria', e.target.value)}
                            placeholder="Ex: Banco do Brasil"
                                                      />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tipo_conta" >Tipo de Conta</Label>
                          <Select onValueChange={(value) => handleInputChange('tipo_conta', value)}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="Conta Corrente" className="text-foreground hover:bg-gray-700">Conta Corrente</SelectItem>
                              <SelectItem value="Conta Poupança" className="text-foreground hover:bg-gray-700">Conta Poupança</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>


              {/* Cônjuge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Informações do Cônjuge</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label >Possui cônjuge?</Label>
                    <Select onValueChange={handleConjugeChange}>
                      <SelectTrigger className="w-48 bg-muted/50 border-border text-foreground">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Sim" className="text-foreground hover:bg-gray-700">Sim</SelectItem>
                        <SelectItem value="Não" className="text-foreground hover:bg-gray-700">Não</SelectItem>
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
                      <h4 className="text-lg font-medium text-foreground">Dados do Cônjuge</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome_conjuge" >Nome do Cônjuge</Label>
                          <InputWithIcon
                            id="nome_conjuge"
                            icon={User}
                            value={formData.nome_conjuge || ''}
                            onChange={(e) => handleInputChange('nome_conjuge', e.target.value)}
                            placeholder="Nome completo"
                                                      />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cpf_conjuge" >CPF do Cônjuge</Label>
                          <InputWithIcon
                            id="cpf_conjuge"
                            icon={CreditCard}
                            value={formData.cpf_conjuge || ''}
                            onChange={(e) => handleInputChange('cpf_conjuge', e.target.value)}
                            placeholder="000.000.000-00"
                                                      />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rg_conjuge" >RG do Cônjuge</Label>
                          <InputWithIcon
                            id="rg_conjuge"
                            icon={CreditCard}
                            value={formData.rg_conjuge || ''}
                            onChange={(e) => handleInputChange('rg_conjuge', e.target.value)}
                            placeholder="00.000.000-0"
                                                      />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="telefone_conjuge" >Telefone do Cônjuge</Label>
                          <InputWithIcon
                            id="telefone_conjuge"
                            icon={Phone}
                            value={formData.telefone_conjuge || ''}
                            onChange={(e) => handleInputChange('telefone_conjuge', e.target.value)}
                            placeholder="(11) 99999-9999"
                                                      />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="regime_bens" >Regime de Bens</Label>
                          <Select onValueChange={(value) => handleInputChange('regime_bens', value)}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground">
                              <SelectValue placeholder="Selecione o regime" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="Comunhão Total" className="text-foreground hover:bg-gray-700">Comunhão Total</SelectItem>
                              <SelectItem value="Comunhão Parcial" className="text-foreground hover:bg-gray-700">Comunhão Parcial</SelectItem>
                              <SelectItem value="Separação Total" className="text-foreground hover:bg-gray-700">Separação Total</SelectItem>
                              <SelectItem value="Outros" className="text-foreground hover:bg-gray-700">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="endereco_conjuge" >Endereço do Cônjuge</Label>
                          <InputWithIcon
                            id="endereco_conjuge"
                            icon={MapPin}
                            value={formData.endereco_conjuge || ''}
                            onChange={(e) => handleInputChange('endereco_conjuge', e.target.value)}
                            placeholder="Endereço completo"
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
                transition={{ duration: 0.6, delay: 0.5 }}
                className="pt-6"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-foreground py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Cadastrando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-5 h-5 text-blue-600" />
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