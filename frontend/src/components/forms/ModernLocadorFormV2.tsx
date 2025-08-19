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
  Users,
  Briefcase,
  Globe,
  UserCheck,
  Building2,
  Upload,
  AlertCircle,
  Loader2,
  CheckCircle,
  MessageSquare,
  CheckSquare,
  MapPin,
  Home,
  Trash2,
  Plus
} from 'lucide-react';
import type { Locador, Endereco, DadosBancarios, RepresentanteLegal, DocumentosEmpresa } from '../../types';
import { apiService } from '../../services/api';
import { EnderecoForm } from './EnderecoForm';
import { DadosBancariosForm } from './DadosBancariosForm';
import { MultipleBankAccountsForm } from './MultipleBankAccountsForm';

const estadosCivis = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'];
const tiposGarantia = ['Nenhuma', 'Fiador', 'Caução', 'Seguro Fiança', 'Título de Capitalização'];
const tiposLocador = ['Proprietário', 'Administrador', 'Procurador', 'Outro'];
const regimesBens = ['Comunhão Total de Bens', 'Comunhão Parcial de Bens', 'Separação Total de Bens', 'Outros'];
const formasRecebimento = ['PIX', 'TED', 'Boleto', 'Transferência'];

export const ModernLocadorFormV2: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showConjuge, setShowConjuge] = useState<boolean>(false);
  const [showRepresentante, setShowRepresentante] = useState<boolean>(false);
  
  // Estados para múltiplos contatos
  const [telefones, setTelefones] = useState<string[]>(['']);
  const [emails, setEmails] = useState<string[]>(['']);
  
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

  const [contasBancarias, setContasBancarias] = useState<DadosBancarios[]>([]);

  const [representanteLegal, setRepresentanteLegal] = useState<RepresentanteLegal>({
    nome: '',
    cpf: '',
    rg: '',
    telefone: '',
    email: '',
    data_nascimento: '',
    nacionalidade: 'Brasileira',
    estado_civil: 'Solteiro',
    profissao: ''
  });

  const [documentosEmpresa, setDocumentosEmpresa] = useState<DocumentosEmpresa>({
    contrato_social: '',
    cartao_cnpj: '',
    comprovante_renda: '',
    comprovante_endereco: '',
    inscricao_estadual: '',
    inscricao_municipal: ''
  });
  
  const [formData, setFormData] = useState<Locador>({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    endereco: endereco,
    dados_bancarios: dadosBancarios,
    tipo_pessoa: 'PF',
    representante_legal: representanteLegal,
    documentos_empresa: documentosEmpresa,
    deseja_fci: 'Não',
    deseja_seguro_fianca: 'Não',
    deseja_seguro_incendio: 'Não',
    rg: '',
    dados_empresa: '',
    representante: '',
    nacionalidade: 'Brasileira',
    estado_civil: 'Solteiro',
    profissao: '',
    existe_conjuge: null,
    nome_conjuge: '',
    cpf_conjuge: '',
    rg_conjuge: '',
    endereco_conjuge: '',
    telefone_conjuge: '',
    tipo_cliente: 'Proprietário',
    data_nascimento: '',
    regime_bens: '',
    observacoes: '',
    tipo_garantia: 'Nenhuma',
    documento_pessoal: null,
    comprovante_endereco: null,
    forma_recebimento: [],
    email_recebimento: '',
    observacoes_especiais: ''
  });

  const handleFormaRecebimentoChange = (forma: string, checked: boolean) => {
    const novasFormas = checked
      ? [...(formData.forma_recebimento || []), forma]
      : (formData.forma_recebimento || []).filter(f => f !== forma);
    
    handleInputChange('forma_recebimento', novasFormas);
  };

  const handleInputChange = (field: keyof Locador, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatarCPFCNPJ = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  // Funções para gerenciar telefones múltiplos
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
    handleInputChange('telefones', newTelefones);
  };

  // Funções para gerenciar emails múltiplos
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
    handleInputChange('emails', newEmails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Preparar dados para envio
      const dadosParaEnvio = {
        ...formData,
        endereco: endereco,
        dados_bancarios: dadosBancarios,
        contas_bancarias: contasBancarias, // Múltiplas contas bancárias
        representante_legal: showRepresentante ? representanteLegal : undefined,
        documentos_empresa: showRepresentante ? documentosEmpresa : undefined,
        existe_conjuge: showConjuge ? 1 : 0
      };

      const response = await apiService.criarLocador(dadosParaEnvio);
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Locador cadastrado com sucesso!' });
        
        // Reset form após sucesso (implementar conforme necessário)
        
        setShowConjuge(false);
        setShowRepresentante(false);
        
      } else {
        setMessage({ type: 'error', text: 'Erro ao cadastrar locador' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao cadastrar locador';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const isPJ = formData.tipo_pessoa === 'PJ';

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
              <h1 className="text-2xl font-bold text-primary-foreground">Cadastro de Locador</h1>
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
                <TabsTrigger value="dados-basicos">Dados Básicos</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
                <TabsTrigger value="observacoes">Observações</TabsTrigger>
                <TabsTrigger value="configuracoes">Dados Bancários</TabsTrigger>
              </TabsList>

              {/* Aba 1: Dados Básicos - EXATAMENTE IGUAL AO LOCATÁRIO */}
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
                        Informações principais do locador
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Seção Classificação - SEPARADA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="card-glass p-6 rounded-xl border border-border shadow-sm"
                >
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div 
                        className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-md"
                        whileHover={{ scale: 1.05 }}
                      >
                        <User className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Classificação do Locador
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

                    <div>
                      <Label className="text-sm font-medium text-foreground">Tipo de Cliente *</Label>
                      <Select 
                        value={formData.tipo_cliente} 
                        onValueChange={(value) => handleInputChange('tipo_cliente', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposLocador.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Classificação do perfil do locador
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
                          <Select 
                            value={formData.existe_conjuge ? 'Sim' : 'Não'} 
                            onValueChange={(value) => {
                              const hasConjuge = value === 'Sim';
                              handleInputChange('existe_conjuge', hasConjuge ? 1 : 0);
                              setShowConjuge(hasConjuge);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Não">Não</SelectItem>
                              <SelectItem value="Sim">Sim</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Necessário para regime de bens
                          </p>
                        </div>
                      </>
                    )}

                    {/* Campos específicos para PJ - IGUAL AOS LOCATÁRIOS */}
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

                    <div>
                      <Label htmlFor="telefone" className="text-sm font-medium text-foreground">Telefone *</Label>
                      <InputWithIcon
                        id="telefone"
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                        placeholder="(41) 99999-9999"
                        icon={Phone}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">Email *</Label>
                      <InputWithIcon
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="locador@email.com"
                        icon={Mail}
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Formulário do Cônjuge - SEÇÃO SEPARADA - Só aparece para PF casado */}
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
                          className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Heart className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Dados do Cônjuge
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Informações do cônjuge do locador
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-foreground">Regime de Bens *</Label>
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
                      
                      <div>
                        <Label htmlFor="nome_conjuge" className="text-sm font-medium text-foreground">Nome do Cônjuge</Label>
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
                        <Label htmlFor="cpf_conjuge" className="text-sm font-medium text-foreground">CPF do Cônjuge</Label>
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

                      <div>
                        <Label htmlFor="rg_conjuge" className="text-sm font-medium text-foreground">RG do Cônjuge</Label>
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
                        <Label htmlFor="telefone_conjuge" className="text-sm font-medium text-foreground">Telefone</Label>
                        <InputWithIcon
                          id="telefone_conjuge"
                          type="tel"
                          value={formData.telefone_conjuge}
                          onChange={(e) => handleInputChange('telefone_conjuge', e.target.value)}
                          placeholder="(41) 99999-9999"
                          icon={Phone}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                  {/* Seção Representante Legal - SEPARADA - IGUAL AOS LOCATÁRIOS */}
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

                        {/* Endereço do Representante */}
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-primary" />
                            Endereço do Representante
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                              <Label htmlFor="rua_representante" className="text-sm font-medium text-foreground">Rua/Avenida</Label>
                              <InputWithIcon
                                id="rua_representante"
                                type="text"
                                value={formData.endereco_representante?.rua || ''}
                                onChange={(e) => handleInputChange('endereco_representante', { ...formData.endereco_representante, rua: e.target.value })}
                                placeholder="Rua das Flores"
                                icon={MapPin}
                              />
                            </div>

                            <div>
                              <Label htmlFor="numero_representante" className="text-sm font-medium text-foreground">Número</Label>
                              <InputWithIcon
                                id="numero_representante"
                                type="text"
                                value={formData.endereco_representante?.numero || ''}
                                onChange={(e) => handleInputChange('endereco_representante', { ...formData.endereco_representante, numero: e.target.value })}
                                placeholder="123"
                                icon={Home}
                              />
                            </div>

                            <div>
                              <Label htmlFor="complemento_representante" className="text-sm font-medium text-foreground">Complemento</Label>
                              <InputWithIcon
                                id="complemento_representante"
                                type="text"
                                value={formData.endereco_representante?.complemento || ''}
                                onChange={(e) => handleInputChange('endereco_representante', { ...formData.endereco_representante, complemento: e.target.value })}
                                placeholder="Apto 45"
                                icon={Building}
                              />
                            </div>

                            <div>
                              <Label htmlFor="bairro_representante" className="text-sm font-medium text-foreground">Bairro</Label>
                              <InputWithIcon
                                id="bairro_representante"
                                type="text"
                                value={formData.endereco_representante?.bairro || ''}
                                onChange={(e) => handleInputChange('endereco_representante', { ...formData.endereco_representante, bairro: e.target.value })}
                                placeholder="Centro"
                                icon={MapPin}
                              />
                            </div>

                            <div>
                              <Label htmlFor="cidade_representante" className="text-sm font-medium text-foreground">Cidade</Label>
                              <InputWithIcon
                                id="cidade_representante"
                                type="text"
                                value={formData.endereco_representante?.cidade || ''}
                                onChange={(e) => handleInputChange('endereco_representante', { ...formData.endereco_representante, cidade: e.target.value })}
                                placeholder="Curitiba"
                                icon={MapPin}
                              />
                            </div>

                            <div>
                              <Label htmlFor="estado_representante" className="text-sm font-medium text-foreground">Estado</Label>
                              <Select 
                                value={formData.endereco_representante?.estado || ''} 
                                onValueChange={(value) => handleInputChange('endereco_representante', { ...formData.endereco_representante, estado: value })}
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

                            <div>
                              <Label htmlFor="cep_representante" className="text-sm font-medium text-foreground">CEP</Label>
                              <InputWithIcon
                                id="cep_representante"
                                type="text"
                                value={formData.endereco_representante?.cep || ''}
                                onChange={(e) => handleInputChange('endereco_representante', { ...formData.endereco_representante, cep: e.target.value })}
                                placeholder="00000-000"
                                icon={MapPin}
                                maxLength={9}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Seção Informações de Contato - SEPARADA - IGUAL AOS LOCATÁRIOS */}
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
                                  placeholder="locador@email.com"
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

                {/* Seção de Endereço - igual ao locatário */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="card-glass p-6 rounded-xl border border-border shadow-sm"
                >
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div 
                        className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-md"
                        whileHover={{ scale: 1.05 }}
                      >
                        <MapPin className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Localização e Endereço
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Endereço completo do locador
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-foreground">CEP</Label>
                      <InputWithIcon
                        type="text"
                        value={endereco.cep}
                        onChange={(e) => setEndereco(prev => ({ ...prev, cep: e.target.value }))}
                        placeholder="00000-000"
                        icon={MapPin}
                        maxLength={9}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label className="text-sm font-medium text-foreground">Rua/Avenida</Label>
                      <InputWithIcon
                        type="text"
                        value={endereco.rua}
                        onChange={(e) => setEndereco(prev => ({ ...prev, rua: e.target.value }))}
                        placeholder="Rua das Flores"
                        icon={MapPin}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-foreground">Número</Label>
                      <InputWithIcon
                        type="text"
                        value={endereco.numero}
                        onChange={(e) => setEndereco(prev => ({ ...prev, numero: e.target.value }))}
                        placeholder="123"
                        icon={Home}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-foreground">Complemento</Label>
                      <InputWithIcon
                        type="text"
                        value={endereco.complemento}
                        onChange={(e) => setEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                        placeholder="Apto 45"
                        icon={Building}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-foreground">Bairro</Label>
                      <InputWithIcon
                        type="text"
                        value={endereco.bairro}
                        onChange={(e) => setEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                        placeholder="Centro"
                        icon={MapPin}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-foreground">Cidade</Label>
                      <InputWithIcon
                        type="text"
                        value={endereco.cidade}
                        onChange={(e) => setEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                        placeholder="Curitiba"
                        icon={MapPin}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-foreground">Estado</Label>
                      <Select value={endereco.estado} onValueChange={(value) => setEndereco(prev => ({ ...prev, estado: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
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
                  </div>
                </motion.div>
              </TabsContent>

              {/* Aba 2: Documentos - EXATAMENTE IGUAL AO LOCATÁRIO */}
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
                          Documentos do Locador
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Faça upload dos documentos do locador. Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
                        </p>
                      </div>
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
                        Estes documentos são necessários para o cadastro do locador.
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

              {/* Aba 3: Observações - EXATAMENTE IGUAL AO LOCATÁRIO */}
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
                        Informações adicionais sobre o locador
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
                        placeholder="Digite aqui informações adicionais sobre o locador, como características especiais, histórico, preferências ou qualquer detalhe importante para o cadastro..."
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
                            <li>• Histórico como proprietário</li>
                            <li>• Preferências ou condições especiais</li>
                            <li>• Informações sobre imóveis disponíveis</li>
                            <li>• Detalhes sobre contratos anteriores</li>
                            <li>• Condições ou acordos especiais</li>
                            <li>• Anotações sobre documentação pendente</li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Aba 4: Dados Bancários */}
              <TabsContent value="configuracoes" className="space-y-8">
                {/* Múltiplas Contas Bancárias */}
                <div className="space-y-4">
                  <MultipleBankAccountsForm 
                    contas={contasBancarias}
                    onChange={setContasBancarias}
                  />
                </div>
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
                      <User className="w-5 h-5" />
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