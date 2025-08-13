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
  CheckSquare
} from 'lucide-react';
import type { Locador, Endereco, DadosBancarios, RepresentanteLegal, DocumentosEmpresa } from '../../types';
import { apiService } from '../../services/api';
import { EnderecoForm } from './EnderecoForm';
import { DadosBancariosForm } from './DadosBancariosForm';

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

  const [representanteLegal, setRepresentanteLegal] = useState<RepresentanteLegal>({
    nome: '',
    cpf: '',
    rg: '',
    telefone: '',
    email: '',
    data_nascimento: '',
    nacionalidade: 'Brasileira',
    estado_civil: 'Solteiro(a)',
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
    estado_civil: 'Solteiro(a)',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Preparar dados para envio (manter compatibilidade com API atual)
      const dadosParaEnvio = {
        ...formData,
        endereco: endereco,
        dados_bancarios: dadosBancarios,
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
                <TabsTrigger value="empresa" className={!isPJ ? 'opacity-50 cursor-not-allowed' : ''}>
                  Empresa
                </TabsTrigger>
                <TabsTrigger value="configuracoes">Dados Bancários</TabsTrigger>
              </TabsList>

              {/* Aba 1: Dados Básicos */}
              <TabsContent value="dados-basicos" className="space-y-8">
                {/* Tipo de Pessoa */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Tipo de Locador
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Pessoa *</Label>
                      <Select value={formData.tipo_pessoa} onValueChange={(value: 'PF' | 'PJ') => {
                        handleInputChange('tipo_pessoa', value);
                        setShowRepresentante(value === 'PJ');
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PF">Pessoa Física</SelectItem>
                          <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Tipo de Cliente</Label>
                      <Select value={formData.tipo_cliente} onValueChange={(value) => {
                        handleInputChange('tipo_cliente', value);
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposLocador.map(tipo => (
                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Dados Pessoais/Empresariais */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    {isPJ ? 'Dados da Empresa' : 'Dados Pessoais'}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">{isPJ ? 'Razão Social' : 'Nome Completo'} *</Label>
                      <InputWithIcon
                        id="nome"
                        type="text"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        placeholder={isPJ ? "Nome da empresa" : "João Silva"}
                        icon={isPJ ? Building : User}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cpf_cnpj">{isPJ ? 'CNPJ' : 'CPF'} *</Label>
                      <InputWithIcon
                        id="cpf_cnpj"
                        type="text"
                        value={formData.cpf_cnpj}
                        onChange={(e) => handleInputChange('cpf_cnpj', formatarCPFCNPJ(e.target.value))}
                        placeholder={isPJ ? "00.000.000/0000-00" : "000.000.000-00"}
                        icon={CreditCard}
                        maxLength={isPJ ? 18 : 14}
                        required
                      />
                    </div>
                  </div>

                  {!isPJ && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="rg">RG *</Label>
                        <InputWithIcon
                          id="rg"
                          type="text"
                          value={formData.rg}
                          onChange={(e) => handleInputChange('rg', e.target.value)}
                          placeholder="00.000.000-0"
                          icon={CreditCard}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="nacionalidade">Nacionalidade</Label>
                        <InputWithIcon
                          id="nacionalidade"
                          type="text"
                          value={formData.nacionalidade}
                          onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                          placeholder="Brasileira"
                          icon={Globe}
                        />
                      </div>

                      <div>
                        <Label htmlFor="estado_civil">Estado Civil</Label>
                        <Select value={formData.estado_civil} onValueChange={(value) => handleInputChange('estado_civil', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {estadosCivis.map(estado => (
                              <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="profissao">Profissão</Label>
                      <InputWithIcon
                        id="profissao"
                        type="text"
                        value={formData.profissao}
                        onChange={(e) => handleInputChange('profissao', e.target.value)}
                        placeholder="Engenheiro"
                        icon={Briefcase}
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefone">Telefone *</Label>
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
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
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

                {/* Endereço */}
                <EnderecoForm 
                  endereco={endereco}
                  onChange={setEndereco}
                  prefixo="Locador"
                />

                {/* Cônjuge */}
                {!isPJ && (
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
                        <h4 className="text-md font-medium text-foreground flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-500" />
                          Dados do Cônjuge
                        </h4>
                        
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
              </TabsContent>

              {/* Aba 2: Documentos */}
              <TabsContent value="documentos" className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Documentos do Locador
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça upload dos documentos necessários. Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUpload
                      label="Documento Pessoal (RG/CPF)"
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize={5}
                      onFileSelect={(file) => handleInputChange('documento_pessoal', file)}
                      currentFile={formData.documento_pessoal}
                      required
                    />

                    <FileUpload
                      label="Comprovante de Endereço"
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize={5}
                      onFileSelect={(file) => handleInputChange('comprovante_endereco', file)}
                      currentFile={formData.comprovante_endereco}
                      required
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Aba 3: Empresa (apenas para PJ) */}
              <TabsContent value="empresa" className="space-y-8">
                {isPJ ? (
                  <>
                    {/* Representante Legal */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Representante Legal *
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Obrigatório para Pessoa Jurídica
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="rep_nome">Nome do Representante *</Label>
                          <InputWithIcon
                            id="rep_nome"
                            type="text"
                            value={representanteLegal.nome}
                            onChange={(e) => setRepresentanteLegal(prev => ({ ...prev, nome: e.target.value }))}
                            placeholder="João Silva"
                            icon={User}
                            required={isPJ}
                          />
                        </div>

                        <div>
                          <Label htmlFor="rep_cpf">CPF do Representante *</Label>
                          <InputWithIcon
                            id="rep_cpf"
                            type="text"
                            value={representanteLegal.cpf}
                            onChange={(e) => setRepresentanteLegal(prev => ({ ...prev, cpf: formatarCPFCNPJ(e.target.value) }))}
                            placeholder="000.000.000-00"
                            icon={CreditCard}
                            maxLength={14}
                            required={isPJ}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="rep_rg">RG *</Label>
                          <InputWithIcon
                            id="rep_rg"
                            type="text"
                            value={representanteLegal.rg}
                            onChange={(e) => setRepresentanteLegal(prev => ({ ...prev, rg: e.target.value }))}
                            placeholder="00.000.000-0"
                            icon={CreditCard}
                            required={isPJ}
                          />
                        </div>

                        <div>
                          <Label htmlFor="rep_telefone">Telefone</Label>
                          <InputWithIcon
                            id="rep_telefone"
                            type="tel"
                            value={representanteLegal.telefone || ''}
                            onChange={(e) => setRepresentanteLegal(prev => ({ ...prev, telefone: e.target.value }))}
                            placeholder="(41) 99999-9999"
                            icon={Phone}
                          />
                        </div>

                        <div>
                          <Label htmlFor="rep_email">Email</Label>
                          <InputWithIcon
                            id="rep_email"
                            type="email"
                            value={representanteLegal.email || ''}
                            onChange={(e) => setRepresentanteLegal(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="representante@email.com"
                            icon={Mail}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Documentos da Empresa */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Documentos da Empresa
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Faça upload dos documentos da empresa. Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUpload
                          label="Contrato Social"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => setDocumentosEmpresa(prev => ({ ...prev, contrato_social: file?.name || '' }))}
                          required
                        />

                        <FileUpload
                          label="Cartão CNPJ"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => setDocumentosEmpresa(prev => ({ ...prev, cartao_cnpj: file?.name || '' }))}
                          required
                        />

                        <FileUpload
                          label="Comprovante de Renda"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => setDocumentosEmpresa(prev => ({ ...prev, comprovante_renda: file?.name || '' }))}
                        />

                        <FileUpload
                          label="Comprovante de Endereço da Empresa"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => setDocumentosEmpresa(prev => ({ ...prev, comprovante_endereco: file?.name || '' }))}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      Seção disponível apenas para Pessoa Jurídica
                    </h3>
                    <p className="text-muted-foreground">
                      Altere o tipo de pessoa para "Pessoa Jurídica" para acessar esta seção.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Aba 4: Dados Bancários */}
              <TabsContent value="configuracoes" className="space-y-8">
                {/* Forma de Recebimento */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    Dados Bancários
                  </h2>
                  
                  {/* Dados Bancários */}
                  <DadosBancariosForm 
                    dadosBancarios={dadosBancarios}
                    onChange={setDadosBancarios}
                  />
                </div>


                {/* Observações */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    Observações
                  </h2>
                  
                  <div>
                    <Label htmlFor="observacoes">Observações Gerais</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Informações adicionais sobre o locador..."
                      rows={4}
                    />
                  </div>
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