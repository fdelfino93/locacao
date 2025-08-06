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
  DollarSign
} from 'lucide-react';
import type { Inquilino, Endereco, DadosBancarios, RepresentanteLegal, DocumentosEmpresa, Fiador, Morador } from '../../types';
import { apiService } from '../../services/api';
import { EnderecoForm } from './EnderecoForm';
import { DadosBancariosForm } from './DadosBancariosForm';

export const ModernInquilinoFormV2: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
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
  
  const [formData, setFormData] = useState<Inquilino>({
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
    responsavel_pgto_agua: 'Inquilino',
    responsavel_pgto_luz: 'Inquilino',
    responsavel_pgto_gas: 'Inquilino',
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
  const responsavesPagamento = ['Inquilino', 'Proprietário', 'Condomínio'];
  const portesAnimais = ['Pequeno (até 10kg)', 'Médio (10-25kg)', 'Grande (25-45kg)', 'Gigante (45kg+)'];

  const handleInputChange = (field: keyof Inquilino, value: any) => {
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

      const response = await apiService.post('/inquilinos', dadosParaEnvio);
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Inquilino cadastrado com sucesso!' });
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
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full mb-4">
              <Home className="w-6 h-6" />
              <span className="font-semibold">Cadastro de Inquilino</span>
            </div>
            <p className="text-gray-600">
              Complete as informações para cadastrar um novo inquilino no sistema
            </p>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tipo de Pessoa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                Tipo de Inquilino
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
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
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
              prefixo="Inquilino"
            />

            {/* Responsabilidades de Pagamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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

            {/* Botão de Envio */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[200px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Home className="w-4 h-4 mr-2" />
                    Cadastrar Inquilino
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};