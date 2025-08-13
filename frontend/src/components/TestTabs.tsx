import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { InputWithIcon } from './ui/input-with-icon';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { User, Building, CreditCard } from 'lucide-react';
import { useFormSectionsData } from '../hooks/useFormData';

/**
 * Componente de teste para demonstrar que os dados agora são preservados
 * ao navegar entre as tabs
 */
export const TestTabs: React.FC = () => {
  const [formData, setFormData] = useState({
    // Seção Pessoal
    nome: '',
    email: '',
    telefone: '',
    
    // Seção Endereço  
    rua: '',
    cidade: '',
    estado: '',
    cep: '',
    
    // Seção Observações
    observacoes: '',
    tipo: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Hook para detectar dados preenchidos em cada seção
  const sectionsData = useFormSectionsData(formData, {
    pessoal: ['nome', 'email', 'telefone'],
    endereco: ['rua', 'cidade', 'estado', 'cep'], 
    observacoes: ['observacoes', 'tipo']
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-foreground mb-8">
            🧪 Teste de Preservação de Estado nas Tabs
          </h1>
          
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              ✅ Como testar:
            </h2>
            <ol className="list-decimal list-inside text-green-700 dark:text-green-300 space-y-1">
              <li>Preencha alguns campos na aba "Dados Pessoais"</li>
              <li>Navegue para a aba "Endereço" e preencha alguns campos</li>
              <li>Volte para "Dados Pessoais" - seus dados devem estar preservados!</li>
              <li>Note o ponto verde nas abas que contêm dados preenchidos</li>
            </ol>
          </div>

          <Tabs defaultValue="pessoal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pessoal" hasData={sectionsData.pessoal}>
                Dados Pessoais
              </TabsTrigger>
              <TabsTrigger value="endereco" hasData={sectionsData.endereco}>
                Endereço
              </TabsTrigger>
              <TabsTrigger value="observacoes" hasData={sectionsData.observacoes}>
                Observações
              </TabsTrigger>
            </TabsList>

            {/* Aba 1: Dados Pessoais */}
            <TabsContent value="pessoal" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Dados Pessoais
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <InputWithIcon
                      id="nome"
                      icon={User}
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <InputWithIcon
                      id="email"
                      type="email"
                      icon={User}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <InputWithIcon
                      id="telefone"
                      icon={User}
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Aba 2: Endereço */}
            <TabsContent value="endereco" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Building className="w-5 h-5 text-green-600" />
                  Endereço
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="rua">Rua/Logradouro</Label>
                    <InputWithIcon
                      id="rua"
                      icon={Building}
                      value={formData.rua}
                      onChange={(e) => handleInputChange('rua', e.target.value)}
                      placeholder="Nome da rua, número"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <InputWithIcon
                      id="cidade"
                      icon={Building}
                      value={formData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      placeholder="Nome da cidade"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="cep">CEP</Label>
                    <InputWithIcon
                      id="cep"
                      icon={CreditCard}
                      value={formData.cep}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Aba 3: Observações */}
            <TabsContent value="observacoes" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  Observações
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teste1">Teste 1</SelectItem>
                        <SelectItem value="teste2">Teste 2</SelectItem>
                        <SelectItem value="teste3">Teste 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Digite suas observações aqui..."
                      rows={6}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Debug: Mostrar dados atuais */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">🔍 Debug - Dados Atuais:</h3>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
            <div className="mt-2">
              <strong>Seções com dados:</strong> {Object.entries(sectionsData).filter(([_, hasData]) => hasData).map(([section]) => section).join(', ') || 'Nenhuma'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};