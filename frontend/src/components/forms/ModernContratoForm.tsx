import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { CurrencyInput } from '../ui/currency-input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { 
  FileText, 
  User, 
  Users, 
  Building, 
  Calendar,
  DollarSign,
  Shield,
  Settings,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Percent,
  Heart,
  Banknote
} from 'lucide-react';
import type { Contrato, ContratoLocador } from '../../types';
import { apiService } from '../../services/api';
import { useFormSectionsData } from '../../hooks/useFormData';
import { ContractLandlordsForm } from './ContractLandlordsForm';

interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
}

interface Inquilino {
  id: number;
  nome: string;
  cpf_cnpj: string;
}

interface Imovel {
  id: number;
  endereco: string;
}

export const ModernContratoForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clientesSelecionados, setClientesSelecionados] = useState<Cliente[]>([]);
  const [inquilinoSelecionado, setInquilinoSelecionado] = useState<Inquilino | null>(null);
  
  // Estados para animais de estimação
  const [pets, setPets] = useState<Array<{
    nome: string;
    tipo: string;
    raca?: string;
    idade?: number;
    vacinacao_em_dia: boolean;
  }>>([]);
  
  // Estados para locadores do contrato
  const [locadores, setLocadores] = useState<ContratoLocador[]>([]);

  const [formData, setFormData] = useState<Contrato>({
    id_imovel: 0,
    id_inquilino: 0,
    data_inicio: '',
    data_fim: '',
    taxa_administracao: 0,
    fundo_conservacao: 0,
    tipo_reajuste: '',
    percentual_reajuste: 0,
    vencimento_dia: 1,
    renovacao_automatica: false,
    seguro_obrigatorio: false,
    clausulas_adicionais: '',
    tipo_plano_locacao: '',
    valores_contrato: '',
    data_vigencia_segfianca: '',
    data_vigencia_segincendio: '',
    data_assinatura: '',
    ultimo_reajuste: '',
    proximo_reajuste: '',
    antecipacao_encargos: false,
    aluguel_garantido: false,
    mes_de_referencia: '',
    tipo_garantia: '',
    bonificacao: 0,
    retidos: '',
    info_garantias: '',
    deseja_fci: 'Não',
    deseja_seguro_fianca: 'Não',
    deseja_seguro_incendio: 'Não',
    // Novos campos
    valor_aluguel: 0,
    valor_iptu: 0,
    valor_condominio: 0,
    valor_fci: 0,
    valor_seguro_fianca: 0,
    valor_seguro_incendio: 0,
    tempo_renovacao: 12,
    tempo_reajuste: 12,
    indice_reajuste: 'IPCA',
    tem_corretor: false,
    dados_bancarios_corretor: {
      banco: '',
      agencia: '',
      conta: '',
      tipo_conta: '',
      chave_pix: ''
    },
    retido_fci: false,
    retido_iptu: false,
    retido_condominio: false,
    retido_seguro_fianca: false,
    retido_seguro_incendio: false,
    antecipa_condominio: false,
    antecipa_seguro_fianca: false,
    antecipa_seguro_incendio: false,
    seguro_fianca_inicio: '',
    seguro_fianca_fim: '',
    seguro_incendio_inicio: '',
    seguro_incendio_fim: '',
    quantidade_pets: 0,
    pets: []
  });

  // ✅ Hook para detectar dados preenchidos em cada seção
  const sectionsData = useFormSectionsData({...formData, locadores}, {
    partes: ['id_imovel', 'id_inquilino', 'locadores'],
    valores: ['valor_aluguel', 'valor_iptu', 'valor_condominio', 'taxa_administracao', 'fundo_conservacao'],
    animais: ['quantidade_pets', 'pets'],
    clausulas: ['clausulas_adicionais', 'tipo_garantia', 'info_garantias', 'retidos']
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [locadoresRes, locatariosRes, imoveisRes] = await Promise.all([
          apiService.listarLocadores(),
          apiService.listarLocatarios(),
          apiService.listarImoveis()
        ]);

        if (locadoresRes.success && locadoresRes.data) {
          setClientes(locadoresRes.data);
        }
        if (locatariosRes.success && locatariosRes.data) {
          setInquilinos(locatariosRes.data);
        }
        if (imoveisRes.success && imoveisRes.data) {
          setImoveis(imoveisRes.data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setMessage({type: 'error', text: 'Erro ao carregar dados necessários.'});
      }
    };

    carregarDados();
  }, []);

  const handleInputChange = (field: keyof Contrato, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClienteChange = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === parseInt(clienteId));
    if (cliente && !clientesSelecionados.some(c => c.id === cliente.id)) {
      const novosClientes = [...clientesSelecionados, cliente];
      setClientesSelecionados(novosClientes);
      // Definir o primeiro como principal para compatibilidade
      if (novosClientes.length === 1) {
        setClienteSelecionado(cliente);
      }
    }
  };
  
  const removerCliente = (clienteId: number) => {
    const novosClientes = clientesSelecionados.filter(c => c.id !== clienteId);
    setClientesSelecionados(novosClientes);
    // Se remover o principal, definir o próximo como principal
    if (clienteSelecionado?.id === clienteId) {
      setClienteSelecionado(novosClientes.length > 0 ? novosClientes[0] : null);
    }
  };

  const handleInquilinoChange = (inquilinoId: string) => {
    const inquilino = inquilinos.find(i => i.id === parseInt(inquilinoId));
    setInquilinoSelecionado(inquilino || null);
    setFormData(prev => ({
      ...prev,
      id_inquilino: parseInt(inquilinoId)
    }));
  };

  const handleImovelChange = (imovelId: string) => {
    setFormData(prev => ({
      ...prev,
      id_imovel: parseInt(imovelId)
    }));
  };


  const atualizarPet = (index: number, campo: string, valor: any) => {
    const novosPets = [...pets];
    novosPets[index] = { ...novosPets[index], [campo]: valor };
    setPets(novosPets);
    setFormData(prev => ({
      ...prev,
      pets: novosPets
    }));
  };

  const validarDataAssinatura = (data: string): boolean => {
    if (!data) return true; // Campo pode ser vazio
    const dataAssinatura = new Date(data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horário para comparação apenas de data
    return dataAssinatura <= hoje;
  };

  const validarVigenciaSeguros = (): boolean => {
    const { seguro_fianca_inicio, seguro_fianca_fim, seguro_incendio_inicio, seguro_incendio_fim } = formData;
    
    // Validar seguro fiança
    if (seguro_fianca_inicio && seguro_fianca_fim) {
      if (new Date(seguro_fianca_inicio) >= new Date(seguro_fianca_fim)) {
        return false;
      }
    }
    
    // Validar seguro incêndio
    if (seguro_incendio_inicio && seguro_incendio_fim) {
      if (new Date(seguro_incendio_inicio) >= new Date(seguro_incendio_fim)) {
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (clientes.length === 0 || inquilinos.length === 0 || imoveis.length === 0) {
      setMessage({type: 'error', text: 'Você precisa ter pelo menos 1 cliente, 1 inquilino e 1 imóvel cadastrados.'});
      setLoading(false);
      return;
    }

    // Validar data de assinatura
    if (formData.data_assinatura && !validarDataAssinatura(formData.data_assinatura)) {
      setMessage({type: 'error', text: 'A data de assinatura não pode ser futura.'});
      setLoading(false);
      return;
    }

    // Validar vigência dos seguros
    if (!validarVigenciaSeguros()) {
      setMessage({type: 'error', text: 'A data de fim dos seguros deve ser posterior à data de início.'});
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.criarContrato(formData);
      if (response.success) {
        setMessage({type: 'success', text: response.message || 'Contrato salvo com sucesso!'});
        // Reset form
        setFormData({
          id_imovel: 0,
          id_inquilino: 0,
          data_inicio: '',
          data_fim: '',
          taxa_administracao: 0,
          fundo_conservacao: 0,
          tipo_reajuste: '',
          percentual_reajuste: 0,
          vencimento_dia: 1,
          renovacao_automatica: false,
          seguro_obrigatorio: false,
          clausulas_adicionais: '',
          tipo_plano_locacao: '',
          valores_contrato: '',
          data_vigencia_segfianca: '',
          data_vigencia_segincendio: '',
          data_assinatura: '',
          ultimo_reajuste: '',
          proximo_reajuste: '',
          antecipacao_encargos: false,
          aluguel_garantido: false,
          mes_de_referencia: '',
          tipo_garantia: '',
          bonificacao: 0,
          retidos: '',
          info_garantias: '',
          deseja_fci: 'Não',
          deseja_seguro_fianca: 'Não',
          deseja_seguro_incendio: 'Não',
          // Novos campos
          valor_aluguel: 0,
          valor_iptu: 0,
          valor_condominio: 0,
          valor_fci: 0,
          valor_seguro_fianca: 0,
          valor_seguro_incendio: 0,
          tempo_renovacao: 12,
          tempo_reajuste: 12,
          indice_reajuste: 'IPCA',
          tem_corretor: false,
          dados_bancarios_corretor: {
            banco: '',
            agencia: '',
            conta: '',
            tipo_conta: '',
            chave_pix: ''
          },
          retido_fci: false,
          retido_iptu: false,
          retido_condominio: false,
          retido_seguro_fianca: false,
          retido_seguro_incendio: false,
          antecipa_condominio: false,
          antecipa_seguro_fianca: false,
          antecipa_seguro_incendio: false,
          seguro_fianca_inicio: '',
          seguro_fianca_fim: '',
          seguro_incendio_inicio: '',
          seguro_incendio_fim: '',
          quantidade_pets: 0,
          pets: []
        });
        setClienteSelecionado(null);
        setClientesSelecionados([]);
        setInquilinoSelecionado(null);
        setPets([]);
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Erro ao salvar contrato. Tente novamente.'});
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          data-initial={{ opacity: 0, y: 30 }}
          data-animate={{ opacity: 1, y: 0 }}
          data-transition={{ duration: 0.6 }}
          className="card-glass rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-foreground/20 rounded-xl">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">Cadastro de Contrato</h1>
            </div>
          </div>

          <div className="p-8">
            {message && (
              <div
                data-initial={{ opacity: 0, scale: 0.95 }}
                data-animate={{ opacity: 1, scale: 1 }}
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
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <Tabs defaultValue="partes" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="partes" hasData={sectionsData.partes}>Partes</TabsTrigger>
                  <TabsTrigger value="valores" hasData={sectionsData.valores}>Valores</TabsTrigger>
                  <TabsTrigger value="animais" hasData={sectionsData.animais}>Animais</TabsTrigger>
                  <TabsTrigger value="clausulas" hasData={sectionsData.clausulas}>Cláusulas</TabsTrigger>
                </TabsList>

                {/* Aba 1: Partes do Contrato */}
                <TabsContent value="partes" className="space-y-8">
                  {/* Seleção de Partes */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Partes do Contrato
                    </h2>
                    
                    {/* Seção de Locadores (Proprietários) */}
                    <div className="md:col-span-3 mb-8">
                      <ContractLandlordsForm 
                        locadores={locadores}
                        onChange={setLocadores}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>
                        <Label>Inquilino (Locatário)</Label>
                        <Select onValueChange={handleInquilinoChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um inquilino..." />
                          </SelectTrigger>
                          <SelectContent>
                            {inquilinos.map(inquilino => (
                              <SelectItem key={inquilino.id} value={inquilino.id.toString()}>
                                {inquilino.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {inquilinoSelecionado && (
                          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-sm text-muted-foreground">
                              <strong>CPF/CNPJ:</strong> {inquilinoSelecionado.cpf_cnpj}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Imóvel</Label>
                        <Select onValueChange={handleImovelChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um imóvel..." />
                          </SelectTrigger>
                          <SelectContent>
                            {imoveis.map(imovel => (
                              <SelectItem key={imovel.id} value={imovel.id.toString()}>
                                {imovel.endereco}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Datas do Contrato */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Datas do Contrato
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="data_assinatura">Data de Assinatura *</Label>
                        <InputWithIcon
                          id="data_assinatura"
                          type="date"
                          icon={Calendar}
                          value={formData.data_assinatura}
                          onChange={(e) => handleInputChange('data_assinatura', e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Não pode ser uma data futura</p>
                      </div>

                      <div>
                        <Label htmlFor="vencimento_dia">Dia do Vencimento</Label>
                        <InputWithIcon
                          id="vencimento_dia"
                          type="number"
                          min="1"
                          max="31"
                          icon={Calendar}
                          value={formData.vencimento_dia}
                          onChange={(e) => handleInputChange('vencimento_dia', parseInt(e.target.value))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="data_inicio">Data de Início</Label>
                        <InputWithIcon
                          id="data_inicio"
                          type="date"
                          icon={Calendar}
                          value={formData.data_inicio}
                          onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="data_fim">Data de Fim</Label>
                        <InputWithIcon
                          id="data_fim"
                          type="date"
                          icon={Calendar}
                          value={formData.data_fim}
                          onChange={(e) => handleInputChange('data_fim', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Corretor */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Corretor
                    </h2>
                
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="tem_corretor"
                          checked={formData.tem_corretor || false}
                          onCheckedChange={(checked) => handleInputChange('tem_corretor', !!checked)}
                        />
                        <Label htmlFor="tem_corretor">Possui corretor?</Label>
                      </div>

                      {formData.tem_corretor && (
                        <div
                          data-initial={{ opacity: 0, height: 0 }}
                          data-animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4 border-l-4 border-primary pl-4"
                        >
                          <h3 className="text-lg font-semibold text-foreground">Dados Bancários do Corretor</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Banco</Label>
                              <Select onValueChange={(value) => 
                                setFormData(prev => ({
                                  ...prev,
                                  dados_bancarios_corretor: {
                                    ...(prev.dados_bancarios_corretor || {}),
                                    banco: value
                                  }
                                }))
                              }>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o banco" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="001">Banco do Brasil</SelectItem>
                                  <SelectItem value="237">Bradesco</SelectItem>
                                  <SelectItem value="104">Caixa Econômica Federal</SelectItem>
                                  <SelectItem value="341">Itaú Unibanco</SelectItem>
                                  <SelectItem value="033">Santander</SelectItem>
                                  <SelectItem value="260">Nubank</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Tipo de Conta</Label>
                              <Select onValueChange={(value) => 
                                setFormData(prev => ({
                                  ...prev,
                                  dados_bancarios_corretor: {
                                    ...(prev.dados_bancarios_corretor || {}),
                                    tipo_conta: value
                                  }
                                }))
                              }>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                                  <SelectItem value="Conta Poupança">Conta Poupança</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Agência</Label>
                              <InputWithIcon
                                type="text"
                                value={formData.dados_bancarios_corretor?.agencia || ''}
                                onChange={(e) => 
                                  setFormData(prev => ({
                                    ...prev,
                                    dados_bancarios_corretor: {
                                      ...(prev.dados_bancarios_corretor || {}),
                                      agencia: e.target.value
                                    }
                                  }))
                                }
                                placeholder="0000"
                                icon={Building}
                                required={formData.tem_corretor}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Conta</Label>
                              <InputWithIcon
                                type="text"
                                value={formData.dados_bancarios_corretor?.conta || ''}
                                onChange={(e) => 
                                  setFormData(prev => ({
                                    ...prev,
                                    dados_bancarios_corretor: {
                                      ...(prev.dados_bancarios_corretor || {}),
                                      conta: e.target.value
                                    }
                                  }))
                                }
                                placeholder="00000-0"
                                icon={CreditCard}
                                required={formData.tem_corretor}
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label>Chave PIX (Opcional)</Label>
                              <InputWithIcon
                                type="text"
                                value={formData.dados_bancarios_corretor?.chave_pix || ''}
                                onChange={(e) => 
                                  setFormData(prev => ({
                                    ...prev,
                                    dados_bancarios_corretor: {
                                      ...(prev.dados_bancarios_corretor || {}),
                                      chave_pix: e.target.value
                                    }
                                  }))
                                }
                                placeholder="CPF, email ou chave aleatória"
                                icon={CreditCard}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Renovação e Reajuste */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      Renovação e Reajuste
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="renovacao_automatica"
                            checked={formData.renovacao_automatica}
                            onCheckedChange={(checked) => handleInputChange('renovacao_automatica', !!checked)}
                          />
                          <Label htmlFor="renovacao_automatica">Renovação Automática?</Label>
                        </div>

                        <div className="space-y-2">
                          <Label>Tempo de Renovação (meses)</Label>
                          <Select 
                            value={formData.tempo_renovacao?.toString() || '12'} 
                            onValueChange={(value) => handleInputChange('tempo_renovacao', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12">12 meses</SelectItem>
                              <SelectItem value="24">24 meses</SelectItem>
                              <SelectItem value="36">36 meses</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Tempo de Reajuste (meses)</Label>
                          <Select 
                            value={formData.tempo_reajuste?.toString() || '12'} 
                            onValueChange={(value) => handleInputChange('tempo_reajuste', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 meses</SelectItem>
                              <SelectItem value="6">6 meses</SelectItem>
                              <SelectItem value="9">9 meses</SelectItem>
                              <SelectItem value="12">12 meses</SelectItem>
                              <SelectItem value="18">18 meses</SelectItem>
                              <SelectItem value="24">24 meses</SelectItem>
                              <SelectItem value="36">36 meses</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Índice de Reajuste</Label>
                          <Select 
                            value={formData.indice_reajuste || 'IPCA'} 
                            onValueChange={(value) => handleInputChange('indice_reajuste', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IPCA">IPCA</SelectItem>
                              <SelectItem value="IGPM">IGPM</SelectItem>
                              <SelectItem value="INPC">INPC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ultimo_reajuste">Último Reajuste</Label>
                        <InputWithIcon
                          id="ultimo_reajuste"
                          type="date"
                          icon={Calendar}
                          value={formData.ultimo_reajuste}
                          onChange={(e) => handleInputChange('ultimo_reajuste', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="proximo_reajuste">Próximo Reajuste</Label>
                        <InputWithIcon
                          id="proximo_reajuste"
                          type="date"
                          icon={Calendar}
                          value={formData.proximo_reajuste}
                          onChange={(e) => handleInputChange('proximo_reajuste', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Aba 2: Valores */}
                <TabsContent value="valores" className="space-y-8">
                  {/* Valores do Contrato */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      Valores do Contrato
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor_aluguel" >Valor do Aluguel</Label>
                    <CurrencyInput
                      id="valor_aluguel"
                      value={formData.valor_aluguel || 0}
                      onChange={(value) => handleInputChange('valor_aluguel', value)}
                                          />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor_iptu" >IPTU</Label>
                    <CurrencyInput
                      id="valor_iptu"
                      value={formData.valor_iptu || 0}
                      onChange={(value) => handleInputChange('valor_iptu', value)}
                                          />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor_condominio" >Condomínio</Label>
                    <CurrencyInput
                      id="valor_condominio"
                      value={formData.valor_condominio || 0}
                      onChange={(value) => handleInputChange('valor_condominio', value)}
                                          />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor_fci" >FCI (Fundo de Conservação)</Label>
                    <CurrencyInput
                      id="valor_fci"
                      value={formData.valor_fci || 0}
                      onChange={(value) => handleInputChange('valor_fci', value)}
                                          />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor_seguro_fianca" >Seguro Fiança</Label>
                    <CurrencyInput
                      id="valor_seguro_fianca"
                      value={formData.valor_seguro_fianca || 0}
                      onChange={(value) => handleInputChange('valor_seguro_fianca', value)}
                                          />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor_seguro_incendio" >Seguro Incêndio</Label>
                    <CurrencyInput
                      id="valor_seguro_incendio"
                      value={formData.valor_seguro_incendio || 0}
                      onChange={(value) => handleInputChange('valor_seguro_incendio', value)}
                                          />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxa_administracao" >Taxa de Administração (%)</Label>
                    <InputWithIcon
                      id="taxa_administracao"
                      type="number"
                      step="0.1"
                      icon={Percent}
                      value={formData.taxa_administracao}
                      onChange={(e) => handleInputChange('taxa_administracao', parseFloat(e.target.value))}
                                          />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bonificacao" >Bonificação (R$)</Label>
                    <CurrencyInput
                      id="bonificacao"
                      value={formData.bonificacao || 0}
                      onChange={(value) => handleInputChange('bonificacao', value)}
                                          />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Aba 3: Animais */}
                <TabsContent value="animais" className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Heart className="w-5 h-5 text-blue-600" />
                      Animais de Estimação
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Quantidade de Pets</Label>
                        <InputWithIcon
                          type="number"
                          min="0"
                          max="10"
                          value={formData.quantidade_pets || 0}
                          onChange={(e) => {
                            const qtd = parseInt(e.target.value) || 0;
                            handleInputChange('quantidade_pets', qtd);
                            
                            // Ajustar array de pets
                            const novosPets = Array(qtd).fill(null).map((_, index) => 
                              pets[index] || {
                                nome: '',
                                tipo: '',
                                raca: '',
                                idade: 0,
                                vacinacao_em_dia: false
                              }
                            );
                            setPets(novosPets);
                            setFormData(prev => ({
                              ...prev,
                              pets: novosPets
                            }));
                          }}
                          icon={Heart}
                        />
                      </div>

                      {pets.map((pet, index) => (
                        <div
                          key={index}
                          data-initial={{ opacity: 0, scale: 0.95 }}
                          data-animate={{ opacity: 1, scale: 1 }}
                          className="p-4 border border-border rounded-xl bg-muted/20 space-y-4"
                        >
                          <h3 className="text-lg font-semibold text-foreground">Pet {index + 1}</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nome</Label>
                              <InputWithIcon
                                type="text"
                                value={pet.nome}
                                onChange={(e) => atualizarPet(index, 'nome', e.target.value)}
                                placeholder="Nome do pet"
                                icon={Heart}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Tipo</Label>
                              <Select
                                value={pet.tipo}
                                onValueChange={(value) => atualizarPet(index, 'tipo', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Cão">Cão</SelectItem>
                                  <SelectItem value="Gato">Gato</SelectItem>
                                  <SelectItem value="Pássaro">Pássaro</SelectItem>
                                  <SelectItem value="Peixe">Peixe</SelectItem>
                                  <SelectItem value="Outros">Outros</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Raça</Label>
                              <InputWithIcon
                                type="text"
                                value={pet.raca || ''}
                                onChange={(e) => atualizarPet(index, 'raca', e.target.value)}
                                placeholder="Raça do pet"
                                icon={Heart}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Idade</Label>
                              <InputWithIcon
                                type="number"
                                min="0"
                                max="30"
                                value={pet.idade || 0}
                                onChange={(e) => atualizarPet(index, 'idade', parseInt(e.target.value) || 0)}
                                placeholder="Idade em anos"
                                icon={Calendar}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`vacinacao_${index}`}
                              checked={pet.vacinacao_em_dia}
                              onCheckedChange={(checked) => atualizarPet(index, 'vacinacao_em_dia', !!checked)}
                            />
                            <Label htmlFor={`vacinacao_${index}`}>Vacinação em dia?</Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Aba 4: Cláusulas */}
                <TabsContent value="clausulas" className="space-y-8">
                  {/* Retidos */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      Retidos
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <Checkbox
                          id="retido_fci"
                          checked={formData.retido_fci || false}
                          onCheckedChange={(checked) => handleInputChange('retido_fci', !!checked)}
                        />
                        <Label htmlFor="retido_fci" className="text-muted-foreground cursor-pointer">FCI Retido</Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <Checkbox
                          id="retido_iptu"
                          checked={formData.retido_iptu || false}
                          onCheckedChange={(checked) => handleInputChange('retido_iptu', !!checked)}
                        />
                        <Label htmlFor="retido_iptu" className="text-muted-foreground cursor-pointer">IPTU Retido</Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <Checkbox
                          id="retido_condominio"
                          checked={formData.retido_condominio || false}
                          onCheckedChange={(checked) => handleInputChange('retido_condominio', !!checked)}
                        />
                        <Label htmlFor="retido_condominio" className="text-muted-foreground cursor-pointer">Condomínio Retido</Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <Checkbox
                          id="retido_seguro_fianca"
                          checked={formData.retido_seguro_fianca || false}
                          onCheckedChange={(checked) => handleInputChange('retido_seguro_fianca', !!checked)}
                        />
                        <Label htmlFor="retido_seguro_fianca" className="text-muted-foreground cursor-pointer">Seguro Fiança Retido</Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <Checkbox
                          id="retido_seguro_incendio"
                          checked={formData.retido_seguro_incendio || false}
                          onCheckedChange={(checked) => handleInputChange('retido_seguro_incendio', !!checked)}
                        />
                        <Label htmlFor="retido_seguro_incendio" className="text-muted-foreground cursor-pointer">Seguro Incêndio Retido</Label>
                      </div>
                    </div>
                  </div>

                  {/* Antecipação de Encargos */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-blue-600" />
                      Antecipação de Encargos
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <Checkbox
                          id="antecipa_condominio"
                          checked={formData.antecipa_condominio || false}
                          onCheckedChange={(checked) => handleInputChange('antecipa_condominio', !!checked)}
                        />
                        <Label htmlFor="antecipa_condominio" className="text-muted-foreground cursor-pointer">Condomínio</Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <Checkbox
                          id="antecipa_seguro_fianca"
                          checked={formData.antecipa_seguro_fianca || false}
                          onCheckedChange={(checked) => handleInputChange('antecipa_seguro_fianca', !!checked)}
                        />
                        <Label htmlFor="antecipa_seguro_fianca" className="text-muted-foreground cursor-pointer">Seguro Fiança</Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <Checkbox
                          id="antecipa_seguro_incendio"
                          checked={formData.antecipa_seguro_incendio || false}
                          onCheckedChange={(checked) => handleInputChange('antecipa_seguro_incendio', !!checked)}
                        />
                        <Label htmlFor="antecipa_seguro_incendio" className="text-muted-foreground cursor-pointer">Seguro Incêndio</Label>
                      </div>
                    </div>
                  </div>

                  {/* Vigência de Seguros */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Vigência de Seguros
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Seguro Fiança</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Data de Início</Label>
                            <InputWithIcon
                              type="date"
                              value={formData.seguro_fianca_inicio || ''}
                              onChange={(e) => handleInputChange('seguro_fianca_inicio', e.target.value)}
                              icon={Calendar}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Data de Fim</Label>
                            <InputWithIcon
                              type="date"
                              value={formData.seguro_fianca_fim || ''}
                              onChange={(e) => handleInputChange('seguro_fianca_fim', e.target.value)}
                              icon={Calendar}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Seguro Incêndio</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Data de Início</Label>
                            <InputWithIcon
                              type="date"
                              value={formData.seguro_incendio_inicio || ''}
                              onChange={(e) => handleInputChange('seguro_incendio_inicio', e.target.value)}
                              icon={Calendar}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Data de Fim</Label>
                            <InputWithIcon
                              type="date"
                              value={formData.seguro_incendio_fim || ''}
                              onChange={(e) => handleInputChange('seguro_incendio_fim', e.target.value)}
                              icon={Calendar}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Informações Adicionais
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label>Tipo de Garantia</Label>
                        <Select onValueChange={(value) => handleInputChange('tipo_garantia', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fiador">Fiador</SelectItem>
                            <SelectItem value="Caução">Caução</SelectItem>
                            <SelectItem value="Seguro-fiança">Seguro-fiança</SelectItem>
                            <SelectItem value="Título de Capitalização">Título de Capitalização</SelectItem>
                            <SelectItem value="Sem garantia">Sem garantia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Plano de Locação</Label>
                        <Select onValueChange={(value) => handleInputChange('tipo_plano_locacao', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o plano..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completo_opcao1">Locação Completo - Opção 1: 100% (1º aluguel) + 10% (demais)</SelectItem>
                            <SelectItem value="completo_opcao2">Locação Completo - Opção 2: 16% (todos os aluguéis)</SelectItem>
                            <SelectItem value="basico_opcao1">Locação Básico - Opção 1: 50% (1º aluguel) + 5% (demais)</SelectItem>
                            <SelectItem value="basico_opcao2">Locação Básico - Opção 2: 8% (todos os aluguéis)</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {formData.tipo_plano_locacao && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                              {formData.tipo_plano_locacao === 'completo_opcao1' && (
                                <div>
                                  <p className="font-medium mb-2">Locação Completo (Administração + Corretor) - Opção 1:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    <li>Taxa de locação: <strong>100%</strong> do primeiro aluguel</li>
                                    <li>Taxa de administração: <strong>10%</strong> dos demais aluguéis</li>
                                  </ul>
                                </div>
                              )}
                              {formData.tipo_plano_locacao === 'completo_opcao2' && (
                                <div>
                                  <p className="font-medium mb-2">Locação Completo (Administração + Corretor) - Opção 2:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    <li>Taxa de administração + locação: <strong>16%</strong> sobre todos os aluguéis</li>
                                  </ul>
                                </div>
                              )}
                              {formData.tipo_plano_locacao === 'basico_opcao1' && (
                                <div>
                                  <p className="font-medium mb-2">Locação Básico (Administração) - Opção 1:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    <li>Taxa de locação: <strong>50%</strong> do primeiro aluguel</li>
                                    <li>Taxa de administração: <strong>5%</strong> dos demais aluguéis</li>
                                  </ul>
                                </div>
                              )}
                              {formData.tipo_plano_locacao === 'basico_opcao2' && (
                                <div>
                                  <p className="font-medium mb-2">Locação Básico (Administração) - Opção 2:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    <li>Taxa de locação + administração: <strong>8%</strong> sobre todos os aluguéis</li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Cláusulas Adicionais</Label>
                      <Textarea
                        value={formData.clausulas_adicionais}
                        onChange={(e) => handleInputChange('clausulas_adicionais', e.target.value)}
                        placeholder="Cláusulas especiais do contrato..."
                        rows={4}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Submit Button */}
              <div
                data-initial={{ opacity: 0, y: 20 }}
                data-animate={{ opacity: 1, y: 0 }}
                data-transition={{ duration: 0.6, delay: 0.7 }}
                className="pt-6"
              >
                <div
                  data-hover={{ scale: 1.02 }}
                  data-tap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full btn-gradient py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Salvando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span>Salvar Contrato</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};