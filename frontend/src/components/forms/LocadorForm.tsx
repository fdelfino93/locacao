import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import type { Locador } from '../../types';
import { apiService } from '../../services/api';

export const LocadorForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showConjuge, setShowConjuge] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<Locador>({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    tipo_recebimento: '',
    conta_bancaria: '',
    deseja_fci: 'Não',
    deseja_seguro_fianca: 'Não',
    deseja_seguro_incendio: 'Não',
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
    data_nascimento: ''
  });

  const handleInputChange = (field: keyof Locador, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: keyof Locador, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked ? 'Sim' : 'Não'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await apiService.criarLocador(formData);
      if (response.success) {
        setMessage({type: 'success', text: response.message || 'Locador cadastrado com sucesso!'});
        // Reset form
        setFormData({
          nome: '',
          cpf_cnpj: '',
          telefone: '',
          email: '',
          endereco: '',
          tipo_recebimento: '',
          conta_bancaria: '',
          deseja_fci: 'Não',
          deseja_seguro_fianca: 'Não',
          deseja_seguro_incendio: 'Não',
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
          data_nascimento: ''
        });
        setShowConjuge(false);
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Erro ao cadastrar cliente. Tente novamente.'});
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-foreground">📋 Cadastro de Cliente</h2>
      
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
        {/* Dados Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input
              id="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rg">RG</Label>
            <Input
              id="rg"
              value={formData.rg}
              onChange={(e) => handleInputChange('rg', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nacionalidade">Nacionalidade</Label>
            <Input
              id="nacionalidade"
              value={formData.nacionalidade}
              onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado_civil">Estado Civil</Label>
            <Input
              id="estado_civil"
              value={formData.estado_civil}
              onChange={(e) => handleInputChange('estado_civil', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profissao">Profissão</Label>
            <Input
              id="profissao"
              value={formData.profissao}
              onChange={(e) => handleInputChange('profissao', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_recebimento">Forma de Recebimento</Label>
            <Select onValueChange={(value) => handleInputChange('tipo_recebimento', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="TED">TED</SelectItem>
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Depósito">Depósito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_cliente">Tipo de Cliente</Label>
            <Select onValueChange={(value) => handleInputChange('tipo_cliente', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residencial">Residencial</SelectItem>
                <SelectItem value="Comercial">Comercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input
              id="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conta_bancaria">Conta Bancária</Label>
            <Input
              id="conta_bancaria"
              value={formData.conta_bancaria}
              onChange={(e) => handleInputChange('conta_bancaria', e.target.value)}
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Textarea
            id="endereco"
            value={formData.endereco}
            onChange={(e) => handleInputChange('endereco', e.target.value)}
            required
          />
        </div>

        {/* Dados da Empresa */}
        <div className="space-y-2">
          <Label htmlFor="dados_empresa">Dados da Empresa</Label>
          <Textarea
            id="dados_empresa"
            value={formData.dados_empresa}
            onChange={(e) => handleInputChange('dados_empresa', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="representante">Representante Legal</Label>
          <Input
            id="representante"
            value={formData.representante}
            onChange={(e) => handleInputChange('representante', e.target.value)}
          />
        </div>

        {/* Preferências */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Preferências</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="deseja_fci"
                checked={formData.deseja_fci === 'Sim'}
                onCheckedChange={(checked) => handleCheckboxChange('deseja_fci', !!checked)}
              />
              <Label htmlFor="deseja_fci">Deseja FCI?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="deseja_seguro_fianca"
                checked={formData.deseja_seguro_fianca === 'Sim'}
                onCheckedChange={(checked) => handleCheckboxChange('deseja_seguro_fianca', !!checked)}
              />
              <Label htmlFor="deseja_seguro_fianca">Deseja Seguro Fiança?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="deseja_seguro_incendio"
                checked={formData.deseja_seguro_incendio === 'Sim'}
                onCheckedChange={(checked) => handleCheckboxChange('deseja_seguro_incendio', !!checked)}
              />
              <Label htmlFor="deseja_seguro_incendio">Deseja Seguro Incêndio?</Label>
            </div>
          </div>
        </div>

        {/* Cônjuge */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Possui cônjuge?</Label>
            <Select onValueChange={handleConjugeChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sim">Sim</SelectItem>
                <SelectItem value="Não">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showConjuge && (
            <div className="space-y-4 p-4 bg-muted rounded-md">
              <h3 className="text-lg font-semibold">Informações do Cônjuge</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_conjuge">Nome do Cônjuge</Label>
                  <Input
                    id="nome_conjuge"
                    value={formData.nome_conjuge || ''}
                    onChange={(e) => handleInputChange('nome_conjuge', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf_conjuge">CPF do Cônjuge</Label>
                  <Input
                    id="cpf_conjuge"
                    value={formData.cpf_conjuge || ''}
                    onChange={(e) => handleInputChange('cpf_conjuge', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rg_conjuge">RG do Cônjuge</Label>
                  <Input
                    id="rg_conjuge"
                    value={formData.rg_conjuge || ''}
                    onChange={(e) => handleInputChange('rg_conjuge', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone_conjuge">Telefone do Cônjuge</Label>
                  <Input
                    id="telefone_conjuge"
                    value={formData.telefone_conjuge || ''}
                    onChange={(e) => handleInputChange('telefone_conjuge', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco_conjuge">Endereço do Cônjuge</Label>
                  <Input
                    id="endereco_conjuge"
                    value={formData.endereco_conjuge || ''}
                    onChange={(e) => handleInputChange('endereco_conjuge', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botão de Submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Cadastrando...' : '💾 Cadastrar Cliente'}
        </Button>
      </form>
    </div>
  );
};