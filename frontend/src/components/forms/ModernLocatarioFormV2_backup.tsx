import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { FileUpload } from '../ui/file-upload';
import { 
  User, 
  CreditCard, 
  Phone, 
  Mail, 
  Building, 
  Calendar,
  Shield,
  Heart,
  FileText,
  Briefcase,
  Globe,
  UserCheck,
  Building2,
  Home,
  DollarSign,
  AlertCircle,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
  Users,
  MapPin
} from 'lucide-react';
import type { Locatario, Endereco, DadosBancarios, Fiador, Morador } from '../../types';
import { apiService } from '../../services/api';
import { EnderecoForm } from './EnderecoForm';
import { DadosBancariosForm } from './DadosBancariosForm';

export const ModernLocatarioFormV2: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Estados para múltiplos contatos
  const [telefones, setTelefones] = useState<string[]>(['']);
  const [emails, setEmails] = useState<string[]>(['']);
  
  // Estados para dados bancários e cônjuge
  const [showConjuge, setShowConjuge] = useState<boolean>(false);
  const [showRepresentante, setShowRepresentante] = useState<boolean>(false);
  const [showMoradores, setShowMoradores] = useState<boolean>(false);
  const [showFiador, setShowFiador] = useState<boolean>(false);
  
  // Estados para os dados estruturados
  const [endereco, setEndereco] = useState<Endereco>({
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'PR',
    cep: ''
  });

  const [dadosBancarios, setDadosBancarios] = useState<DadosBancarios>({
    tipo_recebimento: 'PIX',
    chave_pix: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: 'Corrente',
    titular: '',
    cpf_titular: ''
  });


  const [fiador, setFiador] = useState<Fiador>({
    nome: '',
    cpf_cnpj: '',
    rg: '',
    telefone: '',
    email: '',
    tipo_pessoa: 'PF',
    renda_mensal: 0,
    profissao: '',
    observacoes: ''
  });

  const [moradores, setMoradores] = useState<Morador[]>([]);
  
  const [formData, setFormData] = useState<Locatario>({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    telefones: telefones,
    emails: emails,
    endereco: endereco,
    dados_bancarios: dadosBancarios,
    tipo_pessoa: 'PF',
    tem_fiador: false,
    fiador: fiador,
    responsavel_pgto_agua: 'Locatario',
    responsavel_pgto_luz: 'Locatario',
    responsavel_pgto_gas: 'Locatario',
    rg: '',
    dados_empresa: '',
    representante: '',
    nacionalidade: 'Brasileira',
    estado_civil: 'Solteiro(a)',
    profissao: '',
    dados_moradores: '',
    tem_moradores: false,
    moradores: moradores,
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
    telefone_conjuge: '',
    regime_bens: '',
    existe_conjuge: null,
    documento_pessoal: null,
    comprovante_endereco: null,
    forma_envio_boleto: [],
    email_boleto: '',
    whatsapp_boleto: '',
    observacoes: ''
  });

  const estadosCivis = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'];
  const responsavesPagamento = ['Locatario', 'Proprietário', 'Condomínio'];
  const portesAnimais = ['Pequeno (até 10kg)', 'Médio (10-25kg)', 'Grande (25-45kg)', 'Gigante (45kg+)'];
  const regimesBens = ['Comunhão Total de Bens', 'Comunhão Parcial de Bens', 'Separação Total de Bens', 'Outros'];

  const handleInputChange = (field: keyof Locatario, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funções para gerenciar múltiplos telefones
  const addTelefone = () => {
    setTelefones([...telefones, '']);
  };

  const removeTelefone = (index: number) => {
    if (telefones.length > 1) {
      setTelefones(telefones.filter((_, i) => i !== index));
    }
  };

  const updateTelefone = (index: number, value: string) => {
    const newTelefones = [...telefones];
    newTelefones[index] = value;
    setTelefones(newTelefones);
    setFormData(prev => ({ ...prev, telefones: newTelefones, telefone: newTelefones[0] || '' }));
  };

  // Funções para gerenciar múltiplos emails
  const addEmail = () => {
    setEmails([...emails, '']);
  };

  const removeEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
    setFormData(prev => ({ ...prev, emails: newEmails, email: newEmails[0] || '' }));
  };
  
  // Função para gerenciar cônjuge
  const handleConjugeChange = (value: string) => {
    const hasConjuge = value === 'Sim';
    setShowConjuge(hasConjuge);
    setFormData(prev => ({
      ...prev,
      existe_conjuge: hasConjuge ? 1 : 0
    }));
  };


  const adicionarMorador = () => {
    const novoMorador: Morador = {
      nome: '',
      cpf: '',
      rg: '',
      data_nascimento: '',
      parentesco: '',
      profissao: '',
      telefone: '',
      email: ''
    };
    setMoradores([...moradores, novoMorador]);
  };

  const removerMorador = (index: number) => {
    setMoradores(moradores.filter((_, i) => i !== index));
  };

  const atualizarMorador = (index: number, campo: keyof Morador, valor: string) => {
    const novosmoradores = [...moradores];
    novosmoradores[index] = { ...novosmoradores[index], [campo]: valor };
    setMoradores(novosmoradores);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validações
    const phoneErrors = telefones.filter(phone => phone && !validatePhoneFormat(phone));
    const emailErrors = emails.filter(email => email && !validateEmailFormat(email));
    
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
      const dadosParaEnvio = {
        ...formData,
        telefones: telefones.filter(t => t.trim()),
        emails: emails.filter(e => e.trim()),
        endereco: endereco,
        dados_bancarios: dadosBancarios,
        fiador: showFiador ? fiador : undefined,
        moradores: showMoradores ? moradores : [],
        tem_moradores: showMoradores,
        tem_fiador: showFiador,
        existe_conjuge: showConjuge ? 1 : 0
      };

      const response = await apiService.criarLocatario(dadosParaEnvio);
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Locatario cadastrado com sucesso!' });
        // Reset form após sucesso
        // ... (código de reset similar ao cliente)
      } else {
        setMessage({ type: 'error', text: 'Erro ao cadastrar inquilino' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao cadastrar inquilino';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const formatarCPFCNPJ = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  // Funções para validação
  const validatePhoneFormat = (phone: string): boolean => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone) || phone === '';
  };

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || email === '';
  };

  const isPJ = formData.tipo_pessoa === 'PJ';
  const temPets = formData.pet_inquilino === 1;

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
                <Home className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">Cadastro de Locatário</h1>
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

            <form onSubmit={handleSubmit} className="space-y-8">
              <Tabs defaultValue="dados-basicos" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dados-basicos" hasData={!!(formData.nome || formData.cpf_cnpj || telefones.some(t => t) || emails.some(e => e) || endereco.rua || endereco.cidade)}>
                    <User className="w-4 h-4 mr-2" />
                    Dados Básicos
                  </TabsTrigger>
                  <TabsTrigger value="documentos" hasData={false}>
                    <FileText className="w-4 h-4 mr-2" />
                    Documentos
                  </TabsTrigger>
                  <TabsTrigger value="cobranca" hasData={false}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cobrança
                  </TabsTrigger>
                  <TabsTrigger value="observacoes" hasData={!!formData.observacoes}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Observações
                  </TabsTrigger>
                </TabsList>

                {/* Aba 1: Dados Básicos */}
                <TabsContent value="dados-basicos" className="space-y-8">
                  {/* Header da Seção */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <motion.div 
                        className="p-3 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <User className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          Dados Básicos
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Informações principais do locatário
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Seção Tipo de Pessoa e Cliente */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Building className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Classificação do Locatário
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Defina o tipo de pessoa e perfil do cliente
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-foreground">Tipo de Pessoa *</Label>
                        <Select 
                          value={formData.tipo_pessoa} 
                          onValueChange={(value: 'PF' | 'PJ') => {
                            handleInputChange('tipo_pessoa', value);
                            setShowRepresentante(value === 'PJ');
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PF">Pessoa Física</SelectItem>
                            <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Define os campos específicos do formulário
                        </p>
                      </div>

                    </div>
                  </motion.div>

                  {/* Seção Dados Pessoais/Empresariais */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          {formData.tipo_pessoa === 'PJ' ? <Building className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {formData.tipo_pessoa === 'PJ' ? 'Dados da Empresa' : 'Dados Pessoais'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formData.tipo_pessoa === 'PJ' 
                              ? 'Informações da pessoa jurídica' 
                              : 'Informações da pessoa física'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                      <div>
                        <Label htmlFor="nome" className="text-sm font-medium text-foreground">
                          {formData.tipo_pessoa === 'PJ' ? 'Razão Social' : 'Nome Completo'} *
                        </Label>
                        <InputWithIcon
                          id="nome"
                          type="text"
                          value={formData.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          placeholder={formData.tipo_pessoa === 'PJ' ? 'Nome da empresa' : 'João Silva'}
                          icon={formData.tipo_pessoa === 'PJ' ? Building : User}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="cpf_cnpj" className="text-sm font-medium text-foreground">
                          {formData.tipo_pessoa === 'PJ' ? 'CNPJ' : 'CPF'} *
                        </Label>
                        <InputWithIcon
                          id="cpf_cnpj"
                          type="text"
                          value={formData.cpf_cnpj}
                          onChange={(e) => handleInputChange('cpf_cnpj', formatarCPFCNPJ(e.target.value))}
                          placeholder={formData.tipo_pessoa === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                          icon={CreditCard}
                          required
                        />
                      </div>
                      
                      {/* Campos específicos para PF */}
                      {!isPJ && (
                        <>
                          <div>
                            <Label htmlFor="rg" className="text-sm font-medium text-foreground">RG</Label>
                            <InputWithIcon
                              id="rg"
                              type="text"
                              value={formData.rg}
                              onChange={(e) => handleInputChange('rg', e.target.value)}
                              placeholder="12.345.678-9"
                              icon={CreditCard}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-foreground">Estado Civil</Label>
                            <Select 
                              value={formData.estado_civil} 
                              onValueChange={(value) => handleInputChange('estado_civil', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                                <SelectItem value="Casado">Casado(a)</SelectItem>
                                <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                                <SelectItem value="Viúvo">Viúvo(a)</SelectItem>
                                <SelectItem value="União Estável">União Estável</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="profissao" className="text-sm font-medium text-foreground">Profissão</Label>
                            <InputWithIcon
                              id="profissao"
                              type="text"
                              value={formData.profissao}
                              onChange={(e) => handleInputChange('profissao', e.target.value)}
                              placeholder="Ex: Engenheiro"
                              icon={UserCheck}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="nacionalidade" className="text-sm font-medium text-foreground">Nacionalidade</Label>
                            <InputWithIcon
                              id="nacionalidade"
                              type="text"
                              value={formData.nacionalidade}
                              onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                              placeholder="Brasileira"
                              icon={User}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-foreground">Possui cônjuge/companheiro(a)?</Label>
                            <Select onValueChange={handleConjugeChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Sim">Sim</SelectItem>
                                <SelectItem value="Não">Não</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              Necessário para regime de bens
                            </p>
                          </div>
                        </>
                      )}

                      {/* Campos específicos para PJ */}
                      {isPJ && (
                        <>
                          <div>
                            <Label htmlFor="nome_fantasia" className="text-sm font-medium text-foreground">Nome Fantasia</Label>
                            <InputWithIcon
                              id="nome_fantasia"
                              type="text"
                              value={formData.nome_fantasia || ''}
                              onChange={(e) => handleInputChange('nome_fantasia', e.target.value)}
                              placeholder="Nome fantasia da empresa"
                              icon={Building}
                            />
                          </div>

                          <div>
                            <Label htmlFor="inscricao_estadual" className="text-sm font-medium text-foreground">Inscrição Estadual</Label>
                            <InputWithIcon
                              id="inscricao_estadual"
                              type="text"
                              value={formData.inscricao_estadual || ''}
                              onChange={(e) => handleInputChange('inscricao_estadual', e.target.value)}
                              placeholder="000.000.000.000"
                              icon={FileText}
                            />
                          </div>

                          <div>
                            <Label htmlFor="inscricao_municipal" className="text-sm font-medium text-foreground">Inscrição Municipal</Label>
                            <InputWithIcon
                              id="inscricao_municipal"
                              type="text"
                              value={formData.inscricao_municipal || ''}
                              onChange={(e) => handleInputChange('inscricao_municipal', e.target.value)}
                              placeholder="000000000"
                              icon={FileText}
                            />
                          </div>

                          <div>
                            <Label htmlFor="atividade_principal" className="text-sm font-medium text-foreground">Atividade Principal</Label>
                            <InputWithIcon
                              id="atividade_principal"
                              type="text"
                              value={formData.atividade_principal || ''}
                              onChange={(e) => handleInputChange('atividade_principal', e.target.value)}
                              placeholder="Ex: Comércio varejista"
                              icon={Building}
                            />
                          </div>

                          <div>
                            <Label htmlFor="data_constituicao" className="text-sm font-medium text-foreground">Data de Constituição</Label>
                            <InputWithIcon
                              id="data_constituicao"
                              type="date"
                              value={formData.data_constituicao || ''}
                              onChange={(e) => handleInputChange('data_constituicao', e.target.value)}
                              icon={Heart}
                            />
                          </div>

                          <div>
                            <Label htmlFor="capital_social" className="text-sm font-medium text-foreground">Capital Social</Label>
                            <InputWithIcon
                              id="capital_social"
                              type="text"
                              value={formData.capital_social || ''}
                              onChange={(e) => handleInputChange('capital_social', e.target.value)}
                              placeholder="R$ 10.000,00"
                              icon={CreditCard}
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-foreground">Porte da Empresa</Label>
                            <Select 
                              value={formData.porte_empresa || ''} 
                              onValueChange={(value) => handleInputChange('porte_empresa', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o porte" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MEI">MEI</SelectItem>
                                <SelectItem value="Microempresa">Microempresa</SelectItem>
                                <SelectItem value="Empresa de Pequeno Porte">Empresa de Pequeno Porte</SelectItem>
                                <SelectItem value="Empresa de Médio Porte">Empresa de Médio Porte</SelectItem>
                                <SelectItem value="Grande Empresa">Grande Empresa</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-foreground">Regime Tributário</Label>
                            <Select 
                              value={formData.regime_tributario || ''} 
                              onValueChange={(value) => handleInputChange('regime_tributario', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o regime" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                                <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                                <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                                <SelectItem value="Lucro Arbitrado">Lucro Arbitrado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                    </div>
                  </motion.div>

                  {/* Formulário do Cônjuge - Posicionado após Dados Pessoais */}
                  {showConjuge && formData.tipo_pessoa === 'PF' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="card-glass p-6 rounded-xl border border-border shadow-sm"
                    >
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div 
                            className="p-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg shadow-md"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Heart className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Dados do Cônjuge
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Informações do cônjuge ou companheiro(a)
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="regime_bens" className="text-sm font-medium text-foreground">Regime de Bens *</Label>
                          <Select 
                            value={formData.regime_bens || ''} 
                            onValueChange={(value) => handleInputChange('regime_bens', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o regime de bens" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Comunhão Total de Bens">Comunhão Total de Bens</SelectItem>
                              <SelectItem value="Comunhão Parcial de Bens">Comunhão Parcial de Bens</SelectItem>
                              <SelectItem value="Separação Total de Bens">Separação Total de Bens</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Regime matrimonial de bens aplicável
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="nome_conjuge" className="text-sm font-medium text-foreground">Nome do Cônjuge</Label>
                            <InputWithIcon
                              id="nome_conjuge"
                              type="text"
                              value={formData.nome_conjuge || ''}
                              onChange={(e) => handleInputChange('nome_conjuge', e.target.value)}
                              placeholder="Maria Silva"
                              icon={User}
                            />
                          </div>

                          <div>
                            <Label htmlFor="cpf_conjuge" className="text-sm font-medium text-foreground">CPF do Cônjuge</Label>
                            <InputWithIcon
                              id="cpf_conjuge"
                              type="text"
                              value={formData.cpf_conjuge || ''}
                              onChange={(e) => handleInputChange('cpf_conjuge', formatarCPFCNPJ(e.target.value))}
                              placeholder="000.000.000-00"
                              icon={CreditCard}
                              maxLength={14}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="rg_conjuge" className="text-sm font-medium text-foreground">RG do Cônjuge</Label>
                            <InputWithIcon
                              id="rg_conjuge"
                              type="text"
                              value={formData.rg_conjuge || ''}
                              onChange={(e) => handleInputChange('rg_conjuge', e.target.value)}
                              placeholder="00.000.000-0"
                              icon={CreditCard}
                            />
                          </div>

                          <div>
                            <Label htmlFor="telefone_conjuge" className="text-sm font-medium text-foreground">Telefone do Cônjuge</Label>
                            <InputWithIcon
                              id="telefone_conjuge"
                              type="tel"
                              value={formData.telefone_conjuge || ''}
                              onChange={(e) => handleInputChange('telefone_conjuge', e.target.value)}
                              placeholder="(41) 99999-9999"
                              icon={Phone}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Formulário do Representante Legal - Sempre obrigatório para PJ */}
                  {formData.tipo_pessoa === 'PJ' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className="card-glass p-6 rounded-xl border border-border shadow-sm"
                    >
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div 
                            className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-md"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Users className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Dados do Representante Legal
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Informações do responsável pela empresa
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="nome_representante" className="text-sm font-medium text-foreground">Nome Completo</Label>
                            <InputWithIcon
                              id="nome_representante"
                              type="text"
                              value={formData.nome_representante || ''}
                              onChange={(e) => handleInputChange('nome_representante', e.target.value)}
                              placeholder="João Silva"
                              icon={User}
                            />
                          </div>

                          <div>
                            <Label htmlFor="cpf_representante" className="text-sm font-medium text-foreground">CPF</Label>
                            <InputWithIcon
                              id="cpf_representante"
                              type="text"
                              value={formData.cpf_representante || ''}
                              onChange={(e) => handleInputChange('cpf_representante', formatarCPFCNPJ(e.target.value))}
                              placeholder="000.000.000-00"
                              icon={CreditCard}
                              maxLength={14}
                            />
                          </div>

                          <div>
                            <Label htmlFor="rg_representante" className="text-sm font-medium text-foreground">RG</Label>
                            <InputWithIcon
                              id="rg_representante"
                              type="text"
                              value={formData.rg_representante || ''}
                              onChange={(e) => handleInputChange('rg_representante', e.target.value)}
                              placeholder="00.000.000-0"
                              icon={CreditCard}
                            />
                          </div>

                          <div>
                            <Label htmlFor="cargo_representante" className="text-sm font-medium text-foreground">Cargo/Função</Label>
                            <InputWithIcon
                              id="cargo_representante"
                              type="text"
                              value={formData.cargo_representante || ''}
                              onChange={(e) => handleInputChange('cargo_representante', e.target.value)}
                              placeholder="Ex: Diretor, Sócio"
                              icon={UserCheck}
                            />
                          </div>

                          <div>
                            <Label htmlFor="telefone_representante" className="text-sm font-medium text-foreground">Telefone</Label>
                            <InputWithIcon
                              id="telefone_representante"
                              type="tel"
                              value={formData.telefone_representante || ''}
                              onChange={(e) => handleInputChange('telefone_representante', e.target.value)}
                              placeholder="(41) 99999-9999"
                              icon={Phone}
                            />
                          </div>

                          <div>
                            <Label htmlFor="email_representante" className="text-sm font-medium text-foreground">E-mail</Label>
                            <InputWithIcon
                              id="email_representante"
                              type="email"
                              value={formData.email_representante || ''}
                              onChange={(e) => handleInputChange('email_representante', e.target.value)}
                              placeholder="representante@empresa.com"
                              icon={Mail}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Seção Informações de Contato */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Phone className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Informações de Contato
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Telefones e e-mails para contato
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Telefones */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-primary" />
                          Telefones
                        </h4>
                        <div className="space-y-3">
                          {telefones.map((telefone, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="flex-1">
                                <InputWithIcon
                                  type="tel"
                                  value={telefone}
                                  onChange={(e) => updateTelefone(index, e.target.value)}
                                  placeholder="(41) 99999-9999"
                                  icon={Phone}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeTelefone(index)}
                                disabled={telefones.length === 1}
                                className="px-3 hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTelefone}
                            className="w-full border-dashed hover:border-primary hover:text-primary"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Telefone
                          </Button>
                        </div>
                      </div>
                      
                      {/* E-mails */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-primary" />
                          E-mails
                        </h4>
                        <div className="space-y-3">
                          {emails.map((email, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="flex-1">
                                <InputWithIcon
                                  type="email"
                                  value={email}
                                  onChange={(e) => updateEmail(index, e.target.value)}
                                  placeholder="locatario@email.com"
                                  icon={Mail}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeEmail(index)}
                                disabled={emails.length === 1}
                                className="px-3 hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addEmail}
                            className="w-full border-dashed hover:border-primary hover:text-primary"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar E-mail
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Seção de Endereço integrada */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <MapPin className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Endereço
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Endereço completo do locatário
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <Label htmlFor="rua" className="text-sm font-medium text-foreground">Rua/Avenida</Label>
                        <InputWithIcon
                          id="rua"
                          type="text"
                          value={endereco.rua}
                          onChange={(e) => setEndereco(prev => ({ ...prev, rua: e.target.value }))}
                          placeholder="Rua das Flores"
                          icon={MapPin}
                        />
                      </div>

                      <div>
                        <Label htmlFor="numero" className="text-sm font-medium text-foreground">Número</Label>
                        <InputWithIcon
                          id="numero"
                          type="text"
                          value={endereco.numero}
                          onChange={(e) => setEndereco(prev => ({ ...prev, numero: e.target.value }))}
                          placeholder="123"
                          icon={Home}
                        />
                      </div>

                      <div>
                        <Label htmlFor="complemento" className="text-sm font-medium text-foreground">Complemento</Label>
                        <InputWithIcon
                          id="complemento"
                          type="text"
                          value={endereco.complemento}
                          onChange={(e) => setEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                          placeholder="Apto 45"
                          icon={Building}
                        />
                      </div>

                      <div>
                        <Label htmlFor="bairro" className="text-sm font-medium text-foreground">Bairro</Label>
                        <InputWithIcon
                          id="bairro"
                          type="text"
                          value={endereco.bairro}
                          onChange={(e) => setEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                          placeholder="Centro"
                          icon={MapPin}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cidade" className="text-sm font-medium text-foreground">Cidade</Label>
                        <InputWithIcon
                          id="cidade"
                          type="text"
                          value={endereco.cidade}
                          onChange={(e) => setEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                          placeholder="Curitiba"
                          icon={Building2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="estado" className="text-sm font-medium text-foreground">Estado</Label>
                        <Select 
                          value={endereco.estado} 
                          onValueChange={(value) => setEndereco(prev => ({ ...prev, estado: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AC">Acre</SelectItem>
                            <SelectItem value="AL">Alagoas</SelectItem>
                            <SelectItem value="AP">Amapá</SelectItem>
                            <SelectItem value="AM">Amazonas</SelectItem>
                            <SelectItem value="BA">Bahia</SelectItem>
                            <SelectItem value="CE">Ceará</SelectItem>
                            <SelectItem value="DF">Distrito Federal</SelectItem>
                            <SelectItem value="ES">Espírito Santo</SelectItem>
                            <SelectItem value="GO">Goiás</SelectItem>
                            <SelectItem value="MA">Maranhão</SelectItem>
                            <SelectItem value="MT">Mato Grosso</SelectItem>
                            <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                            <SelectItem value="MG">Minas Gerais</SelectItem>
                            <SelectItem value="PA">Pará</SelectItem>
                            <SelectItem value="PB">Paraíba</SelectItem>
                            <SelectItem value="PR">Paraná</SelectItem>
                            <SelectItem value="PE">Pernambuco</SelectItem>
                            <SelectItem value="PI">Piauí</SelectItem>
                            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                            <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                            <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                            <SelectItem value="RO">Rondônia</SelectItem>
                            <SelectItem value="RR">Roraima</SelectItem>
                            <SelectItem value="SC">Santa Catarina</SelectItem>
                            <SelectItem value="SP">São Paulo</SelectItem>
                            <SelectItem value="SE">Sergipe</SelectItem>
                            <SelectItem value="TO">Tocantins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cep" className="text-sm font-medium text-foreground">CEP</Label>
                        <InputWithIcon
                          id="cep"
                          type="text"
                          value={endereco.cep}
                          onChange={(e) => setEndereco(prev => ({ ...prev, cep: e.target.value }))}
                          placeholder="00000-000"
                          icon={MapPin}
                          maxLength={9}
                        />
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Aba 2: Documentos */}
                <TabsContent value="documentos" className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="tem_conjuge" 
                          checked={showConjuge}
                          onCheckedChange={(checked) => {
                            setShowConjuge(!!checked);
                            handleInputChange('existe_conjuge', checked ? 1 : 0);
                          }}
                        />
                        <Label htmlFor="tem_conjuge" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Possui cônjuge/companheiro(a)
                        </Label>
                      </div>

                      {showConjuge && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4 border-l-4 border-pink-200 pl-4"
                        >
                          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-500" />
                            Dados do Cônjuge
                          </h3>
                          
                          <div>
                            <Label htmlFor="regime_bens">Regime de Bens *</Label>
                            <Select 
                              value={formData.regime_bens || ''} 
                              onValueChange={(value) => handleInputChange('regime_bens', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o regime de bens" />
                              </SelectTrigger>
                              <SelectContent>
                                {regimesBens.map(regime => (
                                  <SelectItem key={regime} value={regime}>{regime}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="nome_conjuge">Nome do Cônjuge</Label>
                              <InputWithIcon
                                id="nome_conjuge"
                                type="text"
                                value={formData.nome_conjuge}
                                onChange={(e) => handleInputChange('nome_conjuge', e.target.value)}
                                placeholder="Maria Silva"
                                icon={User}
                              />
                            </div>

                            <div>
                              <Label htmlFor="cpf_conjuge">CPF do Cônjuge</Label>
                              <InputWithIcon
                                id="cpf_conjuge"
                                type="text"
                                value={formData.cpf_conjuge}
                                onChange={(e) => handleInputChange('cpf_conjuge', formatarCPFCNPJ(e.target.value))}
                                placeholder="000.000.000-00"
                                icon={CreditCard}
                                maxLength={14}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="rg_conjuge">RG do Cônjuge</Label>
                              <InputWithIcon
                                id="rg_conjuge"
                                type="text"
                                value={formData.rg_conjuge}
                                onChange={(e) => handleInputChange('rg_conjuge', e.target.value)}
                                placeholder="00.000.000-0"
                                icon={CreditCard}
                              />
                            </div>

                            <div>
                              <Label htmlFor="telefone_conjuge">Telefone</Label>
                              <InputWithIcon
                                id="telefone_conjuge"
                                type="tel"
                                value={formData.telefone_conjuge}
                                onChange={(e) => handleInputChange('telefone_conjuge', e.target.value)}
                                placeholder="(41) 99999-9999"
                                icon={Phone}
                              />
                            </div>

                            <div>
                              <Label htmlFor="endereco_conjuge">Endereço</Label>
                              <InputWithIcon
                                id="endereco_conjuge"
                                type="text"
                                value={formData.endereco_conjuge}
                                onChange={(e) => handleInputChange('endereco_conjuge', e.target.value)}
                                placeholder="Rua, Número, Bairro"
                                icon={Building2}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Fiador */}
                  {showFiador && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Shield className="w-5 h-5 text-secondary" />
                        Dados do Fiador
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fiador_nome">Nome do Fiador *</Label>
                          <InputWithIcon
                            id="fiador_nome"
                            type="text"
                            value={fiador.nome}
                            onChange={(e) => setFiador(prev => ({ ...prev, nome: e.target.value }))}
                            placeholder="João Silva"
                            icon={User}
                            required={showFiador}
                          />
                        </div>

                        <div>
                          <Label htmlFor="fiador_cpf">CPF do Fiador *</Label>
                          <InputWithIcon
                            id="fiador_cpf"
                            type="text"
                            value={fiador.cpf_cnpj}
                            onChange={(e) => setFiador(prev => ({ ...prev, cpf_cnpj: formatarCPFCNPJ(e.target.value) }))}
                            placeholder="000.000.000-00"
                            icon={CreditCard}
                            maxLength={14}
                            required={showFiador}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="fiador_telefone">Telefone</Label>
                          <InputWithIcon
                            id="fiador_telefone"
                            type="tel"
                            value={fiador.telefone || ''}
                            onChange={(e) => setFiador(prev => ({ ...prev, telefone: e.target.value }))}
                            placeholder="(41) 99999-9999"
                            icon={Phone}
                          />
                        </div>

                        <div>
                          <Label htmlFor="fiador_renda">Renda Mensal</Label>
                          <InputWithIcon
                            id="fiador_renda"
                            type="number"
                            value={fiador.renda_mensal?.toString() || ''}
                            onChange={(e) => setFiador(prev => ({ ...prev, renda_mensal: parseFloat(e.target.value) || 0 }))}
                            placeholder="5000.00"
                            icon={DollarSign}
                            step="0.01"
                          />
                        </div>

                        <div>
                          <Label htmlFor="fiador_profissao">Profissão</Label>
                          <InputWithIcon
                            id="fiador_profissao"
                            type="text"
                            value={fiador.profissao || ''}
                            onChange={(e) => setFiador(prev => ({ ...prev, profissao: e.target.value }))}
                            placeholder="Engenheiro"
                            icon={Briefcase}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Aba 2: Documentos */}
                <TabsContent value="documentos" className="space-y-8">
                  {/* Header da Seção */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Documentos do Locatário
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Faça upload dos documentos do locatário. Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
                      </p>
                    </div>
                  </motion.div>

                  {/* Documentos Obrigatórios */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Documentos Obrigatórios
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Estes documentos são necessários para o cadastro do locatário.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.tipo_pessoa === 'PF' ? (
                        <>
                          <FileUpload
                            label="CPF"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('CPF:', file)}
                            required
                          />
                          <FileUpload
                            label="RG"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('RG:', file)}
                            required
                          />
                          <FileUpload
                            label="Comprovante de Renda"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Renda:', file)}
                            required
                          />
                          <FileUpload
                            label="Comprovante de Estado Civil"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Estado Civil:', file)}
                          />
                        </>
                      ) : (
                        <>
                          <FileUpload
                            label="Contrato Social"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Contrato Social:', file)}
                            required
                          />
                          <FileUpload
                            label="CNPJ Atualizado"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('CNPJ:', file)}
                            required
                          />
                          <FileUpload
                            label="Cartão CNPJ"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Cartão CNPJ:', file)}
                            required
                          />
                          <FileUpload
                            label="Última Alteração Contratual"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Alteração:', file)}
                          />
                        </>
                      )}
                      
                      <FileUpload
                        label="Comprovante de Endereço"
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={5}
                        onFileSelect={(file) => console.log('Endereço:', file)}
                        required
                      />
                      
                      {formData.tipo_pessoa === 'PJ' && (
                        <FileUpload
                          label="RG do Representante Legal"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('RG Representante:', file)}
                          required
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Documentos Opcionais */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Documentos Opcionais
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Documentos complementares que podem ser úteis para o cadastro.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.tipo_pessoa === 'PF' ? (
                        <>
                          <FileUpload
                            label="Certidão de Casamento"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Casamento:', file)}
                          />
                          <FileUpload
                            label="Comprovante de Bens"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Bens:', file)}
                          />
                          <FileUpload
                            label="Declaração de Imposto de Renda"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('IR:', file)}
                          />
                          <FileUpload
                            label="RG do Cônjuge"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('RG Cônjuge:', file)}
                          />
                        </>
                      ) : (
                        <>
                          <FileUpload
                            label="Balanço Patrimonial"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Balanço:', file)}
                          />
                          <FileUpload
                            label="Demonstração de Resultado"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('DRE:', file)}
                          />
                          <FileUpload
                            label="Certidão Negativa de Débitos"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Certidão:', file)}
                          />
                          <FileUpload
                            label="Procuração (se aplicável)"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Procuração:', file)}
                          />
                        </>
                      )}
                      
                      <FileUpload
                        label="Outros Documentos"
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={5}
                        onFileSelect={(file) => console.log('Outros:', file)}
                      />
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Aba 3: Observações */}
                <TabsContent value="observacoes" className="space-y-8">
                  {/* Header da Seção */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <motion.div 
                        className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <MessageSquare className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          Observações
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Informações adicionais sobre o locatário
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Seção de Observações Gerais */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <MessageSquare className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Observações Gerais
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Adicione informações complementares relevantes
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="observacoes" className="text-sm font-medium text-foreground">Observações</Label>
                        <Textarea
                          id="observacoes"
                          value={formData.observacoes}
                          onChange={(e) => handleInputChange('observacoes', e.target.value)}
                          placeholder="Digite aqui informações adicionais sobre o locatário, como características especiais, histórico, preferências ou qualquer detalhe importante para o cadastro..."
                          rows={8}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Utilize este espaço para registrar informações que não se encaixam nos outros campos
                        </p>
                      </div>

                      {/* Informações sobre o campo */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                              Sugestões para observações:
                            </h4>
                            <ul className="space-y-1 text-xs">
                              <li>• Histórico de locações anteriores</li>
                              <li>• Preferências ou restrições específicas</li>
                              <li>• Informações sobre pets ou animais</li>
                              <li>• Detalhes sobre moradores adicionais</li>
                              <li>• Condições ou acordos especiais</li>
                              <li>• Anotações sobre documentação pendente</li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>

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
                  className="w-full btn-gradient py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Cadastrando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Home className="w-5 h-5" />
                      <span>Cadastrar Locatário</span>
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