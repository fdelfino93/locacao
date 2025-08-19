import React, { useState } from 'react';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { 
  User, 
  CreditCard, 
  Phone, 
  Mail, 
  Building, 
  FileText
} from 'lucide-react';

export const ModernLocadorFormV2Test: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    tipo_pessoa: 'PF'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-foreground/20 rounded-xl">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">Cadastro de Locador - Teste</h1>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <Tabs defaultValue="dados-basicos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dados-basicos" hasData={!!(formData.nome || formData.cpf_cnpj)}>
                    Dados Básicos
                  </TabsTrigger>
                  <TabsTrigger value="contato" hasData={!!(formData.telefone || formData.email)}>
                    Contato
                  </TabsTrigger>
                </TabsList>

                {/* Aba 1: Dados Básicos */}
                <TabsContent value="dados-basicos" className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground">Dados Básicos</h2>
                    <p className="text-muted-foreground">Informações principais do locador</p>
                  </div>

                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Tipo de Locador</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo de Pessoa *</Label>
                        <Select 
                          value={formData.tipo_pessoa} 
                          onValueChange={(value: 'PF' | 'PJ') => handleInputChange('tipo_pessoa', value)}
                        >
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
                        <Label htmlFor="nome">
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
                        <Label htmlFor="cpf_cnpj">
                          {formData.tipo_pessoa === 'PJ' ? 'CNPJ' : 'CPF'} *
                        </Label>
                        <InputWithIcon
                          id="cpf_cnpj"
                          type="text"
                          value={formData.cpf_cnpj}
                          onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
                          placeholder={formData.tipo_pessoa === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                          icon={CreditCard}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Aba 2: Contato */}
                <TabsContent value="contato" className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground">Informações de Contato</h2>
                    <p className="text-muted-foreground">Telefone e email do locador</p>
                  </div>

                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Contato</h3>
                    
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
                          placeholder="locador@email.com"
                          icon={Mail}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Cadastrar Locador</span>
                  </div>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};