import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
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
  UserCheck,
  Plus,
  Trash2,
  IdCard
} from 'lucide-react';
import type { Locador, RepresentanteLegal, Endereco } from '../../types';
import { apiService } from '../../services/api';

interface FormSectionsData {
  dados_basicos: boolean;
  representante: boolean;
  contato: boolean;
  bancarios: boolean;
}

export const ModernLocadorFormV3: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showConjuge, setShowConjuge] = useState<boolean>(false);
  const [showDadosBancarios, setShowDadosBancarios] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<Locador>({
    nome: '',
    cpf_cnpj: '',
    telefones: [''],
    emails: [''],
    endereco: {
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
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
    data_nascimento: '',
    representante_legal: {
      nome: '',
      cpf: '',
      rg: '',
      telefones: [''],
      emails: [''],
      endereco: {
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      },
      estado_civil: 'solteiro',
      nacionalidade: '',
      profissao: '',
      data_nascimento: ''
    }
  });

  // Hook para detectar dados preenchidos em cada seção
  const sectionsData: FormSectionsData = {
    dados_basicos: !!(formData.nome || formData.cpf_cnpj || formData.rg || formData.nacionalidade),
    representante: !!(formData.tipo_pessoa === 'PJ' && (formData.representante_legal?.nome || formData.dados_empresa)),
    contato: !!(formData.telefones.some(t => t) || formData.emails.some(e => e) || formData.endereco?.rua),
    bancarios: !!(formData.tipo_recebimento || formData.conta_bancaria)
  };

  const handleInputChange = (field: keyof Locador, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEnderecoChange = (field: keyof Endereco, value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco!,
        [field]: value
      }
    }));
  };

  const handleRepresentanteChange = (field: keyof RepresentanteLegal, value: any) => {
    setFormData(prev => ({
      ...prev,
      representante_legal: {
        ...prev.representante_legal!,
        [field]: value
      }
    }));
  };

  const handleRepresentanteEnderecoChange = (field: keyof Endereco, value: string) => {
    setFormData(prev => ({
      ...prev,
      representante_legal: {
        ...prev.representante_legal!,
        endereco: {
          ...prev.representante_legal!.endereco!,
          [field]: value
        }
      }
    }));
  };

  const addTelefone = () => {
    setFormData(prev => ({
      ...prev,
      telefones: [...prev.telefones, '']
    }));
  };

  const removeTelefone = (index: number) => {
    if (formData.telefones.length > 1) {
      setFormData(prev => ({
        ...prev,
        telefones: prev.telefones.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTelefone = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      telefones: prev.telefones.map((tel, i) => i === index ? value : tel)
    }));
  };

  const addEmail = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const removeEmail = (index: number) => {
    if (formData.emails.length > 1) {
      setFormData(prev => ({
        ...prev,
        emails: prev.emails.filter((_, i) => i !== index)
      }));
    }
  };

  const updateEmail = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }));
  };

  // Funções similares para telefones e emails do representante legal
  const addRepresentanteTelefone = () => {
    setFormData(prev => ({
      ...prev,
      representante_legal: {
        ...prev.representante_legal!,
        telefones: [...prev.representante_legal!.telefones, '']
      }
    }));
  };

  const removeRepresentanteTelefone = (index: number) => {
    if (formData.representante_legal!.telefones.length > 1) {
      setFormData(prev => ({
        ...prev,
        representante_legal: {
          ...prev.representante_legal!,
          telefones: prev.representante_legal!.telefones.filter((_, i) => i !== index)
        }
      }));
    }
  };

  const updateRepresentanteTelefone = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      representante_legal: {
        ...prev.representante_legal!,
        telefones: prev.representante_legal!.telefones.map((tel, i) => i === index ? value : tel)
      }
    }));
  };

  const addRepresentanteEmail = () => {
    setFormData(prev => ({
      ...prev,
      representante_legal: {
        ...prev.representante_legal!,
        emails: [...prev.representante_legal!.emails, '']
      }
    }));
  };

  const removeRepresentanteEmail = (index: number) => {
    if (formData.representante_legal!.emails.length > 1) {
      setFormData(prev => ({
        ...prev,
        representante_legal: {
          ...prev.representante_legal!,
          emails: prev.representante_legal!.emails.filter((_, i) => i !== index)
        }
      }));
    }
  };

  const updateRepresentanteEmail = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      representante_legal: {
        ...prev.representante_legal!,
        emails: prev.representante_legal!.emails.map((email, i) => i === index ? value : email)
      }
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

  const validatePhoneFormat = (phone: string): boolean => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone) || phone === '';
  };

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || email === '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validações
    const phoneErrors = formData.telefones.filter(phone => phone && !validatePhoneFormat(phone));
    const emailErrors = formData.emails.filter(email => email && !validateEmailFormat(email));
    
    if (phoneErrors.length > 0) {
      setMessage({type: 'error', text: 'Formato de telefone inválido. Use (XX) XXXXX-XXXX'});
      setLoading(false);
      return;
    }

    if (emailErrors.length > 0) {
      setMessage({type: 'error', text: 'Formato de e-mail inválido.'});
      setLoading(false);
      return;
    }

    try {
      // Preparar dados para API (compatibilidade com backend atual)
      const dataToSend = {
        ...formData,
        telefone: formData.telefones.filter(t => t)[0] || '',
        email: formData.emails.filter(e => e)[0] || '',
        endereco: `${formData.endereco?.rua}, ${formData.endereco?.numero}, ${formData.endereco?.bairro}, ${formData.endereco?.cidade} - ${formData.endereco?.cep}`,
        representante_legal: formData.tipo_pessoa === 'PJ' ? {
          ...formData.representante_legal,
          telefone: formData.representante_legal?.telefones.filter(t => t)[0] || '',
          email: formData.representante_legal?.emails.filter(e => e)[0] || '',
        } : undefined
      };

      const response = await apiService.criarLocador(dataToSend);
      if (response.success) {
        setMessage({type: 'success', text: response.message || 'Locador cadastrado com sucesso!'});
        // Reset form
        setFormData({
          nome: '',
          cpf_cnpj: '',
          telefones: [''],
          emails: [''],
          endereco: {
            rua: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: ''
          },
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
          data_nascimento: '',
          representante_legal: {
            nome: '',
            cpf: '',
            rg: '',
            telefones: [''],
            emails: [''],
            endereco: {
              rua: '',
              numero: '',
              complemento: '',
              bairro: '',
              cidade: '',
              estado: '',
              cep: ''
            },
            estado_civil: 'solteiro',
            nacionalidade: '',
            profissao: '',
            data_nascimento: ''
          }
        });
        setShowConjuge(false);
        setShowDadosBancarios(false);
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
              <Tabs defaultValue="dados_basicos" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dados_basicos" hasData={sectionsData.dados_basicos}>
                    Dados Básicos
                  </TabsTrigger>
                  <TabsTrigger value="contato" hasData={sectionsData.contato}>
                    Contato
                  </TabsTrigger>
                  {formData.tipo_pessoa === 'PJ' && (
                    <TabsTrigger value="representante" hasData={sectionsData.representante}>
                      Representante Legal
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="bancarios" hasData={sectionsData.bancarios}>
                    Dados Bancários
                  </TabsTrigger>
                </TabsList>

                {/* Aba 1: Dados Básicos */}
                <TabsContent value="dados_basicos" className="space-y-8">
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
                        <User className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">Dados Básicos</h2>
                        <p className="text-muted-foreground">Informações principais do locador</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="tipo_pessoa">Tipo de Pessoa</Label>
                        <Select 
                          value={formData.tipo_pessoa}
                          onValueChange={(value: 'PF' | 'PJ') => handleInputChange('tipo_pessoa', value)}
                        >
                          <SelectTrigger className="bg-muted/50 border-border text-foreground">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="PF" className="text-foreground hover:bg-gray-700">Pessoa Física</SelectItem>
                            <SelectItem value="PJ" className="text-foreground hover:bg-gray-700">Pessoa Jurídica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nome">
                          {formData.tipo_pessoa === 'PJ' ? 'Razão Social' : 'Nome Completo'}
                        </Label>
                        <InputWithIcon
                          id="nome"
                          icon={formData.tipo_pessoa === 'PJ' ? Building : User}
                          value={formData.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          placeholder={formData.tipo_pessoa === 'PJ' ? 'Digite a razão social' : 'Digite o nome completo'}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cpf_cnpj">
                          {formData.tipo_pessoa === 'PJ' ? 'CNPJ' : 'CPF'}
                        </Label>
                        <InputWithIcon
                          id="cpf_cnpj"
                          icon={CreditCard}
                          value={formData.cpf_cnpj}
                          onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
                          placeholder={formData.tipo_pessoa === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                          required
                        />
                      </div>

                      {formData.tipo_pessoa === 'PF' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="rg">RG</Label>
                            <InputWithIcon
                              id="rg"
                              icon={IdCard}
                              value={formData.rg}
                              onChange={(e) => handleInputChange('rg', e.target.value)}
                              placeholder="00.000.000-0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
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
                            <Label htmlFor="nacionalidade">Nacionalidade</Label>
                            <InputWithIcon
                              id="nacionalidade"
                              icon={Globe}
                              value={formData.nacionalidade}
                              onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                              placeholder="Brasileira"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="estado_civil">Estado Civil</Label>
                            <Select onValueChange={(value) => handleInputChange('estado_civil', value)}>
                              <SelectTrigger className="bg-muted/50 border-border text-foreground">
                                <SelectValue placeholder="Selecione o estado civil" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="solteiro" className="text-foreground hover:bg-gray-700">Solteiro(a)</SelectItem>
                                <SelectItem value="casado" className="text-foreground hover:bg-gray-700">Casado(a)</SelectItem>
                                <SelectItem value="divorciado" className="text-foreground hover:bg-gray-700">Divorciado(a)</SelectItem>
                                <SelectItem value="viuvo" className="text-foreground hover:bg-gray-700">Viúvo(a)</SelectItem>
                                <SelectItem value="uniao_estavel" className="text-foreground hover:bg-gray-700">União Estável</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="profissao">Profissão</Label>
                            <InputWithIcon
                              id="profissao"
                              icon={Briefcase}
                              value={formData.profissao}
                              onChange={(e) => handleInputChange('profissao', e.target.value)}
                              placeholder="Engenheiro"
                            />
                          </div>
                        </>
                      )}

                      {formData.tipo_pessoa === 'PJ' && (
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="dados_empresa">Dados da Empresa</Label>
                          <Textarea
                            id="dados_empresa"
                            value={formData.dados_empresa}
                            onChange={(e) => handleInputChange('dados_empresa', e.target.value)}
                            placeholder="Informações sobre a empresa"
                            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="tipo_locador">Tipo de Locador</Label>
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
                </TabsContent>

                {/* Aba 2: Contato */}
                <TabsContent value="contato" className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <motion.div 
                        className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-green-500 to-teal-500"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <Phone className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">Informações de Contato</h2>
                        <p className="text-muted-foreground">Telefones, emails e endereço</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="space-y-6"
                  >
                    {/* Telefones */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Telefones</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTelefone}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Telefone
                        </Button>
                      </div>
                      {formData.telefones.map((telefone, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <InputWithIcon
                            icon={Phone}
                            value={telefone}
                            onChange={(e) => updateTelefone(index, e.target.value)}
                            placeholder="(11) 99999-9999"
                            className="flex-1"
                          />
                          {formData.telefones.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeTelefone(index)}
                              className="p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Emails */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>E-mails</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addEmail}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar E-mail
                        </Button>
                      </div>
                      {formData.emails.map((email, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <InputWithIcon
                            icon={Mail}
                            type="email"
                            value={email}
                            onChange={(e) => updateEmail(index, e.target.value)}
                            placeholder="cliente@email.com"
                            className="flex-1"
                          />
                          {formData.emails.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeEmail(index)}
                              className="p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4">
                      <Label>Endereço</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="endereco_rua">Logradouro</Label>
                          <InputWithIcon
                            id="endereco_rua"
                            icon={MapPin}
                            value={formData.endereco?.rua || ''}
                            onChange={(e) => handleEnderecoChange('rua', e.target.value)}
                            placeholder="Rua das Flores"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endereco_numero">Número</Label>
                          <InputWithIcon
                            id="endereco_numero"
                            icon={MapPin}
                            value={formData.endereco?.numero || ''}
                            onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                            placeholder="123"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endereco_complemento">Complemento</Label>
                          <InputWithIcon
                            id="endereco_complemento"
                            icon={MapPin}
                            value={formData.endereco?.complemento || ''}
                            onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                            placeholder="Apto 45"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endereco_bairro">Bairro</Label>
                          <InputWithIcon
                            id="endereco_bairro"
                            icon={MapPin}
                            value={formData.endereco?.bairro || ''}
                            onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                            placeholder="Centro"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endereco_cidade">Cidade</Label>
                          <InputWithIcon
                            id="endereco_cidade"
                            icon={MapPin}
                            value={formData.endereco?.cidade || ''}
                            onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                            placeholder="São Paulo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endereco_estado">Estado</Label>
                          <InputWithIcon
                            id="endereco_estado"
                            icon={MapPin}
                            value={formData.endereco?.estado || ''}
                            onChange={(e) => handleEnderecoChange('estado', e.target.value)}
                            placeholder="SP"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="endereco_cep">CEP</Label>
                          <InputWithIcon
                            id="endereco_cep"
                            icon={MapPin}
                            value={formData.endereco?.cep || ''}
                            onChange={(e) => handleEnderecoChange('cep', e.target.value)}
                            placeholder="00000-000"
                            className="max-w-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Aba 3: Representante Legal (só aparece para PJ) */}
                {formData.tipo_pessoa === 'PJ' && (
                  <TabsContent value="representante" className="space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center space-y-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-pink-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <UserCheck className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">Representante Legal</h2>
                          <p className="text-muted-foreground">Dados do representante da empresa</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="rep_nome">Nome Completo</Label>
                          <InputWithIcon
                            id="rep_nome"
                            icon={User}
                            value={formData.representante_legal?.nome || ''}
                            onChange={(e) => handleRepresentanteChange('nome', e.target.value)}
                            placeholder="Digite o nome completo"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rep_cpf">CPF</Label>
                          <InputWithIcon
                            id="rep_cpf"
                            icon={CreditCard}
                            value={formData.representante_legal?.cpf || ''}
                            onChange={(e) => handleRepresentanteChange('cpf', e.target.value)}
                            placeholder="000.000.000-00"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rep_rg">RG</Label>
                          <InputWithIcon
                            id="rep_rg"
                            icon={IdCard}
                            value={formData.representante_legal?.rg || ''}
                            onChange={(e) => handleRepresentanteChange('rg', e.target.value)}
                            placeholder="00.000.000-0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rep_data_nascimento">Data de Nascimento</Label>
                          <InputWithIcon
                            id="rep_data_nascimento"
                            type="date"
                            icon={Calendar}
                            value={formData.representante_legal?.data_nascimento || ''}
                            onChange={(e) => handleRepresentanteChange('data_nascimento', e.target.value)}
                            className="bg-muted/50 border-border text-foreground"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rep_estado_civil">Estado Civil</Label>
                          <Select 
                            value={formData.representante_legal?.estado_civil} 
                            onValueChange={(value) => handleRepresentanteChange('estado_civil', value)}
                          >
                            <SelectTrigger className="bg-muted/50 border-border text-foreground">
                              <SelectValue placeholder="Selecione o estado civil" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="solteiro" className="text-foreground hover:bg-gray-700">Solteiro(a)</SelectItem>
                              <SelectItem value="casado" className="text-foreground hover:bg-gray-700">Casado(a)</SelectItem>
                              <SelectItem value="divorciado" className="text-foreground hover:bg-gray-700">Divorciado(a)</SelectItem>
                              <SelectItem value="viuvo" className="text-foreground hover:bg-gray-700">Viúvo(a)</SelectItem>
                              <SelectItem value="uniao_estavel" className="text-foreground hover:bg-gray-700">União Estável</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rep_profissao">Profissão</Label>
                          <InputWithIcon
                            id="rep_profissao"
                            icon={Briefcase}
                            value={formData.representante_legal?.profissao || ''}
                            onChange={(e) => handleRepresentanteChange('profissao', e.target.value)}
                            placeholder="Administrador"
                          />
                        </div>
                      </div>

                      {/* Telefones do Representante */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Telefones</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addRepresentanteTelefone}
                            className="flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar Telefone
                          </Button>
                        </div>
                        {formData.representante_legal?.telefones.map((telefone, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <InputWithIcon
                              icon={Phone}
                              value={telefone}
                              onChange={(e) => updateRepresentanteTelefone(index, e.target.value)}
                              placeholder="(11) 99999-9999"
                              className="flex-1"
                            />
                            {formData.representante_legal!.telefones.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeRepresentanteTelefone(index)}
                                className="p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Emails do Representante */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>E-mails</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addRepresentanteEmail}
                            className="flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar E-mail
                          </Button>
                        </div>
                        {formData.representante_legal?.emails.map((email, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <InputWithIcon
                              icon={Mail}
                              type="email"
                              value={email}
                              onChange={(e) => updateRepresentanteEmail(index, e.target.value)}
                              placeholder="representante@email.com"
                              className="flex-1"
                            />
                            {formData.representante_legal!.emails.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeRepresentanteEmail(index)}
                                className="p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Endereço do Representante */}
                      <div className="space-y-4">
                        <Label>Endereço do Representante</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="rep_endereco_rua">Logradouro</Label>
                            <InputWithIcon
                              id="rep_endereco_rua"
                              icon={MapPin}
                              value={formData.representante_legal?.endereco?.rua || ''}
                              onChange={(e) => handleRepresentanteEnderecoChange('rua', e.target.value)}
                              placeholder="Rua das Flores"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rep_endereco_numero">Número</Label>
                            <InputWithIcon
                              id="rep_endereco_numero"
                              icon={MapPin}
                              value={formData.representante_legal?.endereco?.numero || ''}
                              onChange={(e) => handleRepresentanteEnderecoChange('numero', e.target.value)}
                              placeholder="123"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rep_endereco_complemento">Complemento</Label>
                            <InputWithIcon
                              id="rep_endereco_complemento"
                              icon={MapPin}
                              value={formData.representante_legal?.endereco?.complemento || ''}
                              onChange={(e) => handleRepresentanteEnderecoChange('complemento', e.target.value)}
                              placeholder="Apto 45"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rep_endereco_bairro">Bairro</Label>
                            <InputWithIcon
                              id="rep_endereco_bairro"
                              icon={MapPin}
                              value={formData.representante_legal?.endereco?.bairro || ''}
                              onChange={(e) => handleRepresentanteEnderecoChange('bairro', e.target.value)}
                              placeholder="Centro"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rep_endereco_cidade">Cidade</Label>
                            <InputWithIcon
                              id="rep_endereco_cidade"
                              icon={MapPin}
                              value={formData.representante_legal?.endereco?.cidade || ''}
                              onChange={(e) => handleRepresentanteEnderecoChange('cidade', e.target.value)}
                              placeholder="São Paulo"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rep_endereco_estado">Estado</Label>
                            <InputWithIcon
                              id="rep_endereco_estado"
                              icon={MapPin}
                              value={formData.representante_legal?.endereco?.estado || ''}
                              onChange={(e) => handleRepresentanteEnderecoChange('estado', e.target.value)}
                              placeholder="SP"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="rep_endereco_cep">CEP</Label>
                            <InputWithIcon
                              id="rep_endereco_cep"
                              icon={MapPin}
                              value={formData.representante_legal?.endereco?.cep || ''}
                              onChange={(e) => handleRepresentanteEnderecoChange('cep', e.target.value)}
                              placeholder="00000-000"
                              className="max-w-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>
                )}

                {/* Aba 4: Dados Bancários */}
                <TabsContent value="bancarios" className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <motion.div 
                        className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-red-500"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <CreditCard className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">Dados Bancários</h2>
                        <p className="text-muted-foreground">Forma de recebimento e dados bancários</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo_recebimento">Forma de Recebimento</Label>
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
                              <Label htmlFor="conta_bancaria">Banco</Label>
                              <InputWithIcon
                                id="conta_bancaria"
                                icon={Building}
                                value={formData.conta_bancaria}
                                onChange={(e) => handleInputChange('conta_bancaria', e.target.value)}
                                placeholder="Ex: Banco do Brasil"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="tipo_conta">Tipo de Conta</Label>
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

                    {/* Cônjuge - se aplicável */}
                    {formData.tipo_pessoa === 'PF' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Possui cônjuge?</Label>
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
                                <Label htmlFor="nome_conjuge">Nome do Cônjuge</Label>
                                <InputWithIcon
                                  id="nome_conjuge"
                                  icon={User}
                                  value={formData.nome_conjuge || ''}
                                  onChange={(e) => handleInputChange('nome_conjuge', e.target.value)}
                                  placeholder="Nome completo"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="cpf_conjuge">CPF do Cônjuge</Label>
                                <InputWithIcon
                                  id="cpf_conjuge"
                                  icon={CreditCard}
                                  value={formData.cpf_conjuge || ''}
                                  onChange={(e) => handleInputChange('cpf_conjuge', e.target.value)}
                                  placeholder="000.000.000-00"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="rg_conjuge">RG do Cônjuge</Label>
                                <InputWithIcon
                                  id="rg_conjuge"
                                  icon={IdCard}
                                  value={formData.rg_conjuge || ''}
                                  onChange={(e) => handleInputChange('rg_conjuge', e.target.value)}
                                  placeholder="00.000.000-0"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="telefone_conjuge">Telefone do Cônjuge</Label>
                                <InputWithIcon
                                  id="telefone_conjuge"
                                  icon={Phone}
                                  value={formData.telefone_conjuge || ''}
                                  onChange={(e) => handleInputChange('telefone_conjuge', e.target.value)}
                                  placeholder="(11) 99999-9999"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="regime_bens">Regime de Bens</Label>
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
                                <Label htmlFor="endereco_conjuge">Endereço do Cônjuge</Label>
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
                    )}
                  </motion.div>
                </TabsContent>
              </Tabs>

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