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
  Home,
  DollarSign,
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { Locatario, Endereco, DadosBancarios, RepresentanteLegal, DocumentosEmpresa, Fiador, Morador } from '../../types';
import { apiService } from '../../services/api';
import { EnderecoForm } from './EnderecoForm';
import { DadosBancariosForm } from './DadosBancariosForm';

export const ModernLocatarioFormV2: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
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
    endereco: endereco,
    dados_bancarios: dadosBancarios,
    tipo_pessoa: 'PF',
    representante_legal: representanteLegal,
    documentos_empresa: documentosEmpresa,
    tipo_garantia: 'Nenhuma',
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
    observacoes: ''
  });

  const estadosCivis = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'];
  const tiposGarantia = ['Nenhuma', 'Fiador', 'Caução', 'Seguro Fiança', 'Título de Capitalização'];
  const responsavesPagamento = ['Locatario', 'Proprietário', 'Condomínio'];
  const portesAnimais = ['Pequeno (até 10kg)', 'Médio (10-25kg)', 'Grande (25-45kg)', 'Gigante (45kg+)'];

  const handleInputChange = (field: keyof Locatario, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

    try {
      const dadosParaEnvio = {
        ...formData,
        endereco: endereco,
        dados_bancarios: dadosBancarios,
        representante_legal: showRepresentante ? representanteLegal : undefined,
        documentos_empresa: showRepresentante ? documentosEmpresa : undefined,
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

  const isPJ = formData.tipo_pessoa === 'PJ';
  const temPets = formData.pet_inquilino === 1;

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
                <Home className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Cadastro de Locatário</h2>
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
                <UserCheck className="w-5 h-5 text-gray-300" />
                Tipo de Locatario
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
                  <Label>Tipo de Garantia</Label>
                  <Select value={formData.tipo_garantia} onValueChange={(value) => {
                    handleInputChange('tipo_garantia', value);
                    setShowFiador(value === 'Fiador');
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposGarantia.map(tipo => (
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
                <User className="w-5 h-5 text-gray-300" />
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
                  placeholder="inquilino@email.com"
                  icon={Mail}
                  required
                />
              </div>
            </div>

            {/* Endereço */}
            <EnderecoForm 
              endereco={endereco}
              onChange={setEndereco}
              prefixo="Locatario"
            />

            {/* Responsabilidades de Pagamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                Responsabilidades de Pagamento
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="responsavel_pgto_agua">Pagamento de Água</Label>
                  <Select value={formData.responsavel_pgto_agua} onValueChange={(value) => handleInputChange('responsavel_pgto_agua', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {responsavesPagamento.map(resp => (
                        <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="responsavel_pgto_luz">Pagamento de Luz</Label>
                  <Select value={formData.responsavel_pgto_luz} onValueChange={(value) => handleInputChange('responsavel_pgto_luz', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {responsavesPagamento.map(resp => (
                        <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="responsavel_pgto_gas">Pagamento de Gás</Label>
                  <Select value={formData.responsavel_pgto_gas} onValueChange={(value) => handleInputChange('responsavel_pgto_gas', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {responsavesPagamento.map(resp => (
                        <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sistema de Moradores */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tem_moradores" 
                  checked={showMoradores}
                  onCheckedChange={(checked) => {
                    setShowMoradores(!!checked);
                    handleInputChange('tem_moradores', !!checked);
                  }}
                />
                <Label htmlFor="tem_moradores" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Possui moradores adicionais no imóvel
                </Label>
              </div>

              {showMoradores && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 border-l-4 border-blue-200 pl-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-800 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      Moradores Cadastrados ({moradores.length})
                    </h4>
                    <Button type="button" onClick={adicionarMorador} size="sm" variant="outline">
                      <User className="w-4 h-4 mr-2" />
                      Adicionar Morador
                    </Button>
                  </div>

                  {moradores.map((morador, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Morador {index + 1}</span>
                        <Button 
                          type="button" 
                          onClick={() => removerMorador(index)} 
                          size="sm" 
                          variant="destructive"
                        >
                          Remover
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <InputWithIcon
                          type="text"
                          value={morador.nome}
                          onChange={(e) => atualizarMorador(index, 'nome', e.target.value)}
                          placeholder="Nome completo"
                          icon={User}
                        />
                        <InputWithIcon
                          type="text"
                          value={morador.cpf || ''}
                          onChange={(e) => atualizarMorador(index, 'cpf', e.target.value)}
                          placeholder="CPF (opcional)"
                          icon={CreditCard}
                        />
                        <InputWithIcon
                          type="text"
                          value={morador.parentesco || ''}
                          onChange={(e) => atualizarMorador(index, 'parentesco', e.target.value)}
                          placeholder="Parentesco"
                          icon={Heart}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Sistema de Pets */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="pet_inquilino" 
                  checked={temPets}
                  onCheckedChange={(checked) => handleInputChange('pet_inquilino', checked ? 1 : 0)}
                />
                <Label htmlFor="pet_inquilino" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Possui animais de estimação
                </Label>
              </div>

              {temPets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <Label htmlFor="qtd_pet_inquilino">Quantidade de Pets</Label>
                    <InputWithIcon
                      id="qtd_pet_inquilino"
                      type="number"
                      value={formData.qtd_pet_inquilino.toString()}
                      onChange={(e) => handleInputChange('qtd_pet_inquilino', parseInt(e.target.value) || 0)}
                      placeholder="1"
                      icon={Heart}
                      min="1"
                      max="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="porte_pet">Porte dos Animais</Label>
                    <Select value={formData.porte_pet || ''} onValueChange={(value) => handleInputChange('porte_pet', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o porte" />
                      </SelectTrigger>
                      <SelectContent>
                        {portesAnimais.map(porte => (
                          <SelectItem key={porte} value={porte}>{porte}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Fiador */}
            {showFiador && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Dados do Fiador
                </h3>
                
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

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Observações
              </h3>
              
              <div>
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Informações adicionais sobre o inquilino..."
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