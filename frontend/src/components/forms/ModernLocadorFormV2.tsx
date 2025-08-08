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
  Loader2
} from 'lucide-react';
import type { Locador, Endereco, DadosBancarios, RepresentanteLegal, DocumentosEmpresa } from '../../types';
import { apiService } from '../../services/api';
import { EnderecoForm } from './EnderecoForm';
import { DadosBancariosForm } from './DadosBancariosForm';

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
    observacoes: ''
  });

  const estadosCivis = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'];
  const tiposLocador = ['Proprietário', 'Inquilino', 'Fiador', 'Procurador'];

  const handleInputChange = (field: keyof Locador, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        
        // Reset form após sucesso
        setFormData({
          nome: '',
          cpf_cnpj: '',
          telefone: '',
          email: '',
          endereco: {
            rua: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: 'PR',
            cep: ''
          } as Endereco,
          dados_bancarios: {
            tipo_recebimento: 'PIX',
            chave_pix: '',
            banco: '',
            agencia: '',
            conta: '',
            tipo_conta: 'Corrente',
            titular: '',
            cpf_titular: ''
          } as DadosBancarios,
          tipo_pessoa: 'PF',
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
          observacoes: ''
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

        setDadosBancarios({
          tipo_recebimento: 'PIX',
          chave_pix: '',
          banco: '',
          agencia: '',
          conta: '',
          tipo_conta: 'Corrente',
          titular: '',
          cpf_titular: ''
        });

        setShowConjuge(false);
        setShowRepresentante(false);
        
      } else {
        setMessage({ type: 'error', text: 'Erro ao cadastrar cliente' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao cadastrar cliente';
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

  const isPJ = formData.tipo_pessoa === 'PJ';

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
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Cadastro de Locador</h2>
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tipo de Pessoa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Tipo de Locador
              </h3>
              
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
                  <Label>Tipo de Locador</Label>
                  <Select value={formData.tipo_cliente} onValueChange={(value) => handleInputChange('tipo_cliente', value)}>
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
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                {isPJ ? 'Dados da Empresa' : 'Dados Pessoais'}
              </h3>
              
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
                    <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                    <InputWithIcon
                      id="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                      icon={Calendar}
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
                </div>
              )}

              {!isPJ && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              )}

              {isPJ && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                    <InputWithIcon
                      id="inscricao_estadual"
                      type="text"
                      value={documentosEmpresa.inscricao_estadual || ''}
                      onChange={(e) => setDocumentosEmpresa(prev => ({ ...prev, inscricao_estadual: e.target.value }))}
                      placeholder="000.000.000.000"
                      icon={FileText}
                    />
                  </div>

                  <div>
                    <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
                    <InputWithIcon
                      id="inscricao_municipal"
                      type="text"
                      value={documentosEmpresa.inscricao_municipal || ''}
                      onChange={(e) => setDocumentosEmpresa(prev => ({ ...prev, inscricao_municipal: e.target.value }))}
                      placeholder="000.000-0"
                      icon={FileText}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Dados de Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Dados de Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <InputWithIcon
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="cliente@email.com"
                    icon={Mail}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <EnderecoForm 
              endereco={endereco}
              onChange={setEndereco}
            />

            {/* Dados Bancários */}
            <DadosBancariosForm 
              dadosBancarios={dadosBancarios}
              onChange={setDadosBancarios}
            />

            {/* Representante Legal (PJ) */}
            {isPJ && showRepresentante && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Representante Legal
                </h3>
                
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
            )}

            {/* Documentos da Empresa (PJ) */}
            {isPJ && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Documentos da Empresa
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contrato_social">Contrato Social</Label>
                    <div className="flex gap-2">
                      <InputWithIcon
                        id="contrato_social"
                        type="text"
                        value={documentosEmpresa.contrato_social || ''}
                        onChange={(e) => setDocumentosEmpresa(prev => ({ ...prev, contrato_social: e.target.value }))}
                        placeholder="Caminho do arquivo ou observação"
                        icon={FileText}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cartao_cnpj">Cartão CNPJ</Label>
                    <div className="flex gap-2">
                      <InputWithIcon
                        id="cartao_cnpj"
                        type="text"
                        value={documentosEmpresa.cartao_cnpj || ''}
                        onChange={(e) => setDocumentosEmpresa(prev => ({ ...prev, cartao_cnpj: e.target.value }))}
                        placeholder="Caminho do arquivo ou observação"
                        icon={FileText}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comprovante_renda">Comprovante de Renda</Label>
                    <div className="flex gap-2">
                      <InputWithIcon
                        id="comprovante_renda"
                        type="text"
                        value={documentosEmpresa.comprovante_renda || ''}
                        onChange={(e) => setDocumentosEmpresa(prev => ({ ...prev, comprovante_renda: e.target.value }))}
                        placeholder="Caminho do arquivo ou observação"
                        icon={FileText}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comprovante_endereco">Comprovante de Endereço</Label>
                    <div className="flex gap-2">
                      <InputWithIcon
                        id="comprovante_endereco"
                        type="text"
                        value={documentosEmpresa.comprovante_endereco || ''}
                        onChange={(e) => setDocumentosEmpresa(prev => ({ ...prev, comprovante_endereco: e.target.value }))}
                        placeholder="Caminho do arquivo ou observação"
                        icon={FileText}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Seguros */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Seguros e Serviços
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="deseja_fci" 
                    checked={formData.deseja_fci === 'Sim'}
                    onCheckedChange={(checked) => handleInputChange('deseja_fci', checked ? 'Sim' : 'Não')}
                  />
                  <Label htmlFor="deseja_fci" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Deseja FCI
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="deseja_seguro_fianca" 
                    checked={formData.deseja_seguro_fianca === 'Sim'}
                    onCheckedChange={(checked) => handleInputChange('deseja_seguro_fianca', checked ? 'Sim' : 'Não')}
                  />
                  <Label htmlFor="deseja_seguro_fianca" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Deseja Seguro Fiança
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="deseja_seguro_incendio" 
                    checked={formData.deseja_seguro_incendio === 'Sim'}
                    onCheckedChange={(checked) => handleInputChange('deseja_seguro_incendio', checked ? 'Sim' : 'Não')}
                  />
                  <Label htmlFor="deseja_seguro_incendio" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Deseja Seguro Incêndio
                  </Label>
                </div>
              </div>
            </div>

            {/* Cônjuge */}
            {!isPJ && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="tem_conjuge" 
                    checked={showConjuge}
                    onCheckedChange={setShowConjuge}
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
                    <h4 className="text-md font-medium text-gray-800 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500" />
                      Dados do Cônjuge
                    </h4>
                    
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

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-300" />
                Observações
              </h3>
              
              <div>
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Informações adicionais sobre o cliente..."
                  rows={4}
                />
              </div>
            </div>

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
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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