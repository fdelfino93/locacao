import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import type { Imovel } from '../../types';
import { apiService } from '../../services/api';

export const ImovelForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [inquilinos, setInquilinos] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState<Imovel>({
    id_cliente: 0,
    id_inquilino: 0,
    tipo: '',
    endereco: '',
    valor_aluguel: 0,
    iptu: 0,
    condominio: 0,
    taxa_incendio: 0,
    status: '',
    matricula_imovel: '',
    area_imovel: '',
    dados_imovel: '',
    permite_pets: false,
    info_iptu: '',
    observacoes_condominio: '',
    copel_unidade_consumidora: '',
    sanepar_matricula: '',
    tem_gas: false,
    info_gas: '',
    boleto_condominio: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Carregando dados de clientes e inquilinos...');
        
        const [clientesResponse, inquilinosResponse] = await Promise.all([
          apiService.listarClientes(),
          apiService.listarInquilinos()
        ]);

        console.log('Resposta clientes:', clientesResponse);
        console.log('Resposta inquilinos:', inquilinosResponse);

        if (clientesResponse.success && clientesResponse.data) {
          setClientes(clientesResponse.data);
          console.log('Clientes carregados:', clientesResponse.data);
        }

        if (inquilinosResponse.success && inquilinosResponse.data) {
          setInquilinos(inquilinosResponse.data);
          console.log('Inquilinos carregados:', inquilinosResponse.data);
        }
        
        setMessage({type: 'success', text: `Carregados ${clientesResponse.data?.length || 0} clientes e ${inquilinosResponse.data?.length || 0} inquilinos.`});
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setMessage({type: 'error', text: 'Erro ao carregar clientes e inquilinos. Verifique se a API está rodando.'});
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: keyof Imovel, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.id_cliente || !formData.id_inquilino) {
      setMessage({type: 'error', text: 'Selecione um cliente e um inquilino.'});
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.criarImovel(formData);
      if (response.success) {
        setMessage({type: 'success', text: response.message || 'Imóvel cadastrado com sucesso!'});
        // Reset form
        setFormData({
          id_cliente: 0,
          id_inquilino: 0,
          tipo: '',
          endereco: '',
          valor_aluguel: 0,
          iptu: 0,
          condominio: 0,
          taxa_incendio: 0,
          status: '',
          matricula_imovel: '',
          area_imovel: '',
          dados_imovel: '',
          permite_pets: false,
          info_iptu: '',
          observacoes_condominio: '',
          copel_unidade_consumidora: '',
          sanepar_matricula: '',
          tem_gas: false,
          info_gas: '',
          boleto_condominio: false
        });
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Erro ao cadastrar imóvel. Tente novamente.'});
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-lg">
        <div className="text-center">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-foreground">🏠 Cadastro de Imóvel</h2>
      
      {message && (
        <div className={`p-4 rounded-md mb-6 ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Cliente e Inquilino */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="id_cliente">Cliente Responsável</Label>
            <Select onValueChange={(value) => handleInputChange('id_cliente', parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id.toString()}>
                    {cliente.nome} - {cliente.cpf_cnpj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_inquilino">Inquilino Responsável</Label>
            <Select onValueChange={(value) => handleInputChange('id_inquilino', parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um inquilino..." />
              </SelectTrigger>
              <SelectContent>
                {inquilinos.map((inquilino) => (
                  <SelectItem key={inquilino.id} value={inquilino.id.toString()}>
                    {inquilino.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dados Básicos do Imóvel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo do Imóvel</Label>
            <Select onValueChange={(value) => handleInputChange('tipo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Apartamento">Apartamento</SelectItem>
                <SelectItem value="Casa">Casa</SelectItem>
                <SelectItem value="Sala Comercial">Sala Comercial</SelectItem>
                <SelectItem value="Galpão">Galpão</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Disponível">Disponível</SelectItem>
                <SelectItem value="Ocupado">Ocupado</SelectItem>
                <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor_aluguel">Valor do Aluguel</Label>
            <Input
              id="valor_aluguel"
              type="number"
              step="0.01"
              value={formData.valor_aluguel}
              onChange={(e) => handleInputChange('valor_aluguel', parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iptu">Valor do IPTU</Label>
            <Input
              id="iptu"
              type="number"
              step="0.01"
              value={formData.iptu}
              onChange={(e) => handleInputChange('iptu', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condominio">Valor do Condomínio</Label>
            <Input
              id="condominio"
              type="number"
              step="0.01"
              value={formData.condominio}
              onChange={(e) => handleInputChange('condominio', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxa_incendio">Taxa de Incêndio</Label>
            <Input
              id="taxa_incendio"
              type="number"
              step="0.01"
              value={formData.taxa_incendio}
              onChange={(e) => handleInputChange('taxa_incendio', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricula_imovel">Matrícula do Imóvel</Label>
            <Input
              id="matricula_imovel"
              value={formData.matricula_imovel}
              onChange={(e) => handleInputChange('matricula_imovel', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area_imovel">Área do Imóvel (total/privativa)</Label>
            <Input
              id="area_imovel"
              value={formData.area_imovel}
              onChange={(e) => handleInputChange('area_imovel', e.target.value)}
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            value={formData.endereco}
            onChange={(e) => handleInputChange('endereco', e.target.value)}
            required
          />
        </div>

        {/* Checkbox - Permite Pets */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="permite_pets"
            checked={formData.permite_pets}
            onCheckedChange={(checked) => handleInputChange('permite_pets', !!checked)}
          />
          <Label htmlFor="permite_pets">Permite Animais?</Label>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">📦 Informações Adicionais</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dados_imovel">Dados do Imóvel (suíte, copa, etc.)</Label>
              <Textarea
                id="dados_imovel"
                value={formData.dados_imovel}
                onChange={(e) => handleInputChange('dados_imovel', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="info_iptu">Informações sobre IPTU</Label>
              <Textarea
                id="info_iptu"
                value={formData.info_iptu}
                onChange={(e) => handleInputChange('info_iptu', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes_condominio">Observações do Condomínio</Label>
              <Textarea
                id="observacoes_condominio"
                value={formData.observacoes_condominio}
                onChange={(e) => handleInputChange('observacoes_condominio', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="info_gas">Informações sobre Gás</Label>
              <Textarea
                id="info_gas"
                value={formData.info_gas}
                onChange={(e) => handleInputChange('info_gas', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copel_unidade_consumidora">Copel - Unidade Consumidora</Label>
              <Input
                id="copel_unidade_consumidora"
                value={formData.copel_unidade_consumidora}
                onChange={(e) => handleInputChange('copel_unidade_consumidora', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sanepar_matricula">Sanepar - Matrícula</Label>
              <Input
                id="sanepar_matricula"
                value={formData.sanepar_matricula}
                onChange={(e) => handleInputChange('sanepar_matricula', e.target.value)}
              />
            </div>
          </div>

          {/* Checkboxes adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tem_gas"
                checked={formData.tem_gas}
                onCheckedChange={(checked) => handleInputChange('tem_gas', !!checked)}
              />
              <Label htmlFor="tem_gas">Tem Gás?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="boleto_condominio"
                checked={formData.boleto_condominio}
                onCheckedChange={(checked) => handleInputChange('boleto_condominio', !!checked)}
              />
              <Label htmlFor="boleto_condominio">Boleto do Condomínio incluso?</Label>
            </div>
          </div>
        </div>

        {/* Botão de Submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Cadastrando...' : '💾 Salvar Imóvel'}
        </Button>
      </form>
    </div>
  );
};