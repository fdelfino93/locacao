import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import type { Inquilino } from '../../types';
import { apiService } from '../../services/api';

export const InquilinoForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showConjuge, setShowConjuge] = useState<boolean>(false);
  const [hasDependentes, setHasDependentes] = useState<boolean>(false);
  const [hasPets, setHasPets] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<Inquilino>({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    tipo_garantia: '',
    responsavel_pgto_agua: '',
    responsavel_pgto_luz: '',
    responsavel_pgto_gas: '',
    rg: '',
    dados_empresa: '',
    representante: '',
    nacionalidade: '',
    estado_civil: '',
    profissao: '',
    dados_moradores: '',
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
    telefone_conjuge: ''
  });

  const handleInputChange = (field: keyof Inquilino, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResponsavelChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      responsavel_inq: value === 'Sim' ? 1 : 0
    }));
  };

  const handleDependentesChange = (value: string) => {
    const hasDep = value === 'Sim';
    setHasDependentes(hasDep);
    setFormData(prev => ({
      ...prev,
      dependentes_inq: hasDep ? 1 : 0,
      qtd_dependentes_inq: hasDep ? prev.qtd_dependentes_inq : 0
    }));
  };

  const handlePetsChange = (value: string) => {
    const hasPet = value === 'Sim';
    setHasPets(hasPet);
    setFormData(prev => ({
      ...prev,
      pet_inquilino: hasPet ? 1 : 0,
      qtd_pet_inquilino: hasPet ? prev.qtd_pet_inquilino : 0,
      porte_pet: hasPet ? prev.porte_pet : ''
    }));
  };

  const handleConjugeChange = (value: string) => {
    const hasConjuge = value === 'Sim';
    setShowConjuge(hasConjuge);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await apiService.criarInquilino(formData);
      if (response.success) {
        setMessage({type: 'success', text: response.message || 'Inquilino cadastrado com sucesso!'});
        // Reset form
        setFormData({
          nome: '',
          cpf_cnpj: '',
          telefone: '',
          email: '',
          tipo_garantia: '',
          responsavel_pgto_agua: '',
          responsavel_pgto_luz: '',
          responsavel_pgto_gas: '',
          rg: '',
          dados_empresa: '',
          representante: '',
          nacionalidade: '',
          estado_civil: '',
          profissao: '',
          dados_moradores: '',
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
          telefone_conjuge: ''
        });
        setShowConjuge(false);
        setHasDependentes(false);
        setHasPets(false);
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Erro ao cadastrar inquilino. Tente novamente.'});
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-foreground">📋 Cadastro de Inquilino</h2>
      
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
            <Label htmlFor="nome">Nome do Inquilino</Label>
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
            <Label htmlFor="Endereco_inq">Endereço Responsável</Label>
            <Input
              id="Endereco_inq"
              value={formData.Endereco_inq}
              onChange={(e) => handleInputChange('Endereco_inq', e.target.value)}
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
        </div>

        {/* Tipo de Garantia */}
        <div className="space-y-2">
          <Label htmlFor="tipo_garantia">Tipo de Garantia</Label>
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

        {/* Responsáveis por Pagamentos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Responsáveis por Pagamentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsavel_pgto_agua">Responsável Pagamento Água</Label>
              <Input
                id="responsavel_pgto_agua"
                value={formData.responsavel_pgto_agua}
                onChange={(e) => handleInputChange('responsavel_pgto_agua', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel_pgto_luz">Responsável Pagamento Luz</Label>
              <Input
                id="responsavel_pgto_luz"
                value={formData.responsavel_pgto_luz}
                onChange={(e) => handleInputChange('responsavel_pgto_luz', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel_pgto_gas">Responsável Pagamento Gás</Label>
              <Input
                id="responsavel_pgto_gas"
                value={formData.responsavel_pgto_gas}
                onChange={(e) => handleInputChange('responsavel_pgto_gas', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Dados Adicionais */}
        <div className="space-y-2">
          <Label htmlFor="dados_empresa">Dados da Empresa</Label>
          <Textarea
            id="dados_empresa"
            value={formData.dados_empresa}
            onChange={(e) => handleInputChange('dados_empresa', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dados_moradores">Dados dos Moradores</Label>
          <Textarea
            id="dados_moradores"
            value={formData.dados_moradores}
            onChange={(e) => handleInputChange('dados_moradores', e.target.value)}
          />
        </div>

        {/* Responsável pela Locação */}
        <div className="space-y-2">
          <Label>É o responsável pela locação?</Label>
          <Select onValueChange={handleResponsavelChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sim">Sim</SelectItem>
              <SelectItem value="Não">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dependentes */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Possui dependentes?</Label>
            <Select onValueChange={handleDependentesChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sim">Sim</SelectItem>
                <SelectItem value="Não">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasDependentes && (
            <div className="space-y-2">
              <Label htmlFor="qtd_dependentes_inq">Quantidade de Dependentes</Label>
              <Input
                id="qtd_dependentes_inq"
                type="number"
                min="0"
                value={formData.qtd_dependentes_inq}
                onChange={(e) => handleInputChange('qtd_dependentes_inq', parseInt(e.target.value) || 0)}
              />
            </div>
          )}
        </div>

        {/* Pets */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Possui pets?</Label>
            <Select onValueChange={handlePetsChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sim">Sim</SelectItem>
                <SelectItem value="Não">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasPets && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qtd_pet_inquilino">Quantidade de Pets</Label>
                <Input
                  id="qtd_pet_inquilino"
                  type="number"
                  min="0"
                  value={formData.qtd_pet_inquilino}
                  onChange={(e) => handleInputChange('qtd_pet_inquilino', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="porte_pet">Porte do Pet</Label>
                <Select onValueChange={(value) => handleInputChange('porte_pet', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pequeno">Pequeno</SelectItem>
                    <SelectItem value="Grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
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
          {loading ? 'Cadastrando...' : '💾 Cadastrar Inquilino'}
        </Button>
      </form>
    </div>
  );
};