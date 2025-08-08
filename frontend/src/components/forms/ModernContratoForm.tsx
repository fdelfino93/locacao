import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
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
  Phone,
  MapPin,
  Percent,
  Building2
} from 'lucide-react';
import type { Contrato } from '../../types';
import { apiService } from '../../services/api';

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
  const [inquilinoSelecionado, setInquilinoSelecionado] = useState<Inquilino | null>(null);
  
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
    info_garantias: ''
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
    setClienteSelecionado(cliente || null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (clientes.length === 0 || inquilinos.length === 0 || imoveis.length === 0) {
      setMessage({type: 'error', text: 'Você precisa ter pelo menos 1 cliente, 1 inquilino e 1 imóvel cadastrados.'});
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
          info_garantias: ''
        });
        setClienteSelecionado(null);
        setInquilinoSelecionado(null);
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Erro ao salvar contrato. Tente novamente.'});
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
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Cadastro de Contrato</h2>
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
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message.text}</span>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Seleção de Partes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Partes do Contrato</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Cliente (Proprietário)</Label>
                    <Select onValueChange={handleClienteChange}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione um cliente..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {clientes.map(cliente => (
                          <SelectItem key={cliente.id} value={cliente.id.toString()} className="text-white hover:bg-gray-700">
                            {cliente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {clienteSelecionado && (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-gray-300">
                          <strong>CPF/CNPJ:</strong> {clienteSelecionado.cpf_cnpj}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Inquilino (Locatário)</Label>
                    <Select onValueChange={handleInquilinoChange}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione um inquilino..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {inquilinos.map(inquilino => (
                          <SelectItem key={inquilino.id} value={inquilino.id.toString()} className="text-white hover:bg-gray-700">
                            {inquilino.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {inquilinoSelecionado && (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-gray-300">
                          <strong>CPF/CNPJ:</strong> {inquilinoSelecionado.cpf_cnpj}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Imóvel</Label>
                    <Select onValueChange={handleImovelChange}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione um imóvel..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {imoveis.map(imovel => (
                          <SelectItem key={imovel.id} value={imovel.id.toString()} className="text-white hover:bg-gray-700">
                            {imovel.endereco}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>

              {/* Período e Datas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Período e Reajuste</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio" className="text-gray-300">Data de Início</Label>
                    <InputWithIcon
                      id="data_inicio"
                      type="date"
                      icon={Calendar}
                      value={formData.data_inicio}
                      onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_fim" className="text-gray-300">Data de Fim</Label>
                    <InputWithIcon
                      id="data_fim"
                      type="date"
                      icon={Calendar}
                      value={formData.data_fim}
                      onChange={(e) => handleInputChange('data_fim', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_assinatura" className="text-gray-300">Data de Assinatura</Label>
                    <InputWithIcon
                      id="data_assinatura"
                      type="date"
                      icon={Calendar}
                      value={formData.data_assinatura}
                      onChange={(e) => handleInputChange('data_assinatura', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vencimento_dia" className="text-gray-300">Dia do Vencimento</Label>
                    <InputWithIcon
                      id="vencimento_dia"
                      type="number"
                      min="1"
                      max="31"
                      icon={Calendar}
                      value={formData.vencimento_dia}
                      onChange={(e) => handleInputChange('vencimento_dia', parseInt(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_reajuste" className="text-gray-300">Tipo de Reajuste</Label>
                    <Select onValueChange={(value) => handleInputChange('tipo_reajuste', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="IGPM" className="text-white hover:bg-gray-700">IGPM</SelectItem>
                        <SelectItem value="IPCA" className="text-white hover:bg-gray-700">IPCA</SelectItem>
                        <SelectItem value="Outro" className="text-white hover:bg-gray-700">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="percentual_reajuste" className="text-gray-300">Percentual de Reajuste (%)</Label>
                    <InputWithIcon
                      id="percentual_reajuste"
                      type="number"
                      step="0.1"
                      icon={Percent}
                      value={formData.percentual_reajuste}
                      onChange={(e) => handleInputChange('percentual_reajuste', parseFloat(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Valores e Condições */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Valores e Condições</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="taxa_administracao" className="text-gray-300">Taxa de Administração (%)</Label>
                    <InputWithIcon
                      id="taxa_administracao"
                      type="number"
                      step="0.1"
                      icon={Percent}
                      value={formData.taxa_administracao}
                      onChange={(e) => handleInputChange('taxa_administracao', parseFloat(e.target.value))}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fundo_conservacao" className="text-gray-300">Fundo de Conservação (R$)</Label>
                    <InputWithIcon
                      id="fundo_conservacao"
                      type="number"
                      step="0.1"
                      icon={DollarSign}
                      value={formData.fundo_conservacao}
                      onChange={(e) => handleInputChange('fundo_conservacao', parseFloat(e.target.value))}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_plano_locacao" className="text-gray-300">Plano de Locação</Label>
                    <Select onValueChange={(value) => handleInputChange('tipo_plano_locacao', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Básico" className="text-white hover:bg-gray-700">Básico</SelectItem>
                        <SelectItem value="Completo" className="text-white hover:bg-gray-700">Completo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bonificacao" className="text-gray-300">Bonificação (%)</Label>
                    <InputWithIcon
                      id="bonificacao"
                      type="number"
                      step="0.1"
                      icon={Percent}
                      value={formData.bonificacao}
                      onChange={(e) => handleInputChange('bonificacao', parseFloat(e.target.value))}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valores_contrato" className="text-gray-300">Valores do Contrato</Label>
                  <Textarea
                    id="valores_contrato"
                    value={formData.valores_contrato}
                    onChange={(e) => handleInputChange('valores_contrato', e.target.value)}
                    placeholder="Ex: aluguel, IPTU, condomínio"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retidos" className="text-gray-300">Retidos</Label>
                  <Textarea
                    id="retidos"
                    value={formData.retidos}
                    onChange={(e) => handleInputChange('retidos', e.target.value)}
                    placeholder="Ex: FCI, IPTU, Seguro"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
              </motion.div>

              {/* Garantias e Seguros */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Garantias e Seguros</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_garantia" className="text-gray-300">Tipo de Garantia</Label>
                    <Select onValueChange={(value) => handleInputChange('tipo_garantia', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione..." />
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

                  <div className="space-y-2">
                    <Label htmlFor="data_vigencia_segfianca" className="text-gray-300">Vigência Seguro Fiança</Label>
                    <InputWithIcon
                      id="data_vigencia_segfianca"
                      type="date"
                      icon={Calendar}
                      value={formData.data_vigencia_segfianca}
                      onChange={(e) => handleInputChange('data_vigencia_segfianca', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_vigencia_segincendio" className="text-gray-300">Vigência Seguro Incêndio</Label>
                    <InputWithIcon
                      id="data_vigencia_segincendio"
                      type="date"
                      icon={Calendar}
                      value={formData.data_vigencia_segincendio}
                      onChange={(e) => handleInputChange('data_vigencia_segincendio', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="info_garantias" className="text-gray-300">Informações da Garantia</Label>
                  <Textarea
                    id="info_garantias"
                    value={formData.info_garantias}
                    onChange={(e) => handleInputChange('info_garantias', e.target.value)}
                    placeholder="Fiador, contato, documentos..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
              </motion.div>

              {/* Opções */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Opções do Contrato</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Checkbox
                      id="renovacao_automatica"
                      checked={formData.renovacao_automatica}
                      onCheckedChange={(checked) => handleInputChange('renovacao_automatica', !!checked)}
                      className="border-white/20"
                    />
                    <Label htmlFor="renovacao_automatica" className="text-gray-300 cursor-pointer">Renovação Automática</Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Checkbox
                      id="antecipacao_encargos"
                      checked={formData.antecipacao_encargos}
                      onCheckedChange={(checked) => handleInputChange('antecipacao_encargos', !!checked)}
                      className="border-white/20"
                    />
                    <Label htmlFor="antecipacao_encargos" className="text-gray-300 cursor-pointer">Antecipação de Encargos</Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Checkbox
                      id="aluguel_garantido"
                      checked={formData.aluguel_garantido}
                      onCheckedChange={(checked) => handleInputChange('aluguel_garantido', !!checked)}
                      className="border-white/20"
                    />
                    <Label htmlFor="aluguel_garantido" className="text-gray-300 cursor-pointer">Aluguel Garantido</Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Checkbox
                      id="seguro_obrigatorio"
                      checked={formData.seguro_obrigatorio}
                      onCheckedChange={(checked) => handleInputChange('seguro_obrigatorio', !!checked)}
                      className="border-white/20"
                    />
                    <Label htmlFor="seguro_obrigatorio" className="text-gray-300 cursor-pointer">Seguro Obrigatório</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mes_de_referencia" className="text-gray-300">Mês de Referência</Label>
                  <Select onValueChange={(value) => handleInputChange('mes_de_referencia', value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Mesmo mês" className="text-white hover:bg-gray-700">Mesmo mês</SelectItem>
                      <SelectItem value="Mês anterior" className="text-white hover:bg-gray-700">Mês anterior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clausulas_adicionais" className="text-gray-300">Cláusulas Adicionais</Label>
                  <Textarea
                    id="clausulas_adicionais"
                    value={formData.clausulas_adicionais}
                    onChange={(e) => handleInputChange('clausulas_adicionais', e.target.value)}
                    placeholder="Cláusulas especiais do contrato..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
              </motion.div>

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
                        <span>Salvando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Salvar Contrato</span>
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