import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Crown, Plus, Minus, User, Mail, Phone, CreditCard, Building, Percent, CheckCircle, AlertCircle } from 'lucide-react';
import type { ProprietarioImovel } from '../../types/PrestacaoContas';

interface ProprietariosMultiplosFormProps {
  proprietarios: ProprietarioImovel[];
  onProprietariosChange: (proprietarios: ProprietarioImovel[]) => void;
  className?: string;
}

export const ProprietariosMultiplosForm: React.FC<ProprietariosMultiplosFormProps> = ({
  proprietarios,
  onProprietariosChange,
  className = ""
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [novoProprietario, setNovoProprietario] = useState<Partial<ProprietarioImovel>>({
    nome_proprietario: '',
    cpf_cnpj: '',
    email: '',
    telefone: '',
    percentual_propriedade: 0,
    chave_pix: '',
    banco: '',
    agencia: '',
    conta: '',
    ativo: true
  });

  const totalPercentual = proprietarios.reduce((total, prop) => total + prop.percentual_propriedade, 0);
  const percentualDisponivel = 100 - totalPercentual;

  const adicionarProprietario = () => {
    if (!novoProprietario.nome_proprietario || !novoProprietario.cpf_cnpj || !novoProprietario.percentual_propriedade) {
      return;
    }

    if (novoProprietario.percentual_propriedade! > percentualDisponivel) {
      return;
    }

    const novoId = Date.now();
    const proprietarioCompleto: ProprietarioImovel = {
      id: novoId,
      contrato_id: 0,
      nome_proprietario: novoProprietario.nome_proprietario!,
      cpf_cnpj: novoProprietario.cpf_cnpj!,
      email: novoProprietario.email || '',
      telefone: novoProprietario.telefone || '',
      percentual_propriedade: novoProprietario.percentual_propriedade!,
      chave_pix: novoProprietario.chave_pix || '',
      banco: novoProprietario.banco || '',
      agencia: novoProprietario.agencia || '',
      conta: novoProprietario.conta || '',
      ativo: true
    };

    const novosProprietarios = [...proprietarios, proprietarioCompleto];
    onProprietariosChange(novosProprietarios);

    // Reset form
    setNovoProprietario({
      nome_proprietario: '',
      cpf_cnpj: '',
      email: '',
      telefone: '',
      percentual_propriedade: 0,
      chave_pix: '',
      banco: '',
      agencia: '',
      conta: '',
      ativo: true
    });
    setShowAddForm(false);
  };

  const removerProprietario = (id: number) => {
    const novosProprietarios = proprietarios.filter(p => p.id !== id);
    onProprietariosChange(novosProprietarios);
  };

  const atualizarProprietario = (id: number, campo: keyof ProprietarioImovel, valor: any) => {
    const novosProprietarios = proprietarios.map(p => 
      p.id === id ? { ...p, [campo]: valor } : p
    );
    onProprietariosChange(novosProprietarios);
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const percentualValido = totalPercentual === 100;

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span>Proprietários do Imóvel</span>
              {proprietarios.length > 0 && (
                <Badge variant="secondary">{proprietarios.length} proprietário(s)</Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className={`text-sm font-medium ${percentualValido ? 'text-green-600' : 'text-red-600'}`}>
                {totalPercentual}% / 100%
                {percentualValido ? (
                  <CheckCircle className="w-4 h-4 inline ml-1" />
                ) : (
                  <AlertCircle className="w-4 h-4 inline ml-1" />
                )}
              </div>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
                variant="outline"
                disabled={totalPercentual >= 100}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Lista de Proprietários */}
          {proprietarios.length > 0 && (
            <div className="space-y-4 mb-6">
              <AnimatePresence>
                {proprietarios.map((proprietario) => (
                  <motion.div
                    key={proprietario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Informações Básicas */}
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Nome</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <User className="w-4 h-4 text-yellow-600" />
                              <span className="font-medium text-foreground">{proprietario.nome_proprietario}</span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-yellow-700 dark:text-yellow-300">CPF/CNPJ</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <CreditCard className="w-4 h-4 text-yellow-600" />
                              <span className="font-mono text-sm text-foreground">{formatCPF(proprietario.cpf_cnpj)}</span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Percentual</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Percent className="w-4 h-4 text-yellow-600" />
                              <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                                {proprietario.percentual_propriedade}%
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Contatos */}
                        <div className="space-y-3">
                          {proprietario.email && (
                            <div>
                              <Label className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Email</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Mail className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-foreground">{proprietario.email}</span>
                              </div>
                            </div>
                          )}
                          {proprietario.telefone && (
                            <div>
                              <Label className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Telefone</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Phone className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-foreground">{proprietario.telefone}</span>
                              </div>
                            </div>
                          )}
                          {proprietario.chave_pix && (
                            <div>
                              <Label className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Chave PIX</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <CreditCard className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-mono text-foreground">{proprietario.chave_pix}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Dados Bancários */}
                        <div className="space-y-3">
                          {proprietario.banco && (
                            <div>
                              <Label className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Banco</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Building className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-foreground">{proprietario.banco}</span>
                              </div>
                            </div>
                          )}
                          {proprietario.agencia && proprietario.conta && (
                            <div>
                              <Label className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Agência/Conta</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <CreditCard className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-mono text-foreground">
                                  {proprietario.agencia} / {proprietario.conta}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => removerProprietario(proprietario.id)}
                        size="sm"
                        variant="destructive"
                        className="ml-4"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Formulário para Adicionar Proprietário */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-6"
              >
                <div className="space-y-6">
                  <h4 className="text-md font-semibold text-foreground">Adicionar Novo Proprietário</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome Completo *</Label>
                      <InputWithIcon
                        icon={User}
                        value={novoProprietario.nome_proprietario || ''}
                        onChange={(e) => setNovoProprietario({ ...novoProprietario, nome_proprietario: e.target.value })}
                        placeholder="Nome do proprietário"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>CPF/CNPJ *</Label>
                      <InputWithIcon
                        icon={CreditCard}
                        value={novoProprietario.cpf_cnpj || ''}
                        onChange={(e) => setNovoProprietario({ ...novoProprietario, cpf_cnpj: e.target.value })}
                        placeholder="000.000.000-00"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Percentual de Propriedade * (Disponível: {percentualDisponivel}%)</Label>
                      <InputWithIcon
                        type="number"
                        step="0.01"
                        max={percentualDisponivel}
                        icon={Percent}
                        value={novoProprietario.percentual_propriedade || 0}
                        onChange={(e) => setNovoProprietario({ ...novoProprietario, percentual_propriedade: Number(e.target.value) || 0 })}
                        placeholder="33.33"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Email</Label>
                      <InputWithIcon
                        icon={Mail}
                        type="email"
                        value={novoProprietario.email || ''}
                        onChange={(e) => setNovoProprietario({ ...novoProprietario, email: e.target.value })}
                        placeholder="email@exemplo.com"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Telefone</Label>
                      <InputWithIcon
                        icon={Phone}
                        value={novoProprietario.telefone || ''}
                        onChange={(e) => setNovoProprietario({ ...novoProprietario, telefone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Chave PIX</Label>
                      <InputWithIcon
                        icon={CreditCard}
                        value={novoProprietario.chave_pix || ''}
                        onChange={(e) => setNovoProprietario({ ...novoProprietario, chave_pix: e.target.value })}
                        placeholder="CPF, Email, Telefone ou Chave Aleatória"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={adicionarProprietario}
                      disabled={!novoProprietario.nome_proprietario || !novoProprietario.cpf_cnpj || !novoProprietario.percentual_propriedade || novoProprietario.percentual_propriedade! > percentualDisponivel}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Proprietário
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddForm(false);
                        setNovoProprietario({
                          nome_proprietario: '',
                          cpf_cnpj: '',
                          email: '',
                          telefone: '',
                          percentual_propriedade: 0,
                          chave_pix: '',
                          banco: '',
                          agencia: '',
                          conta: '',
                          ativo: true
                        });
                      }}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mensagem quando não há proprietários */}
          {proprietarios.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-muted-foreground">
              <Crown className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum proprietário cadastrado</p>
              <p className="text-xs">Clique em "Adicionar" para incluir proprietários</p>
            </div>
          )}

          {/* Validação de Percentual */}
          {proprietarios.length > 0 && !percentualValido && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Atenção: A soma dos percentuais deve ser igual a 100%. 
                  Atual: {totalPercentual}% (faltam {100 - totalPercentual}%)
                </span>
              </div>
            </div>
          )}

          {percentualValido && proprietarios.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Configuração válida! Todos os proprietários foram cadastrados corretamente.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProprietariosMultiplosForm;